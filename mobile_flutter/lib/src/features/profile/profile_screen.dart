import 'package:flutter/material.dart';

import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/utils/text_helpers.dart';
import 'package:podology_premium_client/src/shared/widgets/chat_booking_widgets.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.profile, required this.settings, required this.content, required this.bookings, required this.onSaveProfile, required this.onDeleteAccount, required this.onLogout});

  final ClientProfile profile;
  final ClientSettings settings;
  final HomeContent content;
  final List<BookingItem> bookings;
  final Future<void> Function(ClientProfile profile, ClientSettings settings) onSaveProfile;
  final Future<void> Function() onDeleteAccount;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return PageScaffold(
      title: '',
      subtitle: '',
      child: Column(children: [
        PremiumCard(
          child: Row(children: [
            const CircleAvatar(radius: 34, backgroundColor: Colors.black, backgroundImage: AssetImage('assets/images/app_icon.png')),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(profile.fullName, maxLines: 1, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(profile.phone, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700)),
            ])),
          ]),
        ),
        const SizedBox(height: 14),
        for (final item in content.profile.items) ...[
          SettingsTile(icon: iconFromKey(item.icon), title: item.title, text: _profileText(item, bookings), onTap: () => showProfileDetails(context, item)),
        ],
        const SizedBox(height: 14),
        PremiumButton(text: 'Выйти', icon: Icons.logout_rounded, onTap: onLogout, danger: true),
        const SizedBox(height: 10),
        TextButton.icon(
          onPressed: () => _confirmDeleteAccount(context),
          icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger),
          label: const Text('Удалить аккаунт и данные', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w800)),
        ),
      ]),
    );
  }



  Future<void> _confirmDeleteAccount(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Удалить аккаунт?'),
        content: const Text('Профиль и локальная сессия будут удалены. Это действие нужно для требований магазинов приложений и контроля персональных данных.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Отмена')),
          TextButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Удалить')),
        ],
      ),
    );
    if (confirmed == true) await onDeleteAccount();
  }

  String _profileText(ContentItem item, List<BookingItem> bookings) {
    if (item.id.contains('upcoming')) return 'Предстоящие: ${bookings.where((e) => !e.isArchive).length}';
    if (item.id.contains('archive')) return 'Архив: ${bookings.where((e) => e.isArchive).length}';
    if (item.id.contains('settings')) {
      final enabled = [settings.chatNotifications, settings.bookingNotifications, settings.marketingNotifications].where((e) => e).length;
      return 'Включено уведомлений: $enabled из 3';
    }
    return item.description;
  }

  void showProfileDetails(BuildContext context, ContentItem item) {
    final upcoming = bookings.where((e) => !e.isArchive).toList();
    final archive = bookings.where((e) => e.isArchive).toList();
    if (item.id.contains('personal')) {
      _showPersonalEditor(context);
      return;
    }
    if (item.id.contains('settings')) {
      _showSettingsEditor(context);
      return;
    }
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      backgroundColor: AppColors.cream,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.title, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(item.description, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 14),
            if (item.id.contains('upcoming')) ...[
              if (upcoming.isEmpty) const EmptyState(text: 'Предстоящих записей пока нет'),
              for (final b in upcoming) BookingTile(item: b),
            ] else if (item.id.contains('archive')) ...[
              if (archive.isEmpty) const EmptyState(text: 'Архив посещений пуст'),
              for (final b in archive) BookingTile(item: b),
            ] else ...[
              const EmptyState(text: 'Раздел готовится. Информация появится после подключения рабочих данных центра.'),
            ],
          ]),
        ),
      ),
    );
  }

  void _showPersonalEditor(BuildContext context) {
    final firstNameController = TextEditingController(text: profile.firstName);
    final lastNameController = TextEditingController(text: profile.lastName);
    final phoneController = TextEditingController(text: profile.phone);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: AppColors.cream,
      builder: (context) {
        var saving = false;
        return StatefulBuilder(
          builder: (context, setSheetState) => Padding(
            padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 24),
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Личные данные', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text('Измените имя, фамилию и номер телефона клиента.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              TextField(controller: firstNameController, decoration: const InputDecoration(labelText: 'Имя')),
              const SizedBox(height: 10),
              TextField(controller: lastNameController, decoration: const InputDecoration(labelText: 'Фамилия')),
              const SizedBox(height: 10),
              TextField(controller: phoneController, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Телефон')),
              const SizedBox(height: 18),
              PremiumButton(
                text: saving ? 'Сохраняем...' : 'Сохранить',
                icon: Icons.save_rounded,
                onTap: saving
                    ? null
                    : () async {
                        setSheetState(() => saving = true);
                        await onSaveProfile(
                          profile.copyWith(firstName: firstNameController.text, lastName: lastNameController.text, phone: phoneController.text),
                          settings,
                        );
                        if (context.mounted) Navigator.of(context).pop();
                      },
              ),
            ]),
          ),
        );
      },
    );
  }

  void _showSettingsEditor(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: AppColors.cream,
      builder: (context) {
        var saving = false;
        var local = settings;
        return StatefulBuilder(
          builder: (context, setSheetState) => Padding(
            padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.of(context).viewInsets.bottom + 24),
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Настройки', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 8),
              Text('Управляйте уведомлениями и основными параметрами профиля.', style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 16),
              SwitchListTile.adaptive(
                value: local.chatNotifications,
                onChanged: (value) => setSheetState(() => local = local.copyWith(chatNotifications: value)),
                title: const Text('Уведомления чата'),
                subtitle: const Text('Сообщения администратора и ответы в переписке'),
                contentPadding: EdgeInsets.zero,
              ),
              SwitchListTile.adaptive(
                value: local.bookingNotifications,
                onChanged: (value) => setSheetState(() => local = local.copyWith(bookingNotifications: value)),
                title: const Text('Уведомления о записях'),
                subtitle: const Text('Напоминания о визитах и изменениях записи'),
                contentPadding: EdgeInsets.zero,
              ),
              SwitchListTile.adaptive(
                value: local.marketingNotifications,
                onChanged: (value) => setSheetState(() => local = local.copyWith(marketingNotifications: value)),
                title: const Text('Новости и предложения'),
                subtitle: const Text('Акции, новинки и полезные материалы центра'),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 18),
              PremiumButton(
                text: saving ? 'Сохраняем...' : 'Сохранить настройки',
                icon: Icons.tune_rounded,
                onTap: saving
                    ? null
                    : () async {
                        setSheetState(() => saving = true);
                        await onSaveProfile(profile, local);
                        if (context.mounted) Navigator.of(context).pop();
                      },
              ),
            ]),
          ),
        );
      },
    );
  }
}
