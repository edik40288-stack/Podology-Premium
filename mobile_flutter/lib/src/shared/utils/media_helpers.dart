import 'package:podology_premium_client/src/core/app_config.dart';

String resolveMediaUrl(String source) {
  final trimmed = source.trim();
  if (trimmed.startsWith('/')) return '${AppConfig.apiBaseUrl.replaceAll(RegExp(r'/+$'), '')}$trimmed';
  return trimmed;
}

String? inferMediaType(String? source) {
  final value = source?.toLowerCase() ?? '';
  if (value.isEmpty) return null;
  if (value.endsWith('.mp4') || value.endsWith('.mov') || value.endsWith('.webm')) return 'video';
  if (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.webp') || value.endsWith('.gif')) return 'photo';
  return null;
}
