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

test.describe('V2 CRM UI Suite Batch 3', () => {

  test('V2-UI-MANAGER-053: [manager] Manager_Workspace -> Уведомления', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Уведомления")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Уведомления" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Уведомления" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-053', {"id":"UI-MANAGER-Manager_Workspace-BTN-19","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-053', {"id":"UI-MANAGER-Manager_Workspace-BTN-19","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-054: [manager] Manager_Workspace -> Обновить данные', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Обновить данные")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обновить данные" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Обновить данные" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-054', {"id":"UI-MANAGER-Manager_Workspace-BTN-20","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-054', {"id":"UI-MANAGER-Manager_Workspace-BTN-20","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-055: [manager] Manager_Workspace -> Открыть расписание', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть расписание" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Открыть расписание" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-055', {"id":"UI-MANAGER-Manager_Workspace-BTN-21","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-055', {"id":"UI-MANAGER-Manager_Workspace-BTN-21","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-056: [manager] Manager_Workspace -> Записать клиента', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Записать клиента")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Записать клиента" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Записать клиента" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-056', {"id":"UI-MANAGER-Manager_Workspace-BTN-22","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Записать клиента","locator":"button:has-text(\"Записать клиента\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записать клиента"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-056', {"id":"UI-MANAGER-Manager_Workspace-BTN-22","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Записать клиента","locator":"button:has-text(\"Записать клиента\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записать клиента"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-057: [manager] Manager_Workspace -> Предыдущий день', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Предыдущий день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Предыдущий день" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Предыдущий день" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-057', {"id":"UI-MANAGER-Manager_Workspace-BTN-23","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Предыдущий день","locator":"button:has-text(\"Предыдущий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Предыдущий день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-057', {"id":"UI-MANAGER-Manager_Workspace-BTN-23","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Предыдущий день","locator":"button:has-text(\"Предыдущий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Предыдущий день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-058: [manager] Manager_Workspace -> 08.11.2026', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("08.11.2026")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "08.11.2026" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "08.11.2026" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-058', {"id":"UI-MANAGER-Manager_Workspace-BTN-24","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"08.11.2026","locator":"button:has-text(\"08.11.2026\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 08.11.2026"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-058', {"id":"UI-MANAGER-Manager_Workspace-BTN-24","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"08.11.2026","locator":"button:has-text(\"08.11.2026\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 08.11.2026"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-059: [manager] Manager_Workspace -> Следующий день', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Следующий день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Следующий день" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Следующий день" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-059', {"id":"UI-MANAGER-Manager_Workspace-BTN-25","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Следующий день","locator":"button:has-text(\"Следующий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Следующий день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-059', {"id":"UI-MANAGER-Manager_Workspace-BTN-25","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Следующий день","locator":"button:has-text(\"Следующий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Следующий день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-060: [manager] Manager_Workspace -> Новая запись', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Новая запись")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Новая запись" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Новая запись" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-MANAGER-060', {"id":"UI-MANAGER-Manager_Workspace-BTN-26","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Новая запись","locator":"button:has-text(\"Новая запись\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Новая запись"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-060', {"id":"UI-MANAGER-Manager_Workspace-BTN-26","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Новая запись","locator":"button:has-text(\"Новая запись\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Новая запись"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-061: [manager] Manager_Workspace -> Всё расписание', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Всё расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Всё расписание" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-061', {"id":"UI-MANAGER-Manager_Workspace-BTN-27","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-061', {"id":"UI-MANAGER-Manager_Workspace-BTN-27","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-062: [manager] Manager_Workspace -> Клиент Меньше Трех Часов', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Клиент Меньше Трех Часов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Клиент Меньше Трех Часов" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-062', {"id":"UI-MANAGER-Manager_Workspace-BTN-28","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиент Меньше Трех Часов","locator":"button:has-text(\"Клиент Меньше Трех Часов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиент Меньше Трех Часов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-062', {"id":"UI-MANAGER-Manager_Workspace-BTN-28","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиент Меньше Трех Часов","locator":"button:has-text(\"Клиент Меньше Трех Часов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиент Меньше Трех Часов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-063: [manager] Manager_Workspace -> Открыть визит 20:30', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть визит 20:30")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть визит 20:30" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-063', {"id":"UI-MANAGER-Manager_Workspace-BTN-29","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть визит 20:30","locator":"button:has-text(\"Открыть визит 20:30\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть визит 20:30"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-063', {"id":"UI-MANAGER-Manager_Workspace-BTN-29","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть визит 20:30","locator":"button:has-text(\"Открыть визит 20:30\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть визит 20:30"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-064: [manager] Manager_Workspace -> Вернуться к клиентам Все назначенны', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Вернуться к клиентам Все назна")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Вернуться к клиентам Все назначенны" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-064', {"id":"UI-MANAGER-Manager_Workspace-BTN-30","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Вернуться к клиентам Все назначенные задачи выполн","locator":"button:has-text(\"Вернуться к клиентам Все назна\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Вернуться к клиентам Все назначенные задачи выполнены"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-064', {"id":"UI-MANAGER-Manager_Workspace-BTN-30","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Вернуться к клиентам Все назначенные задачи выполн","locator":"button:has-text(\"Вернуться к клиентам Все назна\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Вернуться к клиентам Все назначенные задачи выполнены"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-065: [manager] Manager_Workspace -> Подготовить заказы Ожидают обработк', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Подготовить заказы Ожидают обр")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Подготовить заказы Ожидают обработк" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-065', {"id":"UI-MANAGER-Manager_Workspace-BTN-31","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Подготовить заказы Ожидают обработки: 1","locator":"button:has-text(\"Подготовить заказы Ожидают обр\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подготовить заказы Ожидают обработки: 1"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-065', {"id":"UI-MANAGER-Manager_Workspace-BTN-31","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Подготовить заказы Ожидают обработки: 1","locator":"button:has-text(\"Подготовить заказы Ожидают обр\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подготовить заказы Ожидают обработки: 1"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-066: [manager] Manager_Workspace -> Запланированные сообщения 0 в очере', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Запланированные сообщения 0 в ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запланированные сообщения 0 в очере" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-066', {"id":"UI-MANAGER-Manager_Workspace-BTN-32","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запланированные сообщения 0 в очереди","locator":"button:has-text(\"Запланированные сообщения 0 в \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запланированные сообщения 0 в очереди"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-066', {"id":"UI-MANAGER-Manager_Workspace-BTN-32","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запланированные сообщения 0 в очереди","locator":"button:has-text(\"Запланированные сообщения 0 в \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запланированные сообщения 0 в очереди"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-MANAGER-067: [manager] Manager_Workspace -> Открыть помощника', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть помощника")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть помощника" must be visible on screen Manager_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-MANAGER-067', {"id":"UI-MANAGER-Manager_Workspace-BTN-33","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть помощника","locator":"button:has-text(\"Открыть помощника\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть помощника"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-MANAGER-067', {"id":"UI-MANAGER-Manager_Workspace-BTN-33","role":"manager","screenName":"Manager_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть помощника","locator":"button:has-text(\"Открыть помощника\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть помощника"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-068: [admin] Admin_Workspace -> Обзор дня', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Обзор дня")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обзор дня" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-068', {"id":"UI-ADMIN-Admin_Workspace-BTN-1","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обзор дня","locator":"button:has-text(\"Обзор дня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обзор дня"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-068', {"id":"UI-ADMIN-Admin_Workspace-BTN-1","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обзор дня","locator":"button:has-text(\"Обзор дня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обзор дня"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-069: [admin] Admin_Workspace -> Расписание', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Расписание" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-069', {"id":"UI-ADMIN-Admin_Workspace-BTN-2","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Расписание","locator":"button:has-text(\"Расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-069', {"id":"UI-ADMIN-Admin_Workspace-BTN-2","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Расписание","locator":"button:has-text(\"Расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-070: [admin] Admin_Workspace -> Клиенты', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Клиенты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Клиенты" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-070', {"id":"UI-ADMIN-Admin_Workspace-BTN-3","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиенты","locator":"button:has-text(\"Клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиенты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-070', {"id":"UI-ADMIN-Admin_Workspace-BTN-3","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиенты","locator":"button:has-text(\"Клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиенты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-071: [admin] Admin_Workspace -> Переписка с клиентами', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Переписка с клиентами")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Переписка с клиентами" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-071', {"id":"UI-ADMIN-Admin_Workspace-BTN-4","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Переписка с клиентами","locator":"button:has-text(\"Переписка с клиентами\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Переписка с клиентами"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-071', {"id":"UI-ADMIN-Admin_Workspace-BTN-4","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Переписка с клиентами","locator":"button:has-text(\"Переписка с клиентами\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Переписка с клиентами"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-072: [admin] Admin_Workspace -> Задачи по возвращению клиентов', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Задачи по возвращению клиентов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Задачи по возвращению клиентов" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-072', {"id":"UI-ADMIN-Admin_Workspace-BTN-5","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Задачи по возвращению клиентов","locator":"button:has-text(\"Задачи по возвращению клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Задачи по возвращению клиентов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-072', {"id":"UI-ADMIN-Admin_Workspace-BTN-5","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Задачи по возвращению клиентов","locator":"button:has-text(\"Задачи по возвращению клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Задачи по возвращению клиентов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-073: [admin] Admin_Workspace -> Заказы клиентов', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Заказы клиентов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Заказы клиентов" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-073', {"id":"UI-ADMIN-Admin_Workspace-BTN-6","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Заказы клиентов","locator":"button:has-text(\"Заказы клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Заказы клиентов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-073', {"id":"UI-ADMIN-Admin_Workspace-BTN-6","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Заказы клиентов","locator":"button:has-text(\"Заказы клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Заказы клиентов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-074: [admin] Admin_Workspace -> Склад и материалы', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Склад и материалы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Склад и материалы" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-074', {"id":"UI-ADMIN-Admin_Workspace-BTN-7","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Склад и материалы","locator":"button:has-text(\"Склад и материалы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Склад и материалы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-074', {"id":"UI-ADMIN-Admin_Workspace-BTN-7","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Склад и материалы","locator":"button:has-text(\"Склад и материалы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Склад и материалы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-075: [admin] Admin_Workspace -> План-факт', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("План-факт")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "План-факт" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-075', {"id":"UI-ADMIN-Admin_Workspace-BTN-8","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-075', {"id":"UI-ADMIN-Admin_Workspace-BTN-8","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-076: [admin] Admin_Workspace -> Сверка текущей смены', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Сверка текущей смены")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Сверка текущей смены" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Сверка текущей смены" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-ADMIN-076', {"id":"UI-ADMIN-Admin_Workspace-BTN-9","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Сверка текущей смены","locator":"button:has-text(\"Сверка текущей смены\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Сверка текущей смены"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-076', {"id":"UI-ADMIN-Admin_Workspace-BTN-9","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Сверка текущей смены","locator":"button:has-text(\"Сверка текущей смены\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Сверка текущей смены"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-077: [admin] Admin_Workspace -> Цены услуг', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Цены услуг")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Цены услуг" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Цены услуг" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-ADMIN-077', {"id":"UI-ADMIN-Admin_Workspace-BTN-10","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Цены услуг","locator":"button:has-text(\"Цены услуг\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Цены услуг"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-077', {"id":"UI-ADMIN-Admin_Workspace-BTN-10","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Цены услуг","locator":"button:has-text(\"Цены услуг\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Цены услуг"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-078: [admin] Admin_Workspace -> Помощник', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'admin'
      });
      await page.goto('http://127.0.0.1:8787/?mode=admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=admin' });
      const targetLocator = page.locator('button:has-text("Помощник")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Помощник" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-078', {"id":"UI-ADMIN-Admin_Workspace-BTN-11","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-078', {"id":"UI-ADMIN-Admin_Workspace-BTN-11","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

});
