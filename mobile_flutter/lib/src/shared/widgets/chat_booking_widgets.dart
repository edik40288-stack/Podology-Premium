import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/media_helpers.dart';
import 'package:podology_premium_client/src/shared/utils/ui_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class ChatInputBar extends StatelessWidget {
  const ChatInputBar({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.onSend,
    required this.onImage,
    required this.onVideo,
    required this.onDismissKeyboard,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final VoidCallback onSend;
  final VoidCallback onImage;
  final VoidCallback onVideo;
  final VoidCallback onDismissKeyboard;

  @override
  Widget build(BuildContext context) {
    final keyboardOpen = MediaQuery.of(context).viewInsets.bottom > 0;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.paper.withOpacity(0.92),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.82), width: 1.2),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.07), blurRadius: 24, offset: const Offset(0, 12)),
          BoxShadow(color: Colors.white.withOpacity(0.72), blurRadius: 10, offset: const Offset(0, -2)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
        child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          _ChatMediaButton(icon: Icons.image_outlined, tooltip: 'Добавить фото', onPressed: onImage),
          const SizedBox(width: 4),
          _ChatMediaButton(icon: Icons.videocam_outlined, tooltip: 'Добавить видео', onPressed: onVideo),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 160),
            child: keyboardOpen
                ? Padding(
                    key: const ValueKey('hide_keyboard_button'),
                    padding: const EdgeInsets.only(left: 4),
                    child: _ChatMediaButton(icon: Icons.keyboard_hide_rounded, tooltip: 'Скрыть клавиатуру', onPressed: onDismissKeyboard),
                  )
                : const SizedBox.shrink(key: ValueKey('hide_keyboard_placeholder')),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              autofocus: false,
              minLines: 1,
              maxLines: 4,
              textInputAction: TextInputAction.newline,
              decoration: InputDecoration(
                hintText: 'Сообщение...',
                filled: true,
                fillColor: const Color(0xFFF8F5ED),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: AppColors.lime, width: 1.1)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton.filled(
            onPressed: onSend,
            icon: const Icon(Icons.send_rounded),
            style: IconButton.styleFrom(backgroundColor: AppColors.lime, foregroundColor: Colors.white),
          ),
        ]),
      ),
    );
  }
}

class _ChatMediaButton extends StatelessWidget {
  const _ChatMediaButton({required this.icon, required this.tooltip, required this.onPressed});

  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: AppColors.limeSoft,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(18),
          child: SizedBox(
            width: 44,
            height: 44,
            child: Icon(icon, color: AppColors.lime, size: 23),
          ),
        ),
      ),
    );
  }
}

class StepTitle extends StatelessWidget {
  const StepTitle(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) => Text(text, style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.graphite));
}

class Chips extends StatelessWidget {
  const Chips({super.key, required this.values, required this.selected, required this.onSelected});

  final List<String> values;
  final int selected;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(spacing: 8, runSpacing: 8, children: [
      for (int i = 0; i < values.length; i++) ChoiceChip(selected: selected == i, label: Text(values[i], overflow: TextOverflow.ellipsis), onSelected: (_) => onSelected(i)),
    ]);
  }
}

class BookingTile extends StatelessWidget {
  const BookingTile({super.key, required this.item, this.onCancel, this.onLate});

  final BookingItem item;
  final VoidCallback? onCancel;
  final VoidCallback? onLate;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: PremiumCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const CircleIcon(icon: Icons.calendar_month_rounded),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.service, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 4),
              Text('${item.date}, ${item.time} • ${item.specialist}', maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 6),
              Text(item.status, style: TextStyle(color: item.status.toLowerCase().contains('отмен') ? AppColors.danger : AppColors.lime, fontWeight: FontWeight.w900)),
            ])),
          ]),
          if (onLate != null) ...[
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onLate,
              icon: const Icon(Icons.directions_run_rounded),
              label: const Text('Я опаздываю'),
              style: OutlinedButton.styleFrom(foregroundColor: AppColors.graphite, side: const BorderSide(color: AppColors.lime)),
            ),
          ],
          if (onCancel != null) ...[
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onCancel,
              icon: const Icon(Icons.event_busy_rounded),
              label: const Text('Отменить запись'),
              style: OutlinedButton.styleFrom(foregroundColor: AppColors.danger, side: const BorderSide(color: AppColors.danger)),
            ),
            const SizedBox(height: 4),
            const Text('Отмена доступна не позднее чем за 48 часов до приёма.', style: TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ]),
      ),
    );
  }
}

class ChatBubble extends StatelessWidget {
  const ChatBubble({super.key, required this.message});

  final ChatMessageItem message;

  @override
  Widget build(BuildContext context) {
    final align = message.mine ? CrossAxisAlignment.end : CrossAxisAlignment.start;
    final color = message.mine ? AppColors.limeSoft : const Color(0xFFF4F1EA);
    final mediaType = message.mediaType ?? inferMediaType(message.attachment);
    final attachment = message.attachment;
    return Column(crossAxisAlignment: align, children: [
      Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.74),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(20)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (attachment != null && mediaType == 'photo') ...[
            GestureDetector(
              onTap: () => showMediaPreview(context, attachment, mediaType, message.text),
              child: ClipRRect(borderRadius: BorderRadius.circular(16), child: DynamicImage(source: attachment, width: 220, height: 150)),
            ),
            if (message.text.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(message.text, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.graphite)),
            ],
          ] else if (attachment != null && mediaType == 'video') ...[
            InkWell(
              onTap: () => showMediaPreview(context, attachment, mediaType, message.text),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: 220,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.65), borderRadius: BorderRadius.circular(16)),
                child: Row(children: [
                  const CircleIcon(icon: Icons.play_circle_fill_rounded),
                  const SizedBox(width: 10),
                  Expanded(child: Text(message.text.isEmpty ? 'Видео' : message.text, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.graphite))),
                ]),
              ),
            ),
          ] else ...[
            Text(message.text, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.graphite)),
          ],
          if (message.time.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(message.time, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
          ],
        ]),
      ),
    ]);
  }
}

class SettingsTile extends StatelessWidget {
  const SettingsTile({super.key, required this.icon, required this.title, required this.text, required this.onTap});

  final IconData icon;
  final String title;
  final String text;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(26),
          child: PremiumCard(
            child: Row(children: [
              CircleIcon(icon: icon),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: Theme.of(context).textTheme.titleMedium), const SizedBox(height: 4), Text(text, style: Theme.of(context).textTheme.bodyMedium)])),
              const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
            ]),
          ),
        ),
      ),
    );
  }
}

class InfoLine extends StatelessWidget {
  const InfoLine({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.only(bottom: 10), child: Row(children: [SizedBox(width: 110, child: Text(label, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w800))), Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w900)))]));
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Container(width: double.infinity, padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.paper, borderRadius: BorderRadius.circular(22), border: Border.all(color: AppColors.line)), child: Text(text, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700)));
}
