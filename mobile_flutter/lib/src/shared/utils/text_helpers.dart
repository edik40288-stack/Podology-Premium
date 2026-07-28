import 'dart:convert';

import 'package:flutter/material.dart';

Color colorFromHex(String value, Color fallback) {
  final hex = value.trim().replaceAll('#', '');
  if (hex.length != 6 && hex.length != 8) return fallback;
  final parsed = int.tryParse(hex.length == 6 ? 'FF$hex' : hex, radix: 16);
  return parsed == null ? fallback : Color(parsed);
}

IconData iconFromKey(String key) {
  final value = key.trim().toLowerCase();
  switch (value) {
    case 'center':
      return Icons.apartment_rounded;
    case 'verified':
    case 'certificate':
      return Icons.verified_outlined;
    case 'interior':
      return Icons.photo_camera_back_outlined;
    case 'works':
      return Icons.photo_library_outlined;
    case 'person':
      return Icons.person_pin_rounded;
    case 'calendar':
      return Icons.event_available_rounded;
    case 'chat':
      return Icons.chat_bubble_outline_rounded;
    case 'oil':
      return Icons.opacity_rounded;
    case 'shoes':
    case 'shoe':
      return Icons.directions_walk_rounded;
    case 'spa':
      return Icons.spa_rounded;
    case 'history':
      return Icons.history_rounded;
    case 'medical':
      return Icons.medical_information_rounded;
    case 'settings':
      return Icons.settings_outlined;
    case '🩺':
      return Icons.medical_information_rounded;
    case '✨':
      return Icons.auto_awesome_rounded;
    case '💅':
      return Icons.spa_rounded;
    default:
      return Icons.info_outline_rounded;
  }
}

String textValue(dynamic value, String fallback) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : repairMojibake(text);
}

String repairMojibake(String value) {
  if (!_looksLikeMojibake(value)) return value;
  final variants = <String>{value};
  final latin = _tryDecodeLatin1Utf8(value);
  if (latin != null) variants.add(latin);
  final cp1251 = _tryDecodeCp1251Utf8(value);
  if (cp1251 != null) variants.add(cp1251);
  var best = value;
  var bestScore = _textQualityScore(value);
  for (final variant in variants) {
    final score = _textQualityScore(variant);
    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }
  return best;
}

bool _looksLikeMojibake(String value) {
  return value.contains('Ð') ||
      value.contains('Ñ') ||
      value.contains('â€') ||
      value.contains('â‚') ||
      value.contains('Â');
}


String? _tryDecodeLatin1Utf8(String value) {
  try {
    return utf8.decode(latin1.encode(value), allowMalformed: false);
  } catch (_) {
    return null;
  }
}

String? _tryDecodeCp1251Utf8(String value) {
  try {
    final bytes = <int>[];
    for (final unit in value.codeUnits) {
      final byte = _cp1251Byte(unit);
      if (byte == null) return null;
      bytes.add(byte);
    }
    return utf8.decode(bytes, allowMalformed: false);
  } catch (_) {
    return null;
  }
}

int? _cp1251Byte(int codeUnit) {
  if (codeUnit >= 0x0410 && codeUnit <= 0x044F) return codeUnit - 0x0410 + 0xC0;
  if (codeUnit == 0x0401) return 0xA8;
  if (codeUnit == 0x0451) return 0xB8;
  if (codeUnit >= 0x0000 && codeUnit <= 0x007F) return codeUnit;
  const extra = <int, int>{
    0x0402: 0x80, 0x0403: 0x81, 0x201A: 0x82, 0x0453: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
    0x20AC: 0x88, 0x2030: 0x89, 0x0409: 0x8A, 0x2039: 0x8B, 0x040A: 0x8C, 0x040C: 0x8D, 0x040B: 0x8E, 0x040F: 0x8F,
    0x0452: 0x90, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x2122: 0x99, 0x0459: 0x9A, 0x203A: 0x9B, 0x045A: 0x9C, 0x045C: 0x9D, 0x045B: 0x9E, 0x045F: 0x9F,
    0x00A0: 0xA0, 0x040E: 0xA1, 0x045E: 0xA2, 0x0408: 0xA3, 0x00A4: 0xA4, 0x0490: 0xA5, 0x00A6: 0xA6, 0x00A7: 0xA7,
    0x00A9: 0xA9, 0x0404: 0xAA, 0x00AB: 0xAB, 0x00AC: 0xAC, 0x00AD: 0xAD, 0x00AE: 0xAE, 0x0407: 0xAF,
    0x00B0: 0xB0, 0x00B1: 0xB1, 0x0406: 0xB2, 0x0456: 0xB3, 0x0491: 0xB4, 0x00B5: 0xB5, 0x00B6: 0xB6, 0x00B7: 0xB7,
    0x2116: 0xB9, 0x0454: 0xBA, 0x00BB: 0xBB, 0x0458: 0xBC, 0x0405: 0xBD, 0x0455: 0xBE, 0x0457: 0xBF,
  };
  return extra[codeUnit];
}

int _textQualityScore(String value) {
  var score = 0;
  for (final unit in value.codeUnits) {
    if ((unit >= 0x0410 && unit <= 0x044F) || unit == 0x0401 || unit == 0x0451) score += 2;
    if (unit >= 0x0020 && unit <= 0x007E) score += 1;
  }
  if (_looksLikeMojibake(value)) score -= 80;
  return score;
}


int stableId(String value) {
  var hash = 0;
  for (final code in value.codeUnits) {
    hash = (hash * 31 + code) & 0x7fffffff;
  }
  return hash == 0 ? 1 : hash;
}

String dateLabel(Map<String, dynamic> map) => textValue(map['date'] ?? map['label'] ?? map['datetime'], '');
String timeLabel(Map<String, dynamic> map) => textValue(map['time'] ?? map['label'] ?? map['datetime'], '');

List<String> demoDates() => const <String>[];
List<String> demoTimes() => const <String>[];

String apiDate(String label) {
  final value = label.trim();
  if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(value)) return value;
  final now = DateTime.now();
  if (value == 'Сегодня') return now.toIso8601String().split('T').first;
  if (value == 'Завтра') return now.add(const Duration(days: 1)).toIso8601String().split('T').first;
  if (value == 'Пятница') return now.add(const Duration(days: 2)).toIso8601String().split('T').first;
  if (value == 'Суббота') return now.add(const Duration(days: 3)).toIso8601String().split('T').first;
  return value;
}

String bookingDateTime(String date, String time) {
  final cleanTime = time.trim().length == 5 ? '${time.trim()}:00' : time.trim();
  return '${apiDate(date)}T$cleanTime';
}
