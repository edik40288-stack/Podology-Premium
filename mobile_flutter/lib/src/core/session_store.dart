import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:podology_premium_client/src/models/client_models.dart';

class SessionStore {
  const SessionStore();

  static const _storage = FlutterSecureStorage();
  static const _profileKey = 'client_profile_v1';

  Future<ClientProfile?> loadProfile() async {
    try {
      final raw = await _storage.read(key: _profileKey);
      if (raw == null || raw.trim().isEmpty) return null;
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      final profile = ClientProfile.fromJson(Map<String, dynamic>.from(decoded));
      return profile.authToken.trim().isEmpty ? null : profile;
    } catch (_) {
      return null;
    }
  }

  Future<void> saveProfile(ClientProfile profile) async {
    await _storage.write(key: _profileKey, value: jsonEncode(profile.toJson()));
  }

  Future<void> clear() async {
    await _storage.delete(key: _profileKey);
  }
}
