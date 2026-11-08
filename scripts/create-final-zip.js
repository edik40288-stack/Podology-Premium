const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const downloadsDir = 'C:/Users/edik4/Downloads';
const zipName = 'гпт слабак.zip';
const targetZip = path.join(downloadsDir, zipName);
const labDir = 'C:/Users/edik4/.gemini/antigravity/scratch/PODOLOGY-QA-LAB';
const transcriptDir = 'C:/Users/edik4/.gemini/antigravity/brain/38a1c5b2-0c3a-4e13-8dfe-dad2b028fe6d/.system_generated/logs';

// Staging directory
const stageDir = path.join(labDir, 'staging_export');
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

console.log('Staging files...');

// 1. Copy reports
fs.cpSync(path.join(labDir, 'reports'), path.join(stageDir, 'reports'), { recursive: true });

// 2. Copy evidence (all raw executions, metrics, screenshots)
fs.cpSync(path.join(labDir, 'evidence'), path.join(stageDir, 'evidence'), { recursive: true });

// 3. Copy load testing raw data
if (fs.existsSync(path.join(labDir, 'load-raw'))) {
  fs.cpSync(path.join(labDir, 'load-raw'), path.join(stageDir, 'load-raw'), { recursive: true });
}

// 4. Copy qa (inventory, test specs, configs, playbooks)
fs.cpSync(path.join(labDir, 'qa'), path.join(stageDir, 'qa'), { recursive: true });

// 5. Copy orchestrator scripts & validators
fs.cpSync(path.join(labDir, 'orchestrator'), path.join(stageDir, 'orchestrator'), { recursive: true });

// 6. Copy defects
if (fs.existsSync(path.join(labDir, 'defects'))) {
  fs.cpSync(path.join(labDir, 'defects'), path.join(stageDir, 'defects'), { recursive: true });
}

// 7. Copy checkpoints
if (fs.existsSync(path.join(labDir, 'checkpoints'))) {
  fs.cpSync(path.join(labDir, 'checkpoints'), path.join(stageDir, 'checkpoints'), { recursive: true });
}

// 8. Copy full conversation logs & transcripts (all comments, steps, prompts, responses)
const stageLogs = path.join(stageDir, 'conversation_transcripts_and_logs');
fs.mkdirSync(stageLogs, { recursive: true });
if (fs.existsSync(transcriptDir)) {
  fs.cpSync(transcriptDir, stageLogs, { recursive: true });
}

// 9. Create a Master Summary in stageDir
const masterReadme = `# PODOLOGY QA — ПОЛНЫЙ АРХИВ ДОКАЗАТЕЛЬСТВ, ЛОГОВ И ОТЧЕТОВ ("ГПТ СЛАБАК")

Дата выгрузки: ${new Date().toISOString()}

## Содержимое архива:
1. **/reports/** — Все финальные отчёты:
   - \`e2e-business-flows-report.md\` — Сквозные 8 бизнес-процессов (100% Pass)
   - \`owner-ui-report.md\` — Покрытие UI Владельца (34 элемента)
   - \`admin-ui-report.md\` — Покрытие UI Администратора (24 элемента)
   - \`manager-ui-report.md\` — Покрытие UI Менеджера (33 элемента)
   - \`specialist-ui-report.md\` — Покрытие UI Специалиста (13 элементов)
   - \`client-ui-report.md\` — Покрытие UI Клиента / Сайта (128 элементов)
   - \`evidence-integrity-report.md\` — Независимая Zero-Trust валидация доказательств
2. **/evidence/raw-executions/** — Сырые JSON-доказательства всех запусков:
   - 232 файла \`UI-ACT-*.json\` со всеми селекторами, DOM-мутациями и ответами
   - 8 файлов \`E2E-FLOW-*.json\` со сквозными HTTP-цепочками и транзакциями
   - Специфические глубокие сценарии (SC001, SC051, SC070, SC161, EXT-001..EXT-401)
3. **/load-raw/** — Настоящие замеры нагрузки k6 на 50 пользователей (\`raw-k6-50vu.json\`)
4. **/qa/** — Спецификации тестов, инвентаризация UI (\`ui-inventory.json\`), тест-кейсы
5. **/conversation_transcripts_and_logs/** — Полный лог всех шагов, промптов, рассуждений и комментариев диалога (\`transcript.jsonl\`, \`transcript_full.jsonl\`)
`;
fs.writeFileSync(path.join(stageDir, 'README.md'), masterReadme, 'utf8');

console.log('Compressing to ZIP via PowerShell...');
const psCmd = `powershell -Command "Compress-Archive -Path '${stageDir}/*' -DestinationPath '${targetZip}' -Force"`;
execSync(psCmd, { stdio: 'inherit' });

console.log('Removing staging directory...');
fs.rmSync(stageDir, { recursive: true, force: true });

const stats = fs.statSync(targetZip);
console.log('ZIP successfully created at:', targetZip);
console.log('Size (bytes):', stats.size);
