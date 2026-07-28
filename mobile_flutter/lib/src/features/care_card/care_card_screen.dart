import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/core/api_client.dart';
import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class CareCardScreen extends StatefulWidget {
  const CareCardScreen({
    super.key,
    required this.profile,
    required this.onOpenProfile,
    required this.onOpenChat,
  });

  final ClientProfile profile;
  final VoidCallback onOpenProfile;
  final VoidCallback onOpenChat;

  @override
  State<CareCardScreen> createState() => _CareCardScreenState();
}

class _CareCardScreenState extends State<CareCardScreen> {
  late ApiClient api;
  late ClientCareCard card;
  bool loading = false;

  @override
  void initState() {
    super.initState();
    api = ApiClient(authToken: widget.profile.authToken);
    card = ClientCareCard.empty(widget.profile.phone);
    _loadCareCard();
  }

  @override
  void didUpdateWidget(covariant CareCardScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.profile.phone != widget.profile.phone || oldWidget.profile.authToken != widget.profile.authToken) {
      api = ApiClient(authToken: widget.profile.authToken);
      card = ClientCareCard.empty(widget.profile.phone);
      _loadCareCard();
    }
  }

  Future<void> _loadCareCard() async {
    if (loading) return;
    setState(() => loading = true);
    try {
      final next = await api.loadCareCard(widget.profile.phone);
      if (!mounted) return;
      setState(() => card = next);
    } catch (_) {
      // The screen must stay useful even without network. It shows a calm empty card.
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  void _openTimeline() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => CareTimelineScreen(card: card)));
  }

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      title: 'Моя карта',
      subtitle: card.hasPersonalData ? 'Ваш курс, динамика и домашний уход' : 'Специалист заполнит карту после визита',
      action: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton.filledTonal(
            onPressed: loading ? null : _loadCareCard,
            icon: loading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.refresh_rounded),
          ),
          const SizedBox(width: 8),
          IconButton.filledTonal(onPressed: widget.onOpenProfile, icon: const Icon(Icons.settings_rounded)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CourseProgressCard(card: card),
          const SizedBox(height: 20),
          SectionHeader(title: 'Динамика', icon: Icons.timeline_rounded, subtitle: card.timeline.isEmpty ? 'История появится после добавления специалистом' : 'Последний визит отображается первым'),
          _DynamicsPreview(card: card, onOpenTimeline: _openTimeline),
          SectionHeader(title: 'Домашний уход', icon: Icons.spa_rounded),
          _RecommendationsList(items: card.recommendations),
          const SizedBox(height: 24),
          PremiumButton(text: 'Купить назначенный уход', icon: Icons.arrow_forward_rounded, onTap: widget.onOpenChat),
        ],
      ),
    );
  }
}

class _CourseProgressCard extends StatelessWidget {
  const _CourseProgressCard({required this.card});

  final ClientCareCard card;

  @override
  Widget build(BuildContext context) {
    final percent = card.progressPercent.clamp(0, 100);
    return PremiumCard(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            percent > 0 ? '${card.courseTitle} ($percent%)' : card.courseTitle,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 24, height: 1.05),
          ),
          if (card.courseDescription.trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(card.courseDescription, style: const TextStyle(fontSize: 15.5, height: 1.28, color: AppColors.graphite, fontWeight: FontWeight.w500)),
          ],
          if (card.nextVisitDate.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text('Следующий визит: ${humanDate(card.nextVisitDate)}', style: const TextStyle(fontSize: 15.5, color: AppColors.graphite, fontWeight: FontWeight.w800)),
          ],
          const SizedBox(height: 18),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: percent / 100,
              minHeight: 8,
              backgroundColor: AppColors.line,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.lime),
            ),
          ),
        ],
      ),
    );
  }
}

class _DynamicsPreview extends StatefulWidget {
  const _DynamicsPreview({required this.card, required this.onOpenTimeline});

  final ClientCareCard card;
  final VoidCallback onOpenTimeline;

  @override
  State<_DynamicsPreview> createState() => _DynamicsPreviewState();
}

class _DynamicsPreviewState extends State<_DynamicsPreview> {
  late final PageController controller;
  double page = 0;

  @override
  void initState() {
    super.initState();
    controller = PageController(viewportFraction: 0.92);
    controller.addListener(() {
      if (!controller.hasClients) return;
      setState(() => page = controller.page ?? 0);
    });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final entries = widget.card.timeline;
    if (entries.isEmpty) {
      return PremiumCard(
        child: Row(
          children: const [
            CircleIcon(icon: Icons.photo_library_outlined),
            SizedBox(width: 12),
            Expanded(child: Text('После визитов здесь появятся фото и заметки специалиста.', style: TextStyle(fontSize: 15, height: 1.3, color: AppColors.muted, fontWeight: FontWeight.w700))),
          ],
        ),
      );
    }

    return Column(
      children: [
        SizedBox(
          height: 318,
          child: PageView.builder(
            controller: controller,
            padEnds: false,
            itemCount: entries.length,
            itemBuilder: (context, index) => Padding(
              padding: EdgeInsets.only(right: index == entries.length - 1 ? 0 : 12),
              child: _TimelinePreviewCard(entry: entries[index], onTap: widget.onOpenTimeline),
            ),
          ),
        ),
        const SizedBox(height: 10),
        TextButton.icon(onPressed: widget.onOpenTimeline, icon: const Icon(Icons.open_in_new_rounded), label: const Text('Открыть всю динамику')),
      ],
    );
  }
}

class _TimelinePreviewCard extends StatelessWidget {
  const _TimelinePreviewCard({required this.entry, required this.onTap});

  final CareTimelineEntry entry;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.paper,
      borderRadius: BorderRadius.circular(28),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(28),
        child: Container(
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(28), border: Border.all(color: AppColors.line)),
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: _TimelineImage(entry: entry, height: 194)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _SmallPill(text: humanDate(entry.visitDate)),
                _SmallPill(text: 'Приём ${entry.visitNumber}'),
                if (entry.progressPercent != null) _SmallPill(text: '${entry.progressPercent}%'),
              ],
            ),
            const SizedBox(height: 8),
            Text(entry.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleMedium),
            if (entry.note.trim().isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(entry.note, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium),
            ],
          ]),
        ),
      ),
    );
  }
}

class _TimelineImage extends StatelessWidget {
  const _TimelineImage({required this.entry, required this.height});

  final CareTimelineEntry entry;
  final double height;

  @override
  Widget build(BuildContext context) {
    if (entry.hasBeforeAfter) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Row(children: [
          Expanded(child: _ImageWithLabel(source: entry.beforeImageUrl, label: 'До', height: height)),
          Container(width: 2, height: height, color: Colors.white),
          Expanded(child: _ImageWithLabel(source: entry.afterImageUrl, label: 'После', height: height)),
        ]),
      );
    }
    return ClipRRect(borderRadius: BorderRadius.circular(22), child: DynamicImage(source: entry.imageUrl, width: double.infinity, height: height));
  }
}

class _ImageWithLabel extends StatelessWidget {
  const _ImageWithLabel({required this.source, required this.label, required this.height});

  final String source;
  final String label;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Stack(children: [
      DynamicImage(source: source, width: double.infinity, height: height),
      Positioned(
        left: 10,
        bottom: 10,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.86), borderRadius: BorderRadius.circular(999)),
          child: Text(label, style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.graphite)),
        ),
      ),
    ]);
  }
}

class _RecommendationsList extends StatelessWidget {
  const _RecommendationsList({required this.items});

  final List<HomeCareRecommendation> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      children: [
        for (var i = 0; i < items.length; i++) ...[
          _RecommendationTile(item: items[i]),
          if (i != items.length - 1) const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _RecommendationTile extends StatelessWidget {
  const _RecommendationTile({required this.item});

  final HomeCareRecommendation item;

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      padding: const EdgeInsets.all(12),
      child: Row(children: [
        CircleIcon(icon: iconFromKey(item.icon)),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(item.title, style: Theme.of(context).textTheme.titleMedium),
          if (item.description.trim().isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(item.description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.25)),
          ],
        ])),
        const Icon(Icons.chevron_right_rounded, color: AppColors.lime),
      ]),
    );
  }
}

class CareTimelineScreen extends StatelessWidget {
  const CareTimelineScreen({super.key, required this.card});

  final ClientCareCard card;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.cream,
      body: PageScaffold(
        title: 'Динамика ухода',
        subtitle: card.timeline.isEmpty ? 'История появится после визитов' : 'Свежий визит — сверху',
        action: IconButton.filledTonal(onPressed: () => Navigator.of(context).pop(), icon: const Icon(Icons.close_rounded)),
        child: card.timeline.isEmpty
            ? const PremiumCard(child: Text('Специалист добавит сюда фото, заметки и процент восстановления после визитов.', style: TextStyle(fontSize: 15, height: 1.35, color: AppColors.muted, fontWeight: FontWeight.w700)))
            : Column(
                children: [
                  for (var i = 0; i < card.timeline.length; i++)
                    _TimelineFullEntry(entry: card.timeline[i], isLast: i == card.timeline.length - 1),
                ],
              ),
      ),
    );
  }
}

class _TimelineFullEntry extends StatelessWidget {
  const _TimelineFullEntry({required this.entry, required this.isLast});

  final CareTimelineEntry entry;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Column(children: [
          Container(width: 22, height: 22, decoration: BoxDecoration(color: AppColors.limeSoft, shape: BoxShape.circle, border: Border.all(color: AppColors.lime, width: 2))),
          if (!isLast) Expanded(child: Container(width: 2, color: AppColors.line)),
        ]),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: PremiumCard(
              padding: const EdgeInsets.all(12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _TimelineImage(entry: entry, height: 178),
                const SizedBox(height: 10),
                Wrap(spacing: 8, runSpacing: 6, children: [
                  _SmallPill(text: humanDate(entry.visitDate)),
                  _SmallPill(text: 'Приём ${entry.visitNumber}'),
                  if (entry.progressPercent != null) _SmallPill(text: '${entry.progressPercent}%'),
                ]),
                const SizedBox(height: 10),
                Text(entry.title, style: Theme.of(context).textTheme.titleMedium),
                if (entry.note.trim().isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(entry.note, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.28)),
                ],
              ]),
            ),
          ),
        ),
      ]),
    );
  }
}

class _SmallPill extends StatelessWidget {
  const _SmallPill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: AppColors.limeSoft, borderRadius: BorderRadius.circular(999), border: Border.all(color: AppColors.line)),
      child: Text(text, style: const TextStyle(color: AppColors.graphite, fontSize: 13, fontWeight: FontWeight.w900)),
    );
  }
}

String humanDate(String raw) {
  final date = DateTime.tryParse(raw);
  if (date == null) return raw;
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return '${date.day} ${months[date.month - 1]}';
}
