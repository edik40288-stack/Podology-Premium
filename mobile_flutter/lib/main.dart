import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:podology_premium_client/src/app/podology_premium_app.dart';
import 'package:podology_premium_client/src/core/app_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureSystemUi();
  runApp(const PodologyPremiumApp());
}

Future<void> configureSystemUi() async {
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(AppSystemUi.overlayStyle);
}
