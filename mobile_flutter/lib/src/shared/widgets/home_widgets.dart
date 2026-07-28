import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class UnifiedHeroCard extends StatelessWidget {
  const UnifiedHeroCard({super.key, required this.expertBlock, required this.onOpenMap});

  final ExpertBlock expertBlock;
  final VoidCallback onOpenMap;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 781 / 890,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(34),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/premium_home_hero_card.png',
              fit: BoxFit.cover,
              filterQuality: FilterQuality.high,
            ),
            // The premium address row is part of the hero artwork. Keep it visually untouched
            // and add only a transparent tap layer, so the row stays exactly like the approved design.
            Positioned(
              left: 20,
              right: 20,
              bottom: 12,
              height: 78,
              child: Semantics(
                button: true,
                label: _compactAddress(expertBlock.address),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: onOpenMap,
                    borderRadius: BorderRadius.circular(22),
                    splashColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _compactAddress(String value) {
    final text = value.trim();
    if (text.isEmpty) return 'Петрозаводская ул., 28 к1';
    return text
        .replaceAll('улица', 'ул.,')
        .replaceAll(RegExp(r'\s+к\s+'), ' к')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }
}

class ContentSectionView extends StatelessWidget {
  const ContentSectionView({super.key, required this.section, required this.icon});

  final ContentSection section;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SectionHeader(title: section.title, icon: icon, subtitle: section.description),
      SizedBox(
        height: 206,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: section.items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (context, index) => SizedBox(width: 350, child: AboutContentCard(item: section.items[index])),
        ),
      ),
    ]);
  }
}

class AboutContentCard extends StatelessWidget {
  const AboutContentCard({super.key, required this.item});

  final ContentItem item;

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      padding: const EdgeInsets.all(12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(22),
          child: DynamicImage(source: item.imageSource, width: 132, height: 132),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
            Text(
              item.title,
              maxLines: 2,
              overflow: TextOverflow.visible,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 15.2, height: 1.12, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 7),
            Text(
              item.description,
              maxLines: 5,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 13.1, height: 1.28),
            ),
          ]),
        ),
      ]),
    );
  }
}

class CertificateSection extends StatelessWidget {
  const CertificateSection({super.key, required this.section});

  final ContentSection section;

  @override
  Widget build(BuildContext context) {
    if (section.items.isEmpty) return const SizedBox.shrink();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SectionHeader(title: section.title, icon: Icons.verified_outlined, subtitle: section.description),
      SizedBox(
        height: 264,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: section.items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (context, index) => CertificateCard(item: section.items[index]),
        ),
      ),
    ]);
  }
}

class InteriorSectionView extends StatelessWidget {
  const InteriorSectionView({super.key, required this.section});

  final InteriorSection section;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SectionHeader(title: section.title, icon: Icons.photo_camera_back_outlined, subtitle: section.description),
      ImageStoryStrip(items: section.items),
      if (section.panoramas.isNotEmpty) ...[
        const SizedBox(height: 14),
        for (final item in section.panoramas) PanoramaCard(item: item),
      ],
    ]);
  }
}

class WorksSection extends StatelessWidget {
  const WorksSection({super.key, required this.section});

  final ContentSection section;

  @override
  Widget build(BuildContext context) {
    if (section.items.isEmpty) return const SizedBox.shrink();

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SectionHeader(title: section.title, icon: Icons.photo_library_outlined, subtitle: section.description),
      SizedBox(
        height: 252,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          itemCount: section.items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemBuilder: (context, index) => WorkCard(item: section.items[index]),
        ),
      ),
    ]);
  }
}
