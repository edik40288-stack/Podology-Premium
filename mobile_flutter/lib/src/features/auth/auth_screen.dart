import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:podology_premium_client/src/core/api_client.dart';
import 'package:podology_premium_client/src/core/app_config.dart';
import 'package:podology_premium_client/src/models/client_models.dart';
import 'package:podology_premium_client/src/shared/widgets/common_widgets.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.onComplete});

  final ValueChanged<ClientProfile> onComplete;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final api = const ApiClient();
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final phone = TextEditingController();
  final code = TextEditingController();
  bool codeSent = false;
  bool loading = false;

  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    phone.dispose();
    code.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (loading) return;
    final first = firstName.text.trim();
    final last = lastName.text.trim();
    final mobile = phone.text.trim();
    if (first.isEmpty || last.isEmpty || mobile.isEmpty) {
      _message('Заполните имя, фамилию и телефон');
      return;
    }

    setState(() => loading = true);
    try {
      if (!codeSent) {
        final result = await api.requestAuthCode(firstName: first, lastName: last, phone: mobile);
        if (result['autoVerified'] == true) {
          widget.onComplete(_profileFromAutoVerified(result));
          return;
        }
        setState(() => codeSent = true);
        final demoCode = result['demoCode']?.toString();
        _message(demoCode == null || demoCode.isEmpty ? 'Код отправлен' : 'Код для входа: $demoCode');
        return;
      }

      final verified = await api.verifyAuthCode(firstName: first, lastName: last, phone: mobile, code: code.text.trim());
      widget.onComplete(verified);
    } catch (_) {
      _message(codeSent ? 'Не удалось войти. Проверьте код и интернет.' : 'Не удалось отправить код. Проверьте телефон и повторите попытку.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  ClientProfile _profileFromAutoVerified(Map<String, dynamic> result) {
    final profile = result['profile'] is Map ? Map<String, dynamic>.from(result['profile'] as Map) : <String, dynamic>{};
    return ClientProfile(
      firstName: profile['firstName']?.toString() ?? firstName.text.trim(),
      lastName: profile['lastName']?.toString() ?? lastName.text.trim(),
      phone: profile['phone']?.toString() ?? phone.text.trim(),
      authToken: result['token']?.toString() ?? '',
      testMode: result['mode'] == 'test' || profile['testMode'] == true,
    );
  }

  void _message(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
          children: [
            const SizedBox(height: 12),
            ClipRRect(borderRadius: BorderRadius.circular(28), child: Image.asset('assets/images/app_icon.png', height: 82, width: 82, errorBuilder: (_, __, ___) => const SizedBox(height: 96))),
            const SizedBox(height: 22),
            Text('PODOLOG KUTSYTOI', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 26),
            PremiumCard(
              child: Column(
                children: [
                  TextField(controller: firstName, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'Имя')),
                  const SizedBox(height: 10),
                  TextField(controller: lastName, textInputAction: TextInputAction.next, decoration: const InputDecoration(labelText: 'Фамилия')),
                  const SizedBox(height: 10),
                  TextField(controller: phone, keyboardType: TextInputType.phone, textInputAction: TextInputAction.done, decoration: const InputDecoration(labelText: 'Телефон')),
                  if (codeSent) ...[
                    const SizedBox(height: 10),
                    TextField(controller: code, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Код из SMS')),
                  ],
                  const SizedBox(height: 18),
                  PremiumButton(text: loading ? 'Проверяем...' : (codeSent ? 'Войти' : 'Получить код'), icon: Icons.verified_user_rounded, onTap: loading ? null : submit),
                ],
              ),
            ),
            const SizedBox(height: 14),
            Center(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Продолжая, вы соглашаетесь с ', style: TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
                    TextButton(
                      onPressed: () => _openUrl(AppConfig.termsUrl),
                      style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 2), minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap, visualDensity: VisualDensity.compact),
                      child: const Text('условиями', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                    ),
                    const Text(' и ', style: TextStyle(color: AppColors.muted, fontSize: 12, fontWeight: FontWeight.w600)),
                    TextButton(
                      onPressed: () => _openUrl(AppConfig.privacyPolicyUrl),
                      style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 2), minimumSize: Size.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap, visualDensity: VisualDensity.compact),
                      child: const Text('политикой', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                    ),
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
