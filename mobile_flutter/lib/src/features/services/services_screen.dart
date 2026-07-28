import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key, required this.content, required this.services, required this.onBook});

  final HomeContent content;
  final List<ServiceItem> services;
  final ValueChanged<ServiceItem> onBook;

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      title: content.services.title,
      subtitle: '',
      child: VerticalServicesList(services: services, onBook: onBook),
    );
  }
}
