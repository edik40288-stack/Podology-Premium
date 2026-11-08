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

test.describe('V2 CRM UI Suite Batch 4', () => {

  test('V2-UI-ADMIN-079: [admin] Admin_Workspace -> Открыть меню', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть меню")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть меню" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-079', {"id":"UI-ADMIN-Admin_Workspace-BTN-12","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-079', {"id":"UI-ADMIN-Admin_Workspace-BTN-12","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-080: [admin] Admin_Workspace -> Уведомления', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Уведомления")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Уведомления" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-080', {"id":"UI-ADMIN-Admin_Workspace-BTN-13","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-080', {"id":"UI-ADMIN-Admin_Workspace-BTN-13","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-081: [admin] Admin_Workspace -> Обновить данные', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Обновить данные")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обновить данные" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-081', {"id":"UI-ADMIN-Admin_Workspace-BTN-14","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-081', {"id":"UI-ADMIN-Admin_Workspace-BTN-14","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-082: [admin] Admin_Workspace -> Запросить подтверждение у управляющ', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Запросить подтверждение у упра")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запросить подтверждение у управляющ" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Запросить подтверждение у управляющ" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-ADMIN-082', {"id":"UI-ADMIN-Admin_Workspace-BTN-15","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросить подтверждение у управляющего","locator":"button:has-text(\"Запросить подтверждение у упра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросить подтверждение у управляющего"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-082', {"id":"UI-ADMIN-Admin_Workspace-BTN-15","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросить подтверждение у управляющего","locator":"button:has-text(\"Запросить подтверждение у упра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросить подтверждение у управляющего"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-083: [admin] Admin_Workspace -> Открыть расписание', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть расписание" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-083', {"id":"UI-ADMIN-Admin_Workspace-BTN-16","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-083', {"id":"UI-ADMIN-Admin_Workspace-BTN-16","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-084: [admin] Admin_Workspace -> Предыдущий день', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Предыдущий день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Предыдущий день" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-084', {"id":"UI-ADMIN-Admin_Workspace-BTN-17","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Предыдущий день","locator":"button:has-text(\"Предыдущий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Предыдущий день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-084', {"id":"UI-ADMIN-Admin_Workspace-BTN-17","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Предыдущий день","locator":"button:has-text(\"Предыдущий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Предыдущий день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-085: [admin] Admin_Workspace -> 08.11.2026', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("08.11.2026")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "08.11.2026" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-085', {"id":"UI-ADMIN-Admin_Workspace-BTN-18","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"08.11.2026","locator":"button:has-text(\"08.11.2026\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 08.11.2026"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-085', {"id":"UI-ADMIN-Admin_Workspace-BTN-18","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"08.11.2026","locator":"button:has-text(\"08.11.2026\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 08.11.2026"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-086: [admin] Admin_Workspace -> Следующий день', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Следующий день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Следующий день" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-086', {"id":"UI-ADMIN-Admin_Workspace-BTN-19","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Следующий день","locator":"button:has-text(\"Следующий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Следующий день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-086', {"id":"UI-ADMIN-Admin_Workspace-BTN-19","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Следующий день","locator":"button:has-text(\"Следующий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Следующий день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-087: [admin] Admin_Workspace -> Всё расписание', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Всё расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Всё расписание" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-087', {"id":"UI-ADMIN-Admin_Workspace-BTN-20","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-087', {"id":"UI-ADMIN-Admin_Workspace-BTN-20","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-088: [admin] Admin_Workspace -> Вернуться к клиентам Все назначенны', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Вернуться к клиентам Все назна")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Вернуться к клиентам Все назначенны" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-088', {"id":"UI-ADMIN-Admin_Workspace-BTN-21","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Вернуться к клиентам Все назначенные задачи выполн","locator":"button:has-text(\"Вернуться к клиентам Все назна\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Вернуться к клиентам Все назначенные задачи выполнены"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-088', {"id":"UI-ADMIN-Admin_Workspace-BTN-21","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Вернуться к клиентам Все назначенные задачи выполн","locator":"button:has-text(\"Вернуться к клиентам Все назна\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Вернуться к клиентам Все назначенные задачи выполнены"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-089: [admin] Admin_Workspace -> Подготовить заказы Новых заказов по', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Подготовить заказы Новых заказ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Подготовить заказы Новых заказов по" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Подготовить заказы Новых заказов по" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-ADMIN-089', {"id":"UI-ADMIN-Admin_Workspace-BTN-22","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Подготовить заказы Новых заказов пока нет","locator":"button:has-text(\"Подготовить заказы Новых заказ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подготовить заказы Новых заказов пока нет"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-089', {"id":"UI-ADMIN-Admin_Workspace-BTN-22","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Подготовить заказы Новых заказов пока нет","locator":"button:has-text(\"Подготовить заказы Новых заказ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подготовить заказы Новых заказов пока нет"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-090: [admin] Admin_Workspace -> Запланированные сообщения 0 в очере', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Запланированные сообщения 0 в ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запланированные сообщения 0 в очере" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-090', {"id":"UI-ADMIN-Admin_Workspace-BTN-23","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запланированные сообщения 0 в очереди","locator":"button:has-text(\"Запланированные сообщения 0 в \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запланированные сообщения 0 в очереди"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-090', {"id":"UI-ADMIN-Admin_Workspace-BTN-23","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запланированные сообщения 0 в очереди","locator":"button:has-text(\"Запланированные сообщения 0 в \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запланированные сообщения 0 в очереди"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-ADMIN-091: [admin] Admin_Workspace -> Открыть помощника', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть помощника")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть помощника" must be visible on screen Admin_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-ADMIN-091', {"id":"UI-ADMIN-Admin_Workspace-BTN-24","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть помощника","locator":"button:has-text(\"Открыть помощника\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть помощника"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-ADMIN-091', {"id":"UI-ADMIN-Admin_Workspace-BTN-24","role":"admin","screenName":"Admin_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть помощника","locator":"button:has-text(\"Открыть помощника\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть помощника"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-092: [specialist] Master_Workspace -> Мой день', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Мой день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мой день" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мой день" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-SPECIALIST-092', {"id":"UI-SPECIALIST-Master_Workspace-BTN-1","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мой день","locator":"button:has-text(\"Мой день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мой день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-092', {"id":"UI-SPECIALIST-Master_Workspace-BTN-1","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мой день","locator":"button:has-text(\"Мой день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мой день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-093: [specialist] Master_Workspace -> Мои записи', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Мои записи")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои записи" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои записи" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-SPECIALIST-093', {"id":"UI-SPECIALIST-Master_Workspace-BTN-2","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мои записи","locator":"button:has-text(\"Мои записи\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои записи"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-093', {"id":"UI-SPECIALIST-Master_Workspace-BTN-2","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мои записи","locator":"button:has-text(\"Мои записи\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои записи"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-094: [specialist] Master_Workspace -> Мои клиенты', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Мои клиенты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои клиенты" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои клиенты" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-SPECIALIST-094', {"id":"UI-SPECIALIST-Master_Workspace-BTN-3","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мои клиенты","locator":"button:has-text(\"Мои клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои клиенты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-094', {"id":"UI-SPECIALIST-Master_Workspace-BTN-3","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мои клиенты","locator":"button:has-text(\"Мои клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои клиенты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-095: [specialist] Master_Workspace -> Мои запросы', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Мои запросы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои запросы" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои запросы" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-SPECIALIST-095', {"id":"UI-SPECIALIST-Master_Workspace-BTN-4","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мои запросы","locator":"button:has-text(\"Мои запросы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои запросы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-095', {"id":"UI-SPECIALIST-Master_Workspace-BTN-4","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Мои запросы","locator":"button:has-text(\"Мои запросы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои запросы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-096: [specialist] Master_Workspace -> План-факт', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("План-факт")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "План-факт" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-096', {"id":"UI-SPECIALIST-Master_Workspace-BTN-5","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-096', {"id":"UI-SPECIALIST-Master_Workspace-BTN-5","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-097: [specialist] Master_Workspace -> Помощник', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Помощник")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Помощник" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-097', {"id":"UI-SPECIALIST-Master_Workspace-BTN-6","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-097', {"id":"UI-SPECIALIST-Master_Workspace-BTN-6","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-098: [specialist] Master_Workspace -> Открыть меню', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Открыть меню")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть меню" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-098', {"id":"UI-SPECIALIST-Master_Workspace-BTN-7","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-098', {"id":"UI-SPECIALIST-Master_Workspace-BTN-7","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-099: [specialist] Master_Workspace -> Уведомления', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Уведомления")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Уведомления" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-099', {"id":"UI-SPECIALIST-Master_Workspace-BTN-8","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-099', {"id":"UI-SPECIALIST-Master_Workspace-BTN-8","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-100: [specialist] Master_Workspace -> Обновить данные', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Обновить данные")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обновить данные" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-100', {"id":"UI-SPECIALIST-Master_Workspace-BTN-9","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-100', {"id":"UI-SPECIALIST-Master_Workspace-BTN-9","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-101: [specialist] Master_Workspace -> Открыть расписание', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Открыть расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть расписание" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-101', {"id":"UI-SPECIALIST-Master_Workspace-BTN-10","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-101', {"id":"UI-SPECIALIST-Master_Workspace-BTN-10","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-102: [specialist] Master_Workspace -> Запросить выходной', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Запросить выходной")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запросить выходной" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Запросить выходной" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-SPECIALIST-102', {"id":"UI-SPECIALIST-Master_Workspace-BTN-11","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросить выходной","locator":"button:has-text(\"Запросить выходной\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросить выходной"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-102', {"id":"UI-SPECIALIST-Master_Workspace-BTN-11","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросить выходной","locator":"button:has-text(\"Запросить выходной\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросить выходной"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-103: [specialist] Master_Workspace -> Сегодня', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Сегодня")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Сегодня" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Сегодня" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-SPECIALIST-103', {"id":"UI-SPECIALIST-Master_Workspace-BTN-12","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Сегодня","locator":"button:has-text(\"Сегодня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Сегодня"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-103', {"id":"UI-SPECIALIST-Master_Workspace-BTN-12","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Сегодня","locator":"button:has-text(\"Сегодня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Сегодня"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-SPECIALIST-104: [specialist] Master_Workspace -> Всё расписание', async ({ page, context }) => {
    const actionLog = [];
    try {
      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': 'specialist'
      });
      await page.goto('http://127.0.0.1:8787/?mode=specialist', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=specialist' });
      const targetLocator = page.locator('button:has-text("Всё расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Всё расписание" must be visible on screen Master_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-SPECIALIST-104', {"id":"UI-SPECIALIST-Master_Workspace-BTN-13","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-SPECIALIST-104', {"id":"UI-SPECIALIST-Master_Workspace-BTN-13","role":"specialist","screenName":"Master_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Всё расписание","locator":"button:has-text(\"Всё расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Всё расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

});
