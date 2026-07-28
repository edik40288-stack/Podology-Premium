import 'package:flutter_test/flutter_test.dart';
import 'package:podology_premium_client/src/app/podology_premium_app.dart';

void main() {
  testWidgets('app starts with auth screen', (tester) async {
    await tester.pumpWidget(const PodologyPremiumApp());
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('PODOLOG KUTSYTOI'), findsOneWidget);
    expect(find.text('Получить код'), findsOneWidget);
  });
}
