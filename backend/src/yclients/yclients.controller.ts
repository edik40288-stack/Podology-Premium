import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AuthenticatedRequest, JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CancelBookingDto, CreateBookingDto, LateBookingDto } from "./dto";
import { YclientsService } from "./yclients.service";

@Controller("yclients")
export class YclientsController {
  constructor(private readonly yclients: YclientsService) {}

  @Get("status")
  status() {
    return this.yclients.status();
  }

  @Get("services")
  getServices(
    @Query("staffId") staffId?: string,
    @Query("datetime") datetime?: string,
  ) {
    return this.yclients.getServices(
      staffId ? Number(staffId) : undefined,
      datetime,
    );
  }

  @Get("staff")
  getStaff(
    @Query("serviceId") serviceId?: string,
    @Query("datetime") datetime?: string,
  ) {
    return this.yclients.getStaff(
      serviceId ? Number(serviceId) : undefined,
      datetime,
    );
  }

  @Get("catalog/refresh")
  refreshCatalog() {
    return this.yclients.refreshCatalog();
  }

  @Get("booking/bootstrap")
  getBookingBootstrap(@Query("serviceId") serviceId?: string) {
    return this.yclients.getBookingBootstrap(
      serviceId ? Number(serviceId) : undefined,
    );
  }

  @Get("dates")
  getDates(
    @Query("staffId") staffId?: string,
    @Query("serviceId") serviceId?: string,
  ) {
    return this.yclients.getDates(
      staffId ? Number(staffId) : undefined,
      serviceId ? Number(serviceId) : undefined,
    );
  }

  @Get("times")
  getTimes(
    @Query("staffId") staffId: string,
    @Query("date") date: string,
    @Query("serviceId") serviceId?: string,
  ) {
    return this.yclients.getTimes(
      Number(staffId),
      date,
      serviceId ? Number(serviceId) : undefined,
    );
  }

  @Get("bookings")
  @UseGuards(JwtAuthGuard)
  listBookings(@Req() request: AuthenticatedRequest) {
    return this.yclients.listBookings(request.user);
  }

  @Post("booking/quote")
  @UseGuards(JwtAuthGuard)
  quoteBooking(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateBookingDto,
  ) {
    return this.yclients.quoteBooking(
      {
        ...dto,
        phone: request.user.phone,
        fullname:
          `${request.user.firstName ?? ""} ${request.user.lastName ?? ""}`.trim() ||
          dto.fullname,
      },
      request.user,
    );
  }

  @Post("booking")
  @UseGuards(JwtAuthGuard)
  createBooking(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateBookingDto,
  ) {
    return this.yclients.createBooking(
      {
        ...dto,
        phone: request.user.phone,
        fullname:
          `${request.user.firstName ?? ""} ${request.user.lastName ?? ""}`.trim() ||
          dto.fullname,
      },
      request.user,
    );
  }

  @Post("bookings/:id/cancel")
  @UseGuards(JwtAuthGuard)
  cancelBooking(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.yclients.cancelBooking(
      request.user,
      id,
      dto.reason || "Отмена клиентом из мобильного приложения",
    );
  }

  @Post("bookings/:id/late")
  @UseGuards(JwtAuthGuard)
  lateBooking(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: LateBookingDto,
  ) {
    return this.yclients.lateBooking(request.user, id, dto);
  }
}
