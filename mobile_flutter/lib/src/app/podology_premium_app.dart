import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/core/session_store.dart';
import 'package:podology_premium_client/src/features/auth/auth_screen.dart';
import 'package:podology_premium_client/src/features/shell/premium_shell.dart';
import 'package:podology_premium_client/src/models/client_models.dart';

class PodologyPremiumApp extends StatelessWidget {
  const PodologyPremiumApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PODOLOG KUTSYTOI',
      debugShowCheckedModeBanner: false,
      builder: (context, child) => AnnotatedRegion<SystemUiOverlayStyle>(
        value: AppSystemUi.overlayStyle,
        child: ColoredBox(color: AppColors.cream, child: child ?? const SizedBox.shrink()),
      ),
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.cream,
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.lime, primary: AppColors.lime, secondary: AppColors.lime, surface: AppColors.paper),
        appBarTheme: const AppBarTheme(backgroundColor: Colors.transparent, elevation: 0, surfaceTintColor: Colors.transparent, foregroundColor: AppColors.graphite, systemOverlayStyle: AppSystemUi.overlayStyle),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: AppColors.paper.withOpacity(0.985),
          indicatorColor: AppColors.limeSoft,
          elevation: 10,
          labelTextStyle: MaterialStateProperty.resolveWith((states) => TextStyle(
            fontSize: 12.2,
            fontWeight: states.contains(MaterialState.selected) ? FontWeight.w800 : FontWeight.w700,
            color: states.contains(MaterialState.selected) ? AppColors.graphite : AppColors.muted,
          )),
          iconTheme: MaterialStateProperty.resolveWith((states) => IconThemeData(
            size: 27,
            color: states.contains(MaterialState.selected) ? AppColors.graphite : AppColors.muted,
          )),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.lime,
            foregroundColor: Colors.white,
            elevation: 0,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            textStyle: const TextStyle(fontSize: 16.4, fontWeight: FontWeight.w900, letterSpacing: -0.1),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.paper,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: AppColors.line)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: AppColors.line)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(22), borderSide: const BorderSide(color: AppColors.lime, width: 1.4)),
        ),
        textTheme: const TextTheme(
          displaySmall: TextStyle(fontSize: 31, height: 1.05, fontWeight: FontWeight.w900, color: AppColors.graphite, letterSpacing: -0.6),
          headlineSmall: TextStyle(fontSize: 34, height: 1.06, fontWeight: FontWeight.w900, color: AppColors.graphite, letterSpacing: -0.9),
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.graphite, letterSpacing: -0.25),
          titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.graphite),
          bodyLarge: TextStyle(fontSize: 16, color: AppColors.graphite),
          bodyMedium: TextStyle(fontSize: 14, color: AppColors.muted, height: 1.38, letterSpacing: 0.02),
        ),
      ),
      home: const AppRoot(),
    );
  }
}

class AppRoot extends StatefulWidget {
  const AppRoot({super.key});

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> {
  final session = const SessionStore();
  ClientProfile? profile;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final saved = await session.loadProfile();
    if (!mounted) return;
    setState(() {
      profile = saved;
      loading = false;
    });
  }

  Future<void> _completeAuth(ClientProfile value) async {
    await session.saveProfile(value);
    if (!mounted) return;
    setState(() => profile = value);
  }

  Future<void> _logout() async {
    await session.clear();
    if (!mounted) return;
    setState(() => profile = null);
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (profile == null) return AuthScreen(onComplete: _completeAuth);
    return PremiumShell(profile: profile!, onLogout: () { _logout(); });
  }
}
