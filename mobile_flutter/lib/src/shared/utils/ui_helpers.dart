import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:podology_premium_client/src/shared/utils/media_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

void showMediaPreview(BuildContext context, String source, String? mediaType, String caption) {
  if (mediaType == 'video') {
    openUrl(context, resolveMediaUrl(source));
    return;
  }

  showDialog(
    context: context,
    builder: (context) => Dialog(
      insetPadding: const EdgeInsets.all(18),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          ClipRRect(borderRadius: BorderRadius.circular(20), child: DynamicImage(source: source, width: double.infinity, height: 360)),
          if (caption.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(caption, style: Theme.of(context).textTheme.titleMedium),
          ],
        ]),
      ),
    ),
  );
}

void showSnack(BuildContext context, String text) {
  ScaffoldMessenger.of(context).clearSnackBars();
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text), behavior: SnackBarBehavior.floating));
}

Future<void> openUrl(BuildContext context, String url) async {
  final uri = Uri.tryParse(url);
  if (uri == null) return showSnack(context, 'Ссылка настроена неправильно');
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) showSnack(context, 'Не удалось открыть ссылку');
}
