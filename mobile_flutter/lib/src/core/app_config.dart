import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppConfig {
  static const appEnv = String.fromEnvironment('APP_ENV', defaultValue: 'local');
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL', defaultValue: 'http://127.0.0.1:3000'); // Release scripts must pass HTTPS API_BASE_URL.
  static const privacyPolicyUrl = String.fromEnvironment('PRIVACY_POLICY_URL', defaultValue: 'https://podologkutsytoi.com/legal/privacy');
  static const termsUrl = String.fromEnvironment('TERMS_URL', defaultValue: 'https://podologkutsytoi.com/legal/terms');
  static const accountDeletionUrl = String.fromEnvironment('ACCOUNT_DELETION_URL', defaultValue: 'https://podologkutsytoi.com/legal/account-deletion');
  static const supportEmail = String.fromEnvironment('SUPPORT_EMAIL', defaultValue: 'danilova.danilova.99@mail.ru');
  static bool get isProduction => appEnv == 'production';
}

class AppColors {
  static const cream = Color(0xFFFAF8F1);
  static const paper = Color(0xFFFFFFFF);
  static const graphite = Color(0xFF252520);
  static const muted = Color(0xFF746F65);
  static const lime = Color(0xFF0B8A4B);
  static const limeDark = Color(0xFF056F39);
  static const limeSoft = Color(0xFFE8F4EA);
  static const line = Color(0xFFE9E3D9);
  static const danger = Color(0xFFB95042);
  static const dangerDark = Color(0xFF983C32);
}

class AppSystemUi {
  static const overlayStyle = SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
    systemNavigationBarDividerColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.dark,
  );
}
