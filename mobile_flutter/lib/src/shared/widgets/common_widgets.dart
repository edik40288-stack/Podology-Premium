import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/media_helpers.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';

class PageScaffold extends StatelessWidget {
  const PageScaffold({super.key, required this.title, required this.subtitle, required this.child, this.action});

  final String title;
  final String subtitle;
  final Widget child;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final hasTitle = title.trim().isNotEmpty;
    final hasSubtitle = subtitle.trim().isNotEmpty;
    final hasHeader = hasTitle || hasSubtitle || action != null;

    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppColors.cream, Color(0xFFFFFEFB)],
        ),
      ),
      child: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, hasHeader ? 12 : 16, 20, 34),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  if (hasHeader) ...[
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: hasTitle ? Text(title, style: Theme.of(context).textTheme.headlineSmall) : const SizedBox.shrink()),
                        if (action != null) action!,
                      ],
                    ),
                    if (hasSubtitle) ...[
                      const SizedBox(height: 8),
                      Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
                    ],
                    const SizedBox(height: 18),
                  ],
                  child,
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PremiumButton extends StatelessWidget {
  const PremiumButton({super.key, required this.text, required this.icon, required this.onTap, this.danger = false});

  final String text;
  final IconData icon;
  final VoidCallback? onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.danger : AppColors.lime;
    final darkColor = danger ? AppColors.dangerDark : AppColors.limeDark;
    return Opacity(
      opacity: onTap == null ? 0.58 : 1,
      child: Container(
        width: double.infinity,
        height: 60,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color, darkColor],
          ),
          boxShadow: [BoxShadow(color: color.withOpacity(0.22), blurRadius: 24, offset: const Offset(0, 12))],
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(26),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(26),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: Colors.white, size: 23),
                const SizedBox(width: 12),
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(text, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 17.2, letterSpacing: -0.1)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class PremiumCard extends StatelessWidget {
  const PremiumCard({super.key, required this.child, this.padding = const EdgeInsets.all(16)});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(color: AppColors.paper, borderRadius: BorderRadius.circular(28), border: Border.all(color: AppColors.line.withOpacity(0.72)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 26, offset: const Offset(0, 14))]),
      child: child,
    );
  }
}

class HumanInfoCard extends StatelessWidget {
  const HumanInfoCard({super.key, required this.icon, required this.title, required this.text});

  final IconData icon;
  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      child: Row(children: [
        CircleIcon(icon: icon),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text(text, style: Theme.of(context).textTheme.bodyMedium),
        ])),
      ]),
    );
  }
}

class RichContentCard extends StatelessWidget {
  const RichContentCard({super.key, required this.item});

  final ContentItem item;

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      padding: const EdgeInsets.all(12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (item.hasImage) ...[
          ClipRRect(borderRadius: BorderRadius.circular(20), child: DynamicImage(source: item.imageSource, width: 104, height: 104)),
          const SizedBox(width: 12),
        ] else ...[
          CircleIcon(icon: iconFromKey(item.icon)),
          const SizedBox(width: 12),
        ],
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(item.title, style: Theme.of(context).textTheme.titleMedium),
          if (item.description.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(item.description, maxLines: 5, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ])),
      ]),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, required this.icon, this.subtitle = ''});

  final String title;
  final IconData icon;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(2, 26, 2, 12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.limeSoft,
              borderRadius: BorderRadius.circular(13),
              border: Border.all(color: Colors.white.withOpacity(0.78)),
            ),
            child: Icon(icon, color: AppColors.lime, size: 22),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(letterSpacing: -0.35))),
        ]),
        if (subtitle.isNotEmpty) ...[
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(left: 46),
            child: Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
          ),
        ],
      ]),
    );
  }
}

class CircleIcon extends StatelessWidget {
  const CircleIcon({super.key, required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(width: 50, height: 50, decoration: BoxDecoration(color: AppColors.limeSoft, borderRadius: BorderRadius.circular(18), border: Border.all(color: Colors.white.withOpacity(0.72))), child: Icon(icon, color: AppColors.lime, size: 24));
  }
}

class ServicesList extends StatefulWidget {
  const ServicesList({
    super.key,
    required this.services,
    required this.onBook,
    this.maxItems,
  });

  final List<ServiceItem> services;
  final ValueChanged<ServiceItem> onBook;
  final int? maxItems;

  @override
  State<ServicesList> createState() => _ServicesListState();
}

class _ServicesListState extends State<ServicesList> {
  late final PageController _controller;
  double _page = 0;

  @override
  void initState() {
    super.initState();
    _controller = PageController(viewportFraction: 0.88);
    _controller.addListener(() {
      if (!_controller.hasClients) return;
      setState(() => _page = _controller.page ?? _controller.initialPage.toDouble());
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final visibleServices = widget.maxItems == null ? widget.services : widget.services.take(widget.maxItems!).toList(growable: false);
    if (visibleServices.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 350,
          child: PageView.builder(
            controller: _controller,
            padEnds: false,
            clipBehavior: Clip.none,
            itemCount: visibleServices.length,
            itemBuilder: (context, index) {
              final service = visibleServices[index];
              return Padding(
                padding: EdgeInsets.only(right: index == visibleServices.length - 1 ? 0 : 12),
                child: ServiceCarouselCard(service: service, onBook: () => widget.onBook(service)),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        _SlidingDotsIndicator(count: visibleServices.length, page: _page),
      ],
    );
  }
}

class _ServiceVisual extends StatelessWidget {
  const _ServiceVisual({required this.iconText});

  final String iconText;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 58,
      height: 58,
      decoration: BoxDecoration(
        color: AppColors.limeSoft,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.76)),
        boxShadow: [BoxShadow(color: AppColors.lime.withOpacity(0.07), blurRadius: 14, offset: const Offset(0, 7))],
      ),
      alignment: Alignment.center,
      child: const Icon(Icons.spa_rounded, color: AppColors.lime, size: 28),
    );
  }
}

class ServiceCarouselCard extends StatelessWidget {
  const ServiceCarouselCard({super.key, required this.service, required this.onBook});

  final ServiceItem service;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.paper,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        onTap: onBook,
        borderRadius: BorderRadius.circular(30),
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: AppColors.line),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.045), blurRadius: 22, offset: const Offset(0, 12))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _ServiceVisual(iconText: service.iconText),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                        decoration: BoxDecoration(
                          color: AppColors.limeSoft,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: AppColors.line),
                        ),
                        child: Text(
                          service.category,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: AppColors.graphite),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                service.title,
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 17.2, height: 1.12, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 8),
              Text(
                service.subtitle,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 13.6, height: 1.32),
              ),
              const Spacer(),
              Text(
                service.price.isEmpty ? 'Цена уточняется' : service.price,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.lime, fontWeight: FontWeight.w900, fontSize: 16.2, letterSpacing: 0.1),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 46,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF7F8F4),
                        borderRadius: BorderRadius.circular(17),
                        border: Border.all(color: AppColors.line),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.schedule_rounded, size: 17, color: AppColors.graphite),
                          const SizedBox(width: 7),
                          Expanded(
                            child: Text(
                              service.duration.isEmpty ? 'По времени уточняется' : service.duration,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: AppColors.graphite),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: AppColors.limeSoft,
                      borderRadius: BorderRadius.circular(17),
                      border: Border.all(color: Colors.white.withOpacity(0.74)),
                    ),
                    child: const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.graphite, size: 17),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SlidingDotsIndicator extends StatelessWidget {
  const _SlidingDotsIndicator({required this.count, required this.page});

  final int count;
  final double page;

  @override
  Widget build(BuildContext context) {
    if (count <= 1) return const SizedBox.shrink();
    const maxDots = 5;
    final current = page.round().clamp(0, count - 1);
    var start = 0;
    if (count > maxDots) {
      start = current - maxDots ~/ 2;
      if (start < 0) start = 0;
      if (start > count - maxDots) start = count - maxDots;
    }
    final end = count > maxDots ? start + maxDots : count;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        for (var i = start; i < end; i++)
          AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: i == current ? 20 : 8,
            height: 8,
            decoration: BoxDecoration(
              color: i == current ? AppColors.lime : AppColors.line,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
      ],
    );
  }
}


class VerticalServicesList extends StatelessWidget {
  const VerticalServicesList({super.key, required this.services, required this.onBook});

  final List<ServiceItem> services;
  final ValueChanged<ServiceItem> onBook;

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) return const SizedBox.shrink();
    return Column(
      children: [
        for (var i = 0; i < services.length; i++) ...[
          ServiceListCard(service: services[i], onBook: () => onBook(services[i])),
          if (i != services.length - 1) const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class ServiceListCard extends StatelessWidget {
  const ServiceListCard({super.key, required this.service, required this.onBook});

  final ServiceItem service;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.paper,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        onTap: onBook,
        borderRadius: BorderRadius.circular(30),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: AppColors.line),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.045), blurRadius: 22, offset: const Offset(0, 12))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _ServiceVisual(iconText: service.iconText),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                            decoration: BoxDecoration(
                              color: AppColors.limeSoft,
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: AppColors.line),
                            ),
                            child: Text(
                              service.category,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: AppColors.graphite),
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          service.title,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18, height: 1.15, fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          service.subtitle,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 14, height: 1.34),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      service.price.isEmpty ? 'Цена уточняется' : service.price,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: AppColors.lime, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 0.1),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF7F8F4),
                      borderRadius: BorderRadius.circular(17),
                      border: Border.all(color: AppColors.line),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.schedule_rounded, size: 17, color: AppColors.graphite),
                        const SizedBox(width: 7),
                        Text(
                          service.duration.isEmpty ? 'По времени уточняется' : service.duration,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: AppColors.graphite),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SpecialistCarousel extends StatelessWidget {
  const SpecialistCarousel({super.key, required this.specialists});

  final List<SpecialistItem> specialists;

  @override
  Widget build(BuildContext context) {
    if (specialists.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 246,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: specialists.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) => SpecialistCard(item: specialists[index]),
      ),
    );
  }
}

class SpecialistCard extends StatelessWidget {
  const SpecialistCard({super.key, required this.item});

  final SpecialistItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 342,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.paper,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: AppColors.line),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 18, offset: const Offset(0, 10))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: DynamicImage(
              source: item.imageSource,
              width: 126,
              height: 222,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 20, height: 1.05, fontWeight: FontWeight.w900, color: AppColors.graphite)),
                const SizedBox(height: 7),
                Text(item.role, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.muted, fontSize: 13.5, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.limeSoft,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppColors.line),
                  ),
                  child: Text(item.experience, style: const TextStyle(color: AppColors.lime, fontSize: 13, fontWeight: FontWeight.w900)),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: Text(
                    item.description,
                    maxLines: 6,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 14.2, height: 1.35),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


void showImageDialog(BuildContext context, ContentItem item) {
  showDialog(
    context: context,
    builder: (context) => Dialog(
      insetPadding: const EdgeInsets.all(18),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          ClipRRect(borderRadius: BorderRadius.circular(20), child: DynamicImage(source: item.imageSource, width: double.infinity, height: 360)),
          if (item.title.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(item.title, style: Theme.of(context).textTheme.titleLarge),
          ],
          if (item.description.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(item.description, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ]),
      ),
    ),
  );
}

void showCertificateDialog(BuildContext context, ContentItem item) {
  showDialog(
    context: context,
    builder: (context) => Dialog(
      backgroundColor: AppColors.paper,
      insetPadding: const EdgeInsets.all(14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Container(
                color: Colors.white,
                constraints: const BoxConstraints(maxHeight: 560),
                child: InteractiveViewer(
                  minScale: 1,
                  maxScale: 4,
                  child: CertificateImage(source: item.imageSource, width: double.infinity, height: 540),
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close_rounded),
                label: const Text('Закрыть', style: TextStyle(fontWeight: FontWeight.w800)),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.limeSoft,
                  foregroundColor: AppColors.graphite,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

void _showWidgetSnack(BuildContext context, String text) {
  ScaffoldMessenger.of(context).clearSnackBars();
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text), behavior: SnackBarBehavior.floating));
}

Future<void> _openWidgetUrl(BuildContext context, String url) async {
  final uri = Uri.tryParse(url);
  if (uri == null) return _showWidgetSnack(context, 'Ссылка настроена неправильно');
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) _showWidgetSnack(context, 'Не удалось открыть ссылку');
}

class CertificateCard extends StatelessWidget {
  const CertificateCard({super.key, required this.item});

  final ContentItem item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => showCertificateDialog(context, item),
      borderRadius: BorderRadius.circular(28),
      child: Container(
        width: 248,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.paper,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.line),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 18, offset: const Offset(0, 10))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Container(
                  width: double.infinity,
                  color: Colors.white,
                  padding: const EdgeInsets.all(8),
                  child: CertificateImage(source: item.imageSource, width: double.infinity, height: double.infinity),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.limeSoft,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.verified_outlined, color: AppColors.graphite, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.graphite, height: 1.2),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.open_in_full_rounded, color: AppColors.lime, size: 20),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ImageStoryStrip extends StatelessWidget {
  const ImageStoryStrip({super.key, required this.items});

  final List<ContentItem> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    if (items.length == 1) {
      final item = items.first;
      return LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          return InkWell(
            onTap: () => showImageDialog(context, item),
            borderRadius: BorderRadius.circular(30),
            child: Container(
              width: width,
              height: 206,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.paper,
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: AppColors.line),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.045), blurRadius: 24, offset: const Offset(0, 14))],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: DynamicImage(source: item.imageSource, width: width - 16, height: 190),
              ),
            ),
          );
        },
      );
    }

    return SizedBox(
      height: 148,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) => InkWell(
          onTap: () => showImageDialog(context, items[index]),
          borderRadius: BorderRadius.circular(24),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: DynamicImage(source: items[index].imageSource, width: 210, height: 148),
          ),
        ),
      ),
    );
  }
}

class PanoramaCard extends StatelessWidget {
  const PanoramaCard({super.key, required this.item});

  final ContentItem item;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: PremiumCard(
        child: Row(children: [
          const CircleIcon(icon: Icons.threesixty_rounded),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.title, style: Theme.of(context).textTheme.titleMedium),
            if (item.description.isNotEmpty) Text(item.description, style: Theme.of(context).textTheme.bodyMedium),
          ])),
          IconButton.filledTonal(onPressed: () => _openWidgetUrl(context, item.panoramaUrl), icon: const Icon(Icons.open_in_new_rounded)),
        ]),
      ),
    );
  }
}

class WorkCard extends StatelessWidget {
  const WorkCard({super.key, required this.item});

  final ContentItem item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => showImageDialog(context, item),
      borderRadius: BorderRadius.circular(28),
      child: Container(
        width: 232,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.paper,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.line),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.045), blurRadius: 22, offset: const Offset(0, 12))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: Stack(
                children: [
                  DynamicImage(source: item.imageSource, width: 212, height: 170),
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.18),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 10,
                    bottom: 10,
                    child: Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.88),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.open_in_full_rounded, color: AppColors.lime, size: 18),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              item.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.graphite, fontSize: 15.8, height: 1.1, fontWeight: FontWeight.w900),
            ),
            if (item.description.trim().isNotEmpty) ...[
              const SizedBox(height: 5),
              Text(
                item.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12.8, height: 1.25),
              ),
            ],
          ],
        ),
      ),
    );
  }
}


class CertificateImage extends StatelessWidget {
  const CertificateImage({super.key, required this.source, required this.width, required this.height});

  final String source;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveMediaUrl(source);
    if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
      return Image.network(resolved, width: width, height: height, fit: BoxFit.contain, filterQuality: FilterQuality.high, errorBuilder: (_, __, ___) => _imageFallback(width, height));
    }
    if (resolved.isEmpty) return _imageFallback(width, height);
    return Image.asset(resolved, width: width, height: height, fit: BoxFit.contain, filterQuality: FilterQuality.high, errorBuilder: (_, __, ___) => _imageFallback(width, height));
  }
}

Widget _imageFallback(double width, double height) => Container(
      width: width,
      height: height,
      color: AppColors.limeSoft,
      child: const Icon(Icons.image_outlined, color: AppColors.lime),
    );

class DynamicImage extends StatelessWidget {
  const DynamicImage({super.key, required this.source, required this.width, required this.height});

  final String source;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveMediaUrl(source);
    if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
      return Image.network(resolved, width: width, height: height, fit: BoxFit.cover, filterQuality: FilterQuality.high, gaplessPlayback: true, errorBuilder: (_, __, ___) => _imageFallback(width, height));
    }
    if (resolved.isEmpty) return _imageFallback(width, height);
    return Image.asset(resolved, width: width, height: height, fit: BoxFit.cover, filterQuality: FilterQuality.high, gaplessPlayback: true, errorBuilder: (_, __, ___) => _imageFallback(width, height));
  }
}
