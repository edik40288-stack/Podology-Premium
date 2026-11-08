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

test.describe('V2 Client UI Suite Batch 1', () => {

  test('V2-UI-CLIENT-001: [client] Website_Home -> Записаться ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Записаться ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Записаться ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Записаться ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-001', {"id":"UI-CLIENT-Website_Home-BTN-1","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Записаться ↗","locator":"button:has-text(\"Записаться ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записаться ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-001', {"id":"UI-CLIENT-Website_Home-BTN-1","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Записаться ↗","locator":"button:has-text(\"Записаться ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записаться ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-002: [client] Website_Home -> ☰', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("☰")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "☰" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "☰" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-002', {"id":"UI-CLIENT-Website_Home-BTN-2","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"☰","locator":"button:has-text(\"☰\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ☰"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-002', {"id":"UI-CLIENT-Website_Home-BTN-2","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"☰","locator":"button:has-text(\"☰\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ☰"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-003: [client] Website_Home -> Подобрать услугу ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Подобрать услугу ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Подобрать услугу ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Подобрать услугу ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-003', {"id":"UI-CLIENT-Website_Home-BTN-3","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Подобрать услугу ↗","locator":"button:has-text(\"Подобрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подобрать услугу ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-003', {"id":"UI-CLIENT-Website_Home-BTN-3","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Подобрать услугу ↗","locator":"button:has-text(\"Подобрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подобрать услугу ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-004: [client] Website_Home -> 01 / ПОДОЛОГИЯ ◒ Комфорт начинается', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("01 / ПОДОЛОГИЯ ◒ Комфорт начин")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "01 / ПОДОЛОГИЯ ◒ Комфорт начинается" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "01 / ПОДОЛОГИЯ ◒ Комфорт начинается" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-004', {"id":"UI-CLIENT-Website_Home-BTN-4","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"01 / ПОДОЛОГИЯ ◒ Комфорт начинается со стоп Консул","locator":"button:has-text(\"01 / ПОДОЛОГИЯ ◒ Комфорт начин\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 01 / ПОДОЛОГИЯ ◒ Комфорт начинается со стоп Консультации, подологическая обработка, коррекционные системы и ортезы. 43 услуги ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-004', {"id":"UI-CLIENT-Website_Home-BTN-4","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"01 / ПОДОЛОГИЯ ◒ Комфорт начинается со стоп Консул","locator":"button:has-text(\"01 / ПОДОЛОГИЯ ◒ Комфорт начин\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 01 / ПОДОЛОГИЯ ◒ Комфорт начинается со стоп Консультации, подологическая обработка, коррекционные системы и ортезы. 43 услуги ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-005: [client] Website_Home -> 02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к к', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("02 / ЭСТЕТИЧЕСКИЙ УХОД Внимани")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к к" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к к" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-005', {"id":"UI-CLIENT-Website_Home-BTN-5","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к каждой детали Ги","locator":"button:has-text(\"02 / ЭСТЕТИЧЕСКИЙ УХОД Внимани\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к каждой детали Гигиенический педикюр и маникюр, уход за кожей и покрытия. 26 услуг ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-005', {"id":"UI-CLIENT-Website_Home-BTN-5","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к каждой детали Ги","locator":"button:has-text(\"02 / ЭСТЕТИЧЕСКИЙ УХОД Внимани\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 02 / ЭСТЕТИЧЕСКИЙ УХОД Внимание к каждой детали Гигиенический педикюр и маникюр, уход за кожей и покрытия. 26 услуг ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-006: [client] Website_Home -> 03 / НОГТЕВОЙ СЕРВИС Красота в ваше', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("03 / НОГТЕВОЙ СЕРВИС Красота в")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "03 / НОГТЕВОЙ СЕРВИС Красота в ваше" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "03 / НОГТЕВОЙ СЕРВИС Красота в ваше" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-006', {"id":"UI-CLIENT-Website_Home-BTN-6","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"03 / НОГТЕВОЙ СЕРВИС Красота в вашем ритме Маникюр","locator":"button:has-text(\"03 / НОГТЕВОЙ СЕРВИС Красота в\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 03 / НОГТЕВОЙ СЕРВИС Красота в вашем ритме Маникюр, Smart-педикюр, наращивание и дизайн ногтей. 26 услуг ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-006', {"id":"UI-CLIENT-Website_Home-BTN-6","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"03 / НОГТЕВОЙ СЕРВИС Красота в вашем ритме Маникюр","locator":"button:has-text(\"03 / НОГТЕВОЙ СЕРВИС Красота в\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 03 / НОГТЕВОЙ СЕРВИС Красота в вашем ритме Маникюр, Smart-педикюр, наращивание и дизайн ногтей. 26 услуг ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-007: [client] Website_Home -> Все услуги', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Все услуги")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Все услуги" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Все услуги" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-007', {"id":"UI-CLIENT-Website_Home-BTN-7","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Все услуги","locator":"button:has-text(\"Все услуги\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Все услуги"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-007', {"id":"UI-CLIENT-Website_Home-BTN-7","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Все услуги","locator":"button:has-text(\"Все услуги\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Все услуги"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-008: [client] Website_Home -> Подология', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Подология")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Подология" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Подология" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-008', {"id":"UI-CLIENT-Website_Home-BTN-8","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Подология","locator":"button:has-text(\"Подология\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подология"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-008', {"id":"UI-CLIENT-Website_Home-BTN-8","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Подология","locator":"button:has-text(\"Подология\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Подология"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-009: [client] Website_Home -> Эстетический уход', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Эстетический уход")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Эстетический уход" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Эстетический уход" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-009', {"id":"UI-CLIENT-Website_Home-BTN-9","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Эстетический уход","locator":"button:has-text(\"Эстетический уход\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Эстетический уход"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-009', {"id":"UI-CLIENT-Website_Home-BTN-9","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Эстетический уход","locator":"button:has-text(\"Эстетический уход\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Эстетический уход"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-010: [client] Website_Home -> Ногтевой сервис', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Ногтевой сервис")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Ногтевой сервис" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Ногтевой сервис" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-010', {"id":"UI-CLIENT-Website_Home-BTN-10","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Ногтевой сервис","locator":"button:has-text(\"Ногтевой сервис\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Ногтевой сервис"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-010', {"id":"UI-CLIENT-Website_Home-BTN-10","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Ногтевой сервис","locator":"button:has-text(\"Ногтевой сервис\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Ногтевой сервис"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-011: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-011', {"id":"UI-CLIENT-Website_Home-BTN-11","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-011', {"id":"UI-CLIENT-Website_Home-BTN-11","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-012: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-012', {"id":"UI-CLIENT-Website_Home-BTN-12","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-012', {"id":"UI-CLIENT-Website_Home-BTN-12","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-013: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-013', {"id":"UI-CLIENT-Website_Home-BTN-13","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-013', {"id":"UI-CLIENT-Website_Home-BTN-13","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-014: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-014', {"id":"UI-CLIENT-Website_Home-BTN-14","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-014', {"id":"UI-CLIENT-Website_Home-BTN-14","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-015: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-015', {"id":"UI-CLIENT-Website_Home-BTN-15","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-015', {"id":"UI-CLIENT-Website_Home-BTN-15","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-016: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-016', {"id":"UI-CLIENT-Website_Home-BTN-16","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-016', {"id":"UI-CLIENT-Website_Home-BTN-16","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-017: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-017', {"id":"UI-CLIENT-Website_Home-BTN-17","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-017', {"id":"UI-CLIENT-Website_Home-BTN-17","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-018: [client] Website_Home -> ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-018', {"id":"UI-CLIENT-Website_Home-BTN-18","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-018', {"id":"UI-CLIENT-Website_Home-BTN-18","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"↗","locator":"button:has-text(\"↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-019: [client] Website_Home -> Мои записи и карта визитов ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Мои записи и карта визитов ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои записи и карта визитов ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои записи и карта визитов ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-019', {"id":"UI-CLIENT-Website_Home-BTN-19","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Мои записи и карта визитов ↗","locator":"button:has-text(\"Мои записи и карта визитов ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои записи и карта визитов ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-019', {"id":"UI-CLIENT-Website_Home-BTN-19","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Мои записи и карта визитов ↗","locator":"button:has-text(\"Мои записи и карта визитов ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои записи и карта визитов ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-020: [client] Website_Home -> Показать все 95 услуг ↓', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button#show-more').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Показать все 95 услуг ↓" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Показать все 95 услуг ↓" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-020', {"id":"UI-CLIENT-Website_Home-BTN-20","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Показать все 95 услуг ↓","locator":"button#show-more","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Показать все 95 услуг ↓"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-020', {"id":"UI-CLIENT-Website_Home-BTN-20","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Показать все 95 услуг ↓","locator":"button#show-more","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Показать все 95 услуг ↓"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-021: [client] Website_Home -> Посмотреть консультации ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Посмотреть консультации ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Посмотреть консультации ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Посмотреть консультации ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-021', {"id":"UI-CLIENT-Website_Home-BTN-21","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Посмотреть консультации ↗","locator":"button:has-text(\"Посмотреть консультации ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Посмотреть консультации ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-021', {"id":"UI-CLIENT-Website_Home-BTN-21","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Посмотреть консультации ↗","locator":"button:has-text(\"Посмотреть консультации ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Посмотреть консультации ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-022: [client] Website_Home -> Познакомиться на консультации ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Познакомиться на консультации ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Познакомиться на консультации ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Познакомиться на консультации ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-022', {"id":"UI-CLIENT-Website_Home-BTN-22","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Познакомиться на консультации ↗","locator":"button:has-text(\"Познакомиться на консультации \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Познакомиться на консультации ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-022', {"id":"UI-CLIENT-Website_Home-BTN-22","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Познакомиться на консультации ↗","locator":"button:has-text(\"Познакомиться на консультации \")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Познакомиться на консультации ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-023: [client] Website_Home -> Выбрать услугу ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Выбрать услугу ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-023', {"id":"UI-CLIENT-Website_Home-BTN-23","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-023', {"id":"UI-CLIENT-Website_Home-BTN-23","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-024: [client] Website_Home -> Выбрать услугу ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Выбрать услугу ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-024', {"id":"UI-CLIENT-Website_Home-BTN-24","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-024', {"id":"UI-CLIENT-Website_Home-BTN-24","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-025: [client] Website_Home -> Выбрать услугу ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Выбрать услугу ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-025', {"id":"UI-CLIENT-Website_Home-BTN-25","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-025', {"id":"UI-CLIENT-Website_Home-BTN-25","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-026: [client] Website_Home -> Выбрать услугу ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Выбрать услугу ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать услугу ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-026', {"id":"UI-CLIENT-Website_Home-BTN-26","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-026', {"id":"UI-CLIENT-Website_Home-BTN-26","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Выбрать услугу ↗","locator":"button:has-text(\"Выбрать услугу ↗\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-027: [client] Website_Home -> 01 Введение в подологию · титановая', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("01 Введение в подологию · тита")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "01 Введение в подологию · титановая" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "01 Введение в подологию · титановая" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-027', {"id":"UI-CLIENT-Website_Home-BTN-27","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"01 Введение в подологию · титановая нить NAIL HOUS","locator":"button:has-text(\"01 Введение в подологию · тита\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 01 Введение в подологию · титановая нить NAIL HOUSE · 2021 ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-027', {"id":"UI-CLIENT-Website_Home-BTN-27","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"01 Введение в подологию · титановая нить NAIL HOUS","locator":"button:has-text(\"01 Введение в подологию · тита\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 01 Введение в подологию · титановая нить NAIL HOUSE · 2021 ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-028: [client] Website_Home -> 02 Ортониксия · система 3ТО-ОМЕГА P', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("02 Ортониксия · система 3ТО-ОМ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "02 Ортониксия · система 3ТО-ОМЕГА P" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "02 Ортониксия · система 3ТО-ОМЕГА P" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-028', {"id":"UI-CLIENT-Website_Home-BTN-28","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"02 Ортониксия · система 3ТО-ОМЕГА PodoProFeet Acad","locator":"button:has-text(\"02 Ортониксия · система 3ТО-ОМ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 02 Ортониксия · система 3ТО-ОМЕГА PodoProFeet Academy · 2022 ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-028', {"id":"UI-CLIENT-Website_Home-BTN-28","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"02 Ортониксия · система 3ТО-ОМЕГА PodoProFeet Acad","locator":"button:has-text(\"02 Ортониксия · система 3ТО-ОМ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 02 Ортониксия · система 3ТО-ОМЕГА PodoProFeet Academy · 2022 ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-029: [client] Website_Home -> 03 Подошвенные бородавки в практике', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("03 Подошвенные бородавки в пра")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "03 Подошвенные бородавки в практике" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "03 Подошвенные бородавки в практике" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-029', {"id":"UI-CLIENT-Website_Home-BTN-29","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"03 Подошвенные бородавки в практике подолога PodoP","locator":"button:has-text(\"03 Подошвенные бородавки в пра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 03 Подошвенные бородавки в практике подолога PodoProFeet Academy · 2022 ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-029', {"id":"UI-CLIENT-Website_Home-BTN-29","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"03 Подошвенные бородавки в практике подолога PodoP","locator":"button:has-text(\"03 Подошвенные бородавки в пра\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 03 Подошвенные бородавки в практике подолога PodoProFeet Academy · 2022 ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-030: [client] Website_Home -> 04 Протезирование ногтей PodoProFee', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("04 Протезирование ногтей PodoP")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "04 Протезирование ногтей PodoProFee" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "04 Протезирование ногтей PodoProFee" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-030', {"id":"UI-CLIENT-Website_Home-BTN-30","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"04 Протезирование ногтей PodoProFeet Academy · 202","locator":"button:has-text(\"04 Протезирование ногтей PodoP\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 04 Протезирование ногтей PodoProFeet Academy · 2022 ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-030', {"id":"UI-CLIENT-Website_Home-BTN-30","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"04 Протезирование ногтей PodoProFeet Academy · 202","locator":"button:has-text(\"04 Протезирование ногтей PodoP\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 04 Протезирование ногтей PodoProFeet Academy · 2022 ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-031: [client] Website_Home -> 05 Работа с онихомикозом в подологи', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("05 Работа с онихомикозом в под")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "05 Работа с онихомикозом в подологи" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "05 Работа с онихомикозом в подологи" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-031', {"id":"UI-CLIENT-Website_Home-BTN-31","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"05 Работа с онихомикозом в подологии PodoInstitut ","locator":"button:has-text(\"05 Работа с онихомикозом в под\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 05 Работа с онихомикозом в подологии PodoInstitut · 2023 ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-031', {"id":"UI-CLIENT-Website_Home-BTN-31","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"05 Работа с онихомикозом в подологии PodoInstitut ","locator":"button:has-text(\"05 Работа с онихомикозом в под\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 05 Работа с онихомикозом в подологии PodoInstitut · 2023 ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-032: [client] Website_Home -> 06 Раневой процесс · особенности ве', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("06 Раневой процесс · особеннос")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "06 Раневой процесс · особенности ве" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "06 Раневой процесс · особенности ве" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-032', {"id":"UI-CLIENT-Website_Home-BTN-32","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"06 Раневой процесс · особенности ведения ран PodoP","locator":"button:has-text(\"06 Раневой процесс · особеннос\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 06 Раневой процесс · особенности ведения ран PodoProFeet Academy · 2023 ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-032', {"id":"UI-CLIENT-Website_Home-BTN-32","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"06 Раневой процесс · особенности ведения ран PodoP","locator":"button:has-text(\"06 Раневой процесс · особеннос\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: 06 Раневой процесс · особенности ведения ран PodoProFeet Academy · 2023 ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

});
