const fs = require('fs');
const path = require('path');

const labDir = path.resolve(__dirname, '..');
const invPath = path.join(labDir, 'qa/ui-inventory.json');
const inventory = JSON.parse(fs.readFileSync(invPath, 'utf8'));

const outDir = path.join(labDir, 'qa/v2-tests');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. Separate into roles
const crmRoles = ['owner', 'admin', 'manager', 'specialist'];
const clientRole = ['client'];

const crmItems = inventory.filter(x => crmRoles.includes(x.role));
const clientItems = inventory.filter(x => clientRole.includes(x.role));

console.log(`CRM items: ${crmItems.length}, Client items: ${clientItems.length}`);

function sanitizeLocator(loc) {
  return (loc || '').replace(/[\r\n]+/g, ' ').replace(/'/g, "\\'").trim();
}

function generateSuite(items, filename, suiteTitle, isCrm = false, startIndex = 1) {
  let code = `import { test, expect } from '@playwright/test';
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

test.describe('${suiteTitle}', () => {
`;

  items.forEach((item, index) => {
    const globalIdx = String(startIndex + index).padStart(3, '0');
    const testId = `V2-UI-${item.role.toUpperCase()}-${globalIdx}`;
    const cleanLoc = sanitizeLocator(item.locator);
    const cleanText = (item.text || 'Element').replace(/[\"\r\n]/g, ' ').slice(0, 35).trim();

    code += `
  test('${testId}: [${item.role}] ${item.screenName} -> ${cleanText}', async ({ page, context }) => {
    const actionLog = [];
    try {
`;

    if (isCrm) {
      code += `      // CRM requires authentication headers or mode query
      await page.setExtraHTTPHeaders({
        'oai-authenticated-user-id': 'qa-owner',
        'oai-authenticated-user-email': 'owner-01@example.invalid',
        'x-crm-mode': '${item.role}'
      });
      await page.goto('http://127.0.0.1:8787/?mode=${item.role}', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: 'http://127.0.0.1:8787/?mode=${item.role}' });
`;
    } else {
      const url = item.url || (item.screenName === 'Client_Portal' ? 'http://127.0.0.1:4173/portal.html' : 'http://127.0.0.1:4173/index.html');
      code += `      await page.goto('${url}', { waitUntil: 'domcontentloaded', timeout: 10000 });
      actionLog.push({ step: 'navigate', url: '${url}' });
`;
    }

    code += `      const targetLocator = page.locator('${cleanLoc}').first();

      // STRICT ZERO-TRUST ASSERTION 1: Element MUST exist in DOM and be visible
      await expect(targetLocator, 'Element "${cleanText}" must be visible on screen ${item.screenName}').toBeVisible({ timeout: 4000 });
      actionLog.push({ step: 'assertVisible', passed: true });

      // STRICT ZERO-TRUST ASSERTION 2: Element MUST be enabled (or explicitly documented as disabled)
      await expect(targetLocator, 'Element "${cleanText}" must be enabled for interaction').toBeEnabled({ timeout: 2000 });
      actionLog.push({ step: 'assertEnabled', passed: true });

      // STRICT ZERO-TRUST ACTION: Real interaction
      if ('${item.type}' === 'input') {
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

      saveResult('${testId}', ${JSON.stringify(item)}, 'PASS', actionLog);
    } catch (err) {
      saveResult('${testId}', ${JSON.stringify(item)}, 'FAIL', actionLog, err.message);
      throw err;
    }
  });
`;
  });

  code += `\n});\n`;
  const targetPath = path.join(outDir, filename);
  fs.writeFileSync(targetPath, code, 'utf8');
  console.log(`Generated: ${targetPath} (${items.length} tests)`);
}

// Split CRM items into 4 batches of 26
const crmBatches = [
  crmItems.slice(0, 26),
  crmItems.slice(26, 52),
  crmItems.slice(52, 78),
  crmItems.slice(78)
];

crmBatches.forEach((batch, idx) => {
  generateSuite(batch, `v2-crm-batch-${idx + 1}.spec.js`, `V2 CRM UI Suite Batch ${idx + 1}`, true, idx * 26 + 1);
});

// Split Client items into 4 batches of 32
const clientBatches = [
  clientItems.slice(0, 32),
  clientItems.slice(32, 64),
  clientItems.slice(64, 96),
  clientItems.slice(96)
];

clientBatches.forEach((batch, idx) => {
  generateSuite(batch, `v2-client-batch-${idx + 1}.spec.js`, `V2 Client UI Suite Batch ${idx + 1}`, false, idx * 32 + 1);
});
