import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/core/api_client.dart';
import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';
import 'package:podology_premium_client/src/shared/utils/ui_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/chat_booking_widgets.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({
    super.key,
    required this.profile,
    required this.service,
    required this.bookings,
    required this.onBookingCreated,
    required this.onBookingCanceled,
    required this.onBookingLate,
    this.initialBootstrap,
    required this.allStaff,
    this.onBootstrapLoaded,
  });

  final ClientProfile profile;
  final ServiceItem service;
  final List<BookingItem> bookings;
  final ValueChanged<BookingItem> onBookingCreated;
  final Future<void> Function(BookingItem item) onBookingCanceled;
  final Future<void> Function(BookingItem item) onBookingLate;
  final BookingBootstrap? initialBootstrap;
  final List<SpecialistItem> allStaff;
  final ValueChanged<BookingBootstrap>? onBootstrapLoaded;

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  late final ApiClient api;
  BookingBootstrap? bootstrap;
  List<SpecialistItem> specialists = const [];
  List<String> dates = const [];
  List<String> times = const [];
  Map<int, bool> staffHasSlots = const {};
  int specialistIndex = 0;
  int dateIndex = 0;
  int timeIndex = 0;
  bool loading = false;
  bool loadingTimes = false;
  bool creating = false;
  String source = 'Готовим расписание';

  @override
  void initState() {
    super.initState();
    api = ApiClient(authToken: widget.profile.authToken);
    _applyInstantCatalog();
    final initial = widget.initialBootstrap;
    if (initial != null && initial.isFresh) {
      _applyBootstrap(initial, silent: true);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (times.isEmpty) _reloadTimes();
      _loadBookingData(quiet: true);
    });
  }

  @override
  void didUpdateWidget(covariant BookingScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    final catalogChanged = oldWidget.service.id != widget.service.id || _staffSignature(oldWidget.allStaff) != _staffSignature(widget.allStaff);
    final bootstrapChanged = oldWidget.initialBootstrap?.generatedAt != widget.initialBootstrap?.generatedAt;
    if (catalogChanged) {
      _applyInstantCatalog();
    }
    if (catalogChanged || bootstrapChanged) {
      final initial = widget.initialBootstrap;
      if (initial != null && initial.isFresh && initial.availabilityFor(widget.service.id).isNotEmpty) {
        _applyBootstrap(initial, silent: true);
      }
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        if (times.isEmpty) _reloadTimes();
        if (catalogChanged) _loadBookingData(quiet: true);
      });
    }
  }

  void _applyInstantCatalog() {
    // Before YCLIENTS service->staff mapping arrives, do not guess which
    // specialist can do the selected service. Dates are shown immediately so
    // the screen is not empty, but staff/time comes only from live YCLIENTS data.
    final nextDates = _nextBookingDates();
    setState(() {
      specialists = const [];
      dates = nextDates;
      times = const [];
      staffHasSlots = const {};
      specialistIndex = 0;
      dateIndex = 0;
      timeIndex = 0;
      source = 'Обновляем специалистов';
    });
  }

  List<String> _nextBookingDates() {
    final today = DateTime.now();
    return List<String>.generate(30, (index) {
      final date = DateTime(today.year, today.month, today.day).add(Duration(days: index));
      final month = date.month.toString().padLeft(2, '0');
      final day = date.day.toString().padLeft(2, '0');
      return '${date.year}-$month-$day';
    });
  }

  List<SpecialistItem> _uniqueStaff(List<SpecialistItem> staff) {
    final seen = <int>{};
    final result = <SpecialistItem>[];
    for (final item in staff) {
      if (item.id <= 0 || seen.contains(item.id)) continue;
      seen.add(item.id);
      result.add(item);
    }
    return result;
  }

  String _staffSignature(List<SpecialistItem> staff) => staff.map((item) => item.id).join(',');


  List<String> _cleanDates(List<String> values) {
    final result = <String>[];
    final seen = <String>{};
    for (final raw in values) {
      final date = apiDate(raw);
      if (!RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(date)) continue;
      if (seen.add(date)) result.add(date);
    }
    result.sort();
    return result;
  }

  Future<void> _loadBookingData({bool quiet = false}) async {
    if (!quiet) {
      setState(() {
        loading = true;
        source = 'Обновляем расписание';
      });
    } else {
      setState(() => loading = true);
    }

    try {
      final loaded = await api.loadBookingBootstrap(serviceId: widget.service.id);
      widget.onBootstrapLoaded?.call(loaded);
      if (!mounted) return;
      _applyBootstrap(loaded);
    } catch (_) {
      if (!mounted) return;
      if (specialists.isEmpty) {
        _applyInstantCatalog();
      }
      if (mounted) setState(() => source = times.isEmpty ? 'Выберите специалиста и дату' : 'Выберите удобное время');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _applyBootstrap(BookingBootstrap loaded, {bool silent = false}) {
    final serviceId = widget.service.id;
    final availability = loaded.availabilityFor(serviceId);
    final allowedFromMap = loaded.serviceStaffMap[serviceId] ?? const <int>[];
    final allowedFromAvailability = availability.map((item) => item.staffId).where((id) => id > 0).toList();
    final allowedIds = (allowedFromMap.isNotEmpty ? allowedFromMap : allowedFromAvailability).toSet();
    final staffSource = _uniqueStaff([...loaded.staff, ...widget.allStaff]);
    final visibleStaff = allowedIds.isEmpty
        ? const <SpecialistItem>[]
        : staffSource.where((person) => allowedIds.contains(person.id)).toList();

    final availabilityByStaff = <int, StaffAvailability>{
      for (final item in availability) item.staffId: item,
    };
    final availabilityFlags = <int, bool>{
      for (final person in visibleStaff) person.id: availabilityByStaff[person.id]?.hasSlots == true,
    };

    final safeSelectedStaff = specialists.isNotEmpty && specialistIndex < specialists.length
        ? specialists[specialistIndex].id
        : null;
    var selectedStaff = 0;
    if (safeSelectedStaff != null) {
      final previousIndex = visibleStaff.indexWhere((item) => item.id == safeSelectedStaff);
      if (previousIndex >= 0) selectedStaff = previousIndex;
    }

    final selectedAvailability = visibleStaff.isNotEmpty ? availabilityByStaff[visibleStaff[selectedStaff].id] : null;
    final dateCandidates = selectedAvailability?.dates.isNotEmpty == true
        ? _cleanDates(selectedAvailability!.dates)
        : const <String>[];
    final previousDate = dates.isNotEmpty && dateIndex < dates.length ? apiDate(dates[dateIndex]) : '';
    var selectedDateIndex = previousDate.isNotEmpty ? dateCandidates.indexOf(previousDate) : 0;
    if (selectedDateIndex < 0) selectedDateIndex = 0;
    final selectedDate = dateCandidates.isNotEmpty ? dateCandidates[selectedDateIndex.clamp(0, dateCandidates.length - 1).toInt()] : '';
    final timeCandidates = selectedDate.isNotEmpty ? (selectedAvailability?.timesFor(selectedDate) ?? const <String>[]) : const <String>[];

    setState(() {
      bootstrap = loaded;
      specialists = visibleStaff;
      dates = dateCandidates;
      times = timeCandidates;
      staffHasSlots = availabilityFlags;
      specialistIndex = visibleStaff.isEmpty ? 0 : selectedStaff.clamp(0, visibleStaff.length - 1).toInt();
      dateIndex = selectedDate.isEmpty ? 0 : dateCandidates.indexOf(selectedDate).clamp(0, dateCandidates.length - 1).toInt();
      timeIndex = 0;
      if (visibleStaff.isEmpty) {
        source = 'Для этой услуги пока нет специалистов онлайн-записи';
      } else if (dateCandidates.isEmpty) {
        source = 'Свободных окон для этой услуги пока нет';
      } else {
        source = timeCandidates.isEmpty ? 'Проверяем время' : 'Выберите удобное время';
      }
    });
    if (timeCandidates.isEmpty && selectedDate.isNotEmpty) {
      Future.microtask(_reloadTimes);
    }
  }

  Future<List<String>> _safeLoadTimes(int staffId, String date) async {
    try {
      return await api.loadTimes(staffId: staffId, date: date, serviceId: widget.service.id);
    } catch (_) {
      return const [];
    }
  }

  void _selectSpecialist(int value) {
    if (value < 0 || value >= specialists.length) return;
    final person = specialists[value];
    final availability = _availabilityFor(person.id);
    final nextDates = _cleanDates(availability?.dates ?? const <String>[]);
    final nextTimes = nextDates.isNotEmpty ? (availability?.timesFor(nextDates.first) ?? const <String>[]) : const <String>[];
    setState(() {
      specialistIndex = value;
      dates = nextDates;
      times = nextTimes;
      dateIndex = 0;
      timeIndex = 0;
      source = nextDates.isEmpty ? 'Свободных окон для этого специалиста пока нет' : (nextTimes.isEmpty ? 'Проверяем ближайшее время' : 'Выберите удобное время');
    });
    if (nextDates.isNotEmpty && nextTimes.isEmpty) _reloadTimes();
  }

  void _selectDate(int value) {
    if (value < 0 || value >= dates.length) return;
    final date = dates[value];
    final person = specialists.isNotEmpty ? specialists[specialistIndex] : null;
    final immediateTimes = person == null ? const <String>[] : (_availabilityFor(person.id)?.timesFor(date) ?? const <String>[]);
    setState(() {
      dateIndex = value;
      times = immediateTimes;
      timeIndex = 0;
      source = immediateTimes.isEmpty ? 'Проверяем время' : 'Выберите удобное время';
    });
    _reloadTimes();
  }

  StaffAvailability? _availabilityFor(int staffId) {
    final items = bootstrap?.availabilityFor(widget.service.id) ?? const <StaffAvailability>[];
    for (final item in items) {
      if (item.staffId == staffId) return item;
    }
    return null;
  }

  Future<void> _reloadTimes() async {
    if (specialists.isEmpty || dates.isEmpty) return;
    setState(() {
      loadingTimes = true;
      timeIndex = 0;
      source = times.isEmpty ? 'Проверяем время' : 'Обновляем время';
    });
    final staff = specialists[specialistIndex];
    final date = dates[dateIndex];
    final loadedTimes = await _safeLoadTimes(staff.id, date);
    if (!mounted) return;
    setState(() {
      times = loadedTimes;
      staffHasSlots = {...staffHasSlots, staff.id: loadedTimes.isNotEmpty || staffHasSlots[staff.id] == true};
      source = loadedTimes.isEmpty ? 'На эту дату свободного времени нет' : 'Выберите удобное время';
      loadingTimes = false;
    });
  }

  Future<void> createBooking() async {
    if (creating) return;
    if (specialists.isEmpty || dates.isEmpty || times.isEmpty) {
      showSnack(context, 'Нет выбранного времени. Выберите специалиста, дату и свободное окно.');
      return;
    }
    setState(() => creating = true);
    final specialist = specialists[specialistIndex];
    final date = dates[dateIndex];
    final time = times[timeIndex];
    try {
      final booking = await api.createBooking(profile: widget.profile, service: widget.service, specialist: specialist, date: date, time: time);
      widget.onBookingCreated(booking);
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Это время могло измениться. Обновляем расписание.');
      await _reloadTimes();
    } finally {
      if (mounted) setState(() => creating = false);
    }
  }

  String _staffLabel(SpecialistItem item) => item.name;

  @override
  Widget build(BuildContext context) {
    final upcoming = widget.bookings.where((item) => !item.isArchive).toList();
    final archive = widget.bookings.where((item) => item.isArchive).toList();
    final canCreate = !loadingTimes && !creating && specialists.isNotEmpty && dates.isNotEmpty && times.isNotEmpty;
    final selectedSpecialist = specialists.isNotEmpty ? specialists[specialistIndex] : null;
    final selectedDate = dates.isNotEmpty ? dates[dateIndex] : '';
    final selectedTime = times.isNotEmpty ? times[timeIndex] : '';

    return PageScaffold(
      title: 'Запись',
      subtitle: 'Выберите услугу, специалиста, дату и время.',
      action: IconButton.filledTonal(onPressed: loading ? null : () => _loadBookingData(), icon: const Icon(Icons.refresh_rounded)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        HumanInfoCard(icon: Icons.event_available_rounded, title: loading && specialists.isEmpty ? 'Обновляем расписание...' : source, text: 'Услуга: ${widget.service.title}'),
        const SizedBox(height: 14),
        PremiumCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(widget.service.title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('${widget.service.price}${widget.service.duration.isNotEmpty ? ' • ${widget.service.duration}' : ''}', style: const TextStyle(color: AppColors.lime, fontWeight: FontWeight.w900)),
            const SizedBox(height: 18),
            const StepTitle('1. Специалист'),
            if (specialists.isEmpty)
              const EmptyState(text: 'Сейчас нет специалистов для онлайн-записи по этой услуге')
            else
              Chips(values: specialists.map(_staffLabel).toList(), selected: specialistIndex, onSelected: _selectSpecialist),
            const SizedBox(height: 16),
            const StepTitle('2. Дата'),
            if (dates.isEmpty)
              const EmptyState(text: 'Выберите другой день')
            else
              Chips(values: dates, selected: dateIndex, onSelected: _selectDate),
            const SizedBox(height: 16),
            const StepTitle('3. Время'),
            if (loadingTimes)
              const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: LinearProgressIndicator())
            else if (times.isEmpty)
              const EmptyState(text: 'На эту дату свободного времени нет. Выберите другой день или специалиста.')
            else
              Chips(values: times, selected: timeIndex, onSelected: (value) => setState(() => timeIndex = value)),
            const SizedBox(height: 16),
            if (selectedSpecialist != null && selectedDate.isNotEmpty && selectedTime.isNotEmpty)
              Text('Выбрано: ${selectedSpecialist.name} • $selectedDate • $selectedTime', style: const TextStyle(color: AppColors.graphite, fontWeight: FontWeight.w800)),
            const SizedBox(height: 20),
            PremiumButton(text: creating ? 'Создаём запись...' : 'Подтвердить запись', icon: Icons.check_circle_rounded, onTap: canCreate ? createBooking : null),
          ]),
        ),
        const SectionHeader(title: 'Предстоящие', icon: Icons.event_available_rounded),
        if (upcoming.isEmpty) const EmptyState(text: 'Пока нет предстоящих записей'),
        for (final item in upcoming) BookingTile(item: item, onCancel: () => widget.onBookingCanceled(item), onLate: () => widget.onBookingLate(item)),
        const SectionHeader(title: 'Архив', icon: Icons.history_rounded),
        if (archive.isEmpty) const EmptyState(text: 'Архив пуст'),
        for (final item in archive) BookingTile(item: item),
      ]),
    );
  }
}
