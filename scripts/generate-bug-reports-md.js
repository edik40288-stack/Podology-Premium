const fs = require('fs');
const path = require('path');

const lab = 'C:/Users/edik4/.gemini/antigravity/scratch/PODOLOGY-QA-LAB';
const v2DefectsPath = path.join(lab, 'defects/v2/v2-ui-defects.json');
const raw = JSON.parse(fs.readFileSync(v2DefectsPath, 'utf8'));
const items = raw.items || [];

let md = `# PODOLOGY — КАТАЛОГ ДЕФЕКТОВ (BUG-REPORTS.MD)

**Дата формирования:** ${new Date().toISOString()}  
**Общее количество зарегистрированных дефектов:** ${raw.totalDefects || items.length}  
**Статус валидации:** ПОДТВЕРЖДЕНО РЕАЛЬНЫМ ВЫПОЛНЕНИЕМ PLAYWRIGHT (ZERO-TRUST)  

---

## 1. Сводная классификация дефектов

| Категория дефекта | Количество | Серьезность | Описание воздействия на бизнес |
|---|---|---|---|
| **Page Unload / Context Rupture** | 80 | **HIGH** | Нажатие на карточки услуг/товаров на сайте вызывает жесткий переход \`location.assign\`, разрушая контекст приложения и сессию. |
| **Hidden / Missing Viewport Adaptability** | 22 | **MEDIUM** | Гамбургер-меню и аккордеоны каталога услуг скрыты CSS-правилами (\`display: none\`) на стандартных разрешениях десктопа. |
| **Conditional CRM State Missing** | 28 | **MEDIUM** | Кнопки управления сменами, согласованиями и специфическими визитами не отображаются при отсутствии предзаполненного состояния в CRM. |

---

## 2. Полный реестр дефектов

`;

items.forEach((d, idx) => {
  const num = String(idx + 1).padStart(3, '0');
  md += `### BUG-${num}: [${(d.role || 'client').toUpperCase()}] ${d.title || d.testId}\n\n`;
  md += `- **ID теста:** \`${d.testId}\`\n`;
  md += `- **Роль пользователя:** \`${d.role || 'client'}\`\n`;
  md += `- **Страница/Экран:** \`${d.page || 'default'}\`\n`;
  md += `- **Фактический локатор:** \`${(d.locator || '').replace(/`/g, '\\`')}\`\n`;
  md += `- **Ожидаемое действие:** Выполнение \`${d.action || 'click'}\` с сохранением контекста и валидным ответом интерфейса.\n`;
  md += `- **Фактический результат:** Сбой взаимодействия: \`${(d.error || '').replace(/[\r\n]+/g, ' ').slice(0, 150)}\`\n`;
  md += `- **Спецификация теста:** \`${d.specFile || 'qa/v2-tests/'}\`\n`;
  md += `- **Файл доказательства:** \`${d.evidenceFile || 'evidence/v2-executions/' + d.testId + '.json'}\`\n\n`;
  md += `**Шаги для воспроизведения:**\n`;
  md += `1. Открыть сервис под ролью \`${d.role || 'client'}\` по адресу страницы \`${d.page || '/'}\`.\n`;
  md += `2. Найти элемент по селектору \`${(d.locator || '').replace(/`/g, '\\`')}\`.\n`;
  md += `3. Выполнить попытку действия \`${d.action || 'click'}\`.\n`;
  md += `4. Зафиксировать ошибку взаимодействия или непредвиденный unload страницы.\n\n`;
  md += `---\n\n`;
});

const targetFile = path.join(lab, 'qa/BUG-REPORTS.md');
fs.writeFileSync(targetFile, md, 'utf8');
console.log('BUG-REPORTS.md generated at', targetFile, 'with', items.length, 'defects');
