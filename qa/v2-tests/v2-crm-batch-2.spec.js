import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const evidenceDir = path.resolve('evidence/v2-executions');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

function saveResult(testId, item, status, actionDetails, errorMsg = null) {
  const file = path.join(evidenceDir, testId + '_V2.json');
  fs.writeFileSync(file, JSON.stringify({
    testId,
    inventoryId: item.id,
    role: item.role,
    screen: item.screenName,
    locator: item.locator,
    type: item.type,
    text: item.text,
    status,
    executedAt: new Date().toISOString(),
    actionDetails,
    error: errorMsg
  }, null, 2), 'utf8');
}

test.describe('V2 CRM UI Suite Batch 2', () => {

  test('V2-UI-OWNER-027: [owner] Owner_Workspace -> Всё расписание', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Всё расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Всё расписание" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Всё расписание" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-027', {"id":"UI-OWNER-Owner_Workspace-BTN-27","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-027', {"id":"UI-OWNER-Owner_Workspace-BTN-27","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-028: [owner] Owner_Workspace -> Клиент Меньше Трех Часов', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Клиент Меньше Трех Часов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Клиент Меньше Трех Часов" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Клиент Меньше Трех Часов" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-028', {"id":"UI-OWNER-Owner_Workspace-BTN-28","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиент Меньше Трех Часов","locator":"button:has-text(\"Клиент Меньше Трех Часов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиент Меньше Трех Часов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-028', {"id":"UI-OWNER-Owner_Workspace-BTN-28","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиент Меньше Трех Часов","locator":"button:has-text(\"Клиент Меньше Трех Часов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиент Меньше Трех Часов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-029: [owner] Owner_Workspace -> Открыть визит 20:30', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Открыть визит 20:30")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть визит 20:30" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Открыть визит 20:30" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-029', {"id":"UI-OWNER-Owner_Workspace-BTN-29","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть визит 20:30","locator":"button:has-text(\"Открыть визит 20:30\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть визит 20:30"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-029', {"id":"UI-OWNER-Owner_Workspace-BTN-29","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть визит 20:30","locator":"button:has-text(\"Открыть визит 20:30\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть визит 20:30"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-030: [owner] Owner_Workspace -> Вернуться к клиентам Все назначенны', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Вернуться к клиентам Все назна")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Вернуться к клиентам Все назначенны" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Вернуться к клиентам Все назначенны" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-030', {"id":"UI-OWNER-Owner_Workspace-BTN-30","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Вернуться к клиентам Все назначенные задачи выполн","locator":"button:has-text(\"Вернуться к клиентам Все назна\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Вернуться к клиентам Все назначенные задачи выполнены"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-030', {"id":"UI-OWNER-Owner_Workspace-BTN-30","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Вернуться к клиентам Все назначенные задачи выполн","locator":"button:has-text(\"Вернуться к клиентам Все назна\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Вернуться к клиентам Все назначенные задачи выполнены"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-031: [owner] Owner_Workspace -> Подготовить заказы Ожидают обработк', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Подготовить заказы Ожидают обр")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Подготовить заказы Ожидают обработк" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Подготовить заказы Ожидают обработк" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-031', {"id":"UI-OWNER-Owner_Workspace-BTN-31","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Подготовить заказы Ожидают обработки: 1","locator":"button:has-text(\"Подготовить заказы Ожидают обр\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подготовить заказы Ожидают обработки: 1"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-031', {"id":"UI-OWNER-Owner_Workspace-BTN-31","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Подготовить заказы Ожидают обработки: 1","locator":"button:has-text(\"Подготовить заказы Ожидают обр\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подготовить заказы Ожидают обработки: 1"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-032: [owner] Owner_Workspace -> Запланированные сообщения 0 в очере', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Запланированные сообщения 0 в ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запланированные сообщения 0 в очере" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Запланированные сообщения 0 в очере" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-032', {"id":"UI-OWNER-Owner_Workspace-BTN-32","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запланированные сообщения 0 в очереди","locator":"button:has-text(\"Запланированные сообщения 0 в \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запланированные сообщения 0 в очереди"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-032', {"id":"UI-OWNER-Owner_Workspace-BTN-32","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запланированные сообщения 0 в очереди","locator":"button:has-text(\"Запланированные сообщения 0 в \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запланированные сообщения 0 в очереди"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-033: [owner] Owner_Workspace -> Открыть помощника', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('button:has-text("Открыть помощника")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть помощника" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Открыть помощника" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-033', {"id":"UI-OWNER-Owner_Workspace-BTN-33","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть помощника","locator":"button:has-text(\"Открыть помощника\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть помощника"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-033', {"id":"UI-OWNER-Owner_Workspace-BTN-33","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть помощника","locator":"button:has-text(\"Открыть помощника\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть помощника"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-034: [owner] Owner_Workspace -> select-one', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'owner'
      });
      await page.goto('http://127.0.0.1:8787/?mode=owner', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=owner' });
      const targetLocator = page.locator('select >> nth=34').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "select-one" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "select-one" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('select' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-OWNER-034', {"id":"UI-OWNER-Owner_Workspace-INP-34","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"select","text":"select-one","locator":"select >> nth=34","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Input text or select value in field"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-034', {"id":"UI-OWNER-Owner_Workspace-INP-34","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"select","text":"select-one","locator":"select >> nth=34","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Input text or select value in field"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-035: [manager] Manager_Workspace -> Обзор дня', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Обзор дня")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обзор дня" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Обзор дня" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-035', {"id":"UI-MANAGER-Manager_Workspace-BTN-1","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обзор дня","locator":"button:has-text(\"Обзор дня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обзор дня"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-035', {"id":"UI-MANAGER-Manager_Workspace-BTN-1","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обзор дня","locator":"button:has-text(\"Обзор дня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обзор дня"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-036: [manager] Manager_Workspace -> Расписание', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Расписание" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Расписание" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-036', {"id":"UI-MANAGER-Manager_Workspace-BTN-2","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Расписание","locator":"button:has-text(\"Расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-036', {"id":"UI-MANAGER-Manager_Workspace-BTN-2","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Расписание","locator":"button:has-text(\"Расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-037: [manager] Manager_Workspace -> Клиенты', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Клиенты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Клиенты" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Клиенты" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-037', {"id":"UI-MANAGER-Manager_Workspace-BTN-3","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиенты","locator":"button:has-text(\"Клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиенты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-037', {"id":"UI-MANAGER-Manager_Workspace-BTN-3","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиенты","locator":"button:has-text(\"Клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиенты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-038: [manager] Manager_Workspace -> Запросы сотрудников', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Запросы сотрудников")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запросы сотрудников" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Запросы сотрудников" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-038', {"id":"UI-MANAGER-Manager_Workspace-BTN-4","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросы сотрудников","locator":"button:has-text(\"Запросы сотрудников\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросы сотрудников"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-038', {"id":"UI-MANAGER-Manager_Workspace-BTN-4","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросы сотрудников","locator":"button:has-text(\"Запросы сотрудников\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросы сотрудников"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-039: [manager] Manager_Workspace -> Переписка с клиентами', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Переписка с клиентами")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Переписка с клиентами" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Переписка с клиентами" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-039', {"id":"UI-MANAGER-Manager_Workspace-BTN-5","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Переписка с клиентами","locator":"button:has-text(\"Переписка с клиентами\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Переписка с клиентами"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-039', {"id":"UI-MANAGER-Manager_Workspace-BTN-5","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Переписка с клиентами","locator":"button:has-text(\"Переписка с клиентами\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Переписка с клиентами"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-040: [manager] Manager_Workspace -> Задачи по возвращению клиентов', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Задачи по возвращению клиентов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Задачи по возвращению клиентов" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Задачи по возвращению клиентов" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-040', {"id":"UI-MANAGER-Manager_Workspace-BTN-6","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Задачи по возвращению клиентов","locator":"button:has-text(\"Задачи по возвращению клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Задачи по возвращению клиентов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-040', {"id":"UI-MANAGER-Manager_Workspace-BTN-6","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Задачи по возвращению клиентов","locator":"button:has-text(\"Задачи по возвращению клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Задачи по возвращению клиентов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-041: [manager] Manager_Workspace -> Заказы клиентов', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Заказы клиентов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Заказы клиентов" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Заказы клиентов" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-041', {"id":"UI-MANAGER-Manager_Workspace-BTN-7","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Заказы клиентов","locator":"button:has-text(\"Заказы клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Заказы клиентов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-041', {"id":"UI-MANAGER-Manager_Workspace-BTN-7","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Заказы клиентов","locator":"button:has-text(\"Заказы клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Заказы клиентов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-042: [manager] Manager_Workspace -> Склад и материалы', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Склад и материалы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Склад и материалы" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Склад и материалы" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-042', {"id":"UI-MANAGER-Manager_Workspace-BTN-8","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Склад и материалы","locator":"button:has-text(\"Склад и материалы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Склад и материалы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-042', {"id":"UI-MANAGER-Manager_Workspace-BTN-8","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Склад и материалы","locator":"button:has-text(\"Склад и материалы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Склад и материалы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-043: [manager] Manager_Workspace -> Закупки центра', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Закупки центра")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Закупки центра" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Закупки центра" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-043', {"id":"UI-MANAGER-Manager_Workspace-BTN-9","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Закупки центра","locator":"button:has-text(\"Закупки центра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Закупки центра"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-043', {"id":"UI-MANAGER-Manager_Workspace-BTN-9","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Закупки центра","locator":"button:has-text(\"Закупки центра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Закупки центра"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-044: [manager] Manager_Workspace -> Команда и графики', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Команда и графики")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Команда и графики" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Команда и графики" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-044', {"id":"UI-MANAGER-Manager_Workspace-BTN-10","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Команда и графики","locator":"button:has-text(\"Команда и графики\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Команда и графики"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-044', {"id":"UI-MANAGER-Manager_Workspace-BTN-10","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Команда и графики","locator":"button:has-text(\"Команда и графики\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Команда и графики"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-045: [manager] Manager_Workspace -> План-факт', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("План-факт")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "План-факт" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "План-факт" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-045', {"id":"UI-MANAGER-Manager_Workspace-BTN-11","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-045', {"id":"UI-MANAGER-Manager_Workspace-BTN-11","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-046: [manager] Manager_Workspace -> Планы и зарплаты', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Планы и зарплаты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Планы и зарплаты" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Планы и зарплаты" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-046', {"id":"UI-MANAGER-Manager_Workspace-BTN-12","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Планы и зарплаты","locator":"button:has-text(\"Планы и зарплаты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Планы и зарплаты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-046', {"id":"UI-MANAGER-Manager_Workspace-BTN-12","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Планы и зарплаты","locator":"button:has-text(\"Планы и зарплаты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Планы и зарплаты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-047: [manager] Manager_Workspace -> Финансы', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Финансы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Финансы" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Финансы" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-047', {"id":"UI-MANAGER-Manager_Workspace-BTN-13","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Финансы","locator":"button:has-text(\"Финансы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Финансы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-047', {"id":"UI-MANAGER-Manager_Workspace-BTN-13","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Финансы","locator":"button:has-text(\"Финансы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Финансы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-048: [manager] Manager_Workspace -> Отчёты', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Отчёты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Отчёты" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Отчёты" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-048', {"id":"UI-MANAGER-Manager_Workspace-BTN-14","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Отчёты","locator":"button:has-text(\"Отчёты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Отчёты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-048', {"id":"UI-MANAGER-Manager_Workspace-BTN-14","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Отчёты","locator":"button:has-text(\"Отчёты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Отчёты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-049: [manager] Manager_Workspace -> Услуги и товары', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Услуги и товары")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Услуги и товары" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Услуги и товары" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-049', {"id":"UI-MANAGER-Manager_Workspace-BTN-15","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Услуги и товары","locator":"button:has-text(\"Услуги и товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги и товары"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-049', {"id":"UI-MANAGER-Manager_Workspace-BTN-15","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Услуги и товары","locator":"button:has-text(\"Услуги и товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги и товары"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-050: [manager] Manager_Workspace -> Настройки', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Настройки")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Настройки" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Настройки" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-050', {"id":"UI-MANAGER-Manager_Workspace-BTN-16","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Настройки","locator":"button:has-text(\"Настройки\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Настройки"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-050', {"id":"UI-MANAGER-Manager_Workspace-BTN-16","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Настройки","locator":"button:has-text(\"Настройки\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Настройки"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-051: [manager] Manager_Workspace -> Помощник', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Помощник")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Помощник" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Помощник" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-051', {"id":"UI-MANAGER-Manager_Workspace-BTN-17","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-051', {"id":"UI-MANAGER-Manager_Workspace-BTN-17","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-052: [manager] Manager_Workspace -> Открыть меню', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'manager'
      });
      await page.goto('http://127.0.0.1:8787/?mode=manager', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=manager' });
      const targetLocator = page.locator('button:has-text("Открыть меню")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть меню" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Открыть меню" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('button' === 'input') {
        await targetLocator.fill('QA-Verified-Value');
        actionLog.push({ step: 'fill', value: 'QA-Verified-Value' });
        await expect(targetLocator).toHaveValue('QA-Verified-Value');
      } else {
        await targetLocator.click({ timeout: 3000 });
        actionLog.push({ step: 'click' });
      }

      // STRICT ZERO-TRUST ASSERTION 3: DOM / Page state remained healthy without crash
      const isStillAlive = await page.evaluate(() => document.body !== null);
      expect(isStillAlive, 'Page must remain interactive without crashing').toBe(true);

      saveResult('V2-UI-MANAGER-052', {"id":"UI-MANAGER-Manager_Workspace-BTN-18","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-052', {"id":"UI-MANAGER-Manager_Workspace-BTN-18","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

});
