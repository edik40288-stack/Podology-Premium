import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';

class ClientProfile {
  const ClientProfile({
    required this.firstName,
    required this.lastName,
    required this.phone,
    this.authToken = '',
    this.testMode = false,
  });

  final String firstName;
  final String lastName;
  final String phone;
  final String authToken;
  final bool testMode;

  String get fullName => '$firstName $lastName'.trim();
  String get roomId => 'client-${phone.replaceAll(RegExp(r'[^0-9]+'), '')}';

  factory ClientProfile.fromJson(Map<String, dynamic> json) {
    return ClientProfile(
      firstName: textValue(json['firstName'], 'Клиент'),
      lastName: textValue(json['lastName'], ''),
      phone: textValue(json['phone'], ''),
      authToken: textValue(json['authToken'] ?? json['token'], ''),
      testMode: json['testMode'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
        'authToken': authToken,
        'testMode': testMode,
      };

  ClientProfile copyWith({String? firstName, String? lastName, String? phone, String? authToken, bool? testMode}) {
    return ClientProfile(
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      authToken: authToken ?? this.authToken,
      testMode: testMode ?? this.testMode,
    );
  }
}

class ClientSettings {
  const ClientSettings({
    this.chatNotifications = true,
    this.bookingNotifications = true,
    this.marketingNotifications = false,
  });

  final bool chatNotifications;
  final bool bookingNotifications;
  final bool marketingNotifications;

  factory ClientSettings.fromMap(Map<String, dynamic>? map) {
    return ClientSettings(
      chatNotifications: map?['chatNotifications'] != false,
      bookingNotifications: map?['bookingNotifications'] != false,
      marketingNotifications: map?['marketingNotifications'] == true,
    );
  }

  ClientSettings copyWith({bool? chatNotifications, bool? bookingNotifications, bool? marketingNotifications}) {
    return ClientSettings(
      chatNotifications: chatNotifications ?? this.chatNotifications,
      bookingNotifications: bookingNotifications ?? this.bookingNotifications,
      marketingNotifications: marketingNotifications ?? this.marketingNotifications,
    );
  }

  Map<String, dynamic> toMap() => {
        'chatNotifications': chatNotifications,
        'bookingNotifications': bookingNotifications,
        'marketingNotifications': marketingNotifications,
      };
}

class ContentItem {
  const ContentItem({
    required this.id,
    required this.title,
    this.subtitle = '',
    this.description = '',
    this.imageUrl = '',
    this.asset = '',
    this.icon = '',
    this.price = '',
    this.duration = '',
    this.role = '',
    this.experience = '',
    this.mapUrl = '',
    this.panoramaUrl = '',
    this.buttonText = '',
    this.color = '',
  });

  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String imageUrl;
  final String asset;
  final String icon;
  final String price;
  final String duration;
  final String role;
  final String experience;
  final String mapUrl;
  final String panoramaUrl;
  final String buttonText;
  final String color;

  String get imageSource => imageUrl.trim().isNotEmpty ? imageUrl.trim() : asset.trim();
  bool get hasImage => imageSource.isNotEmpty;

  factory ContentItem.fromMap(Map<String, dynamic> map) {
    return ContentItem(
      id: textValue(map['id'], 'item'),
      title: textValue(map['title'], 'Раздел'),
      subtitle: textValue(map['subtitle'], ''),
      description: textValue(map['description'], map['text']?.toString() ?? ''),
      imageUrl: textValue(map['imageUrl'] ?? map['url'], ''),
      asset: textValue(map['asset'], ''),
      icon: textValue(map['icon'], ''),
      price: textValue(map['price'], ''),
      duration: textValue(map['duration'], ''),
      role: textValue(map['role'], ''),
      experience: textValue(map['experience'], ''),
      mapUrl: textValue(map['mapUrl'], ''),
      panoramaUrl: textValue(map['panoramaUrl'], ''),
      buttonText: textValue(map['buttonText'], ''),
      color: textValue(map['color'], ''),
    );
  }
}

class HeroBlock {
  const HeroBlock({required this.greetingTemplate, required this.title, required this.subtitle, required this.backgroundColor, required this.backgroundImageUrl});

  final String greetingTemplate;
  final String title;
  final String subtitle;
  final String backgroundColor;
  final String backgroundImageUrl;

  factory HeroBlock.fromMap(Map<String, dynamic> map, HeroBlock fallback) {
    return HeroBlock(
      greetingTemplate: textValue(map['greetingTemplate'], fallback.greetingTemplate),
      title: textValue(map['title'], fallback.title),
      subtitle: textValue(map['subtitle'], fallback.subtitle),
      backgroundColor: textValue(map['backgroundColor'], '#FAF8F1'),
      backgroundImageUrl: textValue(map['backgroundImageUrl'], ''),
    );
  }
}

class ExpertBlock {
  const ExpertBlock({required this.title, required this.subtitle, required this.description, required this.address, required this.mapUrl, required this.buttonText, required this.backgroundColor, required this.backgroundImageUrl});

  final String title;
  final String subtitle;
  final String description;
  final String address;
  final String mapUrl;
  final String buttonText;
  final String backgroundColor;
  final String backgroundImageUrl;

  factory ExpertBlock.fromMap(Map<String, dynamic> map, ExpertBlock fallback) {
    return ExpertBlock(
      title: textValue(map['title'], fallback.title),
      subtitle: textValue(map['subtitle'], fallback.subtitle),
      description: textValue(map['description'], fallback.description),
      address: textValue(map['address'], fallback.address),
      mapUrl: textValue(map['mapUrl'], fallback.mapUrl),
      buttonText: textValue(map['buttonText'], 'Открыть карту'),
      backgroundColor: textValue(map['backgroundColor'], '#E6F4E6'),
      backgroundImageUrl: textValue(map['backgroundImageUrl'], ''),
    );
  }
}

class ContentSection {
  const ContentSection({required this.title, required this.description, required this.items});

  final String title;
  final String description;
  final List<ContentItem> items;

  factory ContentSection.fromMap(Map<String, dynamic> map, ContentSection fallback) {
    final items = _items(map['items'], fallback.items);
    return ContentSection(title: textValue(map['title'], fallback.title), description: textValue(map['description'], fallback.description), items: items);
  }
}

class InteriorSection extends ContentSection {
  const InteriorSection({required super.title, required super.description, required super.items, required this.panoramas});

  final List<ContentItem> panoramas;

  factory InteriorSection.fromMap(Map<String, dynamic> map, InteriorSection fallback) {
    return InteriorSection(
      title: textValue(map['title'], fallback.title),
      description: textValue(map['description'], fallback.description),
      items: _items(map['items'], fallback.items),
      panoramas: _items(map['panoramas'], fallback.panoramas),
    );
  }
}


List<ContentItem> _items(dynamic value, List<ContentItem> fallback) {
  if (value is! List) return fallback;
  final result = <ContentItem>[];
  for (final item in value) {
    if (item is Map) result.add(ContentItem.fromMap(Map<String, dynamic>.from(item)));
  }
  return result.isEmpty ? fallback : result;
}

class HomeContent {
  const HomeContent({required this.brandName, required this.topHero, required this.expertBlock, required this.about, required this.certificates, required this.interior, required this.works, required this.services, required this.specialists, required this.profile});

  final String brandName;
  final HeroBlock topHero;
  final ExpertBlock expertBlock;
  final ContentSection about;
  final ContentSection certificates;
  final InteriorSection interior;
  final ContentSection works;
  final ContentSection services;
  final ContentSection specialists;
  final ContentSection profile;

  factory HomeContent.fromMap(Map<String, dynamic> map, {required HomeContent fallback}) {
    return HomeContent(
      brandName: textValue(map['brandName'], fallback.brandName),
      topHero: map['topHero'] is Map ? HeroBlock.fromMap(Map<String, dynamic>.from(map['topHero'] as Map), fallback.topHero) : fallback.topHero,
      expertBlock: map['expertBlock'] is Map ? ExpertBlock.fromMap(Map<String, dynamic>.from(map['expertBlock'] as Map), fallback.expertBlock) : fallback.expertBlock,
      about: map['about'] is Map ? ContentSection.fromMap(Map<String, dynamic>.from(map['about'] as Map), fallback.about) : fallback.about,
      certificates: map['certificates'] is Map ? ContentSection.fromMap(Map<String, dynamic>.from(map['certificates'] as Map), fallback.certificates) : fallback.certificates,
      interior: map['interior'] is Map ? InteriorSection.fromMap(Map<String, dynamic>.from(map['interior'] as Map), fallback.interior) : fallback.interior,
      works: map['works'] is Map ? ContentSection.fromMap(Map<String, dynamic>.from(map['works'] as Map), fallback.works) : fallback.works,
      services: map['services'] is Map ? ContentSection.fromMap(Map<String, dynamic>.from(map['services'] as Map), fallback.services) : fallback.services,
      specialists: map['specialists'] is Map ? ContentSection.fromMap(Map<String, dynamic>.from(map['specialists'] as Map), fallback.specialists) : fallback.specialists,
      profile: map['profile'] is Map ? ContentSection.fromMap(Map<String, dynamic>.from(map['profile'] as Map), fallback.profile) : fallback.profile,
    );
  }

  List<ServiceItem> get serviceItems => services.items.map(ServiceItem.fromContent).toList();
  List<SpecialistItem> get specialistItems => specialists.items.map(SpecialistItem.fromContent).toList();
}

class ServiceItem {
  const ServiceItem({required this.id, required this.title, required this.subtitle, required this.price, required this.duration, required this.iconText, required this.category, this.iconData = Icons.medical_services_rounded});

  final int id;
  final String title;
  final String subtitle;
  final String price;
  final String duration;
  final String iconText;
  final String category;
  final IconData iconData;

  factory ServiceItem.fromContent(ContentItem item) {
    return ServiceItem(
      id: stableId(item.id),
      title: item.title,
      subtitle: item.description,
      price: item.price,
      duration: item.duration,
      iconText: item.icon.isEmpty ? '🦶' : item.icon,
      category: item.subtitle,
      iconData: iconFromKey(item.icon),
    );
  }
}

class SpecialistItem {
  const SpecialistItem({required this.id, required this.name, required this.role, required this.experience, required this.description, required this.imageSource});

  final int id;
  final String name;
  final String role;
  final String experience;
  final String description;
  final String imageSource;

  factory SpecialistItem.fromContent(ContentItem item) {
    return SpecialistItem(id: stableId(item.id), name: item.title, role: item.role, experience: item.experience, description: item.description, imageSource: item.imageSource);
  }
}

class BookingItem {
  const BookingItem({
    required this.id,
    required this.service,
    required this.specialist,
    required this.date,
    required this.time,
    required this.status,
    required this.isArchive,
    this.canCancel = false,
    this.canReportLate = false,
    this.cancelAllowedUntil = '',
  });

  final String id;
  final String service;
  final String specialist;
  final String date;
  final String time;
  final String status;
  final bool isArchive;
  final bool canCancel;
  final bool canReportLate;
  final String cancelAllowedUntil;

  BookingItem copyWith({String? status, bool? isArchive, bool? canCancel, bool? canReportLate}) {
    return BookingItem(
      id: id,
      service: service,
      specialist: specialist,
      date: date,
      time: time,
      status: status ?? this.status,
      isArchive: isArchive ?? this.isArchive,
      canCancel: canCancel ?? this.canCancel,
      canReportLate: canReportLate ?? this.canReportLate,
      cancelAllowedUntil: cancelAllowedUntil,
    );
  }
}

class ChatMessageItem {
  const ChatMessageItem({this.id, required this.text, required this.mine, required this.time, this.attachment, this.mediaType, this.deliveredToTelegram});

  final String? id;
  final String text;
  final bool mine;
  final String time;
  final String? attachment;
  final String? mediaType;
  final bool? deliveredToTelegram;
}

class ClientCareCard {
  const ClientCareCard({
    required this.phone,
    required this.courseTitle,
    required this.courseDescription,
    required this.nextVisitDate,
    required this.progressPercent,
    required this.timeline,
    required this.recommendations,
    required this.updatedAt,
  });

  final String phone;
  final String courseTitle;
  final String courseDescription;
  final String nextVisitDate;
  final int progressPercent;
  final List<CareTimelineEntry> timeline;
  final List<HomeCareRecommendation> recommendations;
  final String updatedAt;

  bool get hasPersonalData => progressPercent > 0 || timeline.isNotEmpty || courseTitle != 'Карта ухода будет заполнена специалистом';
  CareTimelineEntry? get latestEntry => timeline.isEmpty ? null : timeline.first;

  factory ClientCareCard.empty(String phone) {
    return ClientCareCard(
      phone: phone,
      courseTitle: 'Карта ухода будет заполнена специалистом',
      courseDescription: 'После визита специалист добавит курс, прогресс, рекомендации и динамику.',
      nextVisitDate: '',
      progressPercent: 0,
      timeline: const [],
      recommendations: const [
        HomeCareRecommendation(id: 'chat', title: 'Рекомендации в чате', description: 'Специалист сможет отправить рекомендации и уточнения после приёма.', icon: 'chat'),
        HomeCareRecommendation(id: 'visits', title: 'График визитов', description: 'Следующие визиты появятся после назначения специалистом.', icon: 'calendar'),
      ],
      updatedAt: '',
    );
  }

  factory ClientCareCard.fromMap(Map<String, dynamic> map, {required String fallbackPhone}) {
    final timeline = <CareTimelineEntry>[];
    final rawTimeline = map['timeline'];
    if (rawTimeline is List) {
      for (final item in rawTimeline) {
        if (item is Map) timeline.add(CareTimelineEntry.fromMap(Map<String, dynamic>.from(item)));
      }
    }
    timeline.sort((a, b) => b.sortKey.compareTo(a.sortKey));

    final recommendations = <HomeCareRecommendation>[];
    final rawRecommendations = map['recommendations'];
    if (rawRecommendations is List) {
      for (final item in rawRecommendations) {
        if (item is Map) recommendations.add(HomeCareRecommendation.fromMap(Map<String, dynamic>.from(item)));
      }
    }

    return ClientCareCard(
      phone: textValue(map['phone'], fallbackPhone),
      courseTitle: textValue(map['courseTitle'], 'Карта ухода будет заполнена специалистом'),
      courseDescription: textValue(map['courseDescription'], 'После визита специалист добавит курс, прогресс, рекомендации и динамику.'),
      nextVisitDate: textValue(map['nextVisitDate'], ''),
      progressPercent: clampPercent(map['progressPercent']),
      timeline: timeline,
      recommendations: recommendations.isEmpty ? ClientCareCard.empty(fallbackPhone).recommendations : recommendations,
      updatedAt: textValue(map['updatedAt'], ''),
    );
  }
}

class CareTimelineEntry {
  const CareTimelineEntry({
    required this.id,
    required this.visitDate,
    required this.visitNumber,
    required this.title,
    required this.note,
    this.beforeImageUrl = '',
    this.afterImageUrl = '',
    this.imageUrl = '',
    this.progressPercent,
  });

  final String id;
  final String visitDate;
  final int visitNumber;
  final String title;
  final String note;
  final String beforeImageUrl;
  final String afterImageUrl;
  final String imageUrl;
  final int? progressPercent;

  bool get hasBeforeAfter => beforeImageUrl.trim().isNotEmpty || afterImageUrl.trim().isNotEmpty;
  bool get hasAnyImage => imageUrl.trim().isNotEmpty || hasBeforeAfter;
  int get sortKey => DateTime.tryParse(visitDate)?.millisecondsSinceEpoch ?? visitNumber;

  factory CareTimelineEntry.fromMap(Map<String, dynamic> map) {
    return CareTimelineEntry(
      id: textValue(map['id'], 'visit'),
      visitDate: textValue(map['visitDate'], ''),
      visitNumber: int.tryParse(textValue(map['visitNumber'], '0')) ?? 0,
      title: textValue(map['title'], 'Визит'),
      note: textValue(map['note'], ''),
      beforeImageUrl: textValue(map['beforeImageUrl'], ''),
      afterImageUrl: textValue(map['afterImageUrl'], ''),
      imageUrl: textValue(map['imageUrl'], ''),
      progressPercent: map['progressPercent'] == null ? null : clampPercent(map['progressPercent']),
    );
  }
}

class HomeCareRecommendation {
  const HomeCareRecommendation({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    this.actionText = '',
    this.actionUrl = '',
  });

  final String id;
  final String title;
  final String description;
  final String icon;
  final String actionText;
  final String actionUrl;

  factory HomeCareRecommendation.fromMap(Map<String, dynamic> map) {
    return HomeCareRecommendation(
      id: textValue(map['id'], 'recommendation'),
      title: textValue(map['title'], 'Рекомендация'),
      description: textValue(map['description'], ''),
      icon: textValue(map['icon'], 'spa'),
      actionText: textValue(map['actionText'], ''),
      actionUrl: textValue(map['actionUrl'], ''),
    );
  }
}

int clampPercent(dynamic value) {
  final number = value is num ? value.round() : int.tryParse(value?.toString() ?? '') ?? 0;
  if (number < 0) return 0;
  if (number > 100) return 100;
  return number;
}
