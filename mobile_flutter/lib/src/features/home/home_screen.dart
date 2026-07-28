import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/ui_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';
import 'package:podology_premium_client/src/shared/widgets/home_widgets.dart';

class HomeScreen extends StatelessWidget {

  const HomeScreen({super.key, required this.profile, required this.content, required this.services, required this.specialists, required this.onBook});

  final ClientProfile profile;
  final HomeContent content;
  final List<ServiceItem> services;
  final List<SpecialistItem> specialists;
  final ValueChanged<ServiceItem?> onBook;

  Future<void> openMap(BuildContext context) async {
    final uri = Uri.tryParse(content.expertBlock.mapUrl);
    if (uri == null) return showSnack(context, 'Ссылка на карту настроена неправильно');
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) showSnack(context, 'Не удалось открыть карту');
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      title: 'Добро пожаловать',
      subtitle: 'в ${content.brandName}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          UnifiedHeroCard(expertBlock: content.expertBlock, onOpenMap: () => openMap(context)),
          const SizedBox(height: 16),
          PremiumButton(text: 'Записаться на приём', icon: Icons.calendar_month_rounded, onTap: () => onBook(null)),
          ContentSectionView(section: content.about, icon: Icons.apartment_rounded),
          CertificateSection(section: content.certificates),
          InteriorSectionView(section: content.interior),
          WorksSection(section: content.works),
          SectionHeader(title: content.services.title, icon: Icons.medical_services_outlined, subtitle: content.services.description),
          ServicesList(services: services, onBook: (service) => onBook(service)),
          SectionHeader(title: content.specialists.title, icon: Icons.groups_2_outlined, subtitle: content.specialists.description),
          SpecialistCarousel(specialists: specialists),
          const SizedBox(height: 18),
        ],
      ),
    );
  }
}
