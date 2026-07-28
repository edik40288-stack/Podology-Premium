import 'dart:async';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'package:podology_premium_client/src/core/api_client.dart';
import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';
import 'package:podology_premium_client/src/shared/utils/ui_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/chat_booking_widgets.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key, required this.profile, required this.online});

  final ClientProfile profile;
  final bool online;

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  late final ApiClient api;
  final controller = TextEditingController();
  final inputFocusNode = FocusNode();
  final picker = ImagePicker();
  Timer? chatRefreshTimer;
  final List<ChatMessageItem> messages = [];

  @override
  void initState() {
    super.initState();
    api = ApiClient(authToken: widget.profile.authToken);
    _syncMessages();
    chatRefreshTimer = Timer.periodic(const Duration(milliseconds: 800), (_) => _syncMessages());
  }

  @override
  void dispose() {
    chatRefreshTimer?.cancel();
    inputFocusNode.dispose();
    controller.dispose();
    super.dispose();
  }

  Future<void> _syncMessages() async {
    try {
      final loaded = await api.loadChatMessages(widget.profile.roomId);
      if (!mounted || loaded.isEmpty) return;
      final next = loaded.map(_chatMessageFromMap).toList();
      final oldKey = messages.map((item) => '${item.id ?? ''}|${item.time}|${item.text}|${item.attachment ?? ''}').join('~');
      final newKey = next.map((item) => '${item.id ?? ''}|${item.time}|${item.text}|${item.attachment ?? ''}').join('~');
      if (oldKey == newKey) return;
      setState(() {
        messages
          ..clear()
          ..addAll(next);
      });
    } catch (_) {}
  }

  ChatMessageItem _chatMessageFromMap(Map<String, dynamic> map) {
    final role = map['senderRole']?.toString() ?? 'client';
    final mediaType = map['mediaType']?.toString();
    final mediaUrl = map['mediaUrl']?.toString();
    final text = (map['text']?.toString().trim().isNotEmpty ?? false)
        ? repairMojibake(map['text'].toString())
        : mediaType == 'video'
            ? 'Видео'
            : mediaUrl != null
                ? 'Фото'
                : 'Сообщение';
    final createdAt = DateTime.tryParse(map['createdAt']?.toString() ?? '');
    final time = createdAt == null ? 'сейчас' : '${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}';
    return ChatMessageItem(
      id: map['id']?.toString(),
      text: text,
      mine: role == 'client',
      time: time,
      attachment: mediaUrl,
      mediaType: mediaType,
      deliveredToTelegram: map['deliveredToTelegram'] == true,
    );
  }

  void _dismissKeyboard() {
    FocusManager.instance.primaryFocus?.unfocus();
    inputFocusNode.unfocus();
  }

  Future<void> send({String? overrideText, String? mediaUrl, String? mediaType}) async {
    final text = (overrideText ?? controller.text).trim();
    if (text.isEmpty && mediaUrl == null) return;
    if (overrideText == null) {
      controller.clear();
      _dismissKeyboard();
    }
    setState(() => messages.add(ChatMessageItem(text: text.isEmpty ? (mediaType == 'video' ? 'Видео' : 'Фото') : text, mine: true, time: 'сейчас', attachment: mediaUrl, mediaType: mediaType)));
    try {
      await api.sendChatMessage(profile: widget.profile, text: text, mediaUrl: mediaUrl, mediaType: mediaType);
      if (mounted) showSnack(context, 'Отправлено');
      await _syncMessages();
    } catch (_) {
      if (mounted) showSnack(context, 'Сообщение не отправлено. Проверьте подключение и повторите.');
    }
  }

  Future<void> attach({required bool video}) async {
    try {
      final file = video ? await picker.pickVideo(source: ImageSource.gallery) : await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (file == null) return;
      final uploaded = await api.uploadChatMedia(file);
      await send(overrideText: video ? 'Видео' : 'Фото', mediaUrl: uploaded['url']?.toString(), mediaType: uploaded['mediaType']?.toString() ?? (video ? 'video' : 'photo'));
    } catch (_) {
      if (mounted) showSnack(context, 'Не удалось отправить файл. Попробуйте ещё раз.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final visibleMessages = <ChatMessageItem>[
      const ChatMessageItem(
        id: 'local_welcome_message',
        text: 'Добрый день! Вас приветствует центр PODOLOG KUTSYTOI.\nБудем рады помочь с записью и ответить на ваши вопросы.',
        mine: false,
        time: '',
      ),
      ...messages,
    ];
    return SafeArea(
      child: GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: _dismissKeyboard,
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, 8 + bottomPadding),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text('Чат', style: Theme.of(context).textTheme.headlineSmall)),
            IconButton.filledTonal(onPressed: _syncMessages, icon: const Icon(Icons.refresh_rounded)),
          ]),
          const SizedBox(height: 14),
          Expanded(
            child: PremiumCard(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
              child: ListView.separated(
                keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                padding: const EdgeInsets.only(bottom: 6),
                itemCount: visibleMessages.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) => ChatBubble(message: visibleMessages[i]),
              ),
            ),
          ),
          const SizedBox(height: 10),
          ChatInputBar(
            controller: controller,
            focusNode: inputFocusNode,
            onSend: () => send(),
            onImage: () => attach(video: false),
            onVideo: () => attach(video: true),
            onDismissKeyboard: _dismissKeyboard,
          ),
          ]),
        ),
      ),
    );
  }
}
