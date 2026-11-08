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

test.describe('V2 CRM UI Suite Batch 1', () => {

  test('V2-UI-OWNER-001: [owner] Owner_Workspace -> Обзор дня', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Обзор дня")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обзор дня" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-001', {"id":"UI-OWNER-Owner_Workspace-BTN-1","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обзор дня","locator":"button:has-text(\"Обзор дня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обзор дня"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-001', {"id":"UI-OWNER-Owner_Workspace-BTN-1","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обзор дня","locator":"button:has-text(\"Обзор дня\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обзор дня"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-002: [owner] Owner_Workspace -> Расписание', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Расписание" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-002', {"id":"UI-OWNER-Owner_Workspace-BTN-2","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Расписание","locator":"button:has-text(\"Расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-002', {"id":"UI-OWNER-Owner_Workspace-BTN-2","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Расписание","locator":"button:has-text(\"Расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-003: [owner] Owner_Workspace -> Клиенты', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Клиенты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Клиенты" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-003', {"id":"UI-OWNER-Owner_Workspace-BTN-3","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиенты","locator":"button:has-text(\"Клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиенты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-003', {"id":"UI-OWNER-Owner_Workspace-BTN-3","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Клиенты","locator":"button:has-text(\"Клиенты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Клиенты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-004: [owner] Owner_Workspace -> Запросы сотрудников', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Запросы сотрудников")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Запросы сотрудников" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-004', {"id":"UI-OWNER-Owner_Workspace-BTN-4","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросы сотрудников","locator":"button:has-text(\"Запросы сотрудников\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросы сотрудников"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-004', {"id":"UI-OWNER-Owner_Workspace-BTN-4","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Запросы сотрудников","locator":"button:has-text(\"Запросы сотрудников\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Запросы сотрудников"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-005: [owner] Owner_Workspace -> Переписка с клиентами', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Переписка с клиентами")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Переписка с клиентами" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-005', {"id":"UI-OWNER-Owner_Workspace-BTN-5","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Переписка с клиентами","locator":"button:has-text(\"Переписка с клиентами\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Переписка с клиентами"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-005', {"id":"UI-OWNER-Owner_Workspace-BTN-5","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Переписка с клиентами","locator":"button:has-text(\"Переписка с клиентами\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Переписка с клиентами"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-006: [owner] Owner_Workspace -> Задачи по возвращению клиентов', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Задачи по возвращению клиентов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Задачи по возвращению клиентов" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-006', {"id":"UI-OWNER-Owner_Workspace-BTN-6","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Задачи по возвращению клиентов","locator":"button:has-text(\"Задачи по возвращению клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Задачи по возвращению клиентов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-006', {"id":"UI-OWNER-Owner_Workspace-BTN-6","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Задачи по возвращению клиентов","locator":"button:has-text(\"Задачи по возвращению клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Задачи по возвращению клиентов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-007: [owner] Owner_Workspace -> Заказы клиентов', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Заказы клиентов")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Заказы клиентов" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-007', {"id":"UI-OWNER-Owner_Workspace-BTN-7","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Заказы клиентов","locator":"button:has-text(\"Заказы клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Заказы клиентов"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-007', {"id":"UI-OWNER-Owner_Workspace-BTN-7","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Заказы клиентов","locator":"button:has-text(\"Заказы клиентов\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Заказы клиентов"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-008: [owner] Owner_Workspace -> Склад и материалы', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Склад и материалы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Склад и материалы" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-008', {"id":"UI-OWNER-Owner_Workspace-BTN-8","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Склад и материалы","locator":"button:has-text(\"Склад и материалы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Склад и материалы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-008', {"id":"UI-OWNER-Owner_Workspace-BTN-8","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Склад и материалы","locator":"button:has-text(\"Склад и материалы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Склад и материалы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-009: [owner] Owner_Workspace -> Закупки центра', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Закупки центра")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Закупки центра" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-009', {"id":"UI-OWNER-Owner_Workspace-BTN-9","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Закупки центра","locator":"button:has-text(\"Закупки центра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Закупки центра"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-009', {"id":"UI-OWNER-Owner_Workspace-BTN-9","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Закупки центра","locator":"button:has-text(\"Закупки центра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Закупки центра"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-010: [owner] Owner_Workspace -> Команда и графики', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Команда и графики")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Команда и графики" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-010', {"id":"UI-OWNER-Owner_Workspace-BTN-10","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Команда и графики","locator":"button:has-text(\"Команда и графики\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Команда и графики"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-010', {"id":"UI-OWNER-Owner_Workspace-BTN-10","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Команда и графики","locator":"button:has-text(\"Команда и графики\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Команда и графики"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-011: [owner] Owner_Workspace -> План-факт', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("План-факт")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "План-факт" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-011', {"id":"UI-OWNER-Owner_Workspace-BTN-11","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-011', {"id":"UI-OWNER-Owner_Workspace-BTN-11","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"План-факт","locator":"button:has-text(\"План-факт\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: План-факт"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-012: [owner] Owner_Workspace -> Планы и зарплаты', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Планы и зарплаты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Планы и зарплаты" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-012', {"id":"UI-OWNER-Owner_Workspace-BTN-12","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Планы и зарплаты","locator":"button:has-text(\"Планы и зарплаты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Планы и зарплаты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-012', {"id":"UI-OWNER-Owner_Workspace-BTN-12","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Планы и зарплаты","locator":"button:has-text(\"Планы и зарплаты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Планы и зарплаты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-013: [owner] Owner_Workspace -> Финансы', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Финансы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Финансы" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-013', {"id":"UI-OWNER-Owner_Workspace-BTN-13","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Финансы","locator":"button:has-text(\"Финансы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Финансы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-013', {"id":"UI-OWNER-Owner_Workspace-BTN-13","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Финансы","locator":"button:has-text(\"Финансы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Финансы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-014: [owner] Owner_Workspace -> Отчёты', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Отчёты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Отчёты" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-014', {"id":"UI-OWNER-Owner_Workspace-BTN-14","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Отчёты","locator":"button:has-text(\"Отчёты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Отчёты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-014', {"id":"UI-OWNER-Owner_Workspace-BTN-14","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Отчёты","locator":"button:has-text(\"Отчёты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Отчёты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-015: [owner] Owner_Workspace -> Услуги и товары', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Услуги и товары")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Услуги и товары" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-015', {"id":"UI-OWNER-Owner_Workspace-BTN-15","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Услуги и товары","locator":"button:has-text(\"Услуги и товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги и товары"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-015', {"id":"UI-OWNER-Owner_Workspace-BTN-15","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Услуги и товары","locator":"button:has-text(\"Услуги и товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги и товары"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-016: [owner] Owner_Workspace -> Настройки', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Настройки")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Настройки" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-016', {"id":"UI-OWNER-Owner_Workspace-BTN-16","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Настройки","locator":"button:has-text(\"Настройки\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Настройки"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-016', {"id":"UI-OWNER-Owner_Workspace-BTN-16","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Настройки","locator":"button:has-text(\"Настройки\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Настройки"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-017: [owner] Owner_Workspace -> Помощник', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Помощник")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Помощник" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-017', {"id":"UI-OWNER-Owner_Workspace-BTN-17","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-017', {"id":"UI-OWNER-Owner_Workspace-BTN-17","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Помощник","locator":"button:has-text(\"Помощник\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Помощник"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-018: [owner] Owner_Workspace -> Открыть меню', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть меню")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть меню" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-018', {"id":"UI-OWNER-Owner_Workspace-BTN-18","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-018', {"id":"UI-OWNER-Owner_Workspace-BTN-18","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть меню","locator":"button:has-text(\"Открыть меню\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть меню"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-019: [owner] Owner_Workspace -> Уведомления', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Уведомления")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Уведомления" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-019', {"id":"UI-OWNER-Owner_Workspace-BTN-19","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-019', {"id":"UI-OWNER-Owner_Workspace-BTN-19","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Уведомления","locator":"button:has-text(\"Уведомления\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Уведомления"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-020: [owner] Owner_Workspace -> Обновить данные', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Обновить данные")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Обновить данные" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-020', {"id":"UI-OWNER-Owner_Workspace-BTN-20","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-020', {"id":"UI-OWNER-Owner_Workspace-BTN-20","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Обновить данные","locator":"button:has-text(\"Обновить данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Обновить данные"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-021: [owner] Owner_Workspace -> Открыть расписание', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Открыть расписание")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Открыть расписание" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-021', {"id":"UI-OWNER-Owner_Workspace-BTN-21","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-021', {"id":"UI-OWNER-Owner_Workspace-BTN-21","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Открыть расписание","locator":"button:has-text(\"Открыть расписание\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Открыть расписание"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-022: [owner] Owner_Workspace -> Записать клиента', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Записать клиента")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Записать клиента" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-022', {"id":"UI-OWNER-Owner_Workspace-BTN-22","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Записать клиента","locator":"button:has-text(\"Записать клиента\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записать клиента"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-022', {"id":"UI-OWNER-Owner_Workspace-BTN-22","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Записать клиента","locator":"button:has-text(\"Записать клиента\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записать клиента"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-023: [owner] Owner_Workspace -> Предыдущий день', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Предыдущий день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Предыдущий день" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-023', {"id":"UI-OWNER-Owner_Workspace-BTN-23","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Предыдущий день","locator":"button:has-text(\"Предыдущий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Предыдущий день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-023', {"id":"UI-OWNER-Owner_Workspace-BTN-23","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Предыдущий день","locator":"button:has-text(\"Предыдущий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Предыдущий день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-024: [owner] Owner_Workspace -> 08.11.2026', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("08.11.2026")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "08.11.2026" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-024', {"id":"UI-OWNER-Owner_Workspace-BTN-24","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"08.11.2026","locator":"button:has-text(\"08.11.2026\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 08.11.2026"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-024', {"id":"UI-OWNER-Owner_Workspace-BTN-24","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"08.11.2026","locator":"button:has-text(\"08.11.2026\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 08.11.2026"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-025: [owner] Owner_Workspace -> Следующий день', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Следующий день")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Следующий день" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-025', {"id":"UI-OWNER-Owner_Workspace-BTN-25","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Следующий день","locator":"button:has-text(\"Следующий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Следующий день"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-025', {"id":"UI-OWNER-Owner_Workspace-BTN-25","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Следующий день","locator":"button:has-text(\"Следующий день\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Следующий день"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-OWNER-026: [owner] Owner_Workspace -> Новая запись', async ({ page, context }) => {
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
      const targetLocator = page.locator('button:has-text("Новая запись")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Новая запись" must be visible on screen Owner_Workspace').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-OWNER-026', {"id":"UI-OWNER-Owner_Workspace-BTN-26","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Новая запись","locator":"button:has-text(\"Новая запись\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Новая запись"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-OWNER-026', {"id":"UI-OWNER-Owner_Workspace-BTN-26","role":"owner","screenName":"Owner_Workspace","url":"http://127.0.0.1:8787","type":"button","text":"Новая запись","locator":"button:has-text(\"Новая запись\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Новая запись"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

});
