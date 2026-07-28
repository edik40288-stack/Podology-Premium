import 'dart:async';

import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/core/api_client.dart';
import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/core/session_store.dart';
import 'package:podology_premium_client/src/data/demo_content.dart';
import 'package:podology_premium_client/src/features/booking/booking_screen.dart';
import 'package:podology_premium_client/src/features/care_card/care_card_screen.dart';
import 'package:podology_premium_client/src/features/chat/chat_screen.dart';
import 'package:podology_premium_client/src/features/home/home_screen.dart';
import 'package:podology_premium_client/src/features/profile/profile_screen.dart';
import 'package:podology_premium_client/src/features/services/services_screen.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';
import 'package:podology_premium_client/src/shared/utils/ui_helpers.dart';

class PremiumShell extends StatefulWidget {
  const PremiumShell({super.key, required this.profile, required this.onLogout});

  final ClientProfile profile;
  final VoidCallback onLogout;

  @override
  State<PremiumShell> createState() => _PremiumShellState();
}

class _PremiumShellState extends State<PremiumShell> {
  late ApiClient api;
  final session = const SessionStore();
  int index = 0;
  HomeContent homeContent = demoHomeContent;
  ServiceItem selectedService = demoServices.first;
  final List<BookingItem> bookings = <BookingItem>[];
  List<ServiceItem> remoteServices = const [];
  List<SpecialistItem> remoteStaff = const [];
  final Map<int, BookingBootstrap> bookingBootstraps = <int, BookingBootstrap>{};
  bool online = false;
  Timer? contentRefreshTimer;
  late ClientProfile currentProfile;
  ClientSettings currentSettings = const ClientSettings();

  @override
  void initState() {
    super.initState();
    currentProfile = widget.profile;
    api = ApiClient(authToken: currentProfile.authToken);
    _bootstrap();
    contentRefreshTimer = Timer.periodic(const Duration(seconds: 15), (_) => _refreshLiveState());
  }

  @override
  void dispose() {
    contentRefreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _refreshLiveState() async {
    try {
      final nextContent = await api.loadHomeContent();
      final nextServices = await _safeLoadServices();
      final nextStaff = await _safeLoadStaff();
      final nextBookings = await _safeLoadBookings();
      if (!mounted) return;
      setState(() {
        online = true;
        homeContent = nextContent;
        if (nextServices.isNotEmpty) {
          remoteServices = nextServices;
          if (!remoteServices.any((item) => item.id == selectedService.id)) selectedService = remoteServices.first;
        }
        if (nextStaff.isNotEmpty) remoteStaff = nextStaff;
        bookings
          ..clear()
          ..addAll(nextBookings);
      });
    } catch (_) {
      if (mounted) setState(() => online = false);
    }
  }

  Future<void> _bootstrap() async {
    final contentFuture = api.loadHomeContent();
    final servicesFuture = _safeLoadServices();
    final staffFuture = _safeLoadStaff();
    unawaited(api.health().catchError((_) => <String, dynamic>{}));

    try {
      final yclientsServices = await servicesFuture;
      final yclientsStaff = await staffFuture;
      if (!mounted) return;
      setState(() {
        online = true;
        remoteServices = yclientsServices;
        remoteStaff = yclientsStaff;
        final catalogServices = remoteServices.isNotEmpty
            ? remoteServices
            : (homeContent.serviceItems.isNotEmpty ? homeContent.serviceItems : demoServices);
        selectedService = catalogServices.isNotEmpty ? catalogServices.first : demoServices.first;
      });
      final cached = bookingBootstraps[selectedService.id];
      if (cached == null || !cached.isFresh) unawaited(_warmBookingBootstrap(selectedService.id));
      unawaited(contentFuture.then((content) {
        if (!mounted) return;
        setState(() => homeContent = content);
      }).catchError((_) {}));
      unawaited(_loadProfileInBackground());
      unawaited(_loadBookingsInBackground());
    } catch (_) {
      if (!mounted) return;
      setState(() {
        online = false;
        homeContent = demoHomeContent;
        selectedService = demoServices.first;
      });
    }
  }

  Future<void> _loadProfileInBackground() async {
    try {
      final profilePayload = await api.loadProfileSettings(currentProfile.phone);
      final data = profilePayload['data'] is Map ? Map<String, dynamic>.from(profilePayload['data'] as Map) : <String, dynamic>{};
      if (!mounted) return;
      setState(() {
        currentProfile = currentProfile.copyWith(
          firstName: textValue(data['firstName'], currentProfile.firstName),
          lastName: textValue(data['lastName'], currentProfile.lastName),
          phone: textValue(data['phone'], currentProfile.phone),
        );
        currentSettings = ClientSettings.fromMap(data);
      });
    } catch (_) {}
  }

  Future<void> _loadBookingsInBackground() async {
    final loadedBookings = await _safeLoadBookings();
    if (!mounted || loadedBookings.isEmpty) return;
    setState(() {
      bookings
        ..clear()
        ..addAll(loadedBookings);
    });
  }

  void openBooking([ServiceItem? service]) {
    if (service != null) selectedService = service;
    setState(() => index = 2);
    final cached = bookingBootstraps[selectedService.id];
    if (cached == null || !cached.isFresh) unawaited(_warmBookingBootstrap(selectedService.id));
  }


  void openChat() {
    setState(() => index = 3);
  }

  void openProfileSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ProfileScreen(
          profile: currentProfile,
          settings: currentSettings,
          content: homeContent,
          bookings: bookings,
          onSaveProfile: saveProfile,
          onDeleteAccount: deleteAccount,
          onLogout: widget.onLogout,
        ),
      ),
    );
  }

  void addBooking(BookingItem booking) {
    setState(() {
      bookings.insert(0, booking);
      index = 2;
    });
    showSnack(context, 'Запись создана');
    unawaited(_refreshLiveState());
  }


  Future<List<ServiceItem>> _safeLoadServices() async {
    try {
      return await api.loadServices();
    } catch (_) {
      return const [];
    }
  }


  Future<List<SpecialistItem>> _safeLoadStaff() async {
    try {
      return await api.loadStaff();
    } catch (_) {
      return const [];
    }
  }

  Future<List<BookingItem>> _safeLoadBookings() async {
    try {
      return await api.loadBookings();
    } catch (_) {
      return const [];
    }
  }

  Future<void> _warmBookingBootstrap(int serviceId) async {
    if (serviceId <= 0) return;
    try {
      final bootstrap = await api.loadBookingBootstrap(serviceId: serviceId);
      if (!mounted) return;
      setState(() => bookingBootstraps[serviceId] = bootstrap);
    } catch (_) {
      // Booking screen can still request a fresh bootstrap when opened.
    }
  }

  void _saveBookingBootstrap(BookingBootstrap bootstrap) {
    if (selectedService.id <= 0) return;
    setState(() => bookingBootstraps[selectedService.id] = bootstrap);
  }

  Future<void> cancelBooking(BookingItem booking) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Отменить запись?'),
        content: const Text('Отмена возможна только не позднее чем за 48 часов до приёма.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Назад')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Отменить')),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      final cancelled = await api.cancelBooking(booking.id);
      if (!mounted) return;
      setState(() {
        final i = bookings.indexWhere((item) => item.id == booking.id);
        if (i >= 0) bookings[i] = cancelled;
      });
      showSnack(context, 'Запись отменена');
      unawaited(_refreshLiveState());
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Не удалось отменить запись. Отмена разрешена только за 48+ часов до приёма.');
    }
  }


  Future<void> reportLateBooking(BookingItem booking) async {
    try {
      final updated = await api.reportLateBooking(booking.id, minutes: 10, message: 'Клиент сообщил из приложения, что опаздывает примерно на 10 минут.');
      if (!mounted) return;
      setState(() {
        final i = bookings.indexWhere((item) => item.id == booking.id);
        if (i >= 0) bookings[i] = updated;
      });
      showSnack(context, 'Центр получил сообщение об опоздании');
    } catch (_) {
      if (!mounted) return;
      showSnack(context, 'Не удалось передать сообщение об опоздании');
    }
  }

  Future<void> saveProfile(ClientProfile profile, ClientSettings settings) async {
    final trimmed = profile.copyWith(
      firstName: profile.firstName.trim().isEmpty ? currentProfile.firstName : profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim().isEmpty ? currentProfile.phone : profile.phone.trim(),
    );
    final phoneChanged = _normalizePhone(trimmed.phone) != _normalizePhone(currentProfile.phone);

    try {
      var persisted = trimmed.copyWith(authToken: currentProfile.authToken, testMode: currentProfile.testMode);
      if (phoneChanged) {
        final verified = await _verifyPhoneChange(trimmed);
        if (verified == null) return;
        persisted = verified;
        api = ApiClient(authToken: persisted.authToken);
      }

      await api.saveProfileSettings(profile: persisted, settings: settings);
      if (!mounted) return;
      await session.saveProfile(persisted);
      setState(() {
        currentProfile = persisted;
        currentSettings = settings;
      });
      showSnack(context, phoneChanged ? 'Телефон подтверждён и профиль сохранён' : 'Профиль сохранён');
    } catch (_) {
      if (!mounted) return;
      if (phoneChanged) {
        showSnack(context, 'Не удалось подтвердить новый телефон');
        return;
      }
      final persisted = trimmed.copyWith(authToken: currentProfile.authToken, testMode: currentProfile.testMode);
      await session.saveProfile(persisted);
      setState(() {
        currentProfile = persisted;
        currentSettings = settings;
      });
      showSnack(context, 'Профиль обновлён локально');
    }
  }

  Future<ClientProfile?> _verifyPhoneChange(ClientProfile nextProfile) async {
    final request = await api.requestAuthCode(
      firstName: nextProfile.firstName,
      lastName: nextProfile.lastName,
      phone: nextProfile.phone,
    );
    if (request['autoVerified'] == true) {
      return _profileFromAuthResponse(request, nextProfile);
    }
    final demoCode = textValue(request['demoCode'], '');
    final code = await _askPhoneCode(nextProfile.phone, demoCode: demoCode);
    if (code == null || code.trim().isEmpty) return null;
    return api.verifyAuthCode(
      firstName: nextProfile.firstName,
      lastName: nextProfile.lastName,
      phone: nextProfile.phone,
      code: code.trim(),
    );
  }

  Future<String?> _askPhoneCode(String phone, {String demoCode = ''}) {
    final controller = TextEditingController(text: demoCode);
    return showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Подтвердите телефон'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Введите код, отправленный на номер $phone.'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Код из SMS'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(), child: const Text('Отмена')),
          TextButton(onPressed: () => Navigator.of(dialogContext).pop(controller.text), child: const Text('Подтвердить')),
        ],
      ),
    );
  }

  ClientProfile _profileFromAuthResponse(Map<String, dynamic> payload, ClientProfile fallback) {
    final profilePayload = payload['profile'] is Map ? Map<String, dynamic>.from(payload['profile'] as Map) : <String, dynamic>{};
    return ClientProfile(
      firstName: textValue(profilePayload['firstName'], fallback.firstName),
      lastName: textValue(profilePayload['lastName'], fallback.lastName),
      phone: textValue(profilePayload['phone'], fallback.phone),
      authToken: textValue(payload['token'], fallback.authToken),
      testMode: profilePayload['testMode'] == true || payload['mode'] == 'test',
    );
  }

  String _normalizePhone(String value) {
    final text = value.trim();
    final plus = text.startsWith('+') ? '+' : '';
    final digits = text.replaceAll(RegExp(r'[^0-9]+'), '');
    return digits.isEmpty ? '' : '$plus$digits';
  }

  Future<void> deleteAccount() async {
    try {
      await api.deleteAccount();
    } catch (_) {
      // Even if network cleanup fails, local credentials must be removed.
    }
    await session.clear();
    widget.onLogout();
  }

  @override
  Widget build(BuildContext context) {
    final contentServices = homeContent.serviceItems;
    final services = remoteServices.isNotEmpty
        ? remoteServices
        : (contentServices.isNotEmpty ? contentServices : demoServices);
    final specialists = remoteStaff.isNotEmpty ? remoteStaff : (homeContent.specialistItems.isEmpty ? demoSpecialists : homeContent.specialistItems);
    final pages = [
      HomeScreen(profile: currentProfile, content: homeContent, services: services, specialists: specialists, onBook: openBooking),
      ServicesScreen(content: homeContent, services: services, onBook: openBooking),
      BookingScreen(
        profile: currentProfile,
        service: selectedService,
        bookings: bookings,
        onBookingCreated: addBooking,
        onBookingCanceled: cancelBooking,
        onBookingLate: reportLateBooking,
        initialBootstrap: bookingBootstraps[selectedService.id],
        allStaff: specialists,
        onBootstrapLoaded: _saveBookingBootstrap,
      ),
      ChatScreen(profile: currentProfile, online: online),
      CareCardScreen(profile: currentProfile, onOpenProfile: openProfileSettings, onOpenChat: openChat),
    ];

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: AppColors.cream,
      body: IndexedStack(index: index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        height: 76,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (value) {
          setState(() => index = value);
          if (value == 2) {
            final cached = bookingBootstraps[selectedService.id];
            if (cached == null || !cached.isFresh) unawaited(_warmBookingBootstrap(selectedService.id));
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: 'Главная'),
          NavigationDestination(icon: Icon(Icons.grid_view_rounded), selectedIcon: Icon(Icons.grid_view_rounded), label: 'Услуги'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), selectedIcon: Icon(Icons.calendar_month_rounded), label: 'Запись'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline_rounded), selectedIcon: Icon(Icons.chat_bubble_rounded), label: 'Чат'),
          NavigationDestination(icon: Icon(Icons.assignment_ind_outlined), selectedIcon: Icon(Icons.assignment_ind_rounded), label: 'Моя карта'),
        ],
      ),
    );
  }
}
