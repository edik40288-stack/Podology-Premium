import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/data/demo_content.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';

class BookingBootstrap {
  const BookingBootstrap({
    required this.services,
    required this.staff,
    required this.serviceStaffMap,
    required this.availability,
    required this.generatedAt,
  });

  final List<ServiceItem> services;
  final List<SpecialistItem> staff;
  final Map<int, List<int>> serviceStaffMap;
  final Map<int, List<StaffAvailability>> availability;
  final DateTime generatedAt;

  bool get isFresh => DateTime.now().difference(generatedAt).inSeconds < 90;

  List<StaffAvailability> availabilityFor(int serviceId) => availability[serviceId] ?? const [];
}

class StaffAvailability {
  const StaffAvailability({required this.staffId, required this.dates, required this.timesByDate});

  final int staffId;
  final List<String> dates;
  final Map<String, List<String>> timesByDate;

  bool get hasSlots => dates.isNotEmpty && timesByDate.values.any((items) => items.isNotEmpty);

  List<String> timesFor(String date) => timesByDate[apiDate(date)] ?? const [];
}

class ApiClient {
  const ApiClient({this.authToken = ''});

  final String authToken;


  Uri _uri(String path, [Map<String, String?> query = const {}]) {
    final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/+$'), '');
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final filtered = <String, String>{};
    query.forEach((key, value) {
      if (value != null && value.trim().isNotEmpty) filtered[key] = value;
    });
    return Uri.parse('$base$cleanPath').replace(queryParameters: filtered.isEmpty ? null : filtered);
  }

  Map<String, String> get _jsonHeaders => {
        'Content-Type': 'application/json; charset=utf-8',
        if (authToken.trim().isNotEmpty) 'Authorization': 'Bearer $authToken',
      };

  Future<Map<String, dynamic>> requestAuthCode({required String firstName, required String lastName, required String phone}) async {
    final response = await http
        .post(
          _uri('/auth/request-code'),
          headers: {'Content-Type': 'application/json; charset=utf-8'},
          body: jsonEncode({'firstName': firstName, 'lastName': lastName, 'phone': phone}),
        )
        .timeout(const Duration(seconds: 12));
    return _decodeMap(response);
  }

  Future<ClientProfile> verifyAuthCode({required String firstName, required String lastName, required String phone, required String code}) async {
    final response = await http
        .post(
          _uri('/auth/verify-code'),
          headers: {'Content-Type': 'application/json; charset=utf-8'},
          body: jsonEncode({'firstName': firstName, 'lastName': lastName, 'phone': phone, 'code': code}),
        )
        .timeout(const Duration(seconds: 12));
    return _profileFromAuthPayload(_decodeMap(response));
  }

  Future<void> deleteAccount() async {
    final response = await http.delete(_uri('/auth/account'), headers: _jsonHeaders).timeout(const Duration(seconds: 12));
    _decodeMap(response);
  }

  Future<Map<String, dynamic>> health() async {
    final response = await http.get(_uri('/health')).timeout(const Duration(seconds: 5));
    return _decodeMap(response);
  }

  Future<HomeContent> loadHomeContent() async {
    final response = await http.get(_uri('/content/home')).timeout(const Duration(seconds: 8));
    final decoded = _decodeMap(response);
    final payload = decoded['data'] is Map ? Map<String, dynamic>.from(decoded['data'] as Map) : decoded;
    return HomeContent.fromMap(payload, fallback: demoHomeContent);
  }

  Future<Map<String, dynamic>> loadProfileSettings(String phone) async {
    final response = await http.get(_uri('/profile'), headers: _jsonHeaders).timeout(const Duration(seconds: 8));
    return _decodeMap(response);
  }

  Future<Map<String, dynamic>> saveProfileSettings({required ClientProfile profile, required ClientSettings settings}) async {
    final response = await http
        .put(
          _uri('/profile'),
          headers: _jsonHeaders,
          body: jsonEncode({
            'firstName': profile.firstName,
            'lastName': profile.lastName,
            'chatNotifications': settings.chatNotifications,
            'bookingNotifications': settings.bookingNotifications,
            'marketingNotifications': settings.marketingNotifications,
          }),
        )
        .timeout(const Duration(seconds: 20));
    return _decodeMap(response);
  }


  Future<List<ServiceItem>> loadServices() async {
    final response = await http.get(_uri('/yclients/services')).timeout(const Duration(seconds: 8));
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (decoded is Map && decoded['demo'] == true) {
      // Local backend can return a tiny demo YCLIENTS list when real credentials
      // are not configured yet. Do not treat that as the real center catalog.
      return const [];
    }
    final list = _extractList(decoded);
    if (list.isEmpty) return const [];
    return [for (int index = 0; index < list.length; index++) _serviceFromMap(list[index], index)];
  }

  Future<List<SpecialistItem>> loadStaff({int? serviceId}) async {
    final response = await http.get(_uri('/yclients/staff', {'serviceId': serviceId?.toString()})).timeout(const Duration(seconds: 8));
    final list = _extractList(jsonDecode(utf8.decode(response.bodyBytes)));
    if (list.isEmpty) return const [];
    return [for (int index = 0; index < list.length; index++) _specialistFromMap(list[index], index)];
  }

  Future<List<String>> loadDates({int? staffId, int? serviceId}) async {
    final response = await http.get(_uri('/yclients/dates', {'staffId': staffId?.toString(), 'serviceId': serviceId?.toString()})).timeout(const Duration(seconds: 8));
    final values = _extractList(jsonDecode(utf8.decode(response.bodyBytes))).map(dateLabel).where((value) => value.isNotEmpty).toList();
    return values;
  }

  Future<List<String>> loadTimes({required int staffId, required String date, int? serviceId}) async {
    final response = await http.get(_uri('/yclients/times', {'staffId': staffId.toString(), 'date': apiDate(date), 'serviceId': serviceId?.toString()})).timeout(const Duration(seconds: 8));
    final values = _extractList(jsonDecode(utf8.decode(response.bodyBytes))).map(timeLabel).where((value) => value.isNotEmpty).toList();
    return values;
  }

  Future<BookingBootstrap> loadBookingBootstrap({int? serviceId}) async {
    final response = await http
        .get(_uri('/yclients/booking/bootstrap', {'serviceId': serviceId?.toString()}))
        .timeout(const Duration(seconds: 12));
    final decoded = _decodeMap(response);
    final payload = decoded['data'] is Map ? Map<String, dynamic>.from(decoded['data'] as Map) : decoded;

    final serviceMaps = _mapList(payload['services']);
    final staffMaps = _mapList(payload['staff']);
    final services = [for (int index = 0; index < serviceMaps.length; index++) _serviceFromMap(serviceMaps[index], index)];
    final staff = [for (int index = 0; index < staffMaps.length; index++) _specialistFromMap(staffMaps[index], index)];

    return BookingBootstrap(
      services: services,
      staff: staff,
      serviceStaffMap: _serviceStaffMap(payload['serviceStaffMap']),
      availability: _availabilityMap(payload['availability']),
      generatedAt: DateTime.tryParse(textValue(payload['generatedAt'], '')) ?? DateTime.now(),
    );
  }


  Future<ClientCareCard> loadCareCard(String phone) async {
    final response = await http.get(_uri('/care-card', {'phone': phone}), headers: _jsonHeaders).timeout(const Duration(seconds: 8));
    final decoded = _decodeMap(response);
    final payload = decoded['data'] is Map ? Map<String, dynamic>.from(decoded['data'] as Map) : decoded;
    return ClientCareCard.fromMap(payload, fallbackPhone: phone);
  }

  Future<List<BookingItem>> loadBookings() async {
    final response = await http.get(_uri('/yclients/bookings'), headers: _jsonHeaders).timeout(const Duration(seconds: 8));
    final decoded = _decodeMap(response);
    final raw = decoded['data'];
    if (raw is! List) return const [];
    return raw.whereType<Map>().map((item) => _bookingFromMap(Map<String, dynamic>.from(item))).toList();
  }

  Future<BookingItem> createBooking({required ClientProfile profile, required ServiceItem service, required SpecialistItem specialist, required String date, required String time}) async {
    final response = await http
        .post(
          _uri('/yclients/booking'),
          headers: _jsonHeaders,
          body: jsonEncode({'fullname': profile.fullName, 'phone': profile.phone, 'serviceId': service.id, 'serviceTitle': service.title, 'staffId': specialist.id, 'specialistName': specialist.name, 'datetime': bookingDateTime(date, time), 'clientRequestId': '${profile.roomId}-${service.id}-${specialist.id}-${apiDate(date)}-$time', 'comment': 'Запись создана из мобильного приложения PODOLOG KUTSYTOI.'}),
        )
        .timeout(const Duration(seconds: 12));
    final decoded = _decodeMap(response);
    final payload = decoded['data'] is Map ? Map<String, dynamic>.from(decoded['data'] as Map) : decoded;
    final item = _bookingFromMap(payload);
    return BookingItem(
      id: item.id,
      service: service.title,
      specialist: specialist.name,
      date: item.date,
      time: item.time,
      status: item.status,
      isArchive: item.isArchive,
      canCancel: item.canCancel,
      canReportLate: item.canReportLate,
      cancelAllowedUntil: item.cancelAllowedUntil,
    );
  }

  Future<BookingItem> reportLateBooking(String bookingId, {int minutes = 10, String message = ''}) async {
    final response = await http
        .post(
          _uri('/yclients/bookings/$bookingId/late'),
          headers: _jsonHeaders,
          body: jsonEncode({'minutes': minutes.toString(), 'message': message}),
        )
        .timeout(const Duration(seconds: 12));
    final decoded = _decodeMap(response);
    final payload = decoded['data'] is Map ? Map<String, dynamic>.from(decoded['data'] as Map) : decoded;
    return _bookingFromMap(payload);
  }

  Future<BookingItem> cancelBooking(String bookingId) async {
    final response = await http
        .post(
          _uri('/yclients/bookings/$bookingId/cancel'),
          headers: _jsonHeaders,
          body: jsonEncode({'reason': 'Отмена клиентом из мобильного приложения'}),
        )
        .timeout(const Duration(seconds: 12));
    final decoded = _decodeMap(response);
    final payload = decoded['data'] is Map ? Map<String, dynamic>.from(decoded['data'] as Map) : decoded;
    return _bookingFromMap(payload);
  }

  Future<Map<String, dynamic>> sendChatMessage({required ClientProfile profile, required String text, String? mediaUrl, String? mediaType}) async {
    final response = await http
        .post(
          _uri('/chat/messages'),
          headers: _jsonHeaders,
          body: jsonEncode({'roomId': profile.roomId, 'text': text, 'mediaUrl': mediaUrl, 'mediaType': mediaType}),
        )
        .timeout(const Duration(seconds: 20));
    return _decodeMap(response);
  }

  Future<List<Map<String, dynamic>>> loadChatMessages(String roomId) async {
    final response = await http.get(_uri('/chat/rooms/$roomId/messages'), headers: _jsonHeaders).timeout(const Duration(seconds: 8));
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception('HTTP ${response.statusCode}');
    if (decoded is List) return decoded.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    if (decoded is Map && decoded['data'] is List) return (decoded['data'] as List).whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    return const [];
  }

  Future<Map<String, dynamic>> uploadChatMedia(XFile file) async {
    final request = http.MultipartRequest('POST', _uri('/media/chat'));
    if (authToken.trim().isNotEmpty) request.headers['Authorization'] = 'Bearer $authToken';
    request.files.add(await http.MultipartFile.fromPath('file', file.path));
    final streamed = await request.send().timeout(const Duration(seconds: 180));
    final body = await streamed.stream.bytesToString();
    if (streamed.statusCode < 200 || streamed.statusCode >= 300) throw Exception(body);
    return Map<String, dynamic>.from(jsonDecode(body) as Map);
  }

  Map<String, dynamic> _decodeMap(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) throw Exception('HTTP ${response.statusCode}: ${utf8.decode(response.bodyBytes)}');
    final decoded = jsonDecode(utf8.decode(response.bodyBytes));
    return decoded is Map ? Map<String, dynamic>.from(decoded) : <String, dynamic>{'data': decoded};
  }

  BookingItem _bookingFromMap(Map<String, dynamic> map) {
    final datetime = textValue(map['datetime'], '');
    final date = textValue(map['date'], datetime.length >= 10 ? datetime.substring(0, 10) : '');
    final time = textValue(map['time'], datetime.length >= 16 ? datetime.substring(11, 16) : '');
    return BookingItem(
      id: textValue(map['id'], 'booking-${DateTime.now().millisecondsSinceEpoch}'),
      service: textValue(map['service'], textValue(map['serviceTitle'], 'Услуга')),
      specialist: textValue(map['specialist'], textValue(map['specialistName'], 'Специалист')),
      date: date,
      time: time,
      status: textValue(map['status'], 'Создана'),
      isArchive: map['isArchive'] == true,
      canCancel: map['canCancel'] == true,
      canReportLate: map['canReportLate'] == true,
      cancelAllowedUntil: textValue(map['cancelAllowedUntil'], ''),
    );
  }

  ClientProfile _profileFromAuthPayload(Map<String, dynamic> payload) {
    final profilePayload = payload['profile'] is Map ? Map<String, dynamic>.from(payload['profile'] as Map) : <String, dynamic>{};
    return ClientProfile(
      firstName: textValue(profilePayload['firstName'], 'Клиент'),
      lastName: textValue(profilePayload['lastName'], ''),
      phone: textValue(profilePayload['phone'], ''),
      authToken: textValue(payload['token'], ''),
      testMode: profilePayload['testMode'] == true || payload['mode'] == 'test',
    );
  }

  static List<Map<String, dynamic>> _mapList(dynamic raw) {
    if (raw is List) return raw.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    return const [];
  }

  static Map<int, List<int>> _serviceStaffMap(dynamic raw) {
    final result = <int, List<int>>{};
    if (raw is! Map) return result;
    raw.forEach((key, value) {
      final serviceId = int.tryParse(key.toString());
      if (serviceId == null) return;
      if (value is List) {
        result[serviceId] = [
          for (final item in value)
            if (int.tryParse(item.toString()) != null) int.parse(item.toString()),
        ];
      }
    });
    return result;
  }

  static Map<int, List<StaffAvailability>> _availabilityMap(dynamic raw) {
    final result = <int, List<StaffAvailability>>{};
    if (raw is! Map) return result;
    raw.forEach((key, value) {
      final serviceId = int.tryParse(key.toString());
      if (serviceId == null || value is! List) return;
      result[serviceId] = [
        for (final item in value)
          if (item is Map) _availabilityFromMap(Map<String, dynamic>.from(item)),
      ];
    });
    return result;
  }

  static StaffAvailability _availabilityFromMap(Map<String, dynamic> map) {
    final slots = <String, List<String>>{};
    final rawSlots = map['slots'];
    if (rawSlots is List) {
      for (final raw in rawSlots) {
        if (raw is! Map) continue;
        final slot = Map<String, dynamic>.from(raw);
        final date = apiDate(textValue(slot['date'], ''));
        final rawTimes = slot['times'];
        if (date.isEmpty || rawTimes is! List) continue;
        final times = rawTimes
            .map((item) => textValue(item, ''))
            .map((item) => item.contains('T') ? item.substring(11, 16) : item.substring(0, item.length >= 5 ? 5 : item.length))
            .where((item) => RegExp(r'^\d{2}:\d{2}$').hasMatch(item))
            .toList();
        if (times.isNotEmpty) slots[date] = times;
      }
    }
    final dates = slots.keys.toList();
    return StaffAvailability(
      staffId: int.tryParse(textValue(map['staffId'], '0')) ?? 0,
      dates: dates,
      timesByDate: slots,
    );
  }

  static List<Map<String, dynamic>> _extractList(dynamic decoded) {
    if (decoded is List) return decoded.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
    if (decoded is Map) {
      for (final key in ['data', 'items', 'services', 'staff', 'dates', 'times', 'records', 'bookings']) {
        final value = decoded[key];
        if (value is List) return value.whereType<Map>().map((item) => Map<String, dynamic>.from(item)).toList();
        if (value is Map) {
          final nested = _extractList(value);
          if (nested.isNotEmpty) return nested;
        }
      }
    }
    return const [];
  }


  static ServiceItem _serviceFromMap(Map<String, dynamic> map, int index) {
    final fallback = demoServices[index % demoServices.length];
    final rawId = map['id'] ?? map['service_id'] ?? map['serviceId'];
    final rawTitle = map['title'] ?? map['name'] ?? map['service_title'];
    final isRealCatalogItem = rawId != null || rawTitle != null;
    final rawSubtitle = map['subtitle'] ?? map['comment'] ?? map['description'] ?? map['category'] ?? map['seance_length'];
    final explicitPrice = textValue(map['priceLabel'] ?? map['price_text'] ?? map['priceFormatted'] ?? map['price'], '');
    final price = explicitPrice.isNotEmpty && !RegExp(r'^\d+(\.\d+)?$').hasMatch(explicitPrice)
        ? explicitPrice
        : _priceLabel(map, isRealCatalogItem ? '' : fallback.price);
    final explicitDuration = textValue(map['durationLabel'] ?? map['duration_text'] ?? map['duration'], '');
    final duration = explicitDuration.isNotEmpty && !RegExp(r'^\d+(\.\d+)?$').hasMatch(explicitDuration)
        ? explicitDuration
        : _durationLabel(map, isRealCatalogItem ? '' : fallback.duration);
    final icon = textValue(map['icon'], fallback.iconText);
    return ServiceItem(
      id: int.tryParse(textValue(rawId, fallback.id.toString())) ?? fallback.id,
      title: textValue(rawTitle, fallback.title),
      subtitle: textValue(rawSubtitle, isRealCatalogItem ? '' : fallback.subtitle),
      price: price,
      duration: duration,
      iconText: icon,
      category: textValue(map['category'] ?? map['category_title'], isRealCatalogItem ? '' : fallback.category),
      iconData: iconFromKey(icon),
    );
  }

  static String _priceLabel(Map<String, dynamic> map, String fallback) {
    final value = map['price_min'] ?? map['price'] ?? map['cost'] ?? map['price_from'];
    final number = value is num ? value : num.tryParse(value?.toString() ?? '');
    if (number == null || number <= 0) return fallback;
    final rounded = number.round();
    return 'от $rounded ₽';
  }

  static String _durationLabel(Map<String, dynamic> map, String fallback) {
    final value = map['duration'] ?? map['seance_length'] ?? map['length'] ?? map['duration_minutes'];
    final number = value is num ? value : num.tryParse(value?.toString() ?? '');
    if (number == null || number <= 0) return fallback;
    final minutes = number > 300 ? (number / 60).round() : number.round();
    return '$minutes мин';
  }

  static SpecialistItem _specialistFromMap(Map<String, dynamic> map, int index) {
    final fallback = demoSpecialists[index % demoSpecialists.length];
    final image = textValue(map['imageUrl'] ?? map['avatar_big'] ?? map['avatar'] ?? map['image'], '');
    final normalizedImage = image.contains('no-master') || image.contains('no_avatar') || image.contains('default') ? '' : image;
    return SpecialistItem(
      id: int.tryParse(textValue(map['id'] ?? map['staff_id'], fallback.id.toString())) ?? fallback.id,
      name: textValue(map['name'] ?? map['fullname'] ?? map['title'], fallback.name),
      role: textValue(map['role'] ?? map['specialization'] ?? map['position'], fallback.role),
      experience: textValue(map['experience'], fallback.experience),
      description: textValue(map['description'] ?? map['information'], fallback.description),
      imageSource: normalizedImage,
    );
  }

}
