import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { createHash, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { AuthUser } from "../auth/auth.types";
import { DatabaseService } from "../database/database.service";
import { ContentService } from "../content/content.service";
import { ContentItem } from "../content/types";
import { repairMojibake } from "../common/text";
import { TelegramService } from "../telegram/telegram.service";

import { CreateBookingDto, LateBookingDto } from "./dto";

type BookingStatus =
  | "created"
  | "confirmed"
  | "cancelled"
  | "cancelled_salon"
  | "rescheduled"
  | "completed"
  | "no_show"
  | "failed"
  | "needs_refresh";

type BookingRecord = {
  id: string;
  phone: string;
  fullname: string;
  serviceId: number;
  staffId: number;
  serviceTitle?: string;
  specialistName?: string;
  datetime: string;
  status: BookingStatus;
  yclientsRecordId?: string;
  yclientsResponse?: unknown;
  serviceSnapshot?: Record<string, unknown>;
  staffSnapshot?: Record<string, unknown>;
  idempotencyKey?: string;
  catalogVersion?: string;
  clientMessage?: string;
  cancelAllowedUntil: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
};

type BookingStore = {
  version: number;
  bookings: BookingRecord[];
  catalogVersion?: string;
  serviceHash?: string;
  staffHash?: string;
};

type BookingRow = {
  id: string;
  phone: string;
  fullname: string;
  service_id: number;
  staff_id: number;
  service_title: string | null;
  specialist_name: string | null;
  datetime: string;
  status: BookingStatus;
  yclients_record_id: string | null;
  yclients_response: unknown;
  cancel_allowed_until: Date | string;
  cancelled_at: Date | string | null;
  cancel_reason: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type PremiumService = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: string;
  price_min: number;
  price_max: number;
  price: string;
  duration: string;
  seance_length: number;
  active: boolean;
  bookable: boolean;
  source: "yclients";
};

type PremiumStaff = {
  id: number;
  name: string;
  role: string;
  specialization: string;
  experience: string;
  description: string;
  imageUrl: string;
  avatar: string;
  avatar_big: string;
  bookable: boolean;
  hidden: boolean;
  fired: boolean;
  source: "yclients";
};

type SyncSnapshot = {
  version: number;
  initializedAt?: string;
  updatedAt?: string;
  services: PremiumService[];
  staff: PremiumStaff[];
  bookings: BookingRecord[];
  catalogVersion?: string;
  serviceHash?: string;
  staffHash?: string;
};

type BootstrapSlot = {
  date: string;
  times: string[];
};

type BootstrapStaffAvailability = {
  staffId: number;
  dates: string[];
  firstDate: string;
  firstTimes: string[];
  slots: BootstrapSlot[];
};

@Injectable()
export class YclientsService {
  private readonly logger = new Logger(YclientsService.name);
  private readonly businessClient: AxiosInstance;
  private readonly bookingClient: AxiosInstance;
  private readonly companyId: string;
  private readonly formId: string;
  private readonly bookingsPath = join(process.cwd(), "data", "bookings.json");
  private readonly syncPath = join(
    process.cwd(),
    "data",
    "yclients-sync-state.json",
  );

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
    private readonly content: ContentService,
    private readonly telegram: TelegramService,
  ) {
    this.companyId = config.get<string>("YCLIENTS_COMPANY_ID") ?? "";
    this.formId = config.get<string>("YCLIENTS_FORM_ID") ?? "";

    this.businessClient = axios.create({
      baseURL: this.resolveBaseUrl(),
      timeout: 20_000,
      headers: {
        "Accept-Language": config.get<string>("YCLIENTS_LOCALE") ?? "ru-RU",
        Accept: "application/vnd.api.v2+json",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        Authorization: this.businessAuthorizationHeader(),
      },
    });

    this.bookingClient = axios.create({
      baseURL: this.resolveBaseUrl(),
      timeout: 20_000,
      headers: {
        "Accept-Language": config.get<string>("YCLIENTS_LOCALE") ?? "ru-RU",
        Accept: "application/vnd.api.v2+json",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        Authorization: this.partnerAuthorizationHeader(),
      },
    });
  }

  get isConfigured() {
    return (
      this.isRealValue(this.config.get<string>("YCLIENTS_PARTNER_TOKEN")) &&
      this.isRealValue(this.companyId) &&
      this.isRealValue(this.formId)
    );
  }

  status() {
    return {
      configured: this.isConfigured,
      operatingModel: this.operatingModel,
      bookingProvider: this.bookingProvider,
      profileProvider: this.profileProvider,
      companyId: this.isRealValue(this.companyId) ? "set" : "missing",
      formId: this.isRealValue(this.formId) ? "set" : "missing",
      partnerToken: this.isRealValue(
        this.config.get<string>("YCLIENTS_PARTNER_TOKEN"),
      )
        ? "set"
        : "missing",
      userToken: this.isRealValue(
        this.config.get<string>("YCLIENTS_USER_TOKEN"),
      )
        ? "set"
        : "missing",
      apiBaseUrl: this.resolveBaseUrl(),
      syncEnabled: this.syncEnabled,
      importantEventsToTelegram: this.importantEventsToTelegram,
      cacheLastGood: this.cacheLastGood,
      bookingsEndpoint: this.isRealValue(
        this.config.get<string>("YCLIENTS_BOOKINGS_ENDPOINT_TEMPLATE"),
      )
        ? "set"
        : "auto_candidates",
      createBookingEndpoint: this.isRealValue(
        this.config.get<string>("YCLIENTS_CREATE_BOOKING_ENDPOINT_TEMPLATE"),
      )
        ? "set"
        : "default_book_record",
      cancelEndpoint: this.isRealValue(
        this.config.get<string>("YCLIENTS_CANCEL_ENDPOINT_TEMPLATE"),
      )
        ? "set"
        : "default_record_delete",
      clientUpsertEndpoint: this.isRealValue(
        this.config.get<string>("YCLIENTS_CLIENT_UPSERT_ENDPOINT_TEMPLATE"),
      )
        ? "set"
        : "not_configured",
      cancellationRule: `${this.cancelBeforeHours}h`,
      safetyLayer: "v11_quote_slot_recheck_idempotency_snapshots",
      slotFreshness: "always_rechecked_before_create",
      telegramDelivery: "saved_message_plus_retry_status",
    };
  }

  async getServices(staffId?: number, datetime?: string) {
    if (!this.isConfigured) {
      if (!this.allowDemoYclients)
        throw new BadRequestException("Запись сейчас недоступна. Попробуйте позже.");
      return { success: true, demo: true, data: demoServices };
    }

    try {
      const params: Record<string, unknown> = {};
      if (staffId) params.staff_id = staffId;
      if (datetime) params.datetime = datetime;
      const { data } = await this.bookingClient.get(
        `/book_services/${this.companyId}`,
        { params },
      );
      const services = await this.normalizeServices(data);
      await this.persistServicesSnapshot(services);
      return { success: true, source: "yclients", data: services, services };
    } catch (error) {
      this.logger.warn(
        `YCLIENTS services unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
      const cached = await this.cachedServices();
      if (this.cacheLastGood && cached.length > 0)
        return {
          success: true,
          source: "yclients_cache",
          stale: true,
          data: cached,
          services: cached,
        };
      throw error;
    }
  }

  async getStaff(serviceId?: number, datetime?: string) {
    if (!this.isConfigured) {
      if (!this.allowDemoYclients)
        throw new BadRequestException("Запись сейчас недоступна. Попробуйте позже.");
      return { success: true, demo: true, data: demoStaff };
    }

    try {
      const params: Record<string, unknown> = {};
      if (serviceId) params["service_ids[]"] = serviceId;
      if (datetime) params.datetime = datetime;
      const { data } = await this.bookingClient.get(
        `/book_staff/${this.companyId}`,
        { params },
      );
      const staff = await this.normalizeStaff(data);
      await this.persistStaffSnapshot(staff);
      return { success: true, source: "yclients", data: staff, staff };
    } catch (error) {
      this.logger.warn(
        `YCLIENTS staff unavailable: ${error instanceof Error ? error.message : String(error)}`,
      );
      const cached = await this.cachedStaff();
      if (this.cacheLastGood && cached.length > 0)
        return {
          success: true,
          source: "yclients_cache",
          stale: true,
          data: cached,
          staff: cached,
        };
      throw error;
    }
  }

  async getDates(staffId?: number, serviceId?: number) {
    if (!this.isConfigured) {
      if (!this.allowDemoYclients)
        throw new BadRequestException("Запись сейчас недоступна. Попробуйте позже.");
      return { success: true, demo: true, data: demoDates() };
    }

    try {
      const params: Record<string, unknown> = {};
      if (staffId) params.staff_id = staffId;
      if (serviceId) params["service_ids[]"] = serviceId;
      const { data } = await this.bookingClient.get(
        `/book_dates/${this.companyId}`,
        { params },
      );
      const dates = this.normalizeDates(data);
      if (dates.length > 0 || !staffId) {
        return { success: true, source: "yclients", data: dates };
      }

      const fallbackDates = await this.probeAvailableDatesByTimes(
        staffId,
        serviceId,
      );
      return {
        success: true,
        source: fallbackDates.length > 0 ? "yclients_times_fallback" : "yclients",
        fallbackApplied: true,
        data: fallbackDates,
      };
    } catch (error) {
      this.logYclientsFailure("dates", `/book_dates/${this.companyId}`, error);
      if (staffId) {
        const fallbackDates = await this.probeAvailableDatesByTimes(
          staffId,
          serviceId,
        );
        if (fallbackDates.length > 0) {
          return {
            success: true,
            source: "yclients_times_fallback",
            fallbackApplied: true,
            stale: false,
            data: fallbackDates,
          };
        }
      }
      return {
        success: true,
        source: "yclients_unavailable",
        stale: true,
        data: [],
      };
    }
  }

  private async probeAvailableDatesByTimes(staffId: number, serviceId?: number) {
    const days = Math.max(
      7,
      Math.min(
        45,
        Number(this.config.get<string>("YCLIENTS_DATES_FALLBACK_DAYS") ?? 30) ||
          30,
      ),
    );
    const result: { date: string }[] = [];
    const today = new Date();
    for (let offset = 0; offset < days; offset += 1) {
      const current = new Date(today);
      current.setDate(today.getDate() + offset);
      const date = current.toISOString().slice(0, 10);
      try {
        const params: Record<string, unknown> = {};
        if (serviceId) params["service_ids[]"] = serviceId;
        const { data } = await this.bookingClient.get(
          `/book_times/${this.companyId}/${staffId}/${date}`,
          { params },
        );
        if (this.normalizeTimes(data, date).length > 0) result.push({ date });
      } catch (error) {
        this.logger.debug?.(
          `YCLIENTS dates fallback skipped ${date}: ${this.yclientsErrorSummary(error)}`,
        );
      }
      if (result.length >= 14) break;
    }
    return result;
  }

  async getTimes(staffId: number, date: string, serviceId?: number) {
    if (!Number.isFinite(staffId))
      throw new BadRequestException("staffId is required");
    if (!date) throw new BadRequestException("date is required");
    if (!this.isConfigured) {
      if (!this.allowDemoYclients)
        throw new BadRequestException("Запись сейчас недоступна. Попробуйте позже.");
      return { success: true, demo: true, data: demoTimes(date) };
    }

    try {
      const params: Record<string, unknown> = {};
      if (serviceId) params["service_ids[]"] = serviceId;
      const { data } = await this.bookingClient.get(
        `/book_times/${this.companyId}/${staffId}/${date}`,
        { params },
      );
      return {
        success: true,
        source: "yclients",
        data: this.normalizeTimes(data, date),
      };
    } catch (error) {
      this.logYclientsFailure(
        "times",
        `/book_times/${this.companyId}/${staffId}/${date}`,
        error,
      );
      return {
        success: true,
        source: "yclients_unavailable",
        stale: true,
        data: [],
      };
    }
  }

  async refreshCatalog() {
    const services = await this.getServices().catch((error: unknown) => ({
      success: false,
      source: "yclients_error",
      error: this.yclientsErrorSummary(error),
      data: [],
    }));
    const staff = await this.getStaff().catch((error: unknown) => ({
      success: false,
      source: "yclients_error",
      error: this.yclientsErrorSummary(error),
      data: [],
    }));
    const snapshot = await this.readSyncSnapshot();
    return {
      ok: Boolean(
        (services as { success?: boolean }).success ||
        (staff as { success?: boolean }).success,
      ),
      catalogVersion:
        snapshot.catalogVersion ??
        this.hashCatalog(snapshot.services, snapshot.staff),
      catalogUpdatedAt: snapshot.updatedAt,
      services,
      staff,
      updatedAt: new Date().toISOString(),
    };
  }

  async getBookingBootstrap(serviceId?: number) {
    const startedAt = Date.now();
    if (!this.isConfigured) {
      if (!this.allowDemoYclients)
        throw new BadRequestException("Запись сейчас недоступна. Попробуйте позже.");
      const serviceIds = serviceId ? [serviceId] : demoServices.map((item) => item.id);
      const serviceStaffMap = Object.fromEntries(
        serviceIds.map((id) => [String(id), demoStaff.map((item) => item.id)]),
      ) as Record<string, number[]>;
      const availability = Object.fromEntries(
        serviceIds.map((id) => [
          String(id),
          demoStaff.map((person) => ({
            staffId: person.id,
            dates: demoDates().map((item) => item.date),
            firstDate: demoDates()[0]?.date ?? "",
            firstTimes: demoTimes(demoDates()[0]?.date ?? this.dateShift(0)).map(
              (item) => item.time,
            ),
            slots: demoDates().map((item) => ({
              date: item.date,
              times: demoTimes(item.date).map((time) => time.time),
            })),
          })),
        ]),
      ) as Record<string, BootstrapStaffAvailability[]>;
      return {
        success: true,
        source: "demo",
        generatedAt: new Date().toISOString(),
        tookMs: Date.now() - startedAt,
        services: demoServices,
        staff: demoStaff,
        serviceStaffMap,
        availability,
        slotFreshness: "demo_before_create_rechecked",
      };
    }

    const [servicesResult, allStaffResult] = await Promise.all([
      this.getServices().catch((error: unknown) => {
        this.logger.warn(
          `YCLIENTS bootstrap services unavailable: ${this.yclientsErrorSummary(error)}`,
        );
        return null;
      }),
      this.getStaff().catch((error: unknown) => {
        this.logger.warn(
          `YCLIENTS bootstrap staff unavailable: ${this.yclientsErrorSummary(error)}`,
        );
        return null;
      }),
    ]);

    const services = this.responseDataList<PremiumService>(servicesResult);
    const allStaff = this.responseDataList<PremiumStaff>(allStaffResult);
    const targetServices = this.bootstrapTargetServices(services, serviceId);
    const serviceStaffMap: Record<string, number[]> = {};
    const availability: Record<string, BootstrapStaffAvailability[]> = {};
    const staffById = new Map<number, PremiumStaff>();
    for (const person of allStaff) if (person.id > 0) staffById.set(person.id, person);
    const dateCandidates = this.bootstrapDateCandidates();

    await this.mapConcurrent(
      targetServices,
      this.bootstrapServiceConcurrency,
      async (service) => {
        const staffResult = await this.getStaff(service.id).catch(
          (error: unknown) => {
            this.logger.debug?.(
              `YCLIENTS bootstrap staff for service ${service.id} skipped: ${this.yclientsErrorSummary(error)}`,
            );
            return null;
          },
        );

        // Strict YCLIENTS mapping: do not widen a service to every specialist.
        // General staff catalog is only used for names/photos. The eligibility
        // list comes from /book_staff/{companyId}?service_ids[]=SERVICE_ID.
        const staffForService = this.uniqueStaffById(
          this.responseDataList<PremiumStaff>(staffResult),
        ).filter(
          (person) => person.bookable !== false && !person.hidden && !person.fired,
        );
        for (const person of staffForService) staffById.set(person.id, person);

        serviceStaffMap[String(service.id)] = staffForService.map((item) => item.id);
        availability[String(service.id)] = await this.buildAvailabilityForService(
          service.id,
          staffForService,
          dateCandidates,
        );
      },
    );

    return {
      success: true,
      source: "yclients_live_bootstrap",
      mappingSource: "yclients_book_staff_strict",
      generatedAt: new Date().toISOString(),
      tookMs: Date.now() - startedAt,
      horizonDays: dateCandidates.length,
      services,
      staff: this.uniqueStaffById(Array.from(staffById.values())),
      serviceStaffMap,
      availability,
      targetServiceIds: targetServices.map((item) => item.id),
      slotFreshness: "live_bootstrap_rechecked_before_create",
    };
  }

  async quoteBooking(dto: CreateBookingDto, user: AuthUser) {
    const phone = this.normalizePhone(user.phone || dto.phone);
    const fullname =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || dto.fullname;
    const quote = await this.validateBookingRequest(dto, phone, fullname);
    return {
      ok: true,
      quoteId: this.hashValue(
        `${phone}|${dto.serviceId}|${dto.staffId}|${dto.datetime}|${quote.catalogVersion}`,
      ).slice(0, 24),
      expiresAt: new Date(
        Date.now() + this.quoteTtlMinutes * 60 * 1000,
      ).toISOString(),
      source: quote.source,
      catalogVersion: quote.catalogVersion,
      service: quote.serviceSnapshot,
      specialist: quote.staffSnapshot,
      slot: quote.slot,
      message:
        "Время доступно. Перед подтверждением мы проверим его ещё раз.",
    };
  }

  async listBookings(user: AuthUser) {
    const phone = this.normalizePhone(user.phone);

    if (
      this.bookingProvider === "yclients" &&
      !this.isConfigured &&
      !this.allowDemoYclients
    ) {
      throw new BadRequestException("Запись сейчас недоступна. Попробуйте позже.");
    }

    if (this.bookingProvider === "yclients" && this.isConfigured) {
      const remoteBookings = await this.listRemoteBookings(phone).catch(
        (error: unknown) => {
          this.logger.warn(
            `YCLIENTS remote bookings unavailable: ${error instanceof Error ? error.message : String(error)}`,
          );
          return null;
        },
      );
      if (remoteBookings) {
        await this.syncRemoteBookings(remoteBookings);
        const localBookings = this.db.isPostgres
          ? await this.listBookingsPostgres(phone)
          : (await this.readBookingStore()).bookings.filter(
              (item) => item.phone === phone,
            );
        const merged = this.mergeBookingLists(remoteBookings, localBookings);
        return {
          ok: true,
          source: "yclients_plus_local_cache",
          data: merged
            .sort((a, b) => b.datetime.localeCompare(a.datetime))
            .map((item) => this.bookingForClient(item)),
        };
      }
    }

    const bookings = this.db.isPostgres
      ? await this.listBookingsPostgres(phone)
      : (await this.readBookingStore()).bookings.filter(
          (item) => item.phone === phone,
        );
    return {
      ok: true,
      source:
        this.bookingProvider === "yclients" ? "technical_cache" : "app_cache",
      data: bookings
        .sort((a, b) => b.datetime.localeCompare(a.datetime))
        .map((item) => this.bookingForClient(item)),
    };
  }

  async createBooking(dto: CreateBookingDto, user: AuthUser) {
    const phone = this.normalizePhone(user.phone || dto.phone);
    const fullname =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || dto.fullname;
    const idempotencyKey = this.bookingIdempotencyKey(phone, dto);
    const existing = await this.findExistingBookingByIdempotency(
      phone,
      idempotencyKey,
    );
    if (existing) {
      return {
        ok: true,
        idempotentReplay: true,
        data: this.bookingForClient(existing),
        yclients: existing.yclientsResponse,
      };
    }

    let remoteResponse: unknown;
    let yclientsRecordId: string | undefined;
    let status: BookingStatus = "created";
    let quote: Awaited<
      ReturnType<YclientsService["validateBookingRequest"]>
    > | null = null;

    if (!this.isConfigured) {
      if (!this.allowDemoYclients)
        throw new BadRequestException(
          "Запись сейчас недоступна. Попробуйте позже.",
        );
      remoteResponse = {
        demo: true,
        ok: true,
        app: { idempotencyKey },
        message:
          "Тестовая запись принята.",
      };
      yclientsRecordId = `demo-${Date.now()}`;
    } else {
      quote = await this.validateBookingRequest(dto, phone, fullname);
      const payload = this.createBookingPayload({
        dto,
        phone,
        fullname,
        quote,
        idempotencyKey,
      });
      const createEndpoint = this.createBookingEndpoint();

      try {
        const { data } = await this.businessClient.post(
          createEndpoint,
          payload,
        );
        yclientsRecordId = this.extractYclientsRecordId(data);
        remoteResponse = {
          source: "yclients",
          remote: data,
          app: {
            idempotencyKey,
            catalogVersion: quote.catalogVersion,
            serviceSnapshot: quote.serviceSnapshot,
            staffSnapshot: quote.staffSnapshot,
            slot: quote.slot,
            createdThrough: "mobile_app_v11_slot_rechecked",
          },
        };
        status = "confirmed";
      } catch (error) {
        this.logYclientsFailure("create booking", createEndpoint, error);
        throw new BadRequestException(
          "Не удалось подтвердить запись. Время могло измениться. Обновите расписание и попробуйте снова.",
        );
      }
    }

    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: randomUUID(),
      phone,
      fullname,
      serviceId: dto.serviceId,
      staffId: dto.staffId,
      serviceTitle:
        quote?.serviceSnapshot.title?.toString() || dto.serviceTitle,
      specialistName:
        quote?.staffSnapshot.name?.toString() || dto.specialistName,
      datetime: dto.datetime,
      status,
      yclientsRecordId,
      yclientsResponse: remoteResponse,
      serviceSnapshot: quote?.serviceSnapshot,
      staffSnapshot: quote?.staffSnapshot,
      idempotencyKey,
      catalogVersion: quote?.catalogVersion,
      cancelAllowedUntil: this.cancelAllowedUntil(dto.datetime).toISOString(),
      createdAt: now,
      updatedAt: now,
    };
    await this.saveBooking(booking);
    await this.notifyBookingEvent("📅 Новая запись", booking, [
      `Услуга: ${booking.serviceTitle || dto.serviceId}`,
      `Специалист: ${booking.specialistName || dto.staffId}`,
      `Время: ${this.humanDateTime(dto.datetime)}`,
    ]);
    return {
      ok: true,
      data: this.bookingForClient(booking),
      yclients: remoteResponse,
    };
  }

  async cancelBooking(user: AuthUser, bookingId: string, reason: string) {
    const phone = this.normalizePhone(user.phone);
    const booking = await this.findBooking(bookingId);
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.phone !== phone)
      throw new ForbiddenException("Booking belongs to another user");
    if (booking.status === "cancelled")
      return {
        ok: true,
        data: this.bookingForClient(booking),
        alreadyCancelled: true,
      };
    if (!this.canCancel(booking)) {
      throw new BadRequestException(
        `Отмена доступна не позднее чем за ${this.cancelBeforeHours} часов до приёма`,
      );
    }

    if (
      this.isConfigured &&
      booking.yclientsRecordId &&
      !booking.yclientsRecordId.startsWith("demo-")
    ) {
      await this.cancelRemoteBooking(booking, reason);
    }

    const next: BookingRecord = {
      ...booking,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
      updatedAt: new Date().toISOString(),
    };
    await this.saveBooking(next);
    await this.notifyBookingEvent("❌ Клиент отменил запись", next, [
      `Услуга: ${next.serviceTitle || next.serviceId}`,
      `Время: ${this.humanDateTime(next.datetime)}`,
      `Причина: ${reason}`,
    ]);
    return { ok: true, data: this.bookingForClient(next) };
  }

  async lateBooking(user: AuthUser, bookingId: string, dto: LateBookingDto) {
    const phone = this.normalizePhone(user.phone);
    const booking = await this.findBooking(bookingId);
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.phone !== phone)
      throw new ForbiddenException("Booking belongs to another user");
    if (
      ["cancelled", "cancelled_salon", "completed", "no_show"].includes(
        booking.status,
      )
    ) {
      throw new BadRequestException(
        "По этой записи уже нельзя отправить опоздание.",
      );
    }
    const minutes = Math.max(0, Math.min(180, Number(dto.minutes ?? 0) || 0));
    const message =
      dto.message?.trim() ||
      (minutes
        ? `Клиент опаздывает примерно на ${minutes} минут.`
        : "Клиент сообщил, что опаздывает.");
    const next: BookingRecord = {
      ...booking,
      clientMessage: message,
      updatedAt: new Date().toISOString(),
    };
    await this.saveBooking(next);
    await this.notifyBookingEvent("⏰ Клиент опаздывает", booking, [
      `Услуга: ${booking.serviceTitle || booking.serviceId}`,
      `Время записи: ${this.humanDateTime(booking.datetime)}`,
      message,
    ]);
    return {
      ok: true,
      data: this.bookingForClient(next),
      message: "Сообщение об опоздании передано центру.",
    };
  }

  async syncClientProfile(input: {
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    if (this.profileProvider !== "yclients")
      return { skipped: true, reason: "profile_provider_is_not_yclients" };
    if (!this.isConfigured)
      return { skipped: true, reason: "yclients_not_configured" };
    const template =
      this.config
        .get<string>("YCLIENTS_CLIENT_UPSERT_ENDPOINT_TEMPLATE")
        ?.trim() ?? "";
    if (!this.isRealValue(template))
      return { skipped: true, reason: "client_upsert_endpoint_not_configured" };

    const payload = {
      phone: this.normalizePhone(input.phone),
      name: [input.firstName, input.lastName].filter(Boolean).join(" ").trim(),
      firstname: input.firstName ?? "",
      lastname: input.lastName ?? "",
      email: input.email ?? "",
      comment:
        "Клиент синхронизирован из мобильного приложения PODOLOG KUTSYTOI.",
    };

    return this.callConfiguredEndpoint({
      template,
      method:
        this.config.get<string>("YCLIENTS_CLIENT_UPSERT_METHOD") || "POST",
      params: { phone: payload.phone },
      body: payload,
    });
  }

  async requestClientErasure(phoneInput: string) {
    if (this.profileProvider !== "yclients")
      return { skipped: true, reason: "profile_provider_is_not_yclients" };
    if (!this.isConfigured)
      return { skipped: true, reason: "yclients_not_configured" };
    const template =
      this.config
        .get<string>("YCLIENTS_CLIENT_DELETE_ENDPOINT_TEMPLATE")
        ?.trim() ?? "";
    if (!this.isRealValue(template))
      return {
        skipped: true,
        reason: "client_delete_endpoint_not_configured_manual_process_required",
      };
    const phone = this.normalizePhone(phoneInput);
    return this.callConfiguredEndpoint({
      template,
      method:
        this.config.get<string>("YCLIENTS_CLIENT_DELETE_METHOD") || "POST",
      params: { phone },
      body: {
        phone,
        mode:
          this.config.get<string>("YCLIENTS_CLIENT_DELETE_MODE") || "request",
        comment:
          "Запрос удаления аккаунта из мобильного приложения PODOLOG KUTSYTOI.",
      },
    });
  }

  private async normalizeServices(data: unknown): Promise<PremiumService[]> {
    const home = await this.content.readHomeData();
    const premium = home.services.items;
    const list = this.extractObjectListByKeys(data, [
      "services",
      "data",
      "items",
    ]);
    return list
      .filter((item) => this.isActiveService(item))
      .map((item, index) => this.premiumServiceFromMap(item, premium, index))
      .filter((item) => item.id > 0);
  }

  private async normalizeStaff(data: unknown): Promise<PremiumStaff[]> {
    const home = await this.content.readHomeData();
    const premium = home.specialists.items;
    const list = this.extractObjectListByKeys(data, ["staff", "data", "items"]);
    return list
      .filter((item) => this.isVisibleStaff(item))
      .map((item, index) => this.premiumStaffFromMap(item, premium, index))
      .filter((item) => item.id > 0);
  }

  private normalizeDates(data: unknown) {
    const list = this.extractObjectListByKeys(data, ["dates", "data", "items"]);
    return list
      .map((item) => ({
        date: this.firstText(item, ["date", "day", "datetime", "label"]) || "",
      }))
      .filter((item) => /^\d{4}-\d{2}-\d{2}/.test(item.date));
  }

  private normalizeTimes(data: unknown, date: string) {
    const list = this.extractObjectListByKeys(data, ["times", "data", "items"]);
    return list
      .map((item) => {
        const time =
          this.firstText(item, [
            "time",
            "label",
            "datetime",
            "start_time",
            "start",
          ]) || "";
        const clean = time.includes("T")
          ? time.slice(11, 16)
          : time.slice(0, 5);
        return { date, time: clean };
      })
      .filter((item) => /^\d{2}:\d{2}$/.test(item.time));
  }

  private premiumServiceFromMap(
    item: Record<string, unknown>,
    premium: ContentItem[],
    index: number,
  ): PremiumService {
    const id = this.firstNumber(item, ["id", "service_id", "serviceId"]) || 0;
    const title = this.sanitizeMarketplaceText(this.cleanText(
      this.firstText(item, ["title", "name", "service_title"]) ||
        `Услуга #${id}`,
    ));
    const match = this.matchPremiumService(id, title, premium, index);
    const rawComment = this.sanitizeMarketplaceText(this.cleanText(
      this.firstText(item, ["comment", "description", "text"]) || "",
    ));
    const priceMin =
      this.firstNumber(item, ["price_min", "price", "cost", "price_from"]) || 0;
    const priceMax = this.firstNumber(item, ["price_max"]) || priceMin;
    const seconds =
      this.firstNumber(item, ["seance_length", "duration", "length"]) ||
      this.durationTextToSeconds(
        this.firstText(item, ["duration_label", "duration_text"]) || "",
      ) ||
      0;
    const category = this.sanitizeMarketplaceText(this.cleanText(
      this.firstText(item, ["category_title", "category"]) ||
        match?.subtitle ||
        this.categoryForTitle(title),
    ));
    const description = this.sanitizeMarketplaceText(
      rawComment ||
      match?.description ||
      this.descriptionForService(title, category),
    );
    return {
      id,
      title,
      subtitle: description,
      description,
      category,
      icon: match?.icon || this.iconForService(title, category),
      price_min: priceMin,
      price_max: priceMax,
      price: this.priceLabel(priceMin, priceMax),
      duration: this.durationLabel(seconds),
      seance_length: seconds,
      active: true,
      bookable: true,
      source: "yclients",
    };
  }

  private premiumStaffFromMap(
    item: Record<string, unknown>,
    premium: ContentItem[],
    index: number,
  ): PremiumStaff {
    const id =
      this.firstNumber(item, ["id", "staff_id", "staffId", "master_id"]) || 0;
    const name = this.cleanText(
      this.firstText(item, ["name", "fullname", "title"]) ||
        `Специалист #${id}`,
    );
    const match = this.matchPremiumStaff(id, name, premium, index);
    const role = this.cleanText(
      this.firstText(item, ["specialization", "role", "position"]) ||
        match?.role ||
        "Специалист",
    );
    const rawInfo = this.cleanText(
      this.firstText(item, ["information", "description", "comment"]) || "",
    );
    const avatar = this.cleanText(
      this.firstText(item, ["avatar_big", "avatar", "imageUrl", "image"]) || "",
    );
    const imageUrl = this.isYclientsNoMasterImage(avatar) ? "" : avatar;
    return {
      id,
      name,
      role,
      specialization: role,
      experience: match?.experience || "",
      description:
        rawInfo ||
        match?.description ||
        "Профессиональный специалист центра. Подберёт комфортный формат ухода и поможет решить задачу без лишнего стресса.",
      imageUrl: imageUrl || match?.imageUrl || match?.asset || "",
      avatar: imageUrl,
      avatar_big: imageUrl,
      bookable: true,
      hidden: false,
      fired: false,
      source: "yclients",
    };
  }

  private matchPremiumService(
    id: number,
    title: string,
    items: ContentItem[],
    index: number,
  ) {
    void index;
    return (
      items.find((item) => this.extractYclientsId(item) === id) ||
      items.find((item) => this.sameNormalizedTitle(item.title, title))
    );
  }

  private matchPremiumStaff(
    id: number,
    name: string,
    items: ContentItem[],
    index: number,
  ) {
    void index;
    return (
      items.find((item) => this.extractYclientsId(item) === id) ||
      items.find((item) => this.sameNormalizedTitle(item.title, name))
    );
  }

  private extractYclientsId(item: ContentItem) {
    const raw = [item.id, item.mapUrl, item.buttonText, item.color].join(" ");
    const match =
      raw.match(/yclients[:=\-_ ](\d+)/i) || raw.match(/yc[:=\-_ ](\d+)/i);
    return match ? Number(match[1]) : undefined;
  }

  private sameNormalizedTitle(a: string, b: string) {
    const normalize = (value: string) =>
      this.cleanText(value)
        .toLowerCase()
        .replace(/[^а-яёa-z0-9]+/gi, " ")
        .trim();
    const left = normalize(a);
    const right = normalize(b);
    return Boolean(
      left &&
      right &&
      (left === right || left.includes(right) || right.includes(left)),
    );
  }

  private isActiveService(item: Record<string, unknown>) {
    if (item.active === 0 || item.active === false) return false;
    if (item.deleted === true) return false;
    if (item.bookable === false) return false;
    return true;
  }

  private isVisibleStaff(item: Record<string, unknown>) {
    if (item.fired === 1 || item.fired === true) return false;
    if (item.hidden === 1 || item.hidden === true) return false;
    if (item.bookable === false) return false;
    return true;
  }

  private async persistServicesSnapshot(next: PremiumService[]) {
    const snapshot = await this.readSyncSnapshot();
    await this.notifyCatalogDiff("service", snapshot.services, next);
    snapshot.services = next;
    this.refreshCatalogHashes(snapshot);
    await this.writeSyncSnapshot(snapshot);
  }

  private async persistStaffSnapshot(next: PremiumStaff[]) {
    const snapshot = await this.readSyncSnapshot();
    await this.notifyCatalogDiff("staff", snapshot.staff, next);
    snapshot.staff = next;
    this.refreshCatalogHashes(snapshot);
    await this.writeSyncSnapshot(snapshot);
  }

  private async notifyCatalogDiff(
    kind: "service" | "staff",
    previous: { id: number; title?: string; name?: string }[],
    next: { id: number; title?: string; name?: string }[],
  ) {
    if (
      !this.syncEnabled ||
      !this.catalogEventsToTelegram ||
      previous.length === 0
    )
      return;
    const previousIds = new Set(previous.map((item) => item.id));
    const nextIds = new Set(next.map((item) => item.id));
    const added = next.filter((item) => !previousIds.has(item.id));
    const removed = previous.filter((item) => !nextIds.has(item.id));
    const label = kind === "service" ? "услуга" : "специалист";
    for (const item of added)
      await this.notifyImportantEvent(
        `${label === "услуга" ? "Добавлена новая услуга" : "Добавлен новый специалист"}`,
        [`${label}: ${item.title || item.name || item.id}`],
      );
    for (const item of removed)
      await this.notifyImportantEvent(
        `${label === "услуга" ? "Услуга скрыта/удалена" : "Специалист скрыт/удалён"}`,
        [`${label}: ${item.title || item.name || item.id}`],
      );
  }

  private async cachedServices() {
    return (await this.readSyncSnapshot()).services ?? [];
  }

  private async cachedStaff() {
    return (await this.readSyncSnapshot()).staff ?? [];
  }

  private async readSyncSnapshot(): Promise<SyncSnapshot> {
    try {
      const raw = await readFile(this.syncPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<SyncSnapshot>;
      const snapshot = {
        version: 1,
        initializedAt: parsed.initializedAt,
        updatedAt: parsed.updatedAt,
        services: parsed.services ?? [],
        staff: parsed.staff ?? [],
        bookings: parsed.bookings ?? [],
        catalogVersion: parsed.catalogVersion,
        serviceHash: parsed.serviceHash,
        staffHash: parsed.staffHash,
      };
      if (!snapshot.catalogVersion) this.refreshCatalogHashes(snapshot);
      return snapshot;
    } catch {
      const snapshot: SyncSnapshot = {
        version: 1,
        initializedAt: new Date().toISOString(),
        services: [],
        staff: [],
        bookings: [],
      };
      this.refreshCatalogHashes(snapshot);
      return snapshot;
    }
  }

  private async writeSyncSnapshot(snapshot: SyncSnapshot) {
    snapshot.updatedAt = new Date().toISOString();
    await mkdir(dirname(this.syncPath), { recursive: true });
    await writeFile(
      this.syncPath,
      `${JSON.stringify(snapshot, null, 2)}\n`,
      "utf8",
    );
  }

  private async listRemoteBookings(
    phone: string,
  ): Promise<BookingRecord[] | null> {
    const from = this.dateShift(-this.bookingsLookbackDays);
    const to = this.dateShift(this.bookingsLookaheadDays);
    const template =
      this.config.get<string>("YCLIENTS_BOOKINGS_ENDPOINT_TEMPLATE")?.trim() ??
      "";
    const candidates = this.isRealValue(template)
      ? [this.endpointFromTemplate(template, { phone, from, to })]
      : [
          `/records/${this.companyId}?phone=${encodeURIComponent(phone)}&start_date=${from}&end_date=${to}`,
          `/records/${this.companyId}?client_phone=${encodeURIComponent(phone)}&start_date=${from}&end_date=${to}`,
          `/record/${this.companyId}?phone=${encodeURIComponent(phone)}&start_date=${from}&end_date=${to}`,
          `/visits/${this.companyId}?phone=${encodeURIComponent(phone)}&start_date=${from}&end_date=${to}`,
        ];

    for (const url of candidates) {
      try {
        const { data } = await this.businessClient.get(url);
        const list = this.extractObjectList(data);
        return list.map((item) => this.remoteBookingFromMap(item, phone));
      } catch (error) {
        this.logger.debug?.(
          `YCLIENTS bookings candidate failed ${url}: ${this.yclientsErrorSummary(error)}`,
        );
      }
    }
    return null;
  }

  private mergeBookingLists(remote: BookingRecord[], local: BookingRecord[]) {
    const result: BookingRecord[] = [];
    const seen = new Set<string>();
    const add = (item: BookingRecord) => {
      const key = item.yclientsRecordId
        ? `yc:${item.yclientsRecordId}`
        : `app:${item.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push(item);
    };
    for (const item of remote) add(item);
    for (const item of local) add(item);
    return result;
  }

  private remoteBookingFromMap(
    item: Record<string, unknown>,
    phone: string,
  ): BookingRecord {
    const recordId =
      this.firstText(item, [
        "record_id",
        "recordId",
        "visit_id",
        "visitId",
        "id",
      ]) || `yclients-${Date.now()}`;
    const serviceId =
      this.firstNumber(item, ["service_id", "serviceId"]) ||
      this.firstNestedNumber(item, ["service", "services"], ["id"]) ||
      0;
    const staffId =
      this.firstNumber(item, [
        "staff_id",
        "staffId",
        "master_id",
        "masterId",
      ]) ||
      this.firstNestedNumber(item, ["staff", "master"], ["id"]) ||
      0;
    const datetime = this.remoteDatetime(item);
    const statusText = (
      this.firstText(item, ["status", "state"]) ?? ""
    ).toLowerCase();
    const status: BookingStatus =
      statusText.includes("cancel") ||
      statusText.includes("отмен") ||
      item.deleted === true
        ? "cancelled"
        : "confirmed";
    const now = new Date().toISOString();
    return {
      id: recordId,
      phone,
      fullname:
        this.firstText(item, [
          "client_name",
          "clientName",
          "fullname",
          "name",
        ]) ||
        this.firstNestedText(item, ["client"], ["name", "fullname"]) ||
        "Клиент",
      serviceId,
      staffId,
      serviceTitle:
        this.firstText(item, [
          "service_title",
          "serviceTitle",
          "service",
          "title",
        ]) ||
        this.firstNestedText(item, ["service", "services"], ["title", "name"]),
      specialistName:
        this.firstText(item, [
          "staff_name",
          "staffName",
          "master_name",
          "masterName",
          "specialist",
        ]) ||
        this.firstNestedText(item, ["staff", "master"], ["name", "title"]),
      datetime,
      status,
      yclientsRecordId: recordId,
      yclientsResponse: { source: "yclients" },
      cancelAllowedUntil: this.cancelAllowedUntil(datetime).toISOString(),
      createdAt: this.firstText(item, ["created_at", "createdAt"]) || now,
      updatedAt: this.firstText(item, ["updated_at", "updatedAt"]) || now,
    };
  }

  private async syncRemoteBookings(remote: BookingRecord[]) {
    const local = this.db.isPostgres
      ? []
      : (await this.readBookingStore()).bookings;
    for (const item of remote) {
      const existing = local.find(
        (entry) =>
          entry.yclientsRecordId === item.yclientsRecordId ||
          entry.id === item.id,
      );
      if (existing) {
        if (existing.status !== item.status && item.status === "cancelled") {
          await this.notifyBookingEvent("❌ Запись отменена", item, [
            `Услуга: ${item.serviceTitle || item.serviceId}`,
            `Время: ${this.humanDateTime(item.datetime)}`,
          ]);
        } else if (existing.datetime !== item.datetime) {
          await this.notifyBookingEvent("🔁 Запись изменена", item, [
            `Услуга: ${item.serviceTitle || item.serviceId}`,
            `Новое время: ${this.humanDateTime(item.datetime)}`,
          ]);
        }
        await this.saveBooking({
          ...existing,
          ...item,
          id: existing.id,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await this.saveBooking(item);
      }
    }
  }

  private createBookingPayload(input: {
    dto: CreateBookingDto;
    phone: string;
    fullname: string;
    quote?: Awaited<
      ReturnType<YclientsService["validateBookingRequest"]>
    > | null;
    idempotencyKey?: string;
  }) {
    const formIdNumber = Number(this.formId);
    const formId = Number.isFinite(formIdNumber) ? formIdNumber : this.formId;
    const comment = [
      input.dto.comment ??
        "Запись создана из мобильного приложения PODOLOG KUTSYTOI.",
      input.idempotencyKey ? `app_idempotency_key=${input.idempotencyKey}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return {
      phone: input.phone,
      email: input.dto.email ?? "",
      fullname: input.fullname,
      form_id: formId,
      appointments: [
        {
          id: 1,
          services: [input.dto.serviceId],
          staff_id: input.dto.staffId,
          events: [],
          datetime: input.dto.datetime,
          chargeStatus: "",
          comment,
        },
      ],
    };
  }

  private createBookingEndpoint() {
    const template =
      this.config
        .get<string>("YCLIENTS_CREATE_BOOKING_ENDPOINT_TEMPLATE")
        ?.trim() || "/book_record/{companyId}/";
    return this.endpointFromTemplate(template, {});
  }

  private async callConfiguredEndpoint(input: {
    template: string;
    method: string;
    params: Record<string, string>;
    body: Record<string, unknown>;
  }) {
    const url = this.endpointFromTemplate(input.template, input.params);
    const method = input.method.trim().toUpperCase();
    if (method === "GET") {
      const { data } = await this.businessClient.get(url, {
        params: input.body,
      });
      return { ok: true, source: "yclients", data };
    }
    if (method === "PUT") {
      const { data } = await this.businessClient.put(url, input.body);
      return { ok: true, source: "yclients", data };
    }
    if (method === "PATCH") {
      const { data } = await this.businessClient.patch(url, input.body);
      return { ok: true, source: "yclients", data };
    }
    if (method === "DELETE") {
      const { data } = await this.businessClient.delete(url, {
        data: input.body,
      });
      return { ok: true, source: "yclients", data };
    }
    const { data } = await this.businessClient.post(url, input.body);
    return { ok: true, source: "yclients", data };
  }

  private endpointFromTemplate(
    template: string,
    params: Record<string, string>,
  ) {
    let value = template
      .replace("{companyId}", encodeURIComponent(this.companyId))
      .replace("{formId}", encodeURIComponent(this.formId));
    for (const [key, raw] of Object.entries(params))
      value = value.replace(`{${key}}`, encodeURIComponent(raw));
    return value;
  }

  private extractObjectList(data: unknown): Record<string, unknown>[] {
    return this.extractObjectListByKeys(data, [
      "data",
      "items",
      "records",
      "visits",
      "bookings",
      "appointments",
      "services",
      "staff",
      "dates",
      "times",
    ]);
  }

  private extractObjectListByKeys(
    data: unknown,
    keys: string[],
  ): Record<string, unknown>[] {
    if (Array.isArray(data)) {
      return data.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      );
    }
    if (!data || typeof data !== "object") return [];
    const map = data as Record<string, unknown>;
    for (const key of keys) {
      const value = map[key];
      if (Array.isArray(value))
        return this.extractObjectListByKeys(value, keys);
      if (value && typeof value === "object") {
        const nested = this.extractObjectListByKeys(value, keys);
        if (nested.length > 0) return nested;
      }
    }
    return [];
  }

  private remoteDatetime(item: Record<string, unknown>) {
    const datetime = this.firstText(item, [
      "datetime",
      "date_time",
      "start_datetime",
      "startTime",
      "start",
    ]);
    if (datetime)
      return datetime.includes(" ") ? datetime.replace(" ", "T") : datetime;
    const date =
      this.firstText(item, ["date", "day"]) ||
      new Date().toISOString().slice(0, 10);
    const time = this.firstText(item, ["time", "start_time"]) || "00:00";
    return `${date}T${time.length === 5 ? `${time}:00` : time}`;
  }

  private firstText(item: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = item[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (typeof value === "number" && Number.isFinite(value))
        return String(value);
    }
    return undefined;
  }

  private firstNumber(item: Record<string, unknown>, keys: string[]) {
    const text = this.firstText(item, keys);
    const value = Number(text);
    return Number.isFinite(value) ? value : undefined;
  }

  private firstNestedText(
    item: Record<string, unknown>,
    parentKeys: string[],
    childKeys: string[],
  ) {
    for (const parent of parentKeys) {
      const value = item[parent];
      if (Array.isArray(value) && value[0] && typeof value[0] === "object") {
        const text = this.firstText(
          value[0] as Record<string, unknown>,
          childKeys,
        );
        if (text) return text;
      }
      if (value && typeof value === "object") {
        const text = this.firstText(
          value as Record<string, unknown>,
          childKeys,
        );
        if (text) return text;
      }
    }
    return undefined;
  }

  private firstNestedNumber(
    item: Record<string, unknown>,
    parentKeys: string[],
    childKeys: string[],
  ) {
    const text = this.firstNestedText(item, parentKeys, childKeys);
    const value = Number(text);
    return Number.isFinite(value) ? value : undefined;
  }

  private uniqueStaffById(staff: PremiumStaff[]) {
    const seen = new Set<number>();
    const result: PremiumStaff[] = [];
    for (const person of staff) {
      if (!person.id || seen.has(person.id)) continue;
      seen.add(person.id);
      result.push(person);
    }
    return result;
  }

  private async buildAvailabilityForService(
    serviceId: number,
    staff: PremiumStaff[],
    dates: string[],
  ): Promise<BootstrapStaffAvailability[]> {
    return this.mapConcurrent(
      staff,
      this.bootstrapStaffConcurrency,
      async (person) => {
        const slotsRaw = await this.mapConcurrent(
          dates,
          this.bootstrapTimesConcurrency,
          async (date) => {
            const times = await this.loadTimesDirect(person.id, date, serviceId);
            if (times.length === 0) return null;
            return { date, times: times.slice(0, this.bootstrapTimesPerDay) };
          },
        );
        const slots = slotsRaw.filter(
          (item): item is BootstrapSlot => item !== null,
        );
        return {
          staffId: person.id,
          dates: slots.map((item) => item.date),
          firstDate: slots[0]?.date ?? "",
          firstTimes: slots[0]?.times ?? [],
          slots,
        };
      },
    );
  }

  private async loadTimesDirect(
    staffId: number,
    date: string,
    serviceId?: number,
  ): Promise<string[]> {
    try {
      const params: Record<string, unknown> = {};
      if (serviceId) params["service_ids[]"] = serviceId;
      const { data } = await this.bookingClient.get(
        `/book_times/${this.companyId}/${staffId}/${date}`,
        { params, timeout: this.bootstrapRequestTimeoutMs },
      );
      return this.normalizeTimes(data, date).map((item) => item.time);
    } catch (error) {
      this.logger.debug?.(
        `YCLIENTS bootstrap times skipped staff=${staffId} service=${serviceId ?? "any"} date=${date}: ${this.yclientsErrorSummary(error)}`,
      );
      return [];
    }
  }

  private responseDataList<T>(response: unknown): T[] {
    if (!response || typeof response !== "object") return [];
    const data = (response as { data?: unknown }).data;
    return Array.isArray(data) ? (data as T[]) : [];
  }

  private bootstrapTargetServices(services: PremiumService[], serviceId?: number) {
    if (serviceId && Number.isFinite(serviceId)) {
      const exact = services.find((item) => item.id === serviceId);
      return exact ? [exact] : [{ ...demoServices[0], id: serviceId, title: `Услуга #${serviceId}` }];
    }
    return services.slice(0, this.bootstrapServiceLimit);
  }

  private bootstrapDateCandidates() {
    const today = new Date();
    return Array.from({ length: this.bootstrapHorizonDays }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return date.toISOString().slice(0, 10);
    });
  }

  private async mapConcurrent<T, R>(
    items: T[],
    limit: number,
    worker: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const safeLimit = Math.max(1, Math.min(limit, 24));
    const result = new Array<R>(items.length);
    let cursor = 0;
    const runners = Array.from(
      { length: Math.min(safeLimit, items.length) },
      async () => {
        while (cursor < items.length) {
          const index = cursor;
          cursor += 1;
          result[index] = await worker(items[index], index);
        }
      },
    );
    await Promise.all(runners);
    return result;
  }

  private async validateBookingRequest(
    dto: CreateBookingDto,
    phone: string,
    fullname: string,
  ) {
    if (!Number.isFinite(dto.serviceId) || dto.serviceId <= 0)
      throw new BadRequestException(
        "Услуга не выбрана. Обновите каталог и попробуйте снова.",
      );
    if (!Number.isFinite(dto.staffId) || dto.staffId <= 0)
      throw new BadRequestException(
        "Специалист не выбран. Обновите каталог и попробуйте снова.",
      );
    const date = dto.datetime.slice(0, 10);
    const time = dto.datetime.slice(11, 16);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
      throw new BadRequestException(
        "Некорректное время записи. Обновите экран записи.",
      );

    const service = await this.findFreshService(dto.serviceId);
    if (!service || service.active === false || service.bookable === false)
      throw new BadRequestException(
        "Эта услуга уже недоступна. Мы обновили данные, выберите услугу заново.",
      );

    const staff = await this.findFreshStaff(dto.staffId, dto.serviceId);
    if (!staff || staff.fired || staff.hidden || staff.bookable === false)
      throw new BadRequestException(
        "Этот специалист уже недоступен для выбранной услуги. Выберите другого специалиста.",
      );

    const times = await this.getTimes(dto.staffId, date, dto.serviceId);
    const availableTimes = Array.isArray((times as { data?: unknown }).data)
      ? (times as { data: { time?: string }[] }).data
      : [];
    const slotAvailable = availableTimes.some((item) => item.time === time);
    if (!slotAvailable)
      throw new BadRequestException(
        "Это время уже занято или изменилось. Обновите расписание и выберите другое время.",
      );

    const snapshot = await this.readSyncSnapshot();
    const catalogVersion =
      snapshot.catalogVersion ??
      this.hashCatalog(snapshot.services, snapshot.staff);
    const serviceSnapshot = this.serviceSnapshot(service);
    const staffSnapshot = this.staffSnapshot(staff);
    return {
      source: "yclients" as const,
      phone,
      fullname,
      catalogVersion,
      serviceSnapshot,
      staffSnapshot,
      slot: {
        date,
        time,
        datetime: dto.datetime,
        serviceId: dto.serviceId,
        staffId: dto.staffId,
      },
    };
  }

  private async findFreshService(serviceId: number) {
    const remote = await this.getServices().catch(() => null);
    const remoteList =
      remote && Array.isArray((remote as { data?: unknown }).data)
        ? (remote as { data: PremiumService[] }).data
        : [];
    const fromRemote = remoteList.find((item) => item.id === serviceId);
    if (fromRemote) return fromRemote;
    return (await this.cachedServices()).find((item) => item.id === serviceId);
  }

  private async findFreshStaff(staffId: number, serviceId: number) {
    const remote = await this.getStaff(serviceId).catch(() => null);
    const remoteList =
      remote && Array.isArray((remote as { data?: unknown }).data)
        ? (remote as { data: PremiumStaff[] }).data
        : [];
    const fromRemote = remoteList.find((item) => item.id === staffId);
    if (fromRemote) return fromRemote;
    return (await this.cachedStaff()).find((item) => item.id === staffId);
  }

  private serviceSnapshot(service: PremiumService) {
    return {
      id: service.id,
      title: service.title,
      category: service.category,
      price: service.price,
      priceMin: service.price_min,
      priceMax: service.price_max,
      duration: service.duration,
      seanceLength: service.seance_length,
      icon: service.icon,
    };
  }

  private staffSnapshot(staff: PremiumStaff) {
    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      specialization: staff.specialization,
      imageUrl: staff.imageUrl,
    };
  }

  private bookingIdempotencyKey(phone: string, dto: CreateBookingDto) {
    const external = dto.clientRequestId?.trim();
    const base =
      external ||
      `${phone}|${dto.serviceId}|${dto.staffId}|${dto.datetime.slice(0, 16)}`;
    return this.hashValue(base);
  }

  private async findExistingBookingByIdempotency(
    phone: string,
    idempotencyKey: string,
  ) {
    const bookings = this.db.isPostgres
      ? await this.listBookingsPostgres(phone)
      : (await this.readBookingStore()).bookings.filter(
          (item) => item.phone === phone,
        );
    return bookings.find(
      (item) =>
        this.bookingIdempotencyKeyFromRecord(item) === idempotencyKey &&
        !["cancelled", "cancelled_salon", "failed"].includes(item.status),
    );
  }

  private bookingIdempotencyKeyFromRecord(booking: BookingRecord) {
    return (
      booking.idempotencyKey || this.bookingAppMeta(booking).idempotencyKey
    );
  }

  private bookingAppMeta(booking: BookingRecord): {
    idempotencyKey?: string;
    catalogVersion?: string;
    serviceSnapshot?: Record<string, unknown>;
    staffSnapshot?: Record<string, unknown>;
  } {
    const value = booking.yclientsResponse;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const app = (value as Record<string, unknown>).app;
      if (app && typeof app === "object" && !Array.isArray(app))
        return app as {
          idempotencyKey?: string;
          catalogVersion?: string;
          serviceSnapshot?: Record<string, unknown>;
          staffSnapshot?: Record<string, unknown>;
        };
    }
    return {};
  }

  private async cancelRemoteBooking(booking: BookingRecord, reason: string) {
    const recordId = booking.yclientsRecordId;
    if (!recordId) return;
    const template =
      this.config.get<string>("YCLIENTS_CANCEL_ENDPOINT_TEMPLATE")?.trim() ||
      "/record/{companyId}/{recordId}";
    const method = (
      this.config.get<string>("YCLIENTS_CANCEL_METHOD")?.trim() || "DELETE"
    ).toUpperCase();
    const url = template
      .replace("{companyId}", encodeURIComponent(this.companyId))
      .replace("{recordId}", encodeURIComponent(recordId));
    const body = { reason, comment: reason };
    try {
      if (method === "POST") await this.businessClient.post(url, body);
      else if (method === "PUT") await this.businessClient.put(url, body);
      else if (method === "PATCH") await this.businessClient.patch(url, body);
      else await this.businessClient.delete(url, { data: body });
    } catch (error) {
      this.logYclientsFailure("cancel booking", url, error);
      throw new BadRequestException(
        "Не удалось отменить запись. Попробуйте позже или свяжитесь с центром.",
      );
    }
  }

  private bookingForClient(booking: BookingRecord) {
    const appMeta = this.bookingAppMeta(booking);
    return {
      id: booking.id,
      serviceId: booking.serviceId,
      staffId: booking.staffId,
      service:
        booking.serviceTitle ||
        appMeta.serviceSnapshot?.title ||
        `Услуга #${booking.serviceId}`,
      specialist:
        booking.specialistName ||
        appMeta.staffSnapshot?.name ||
        `Специалист #${booking.staffId}`,
      datetime: booking.datetime,
      date: booking.datetime.slice(0, 10),
      time: booking.datetime.slice(11, 16),
      status: this.statusLabel(booking.status),
      statusCode: booking.status,
      isArchive: this.isArchiveBooking(booking),
      canCancel: this.canCancel(booking),
      canReportLate: this.canReportLate(booking),
      cancelAllowedUntil: booking.cancelAllowedUntil,
      yclientsRecordId: booking.yclientsRecordId ? "set" : "",
      catalogVersion: booking.catalogVersion || appMeta.catalogVersion,
      serviceSnapshot: booking.serviceSnapshot || appMeta.serviceSnapshot,
      staffSnapshot: booking.staffSnapshot || appMeta.staffSnapshot,
      clientMessage: booking.clientMessage,
    };
  }

  private statusLabel(status: BookingStatus) {
    if (status === "cancelled") return "Отменена клиентом";
    if (status === "cancelled_salon") return "Отменена центром";
    if (status === "rescheduled") return "Перенесена";
    if (status === "completed") return "Визит завершён";
    if (status === "no_show") return "Клиент не пришёл";
    if (status === "failed") return "Не подтверждена";
    if (status === "needs_refresh") return "Нужно обновить данные";
    if (status === "confirmed") return "Подтверждена";
    return "Создана";
  }

  private isArchiveBooking(booking: BookingRecord) {
    return (
      [
        "cancelled",
        "cancelled_salon",
        "completed",
        "no_show",
        "failed",
      ].includes(booking.status) ||
      new Date(booking.datetime).getTime() < Date.now()
    );
  }

  private canCancel(booking: BookingRecord) {
    return (
      ![
        "cancelled",
        "cancelled_salon",
        "completed",
        "no_show",
        "failed",
      ].includes(booking.status) &&
      Date.now() <= this.cancelAllowedUntil(booking.datetime).getTime()
    );
  }

  private canReportLate(booking: BookingRecord) {
    if (
      [
        "cancelled",
        "cancelled_salon",
        "completed",
        "no_show",
        "failed",
      ].includes(booking.status)
    )
      return false;
    return new Date(booking.datetime).getTime() >= Date.now() - 30 * 60 * 1000;
  }

  private cancelAllowedUntil(datetime: string) {
    const date = new Date(datetime);
    return new Date(date.getTime() - this.cancelBeforeHours * 60 * 60 * 1000);
  }

  private get allowDemoYclients() {
    const explicit = this.config.get<string>("ALLOW_DEMO_YCLIENTS");
    if (explicit !== undefined) return explicit === "true";
    return (
      (this.config.get<string>("APP_ENV") ?? "local").toLowerCase() !==
      "production"
    );
  }

  private get syncEnabled() {
    return this.config.get<string>("YCLIENTS_SYNC_ENABLE", "true") !== "false";
  }

  private get importantEventsToTelegram() {
    return (
      this.config.get<string>(
        "YCLIENTS_IMPORTANT_EVENTS_TO_TELEGRAM",
        "true",
      ) !== "false"
    );
  }

  private get catalogEventsToTelegram() {
    return this.config.get<string>("YCLIENTS_CATALOG_EVENTS_TO_TELEGRAM", "false") === "true";
  }

  private get cacheLastGood() {
    return (
      this.config.get<string>("YCLIENTS_CACHE_LAST_GOOD", "true") !== "false"
    );
  }

  private get operatingModel() {
    return (
      this.config.get<string>("APP_OPERATING_MODEL") ?? "full"
    ).toLowerCase();
  }

  private get bookingProvider() {
    return (
      this.config.get<string>("BOOKING_PROVIDER") ?? "app_cache"
    ).toLowerCase();
  }

  private get profileProvider() {
    return (
      this.config.get<string>("PROFILE_PROVIDER") ?? "app_cache"
    ).toLowerCase();
  }

  private get cancelBeforeHours() {
    const value = Number(
      this.config.get<string>("BOOKING_CANCEL_BEFORE_HOURS") ?? 48,
    );
    return Number.isFinite(value) && value > 0 ? value : 48;
  }

  private get bookingsLookbackDays() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOKINGS_LOOKBACK_DAYS") ?? 30,
    );
    return Number.isFinite(value) && value >= 0 ? value : 30;
  }

  private get bookingsLookaheadDays() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOKINGS_LOOKAHEAD_DAYS") ?? 90,
    );
    return Number.isFinite(value) && value > 0 ? value : 90;
  }

  private async listBookingsPostgres(phone: string) {
    const result = await this.db.query<BookingRow>(
      "select * from bookings where phone = $1 order by datetime desc limit 200",
      [phone],
    );
    return result.rows.map((row) => this.bookingFromRow(row));
  }

  private async findBooking(id: string) {
    if (this.db.isPostgres) {
      const result = await this.db.query<BookingRow>(
        "select * from bookings where id = $1 limit 1",
        [id],
      );
      return result.rows[0] ? this.bookingFromRow(result.rows[0]) : null;
    }
    return (
      (await this.readBookingStore()).bookings.find(
        (item) => item.id === id || item.yclientsRecordId === id,
      ) ?? null
    );
  }

  private async saveBooking(booking: BookingRecord) {
    if (this.db.isPostgres) {
      await this.db.query(
        `insert into bookings (id, phone, fullname, service_id, staff_id, service_title, specialist_name, datetime, status, yclients_record_id, yclients_response, cancel_allowed_until, cancelled_at, cancel_reason, created_at, updated_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, $14, $15, $16)
         on conflict (id) do update set
           phone = excluded.phone,
           fullname = excluded.fullname,
           service_id = excluded.service_id,
           staff_id = excluded.staff_id,
           service_title = excluded.service_title,
           specialist_name = excluded.specialist_name,
           datetime = excluded.datetime,
           status = excluded.status,
           yclients_record_id = excluded.yclients_record_id,
           yclients_response = excluded.yclients_response,
           cancel_allowed_until = excluded.cancel_allowed_until,
           cancelled_at = excluded.cancelled_at,
           cancel_reason = excluded.cancel_reason,
           updated_at = excluded.updated_at`,
        [
          booking.id,
          booking.phone,
          booking.fullname,
          booking.serviceId,
          booking.staffId,
          booking.serviceTitle ?? null,
          booking.specialistName ?? null,
          booking.datetime,
          booking.status,
          booking.yclientsRecordId ?? null,
          JSON.stringify(booking.yclientsResponse ?? {}),
          booking.cancelAllowedUntil,
          booking.cancelledAt ?? null,
          booking.cancelReason ?? null,
          booking.createdAt,
          booking.updatedAt,
        ],
      );
      return;
    }
    const store = await this.readBookingStore();
    const index = store.bookings.findIndex(
      (item) =>
        item.id === booking.id ||
        (booking.yclientsRecordId &&
          item.yclientsRecordId === booking.yclientsRecordId),
    );
    if (index >= 0)
      store.bookings[index] = {
        ...store.bookings[index],
        ...booking,
        id: store.bookings[index].id,
      };
    else store.bookings.push(booking);
    await this.writeBookingStore(store);
  }

  private bookingFromRow(row: BookingRow): BookingRecord {
    return {
      id: row.id,
      phone: row.phone,
      fullname: row.fullname,
      serviceId: row.service_id,
      staffId: row.staff_id,
      serviceTitle: row.service_title ?? undefined,
      specialistName: row.specialist_name ?? undefined,
      datetime: row.datetime,
      status: row.status,
      yclientsRecordId: row.yclients_record_id ?? undefined,
      yclientsResponse: row.yclients_response,
      cancelAllowedUntil: new Date(row.cancel_allowed_until).toISOString(),
      cancelledAt: row.cancelled_at
        ? new Date(row.cancelled_at).toISOString()
        : undefined,
      cancelReason: row.cancel_reason ?? undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private async readBookingStore(): Promise<BookingStore> {
    try {
      const raw = await readFile(this.bookingsPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<BookingStore>;
      return { version: 1, bookings: parsed.bookings ?? [] };
    } catch {
      return { version: 1, bookings: [] };
    }
  }

  private async writeBookingStore(store: BookingStore) {
    await mkdir(dirname(this.bookingsPath), { recursive: true });
    await writeFile(
      this.bookingsPath,
      `${JSON.stringify(store, null, 2)}\n`,
      "utf8",
    );
  }

  private extractYclientsRecordId(data: unknown): string | undefined {
    const queue: unknown[] = [data];
    while (queue.length) {
      const value = queue.shift();
      if (!value || typeof value !== "object") continue;
      if (Array.isArray(value)) {
        queue.push(...value);
        continue;
      }
      const map = value as Record<string, unknown>;
      for (const key of [
        "record_id",
        "recordId",
        "visit_id",
        "visitId",
        "id",
      ]) {
        const candidate = map[key];
        if (typeof candidate === "string" || typeof candidate === "number")
          return String(candidate);
      }
      for (const key of [
        "data",
        "record",
        "appointment",
        "appointments",
        "records",
      ])
        queue.push(map[key]);
    }
    return undefined;
  }

  private refreshCatalogHashes(snapshot: SyncSnapshot) {
    snapshot.serviceHash = this.hashValue(
      JSON.stringify(
        (snapshot.services ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          duration: item.duration,
          active: item.active,
          bookable: item.bookable,
        })),
      ),
    );
    snapshot.staffHash = this.hashValue(
      JSON.stringify(
        (snapshot.staff ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          imageUrl: item.imageUrl,
          bookable: item.bookable,
          hidden: item.hidden,
          fired: item.fired,
        })),
      ),
    );
    snapshot.catalogVersion = this.hashValue(
      `${snapshot.serviceHash}|${snapshot.staffHash}`,
    ).slice(0, 20);
  }

  private hashCatalog(services: PremiumService[], staff: PremiumStaff[]) {
    return this.hashValue(
      JSON.stringify({
        services: services.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          duration: item.duration,
        })),
        staff: staff.map((item) => ({
          id: item.id,
          name: item.name,
          role: item.role,
        })),
      }),
    ).slice(0, 20);
  }

  private hashValue(value: string) {
    return createHash("sha256").update(value).digest("hex");
  }

  private get quoteTtlMinutes() {
    const value = Number(
      this.config.get<string>("BOOKING_QUOTE_TTL_MINUTES") ?? 3,
    );
    return Number.isFinite(value) && value > 0 ? value : 3;
  }

  private get bootstrapHorizonDays() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_HORIZON_DAYS") ?? 30,
    );
    return Number.isFinite(value) ? Math.max(7, Math.min(45, value)) : 30;
  }

  private get bootstrapServiceLimit() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_SERVICE_LIMIT") ?? 12,
    );
    return Number.isFinite(value) ? Math.max(1, Math.min(80, value)) : 12;
  }

  private get bootstrapServiceConcurrency() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_SERVICE_CONCURRENCY") ?? 4,
    );
    return Number.isFinite(value) ? Math.max(1, Math.min(8, value)) : 4;
  }

  private get bootstrapStaffConcurrency() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_STAFF_CONCURRENCY") ?? 4,
    );
    return Number.isFinite(value) ? Math.max(1, Math.min(8, value)) : 4;
  }

  private get bootstrapTimesConcurrency() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_TIMES_CONCURRENCY") ?? 24,
    );
    return Number.isFinite(value) ? Math.max(4, Math.min(32, value)) : 24;
  }

  private get bootstrapRequestTimeoutMs() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_REQUEST_TIMEOUT_MS") ?? 3000,
    );
    return Number.isFinite(value) ? Math.max(1200, Math.min(8000, value)) : 3000;
  }

  private get bootstrapTimesPerDay() {
    const value = Number(
      this.config.get<string>("YCLIENTS_BOOTSTRAP_TIMES_PER_DAY") ?? 24,
    );
    return Number.isFinite(value) ? Math.max(4, Math.min(60, value)) : 24;
  }

  private logYclientsFailure(scope: string, url: string, error: unknown) {
    this.logger.warn(
      `YCLIENTS ${scope} failed ${url}: ${this.yclientsErrorSummary(error)}`,
    );
  }

  private yclientsErrorSummary(error: unknown) {
    const candidate = error as {
      message?: string;
      response?: { status?: number; statusText?: string; data?: unknown };
    };
    const status = candidate.response?.status;
    const statusText = candidate.response?.statusText;
    const data = candidate.response?.data;
    const body = data === undefined ? "" : ` body=${this.safeJson(data)}`;
    return [
      `status=${status ?? "n/a"}`,
      statusText ? `text=${statusText}` : "",
      candidate.message ? `message=${candidate.message}` : "",
      body,
    ]
      .filter(Boolean)
      .join(" ");
  }

  private safeJson(value: unknown) {
    try {
      const text = JSON.stringify(value);
      return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
    } catch {
      return String(value);
    }
  }

  private isRealValue(value?: string) {
    const text = value?.trim() ?? "";
    if (!text) return false;
    if (text.startsWith("put_")) return false;
    if (text.includes("your-") || text.includes("your_")) return false;
    if (text.includes("_here")) return false;
    return true;
  }

  private resolveBaseUrl() {
    const explicit = this.config.get<string>("YCLIENTS_API_BASE_URL")?.trim();
    if (explicit && !explicit.startsWith("put_"))
      return explicit.replace(/\/$/, "");
    return "https://api.yclients.com/api/v1";
  }

  private partnerAuthorizationHeader() {
    const partnerToken = (
      this.config.get<string>("YCLIENTS_PARTNER_TOKEN") ?? ""
    )
      .replace(/^Bearer\s+/i, "")
      .trim();
    return this.isRealValue(partnerToken)
      ? `Bearer ${partnerToken}`
      : "Bearer missing_partner_token";
  }

  private businessAuthorizationHeader() {
    const partnerToken = (
      this.config.get<string>("YCLIENTS_PARTNER_TOKEN") ?? ""
    )
      .replace(/^Bearer\s+/i, "")
      .trim();
    const userToken = (this.config.get<string>("YCLIENTS_USER_TOKEN") ?? "")
      .replace(/^User\s+/i, "")
      .trim();
    if (this.isRealValue(partnerToken) && this.isRealValue(userToken))
      return `Bearer ${partnerToken}, User ${userToken}`;
    if (this.isRealValue(partnerToken)) return `Bearer ${partnerToken}`;
    return "Bearer missing_partner_token";
  }

  private normalizePhone(value: string) {
    const digits = value.toString().replace(/[^0-9]/g, "");
    if (!digits) return "";
    if (/^8\d{10}$/.test(digits)) return `+7${digits.slice(1)}`;
    if (/^9\d{9}$/.test(digits)) return `+7${digits}`;
    if (/^7\d{10}$/.test(digits)) return `+${digits}`;
    return value.toString().trim().startsWith("+") ? `+${digits}` : digits;
  }


  private sanitizeMarketplaceText(value: string) {
    return value
      .replace(/лечебн(ый|ая|ое|ые|ого|ым|ую)/gi, 'укрепляющ$1')
      .replace(/\bлечени[ея]\b/gi, 'уход')
      .replace(/\bлечит\b/gi, 'помогает в уходе')
      .replace(/диагностик[аиуой]*/gi, 'оценка состояния')
      .replace(/диагноз[а-я]*/gi, 'оценка состояния')
      .replace(/медицинск(ая|ое|ие|их|ой|ую)\s+(помощь|услуга|услуги)/gi, 'услуга ухода')
      .replace(/\bврач\b/gi, 'специалист')
      .replace(/терапи[яиюей]/gi, 'уход')
      .replace(/соскоб\s+на\s+анализ/gi, 'оценка состояния')
      .replace(/\bсоскоб\b/gi, 'оценка состояния')
      .replace(/\bанализ(ы|ов|а|у|ом)?\b/gi, 'консультация')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanText(value: string) {
    return repairMojibake(value).replace(/\s+/g, " ").trim();
  }

  private priceLabel(min: number, max: number) {
    if (!min && !max) return "";
    if (min && max && min !== max)
      return `${Math.round(min)}–${Math.round(max)} ₽`;
    return `${Math.round(min || max)} ₽`;
  }

  private durationLabel(seconds: number) {
    if (!seconds) return "";
    const minutes =
      seconds > 300 ? Math.round(seconds / 60) : Math.round(seconds);
    return `${minutes} мин`;
  }

  private durationTextToSeconds(value: string) {
    const match = value.match(/(\d+)/);
    if (!match) return 0;
    return Number(match[1]) * 60;
  }

  private categoryForTitle(title: string) {
    const lower = title.toLowerCase();
    if (lower.includes("маник")) return "Маникюр";
    if (lower.includes("педик")) return "Педикюр";
    if (lower.includes("анализ") || lower.includes("соскоб")) return "Консультация";
    if (
      lower.includes("коррек") ||
      lower.includes("титан") ||
      lower.includes("систем")
    )
      return "Коррекция ногтей";
    return "Подология";
  }

  private iconForService(title: string, category: string) {
    const text = `${title} ${category}`.toLowerCase();
    if (text.includes("маник")) return "🤍";
    if (text.includes("анализ") || text.includes("соскоб")) return "📝";
    if (
      text.includes("коррек") ||
      text.includes("систем") ||
      text.includes("титан")
    )
      return "🧩";
    if (text.includes("ногт")) return "💅";
    return "🦶";
  }

  private descriptionForService(title: string, category: string) {
    if (category.toLowerCase().includes("маник"))
      return "Аккуратная эстетическая процедура с вниманием к форме, чистоте и комфорту.";
    if (category.toLowerCase().includes("коррек"))
      return "Профессиональная работа с ногтевой пластиной и деликатная коррекция дискомфорта.";
    if (category.toLowerCase().includes("консультац"))
      return "Бережный забор материала и понятные рекомендации по дальнейшим действиям.";
    if (title.toLowerCase().includes("консульта"))
      return "Осмотр, объяснение ситуации простым языком и индивидуальный план ухода.";
    return "Профессиональная подологическая процедура в спокойном premium-формате.";
  }

  private isYclientsNoMasterImage(url: string) {
    return !url || /no-master|no_avatar|default/i.test(url);
  }

  private dateShift(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private async notifyImportantEvent(title: string, lines: string[]) {
    if (!this.importantEventsToTelegram) return;
    await this.telegram
      .notifySystemEvent({ title, lines })
      .catch((error: unknown) =>
        this.logger.warn(
          `Telegram important event skipped: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
  }

  private async notifyBookingEvent(
    title: string,
    booking: Pick<BookingRecord, "phone" | "fullname">,
    lines: string[],
  ) {
    if (!this.importantEventsToTelegram) return;
    await this.telegram
      .notifyClientActionEvent({
        roomId: this.roomIdForPhone(booking.phone),
        clientName: booking.fullname,
        clientPhone: booking.phone,
        title,
        lines,
      })
      .catch((error: unknown) =>
        this.logger.warn(
          `Telegram booking event skipped: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
  }

  private roomIdForPhone(phone: string) {
    return `client-${this.normalizePhone(phone).replace(/[^0-9]+/g, "")}`;
  }

  private humanDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
}

const demoServices: PremiumService[] = [
  {
    id: 1001,
    title: "Профессиональный педикюр",
    subtitle: "Аккуратная обработка стоп и ногтей",
    description: "Аккуратная обработка стоп и ногтей",
    category: "Подология",
    icon: "🦶",
    price_min: 4500,
    price_max: 4500,
    price: "4500 ₽",
    duration: "90 мин",
    seance_length: 5400,
    active: true,
    bookable: true,
    source: "yclients",
  },
  {
    id: 1002,
    title: "Консультация подолога",
    subtitle: "Осмотр, рекомендации и план ухода",
    description: "Осмотр, рекомендации и план ухода",
    category: "Подология",
    icon: "🩺",
    price_min: 2000,
    price_max: 2000,
    price: "2000 ₽",
    duration: "45 мин",
    seance_length: 2700,
    active: true,
    bookable: true,
    source: "yclients",
  },
];

const demoStaff: PremiumStaff[] = [
  {
    id: 2001,
    name: "Александра Куцытой",
    role: "Специалист-подолог",
    specialization: "Специалист-подолог",
    experience: "",
    description: "Профессиональный специалист центра.",
    imageUrl: "assets/images/specialist_alexandra_kutsytoy.jpg",
    avatar: "",
    avatar_big: "",
    bookable: true,
    hidden: false,
    fired: false,
    source: "yclients",
  },
  {
    id: 2002,
    name: "Кристина Журомская",
    role: "Подолог-эстетист",
    specialization: "Подолог-эстетист",
    experience: "",
    description: "Профессиональный специалист центра.",
    imageUrl: "",
    avatar: "",
    avatar_big: "",
    bookable: true,
    hidden: false,
    fired: false,
    source: "yclients",
  },
];

function demoDates() {
  const today = new Date();
  return [2, 3, 4, 6].map((shift) => {
    const date = new Date(today);
    date.setDate(today.getDate() + shift);
    return { date: date.toISOString().slice(0, 10) };
  });
}

function demoTimes(date: string) {
  return ["10:00", "12:30", "14:30", "17:00"].map((time) => ({ date, time }));
}
