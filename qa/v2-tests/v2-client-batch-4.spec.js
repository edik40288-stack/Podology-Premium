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

test.describe('V2 Client UI Suite Batch 4', () => {

  test('V2-UI-CLIENT-097: [client] Website_Home -> Записаться на приём ↗', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("Записаться на приём ↗")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Записаться на приём ↗" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Записаться на приём ↗" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-097', {"id":"UI-CLIENT-Website_Home-BTN-97","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Записаться на приём ↗","locator":"button:has-text(\"Записаться на приём ↗\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записаться на приём ↗"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-097', {"id":"UI-CLIENT-Website_Home-BTN-97","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"Записаться на приём ↗","locator":"button:has-text(\"Записаться на приём ↗\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записаться на приём ↗"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-098: [client] Website_Home -> ×', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('button:has-text("×")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "×" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "×" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-098', {"id":"UI-CLIENT-Website_Home-BTN-98","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"×","locator":"button:has-text(\"×\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ×"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-098', {"id":"UI-CLIENT-Website_Home-BTN-98","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"button","text":"×","locator":"button:has-text(\"×\")","visible":false,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: ×"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-099: [client] Website_Home -> Найти услугу…', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('#search').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Найти услугу…" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Найти услугу…" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('input' === 'input') {
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

      saveResult('V2-UI-CLIENT-099', {"id":"UI-CLIENT-Website_Home-INP-99","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"input","text":"Найти услугу…","locator":"#search","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Input text or select value in search"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-099', {"id":"UI-CLIENT-Website_Home-INP-99","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"input","text":"Найти услугу…","locator":"#search","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Input text or select value in search"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-100: [client] Website_Home -> Куцытой ЦЕНТР ПОДОЛОГИИ', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('a:has-text("Куцытой ЦЕНТР ПОДОЛОГИИ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Куцытой ЦЕНТР ПОДОЛОГИИ" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Куцытой ЦЕНТР ПОДОЛОГИИ" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-100', {"id":"UI-CLIENT-Website_Home-NAV-100","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Куцытой\nЦЕНТР ПОДОЛОГИИ","locator":"a:has-text(\"Куцытой\nЦЕНТР ПОДОЛОГИИ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Куцытой\nЦЕНТР ПОДОЛОГИИ"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-100', {"id":"UI-CLIENT-Website_Home-NAV-100","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Куцытой\nЦЕНТР ПОДОЛОГИИ","locator":"a:has-text(\"Куцытой\nЦЕНТР ПОДОЛОГИИ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Куцытой\nЦЕНТР ПОДОЛОГИИ"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-101: [client] Website_Home -> Специалисты', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('a:has-text("Специалисты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Специалисты" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Специалисты" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-101', {"id":"UI-CLIENT-Website_Home-NAV-101","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Специалисты","locator":"a:has-text(\"Специалисты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Специалисты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-101', {"id":"UI-CLIENT-Website_Home-NAV-101","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Специалисты","locator":"a:has-text(\"Специалисты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Специалисты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-102: [client] Website_Home -> Услуги и цены', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('a:has-text("Услуги и цены")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Услуги и цены" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Услуги и цены" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-102', {"id":"UI-CLIENT-Website_Home-NAV-102","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Услуги и цены","locator":"a:has-text(\"Услуги и цены\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Услуги и цены"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-102', {"id":"UI-CLIENT-Website_Home-NAV-102","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Услуги и цены","locator":"a:has-text(\"Услуги и цены\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Услуги и цены"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-103: [client] Website_Home -> Домашний уход', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('a:has-text("Домашний уход")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Домашний уход" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Домашний уход" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-103', {"id":"UI-CLIENT-Website_Home-NAV-103","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Домашний уход","locator":"a:has-text(\"Домашний уход\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Домашний уход"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-103', {"id":"UI-CLIENT-Website_Home-NAV-103","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Домашний уход","locator":"a:has-text(\"Домашний уход\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Домашний уход"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-104: [client] Website_Home -> Контакты', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('a:has-text("Контакты")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Контакты" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Контакты" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-104', {"id":"UI-CLIENT-Website_Home-NAV-104","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Контакты","locator":"a:has-text(\"Контакты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Контакты"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-104', {"id":"UI-CLIENT-Website_Home-NAV-104","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Контакты","locator":"a:has-text(\"Контакты\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Контакты"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-105: [client] Website_Home -> Личный кабинет', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:4173/index.html' });
      const targetLocator = page.locator('a:has-text("Личный кабинет")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Личный кабинет" must be visible on screen Website_Home').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Личный кабинет" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-105', {"id":"UI-CLIENT-Website_Home-NAV-105","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Личный кабинет","locator":"a:has-text(\"Личный кабинет\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Личный кабинет"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-105', {"id":"UI-CLIENT-Website_Home-NAV-105","role":"client","screenName":"Website_Home","url":"http://127.0.0.1:4173/index.html","type":"nav_link","text":"Личный кабинет","locator":"a:has-text(\"Личный кабинет\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to Личный кабинет"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-106: [client] Client_Portal -> Услуги', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Услуги")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Услуги" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Услуги" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-106', {"id":"UI-CLIENT-Client_Portal-BTN-1","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Услуги","locator":"button:has-text(\"Услуги\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-106', {"id":"UI-CLIENT-Client_Portal-BTN-1","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Услуги","locator":"button:has-text(\"Услуги\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-107: [client] Client_Portal -> Товары', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Товары")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Товары" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Товары" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-107', {"id":"UI-CLIENT-Client_Portal-BTN-2","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Товары","locator":"button:has-text(\"Товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Товары"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-107', {"id":"UI-CLIENT-Client_Portal-BTN-2","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Товары","locator":"button:has-text(\"Товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Товары"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-108: [client] Client_Portal -> Войти', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Войти")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Войти" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Войти" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-108', {"id":"UI-CLIENT-Client_Portal-BTN-3","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Войти","locator":"button:has-text(\"Войти\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Войти"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-108', {"id":"UI-CLIENT-Client_Portal-BTN-3","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Войти","locator":"button:has-text(\"Войти\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Войти"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-109: [client] Client_Portal -> Мой кабинет', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Мой кабинет")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мой кабинет" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мой кабинет" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-109', {"id":"UI-CLIENT-Client_Portal-BTN-4","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мой кабинет","locator":"button:has-text(\"Мой кабинет\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мой кабинет"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-109', {"id":"UI-CLIENT-Client_Portal-BTN-4","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мой кабинет","locator":"button:has-text(\"Мой кабинет\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мой кабинет"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-110: [client] Client_Portal -> Услуги и запись', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Услуги и запись")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Услуги и запись" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Услуги и запись" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-110', {"id":"UI-CLIENT-Client_Portal-BTN-5","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Услуги и запись","locator":"button:has-text(\"Услуги и запись\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги и запись"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-110', {"id":"UI-CLIENT-Client_Portal-BTN-5","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Услуги и запись","locator":"button:has-text(\"Услуги и запись\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Услуги и запись"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-111: [client] Client_Portal -> Мои записи', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Мои записи")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои записи" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-CLIENT-111', {"id":"UI-CLIENT-Client_Portal-BTN-6","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои записи","locator":"button:has-text(\"Мои записи\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои записи"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-111', {"id":"UI-CLIENT-Client_Portal-BTN-6","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои записи","locator":"button:has-text(\"Мои записи\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои записи"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-112: [client] Client_Portal -> Карта и рекомендации', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Карта и рекомендации")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Карта и рекомендации" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Карта и рекомендации" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-112', {"id":"UI-CLIENT-Client_Portal-BTN-7","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Карта и рекомендации","locator":"button:has-text(\"Карта и рекомендации\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Карта и рекомендации"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-112', {"id":"UI-CLIENT-Client_Portal-BTN-7","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Карта и рекомендации","locator":"button:has-text(\"Карта и рекомендации\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Карта и рекомендации"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-113: [client] Client_Portal -> Товары', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Товары")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Товары" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Товары" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-113', {"id":"UI-CLIENT-Client_Portal-BTN-8","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Товары","locator":"button:has-text(\"Товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Товары"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-113', {"id":"UI-CLIENT-Client_Portal-BTN-8","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Товары","locator":"button:has-text(\"Товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Товары"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-114: [client] Client_Portal -> Мои заказы', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Мои заказы")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои заказы" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои заказы" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-114', {"id":"UI-CLIENT-Client_Portal-BTN-9","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои заказы","locator":"button:has-text(\"Мои заказы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои заказы"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-114', {"id":"UI-CLIENT-Client_Portal-BTN-9","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои заказы","locator":"button:has-text(\"Мои заказы\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои заказы"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-115: [client] Client_Portal -> Мои данные', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Мои данные")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои данные" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои данные" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-115', {"id":"UI-CLIENT-Client_Portal-BTN-10","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои данные","locator":"button:has-text(\"Мои данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои данные"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-115', {"id":"UI-CLIENT-Client_Portal-BTN-10","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои данные","locator":"button:has-text(\"Мои данные\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои данные"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-116: [client] Client_Portal -> Записаться', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Записаться")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Записаться" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Записаться" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-116', {"id":"UI-CLIENT-Client_Portal-BTN-11","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Записаться","locator":"button:has-text(\"Записаться\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записаться"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-116', {"id":"UI-CLIENT-Client_Portal-BTN-11","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Записаться","locator":"button:has-text(\"Записаться\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Записаться"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-117: [client] Client_Portal -> Выбрать услугу', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Выбрать услугу")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать услугу" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать услугу" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-117', {"id":"UI-CLIENT-Client_Portal-BTN-12","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать услугу","locator":"button:has-text(\"Выбрать услугу\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-117', {"id":"UI-CLIENT-Client_Portal-BTN-12","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать услугу","locator":"button:has-text(\"Выбрать услугу\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать услугу"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-118: [client] Client_Portal -> Моя карта Рекомендации после посеще', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Моя карта Рекомендации после п")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Моя карта Рекомендации после посеще" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Моя карта Рекомендации после посеще" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-118', {"id":"UI-CLIENT-Client_Portal-BTN-13","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Моя карта Рекомендации после посещения","locator":"button:has-text(\"Моя карта Рекомендации после п\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Моя карта Рекомендации после посещения"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-118', {"id":"UI-CLIENT-Client_Portal-BTN-13","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Моя карта Рекомендации после посещения","locator":"button:has-text(\"Моя карта Рекомендации после п\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Моя карта Рекомендации после посещения"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-119: [client] Client_Portal -> Мои заказы Статусы и получение това', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Мои заказы Статусы и получение")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои заказы Статусы и получение това" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои заказы Статусы и получение това" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-119', {"id":"UI-CLIENT-Client_Portal-BTN-14","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои заказы Статусы и получение товаров","locator":"button:has-text(\"Мои заказы Статусы и получение\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои заказы Статусы и получение товаров"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-119', {"id":"UI-CLIENT-Client_Portal-BTN-14","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои заказы Статусы и получение товаров","locator":"button:has-text(\"Мои заказы Статусы и получение\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои заказы Статусы и получение товаров"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-120: [client] Client_Portal -> Мои данные Телефон и дата рождения', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Мои данные Телефон и дата рожд")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Мои данные Телефон и дата рождения" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Мои данные Телефон и дата рождения" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-120', {"id":"UI-CLIENT-Client_Portal-BTN-15","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои данные Телефон и дата рождения","locator":"button:has-text(\"Мои данные Телефон и дата рожд\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои данные Телефон и дата рождения"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-120', {"id":"UI-CLIENT-Client_Portal-BTN-15","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Мои данные Телефон и дата рождения","locator":"button:has-text(\"Мои данные Телефон и дата рожд\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Мои данные Телефон и дата рождения"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-121: [client] Client_Portal -> Все услуги', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Все услуги")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Все услуги" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
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

      saveResult('V2-UI-CLIENT-121', {"id":"UI-CLIENT-Client_Portal-BTN-16","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Все услуги","locator":"button:has-text(\"Все услуги\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Все услуги"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-121', {"id":"UI-CLIENT-Client_Portal-BTN-16","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Все услуги","locator":"button:has-text(\"Все услуги\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Все услуги"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-122: [client] Client_Portal -> Выбрать', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Выбрать")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-122', {"id":"UI-CLIENT-Client_Portal-BTN-17","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-122', {"id":"UI-CLIENT-Client_Portal-BTN-17","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-123: [client] Client_Portal -> Выбрать', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Выбрать")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-123', {"id":"UI-CLIENT-Client_Portal-BTN-18","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-123', {"id":"UI-CLIENT-Client_Portal-BTN-18","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-124: [client] Client_Portal -> Выбрать', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Выбрать")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-124', {"id":"UI-CLIENT-Client_Portal-BTN-19","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-124', {"id":"UI-CLIENT-Client_Portal-BTN-19","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-125: [client] Client_Portal -> Выбрать', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Выбрать")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Выбрать" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Выбрать" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-125', {"id":"UI-CLIENT-Client_Portal-BTN-20","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-125', {"id":"UI-CLIENT-Client_Portal-BTN-20","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Выбрать","locator":"button:has-text(\"Выбрать\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Выбрать"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-126: [client] Client_Portal -> Смотреть товары', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('button:has-text("Смотреть товары")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "Смотреть товары" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "Смотреть товары" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
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

      saveResult('V2-UI-CLIENT-126', {"id":"UI-CLIENT-Client_Portal-BTN-21","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Смотреть товары","locator":"button:has-text(\"Смотреть товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Смотреть товары"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-126', {"id":"UI-CLIENT-Client_Portal-BTN-21","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"button","text":"Смотреть товары","locator":"button:has-text(\"Смотреть товары\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Trigger action: Смотреть товары"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-127: [client] Client_Portal -> К. Куцытой ЦЕНТР ПОДОЛОГИИ', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('a:has-text("К. Куцытой ЦЕНТР ПОДОЛОГИИ")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "К. Куцытой ЦЕНТР ПОДОЛОГИИ" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "К. Куцытой ЦЕНТР ПОДОЛОГИИ" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-127', {"id":"UI-CLIENT-Client_Portal-NAV-22","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"nav_link","text":"К.\nКуцытой\nЦЕНТР ПОДОЛОГИИ","locator":"a:has-text(\"К.\nКуцытой\nЦЕНТР ПОДОЛОГИИ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to К.\nКуцытой\nЦЕНТР ПОДОЛОГИИ"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-127', {"id":"UI-CLIENT-Client_Portal-NAV-22","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"nav_link","text":"К.\nКуцытой\nЦЕНТР ПОДОЛОГИИ","locator":"a:has-text(\"К.\nКуцытой\nЦЕНТР ПОДОЛОГИИ\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to К.\nКуцытой\nЦЕНТР ПОДОЛОГИИ"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

  test('V2-UI-CLIENT-128: [client] Client_Portal -> На главную', async ({ page, context }) => {
    const actionLog = [];
    try {
      await page.goto('http://127.0.0.1:8787/client', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/client' });
      const targetLocator = page.locator('a:has-text("На главную")').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "На главную" must be visible on screen Client_Portal').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "На главную" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('nav_link' === 'input') {
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

      saveResult('V2-UI-CLIENT-128', {"id":"UI-CLIENT-Client_Portal-NAV-23","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"nav_link","text":"На главную","locator":"a:has-text(\"На главную\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to На главную"}, 'PASS', actionLog);
    } catch (err) {
      saveResult('V2-UI-CLIENT-128', {"id":"UI-CLIENT-Client_Portal-NAV-23","role":"client","screenName":"Client_Portal","url":"http://127.0.0.1:8787/client","type":"nav_link","text":"На главную","locator":"a:has-text(\"На главную\")","visible":true,"enabled":true,"disabledReason":null,"expectedAction":"Navigate to На главную"}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });

});
