import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const evidenceDir = path.resolve('evidence/raw-executions');
if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

function saveEvidence(testId, title, requests, assertions, dbState, status) {
  const file = path.join(evidenceDir, `${testId}_DEEP_RUN.json`);
  fs.writeFileSync(file, JSON.stringify({
    testId,
    title,
    executedAt: new Date().toISOString(),
    status,
    requests,
    assertions,
    dbState
  }, null, 2), 'utf8');
}

const crmOwnerHeaders = {
  'oai-authenticated-user-id': 'qa-owner',
  'oai-authenticated-user-email': 'owner-01@example.invalid',
  'x-crm-mode': 'owner'
};

const crmAdminHeaders = {
  'oai-authenticated-user-id': 'qa-owner',
  'oai-authenticated-user-email': 'owner-01@example.invalid',
  'x-crm-mode': 'admin'
};

const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Moscow' }).format(new Date());

async function getAvailableSlots(request, minDayOffset = 10, count = 2) {
  const crmRes = await request.get('http://127.0.0.1:8787/api/crm', { headers: crmOwnerHeaders });
  const crm = await crmRes.json();
  const occupiedSet = new Set(crm.appointments.map(a => `${a.date}_${a.start}`));
  const slots = [];

  for (let day = minDayOffset; day < 120 && slots.length < count; day++) {
    const dt = new Date();
    dt.setDate(dt.getDate() + day);
    const dateStr = dt.toISOString().slice(0, 10);
    for (let s = 600; s <= 960 && slots.length < count; s += 30) {
      const key = `${dateStr}_${s}`;
      if (!occupiedSet.has(key)) {
        occupiedSet.add(key);
        slots.push({ date: dateStr, start: s });
      }
    }
  }
  return slots;
}

test.describe('E2E BUSINESS FLOWS (8 Comprehensive Multi-Role Scenarios)', () => {

  test('E2E-FLOW-01: Client books appointment on site -> record appears in CRM', async ({ request }) => {
    const timestamp = Date.now();
    const phone = '+7999' + String(timestamp).slice(-7);
    const [slot] = await getAvailableSlots(request, 12, 1);
    const clientUserId = 'client-user-' + timestamp;
    const clientEmail = `client-${timestamp}@example.invalid`;

    // 1. Client registers via portal API
    const regRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow01-reg-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: {
        action: 'register',
        name: 'E2E Client One',
        phone,
        birthDate: '1995-05-15',
        consent: true
      }
    });
    expect(regRes.status()).toBe(200);
    const { id: patientId } = await regRes.json();
    expect(patientId).toBeTruthy();

    // 2. Client books appointment via portal API
    const bookRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow01-book-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: {
        action: 'book',
        patient: patientId,
        serviceIds: ['23006090'],
        worker: 'alex',
        date: slot.date,
        start: slot.start
      }
    });
    expect(bookRes.status()).toBe(200);
    const { id: appointmentId } = await bookRes.json();
    expect(appointmentId).toBeTruthy();

    // 3. Owner verifies appointment presence in CRM state
    const crmRes = await request.get('http://127.0.0.1:8787/api/crm', {
      headers: crmOwnerHeaders
    });
    expect(crmRes.status()).toBe(200);
    const crmData = await crmRes.json();
    const found = crmData.appointments.find(a => a.id === appointmentId);
    expect(found).toBeTruthy();
    expect(found.patient).toBe(patientId);
    expect(found.worker).toBe('alex');

    saveEvidence('E2E-FLOW-01', 'Client books on site -> appears in CRM',
      [{ action: 'register', status: regRes.status() }, { action: 'book', status: bookRes.status() }, { action: 'crmVerification', status: crmRes.status() }],
      [{ name: 'AppointmentCreatedInCRM', passed: true, details: `Appt ID ${appointmentId} confirmed in CRM state` }],
      { appointmentId, patientId, date: slot.date, start: slot.start, worker: 'alex' }, 'PASS');
  });

  test('E2E-FLOW-02: Admin reschedules appointment -> client sees updated time in portal', async ({ request }) => {
    const timestamp = Date.now();
    const phone = '+7999' + String(timestamp).slice(-7);
    const [slot1, slot2] = await getAvailableSlots(request, 14, 2);
    const clientUserId = 'client-user-' + timestamp;
    const clientEmail = `client-${timestamp}@example.invalid`;

    // 1. Register & book
    const regRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow02-reg-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: { action: 'register', name: 'E2E Client Two', phone, birthDate: '1992-03-20', consent: true }
    });
    const { id: patientId } = await regRes.json();

    const bookRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow02-book-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: { action: 'book', patient: patientId, serviceIds: ['23006090'], worker: 'alex', date: slot1.date, start: slot1.start }
    });
    const { id: apptId } = await bookRes.json();

    // 2. Admin reschedules in CRM
    const rescheduleRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow02-resched-' + timestamp, ...crmAdminHeaders },
      data: { action: 'appointment.save', id: apptId, version: 1, patient: patientId, serviceIds: ['23006090'], worker: 'alex', date: slot2.date, start: slot2.start }
    });
    expect(rescheduleRes.status()).toBe(200);

    // 3. Client queries portal for their appointments via GET
    const portalGetRes = await request.get('http://127.0.0.1:8787/api/portal', {
      headers: {
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      }
    });
    expect(portalGetRes.status()).toBe(200);
    const portalData = await portalGetRes.json();
    const target = portalData.visits.find(a => a.id === apptId);
    expect(target).toBeTruthy();
    expect(target.date).toBe(slot2.date);
    expect(target.start).toBe(slot2.start);

    saveEvidence('E2E-FLOW-02', 'Admin reschedules -> client sees updated time in portal',
      [{ action: 'reschedule', status: rescheduleRes.status() }, { action: 'portalGet', status: portalGetRes.status() }],
      [{ name: 'ReschedulePropagatedToPortal', passed: true, details: `New date: ${target.date}, start: ${target.start}` }],
      { apptId, updatedDate: slot2.date, updatedStart: slot2.start }, 'PASS');
  });

  test('E2E-FLOW-03: Client cancels in portal -> slot freed in CRM schedule', async ({ request }) => {
    const timestamp = Date.now();
    const phone = '+7999' + String(timestamp).slice(-7);
    const [slot] = await getAvailableSlots(request, 16, 1);
    const clientUserId = 'client-user-' + timestamp;
    const clientEmail = `client-${timestamp}@example.invalid`;

    const regRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow03-reg-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: { action: 'register', name: 'E2E Client Three', phone, birthDate: '1988-11-12', consent: true }
    });
    const { id: patientId } = await regRes.json();

    const bookRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow03-book-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: { action: 'book', patient: patientId, serviceIds: ['23006090'], worker: 'alex', date: slot.date, start: slot.start }
    });
    const { id: apptId } = await bookRes.json();

    // Client cancels via portalAction
    const cancelRes = await request.post('http://127.0.0.1:8787/api/portal', {
      headers: {
        'idempotency-key': 'flow03-cancel-' + timestamp,
        'oai-authenticated-user-id': clientUserId,
        'oai-authenticated-user-email': clientEmail
      },
      data: { action: 'cancel', patient: patientId, id: apptId, version: 1 }
    });
    expect(cancelRes.status()).toBe(200);

    // Verify slot is free and another appointment can be booked on that exact slot
    const rebookRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow03-rebook-' + timestamp, ...crmOwnerHeaders },
      data: {
        action: 'appointment.save',
        patient: '2d751110-3ffb-4a33-97b0-6f449c7d2749',
        worker: 'alex',
        serviceIds: ['23006090'],
        date: slot.date,
        start: slot.start
      }
    });
    expect(rebookRes.status()).toBe(200);

    saveEvidence('E2E-FLOW-03', 'Client cancels in portal -> slot freed in CRM',
      [{ action: 'cancel', status: cancelRes.status() }, { action: 'rebookSlot', status: rebookRes.status() }],
      [{ name: 'SlotRebookSuccessAfterCancel', passed: true, details: 'Slot freed and successfully rebooked' }],
      { apptId, freedSlot: { date: slot.date, start: slot.start } }, 'PASS');
  });

  test('E2E-FLOW-04: Specialist completes visit -> financial metrics update', async ({ request }) => {
    const timestamp = Date.now();
    const [slot] = await getAvailableSlots(request, 18, 1);
    const price = 400000;

    const apptRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow04-create-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.save', patient: '2d751110-3ffb-4a33-97b0-6f449c7d2749', worker: 'alex', serviceIds: ['23006090'], date: slot.date, start: slot.start, price }
    });
    const apptId = (await apptRes.json()).id;

    // Visit status progression: arrived -> in_service -> completed
    await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow04-s1-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.status', id: apptId, version: 1, status: 'arrived' }
    });
    await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow04-s2-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.status', id: apptId, version: 2, status: 'in_service' }
    });
    const compRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow04-s3-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.status', id: apptId, version: 3, status: 'completed' }
    });
    expect(compRes.status()).toBe(200);

    // Register payment for completed visit
    const payRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow04-pay-' + timestamp, ...crmOwnerHeaders },
      data: {
        action: 'payment.add',
        kind: 'appointment',
        entity: apptId,
        parts: [{ method: 'card', amount: price }]
      }
    });
    expect(payRes.status()).toBe(200);

    // Verify financial metrics via report GET
    const finRes = await request.get(`http://127.0.0.1:8787/api/crm?op=report&from=${todayStr}&to=${todayStr}`, {
      headers: crmOwnerHeaders
    });
    expect(finRes.status()).toBe(200);
    const reportData = await finRes.json();
    expect(reportData.income).toBeGreaterThanOrEqual(price);

    saveEvidence('E2E-FLOW-04', 'Specialist completes visit -> financial metrics update',
      [{ action: 'appointment.status', status: compRes.status() }, { action: 'payment.add', status: payRes.status() }],
      [{ name: 'VisitCompletedAndPaid', passed: true, details: `Visit ${apptId} completed and paid ${price}` }],
      { apptId, status: 'completed', paidAmount: price }, 'PASS');
  });

  test('E2E-FLOW-05: Admin/Lead accepts partial stock receipt -> inventory increases', async ({ request }) => {
    const timestamp = Date.now();

    // 1. Create a dedicated material for stock verification
    const matAddRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'mat-add-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'material.add', name: 'Лабораторный расходник ' + timestamp, unit: 'шт', stock: 10, cost: 25000 }
    });
    expect(matAddRes.status()).toBe(200);
    const { id: itemId } = await matAddRes.json();
    const initialQty = 10;

    // 2. Register material receipt with proper domain fields
    const receiptQty = 15;
    const receiptCost = 25000;
    const receiptRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'receipt-' + timestamp, ...crmOwnerHeaders },
      data: {
        action: 'material.receipt',
        material: itemId,
        qty: receiptQty,
        cost: receiptCost,
        reason: 'ООО Подология Поставка',
        documentRef: 'INV-' + timestamp
      }
    });
    expect(receiptRes.status()).toBe(200);

    // 3. Verify stock increased in CRM
    const crmAfterRes = await request.get('http://127.0.0.1:8787/api/crm', {
      headers: crmOwnerHeaders
    });
    const crmAfter = await crmAfterRes.json();
    const itemAfter = crmAfter.materials.find(m => m.id === itemId);
    const finalQty = itemAfter.stock;
    expect(finalQty).toBe(initialQty + receiptQty);

    saveEvidence('E2E-FLOW-05', 'Admin/Lead accepts partial stock receipt -> inventory increases',
      [{ action: 'material.receipt', status: receiptRes.status() }],
      [{ name: 'InventoryIncreased', passed: true, details: `Stock updated from ${initialQty} to ${finalQty}` }],
      { materialId: itemId, initialQty, receiptQty, finalQty }, 'PASS');
  });

  test('E2E-FLOW-06: Owner updates employee role -> access permission strictly enforced', async ({ request }) => {
    const timestamp = Date.now();
    const employeeEmail = `spec-perm-${timestamp}@example.invalid`;

    // 1. Owner registers specialist member linked to worker alex
    const setRoleRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'role-set-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'member.save', email: employeeEmail, name: 'Perm Test Employee', role: 'specialist', worker: 'alex' }
    });
    expect(setRoleRes.status()).toBe(200);

    // 2. Specialist attempts to access Lead-only payout mutation -> must be rejected (403)
    const unauthorizedActionRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: {
        'idempotency-key': 'unauth-' + timestamp,
        'oai-authenticated-user-id': 'spec-user-' + timestamp,
        'oai-authenticated-user-email': employeeEmail,
        'x-crm-mode': 'specialist'
      },
      data: { action: 'payout.add', worker: 'alex', amount: 5000000, date: todayStr, reason: 'Unauthorized payout attempt' }
    });
    expect(unauthorizedActionRes.status()).toBe(403);

    saveEvidence('E2E-FLOW-06', 'Owner updates role -> access restrictions strictly enforced',
      [{ action: 'member.save', status: setRoleRes.status() }, { action: 'payout.add', status: unauthorizedActionRes.status() }],
      [{ name: 'SpecialistDeniedOwnerEndpoint', passed: true, details: 'HTTP 403 Forbidden correctly returned' }],
      { employeeEmail, restrictedRole: 'specialist', attemptedAction: 'payout.add', rejectedStatus: 403 }, 'PASS');
  });

  test('E2E-FLOW-07: Client partial payment -> amounts and balance strictly reconciled', async ({ request }) => {
    const timestamp = Date.now();
    const [slot] = await getAvailableSlots(request, 20, 1);
    const totalPrice = 500000;
    const part1 = 200000;
    const part2 = 300000;

    // 1. Create appointment and complete it
    const apptRes = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow07-appt-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.save', patient: '2d751110-3ffb-4a33-97b0-6f449c7d2749', worker: 'alex', serviceIds: ['23006090'], date: slot.date, start: slot.start, price: totalPrice }
    });
    const apptId = (await apptRes.json()).id;

    await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow07-s1-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.status', id: apptId, version: 1, status: 'arrived' }
    });
    await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow07-s2-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.status', id: apptId, version: 2, status: 'in_service' }
    });
    await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow07-s3-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'appointment.status', id: apptId, version: 3, status: 'completed' }
    });

    // 2. First partial payment
    const p1Res = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow07-p1-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'payment.add', kind: 'appointment', entity: apptId, parts: [{ method: 'cash', amount: part1 }] }
    });
    expect(p1Res.status()).toBe(200);

    // 3. Second partial payment
    const p2Res = await request.post('http://127.0.0.1:8787/api/crm', {
      headers: { 'idempotency-key': 'flow07-p2-' + timestamp, ...crmOwnerHeaders },
      data: { action: 'payment.add', kind: 'appointment', entity: apptId, parts: [{ method: 'card', amount: part2 }] }
    });
    expect(p2Res.status()).toBe(200);

    // 4. Verify balance reconciliation in CRM projected view
    const crmStateRes = await request.get('http://127.0.0.1:8787/api/crm', {
      headers: crmOwnerHeaders
    });
    const crmState = await crmStateRes.json();
    const apptInState = crmState.appointments.find(a => a.id === apptId);
    expect(apptInState.paid).toBe(totalPrice);
    expect(apptInState.price).toBe(totalPrice);

    saveEvidence('E2E-FLOW-07', 'Client partial payment -> amounts reconciled',
      [{ action: 'payment.add.part1', status: p1Res.status() }, { action: 'payment.add.part2', status: p2Res.status() }],
      [{ name: 'ReconciliationExactMatch', passed: true, details: `part1(${part1}) + part2(${part2}) == total(${totalPrice})` }],
      { apptId, totalPrice, paidTotal: apptInState.paid, balance: 0 }, 'PASS');
  });

  test('E2E-FLOW-08: Multi-user concurrent booking on same slot -> exact 1 succeeds, remaining rejected', async ({ request }) => {
    const timestamp = Date.now();
    const [slot] = await getAvailableSlots(request, 22, 1);
    const slotWorker = 'alex';

    const reqs = [1, 2, 3].map(i => {
      return request.post('http://127.0.0.1:8787/api/crm', {
        headers: {
          'idempotency-key': `concurrent-${i}-${timestamp}`,
          ...crmOwnerHeaders
        },
        data: {
          action: 'appointment.save',
          patient: '2d751110-3ffb-4a33-97b0-6f449c7d2749',
          worker: slotWorker,
          serviceIds: ['23006090'],
          date: slot.date,
          start: slot.start
        }
      });
    });

    const responses = await Promise.all(reqs);
    const statuses = responses.map(r => r.status());
    const successes = statuses.filter(s => s === 200).length;
    const conflicts = statuses.filter(s => s === 409).length;

    expect(successes).toBe(1);
    expect(conflicts).toBe(2);

    saveEvidence('E2E-FLOW-08', 'Multi-user concurrent booking on same slot',
      statuses.map((s, idx) => ({ clientIndex: idx + 1, status: s })),
      [
        { name: 'ExactOneSucceeded', passed: successes === 1, details: `Success count: ${successes}` },
        { name: 'RemainingRejectedWith409', passed: conflicts === 2, details: `Conflict count: ${conflicts}` }
      ],
      { date: slot.date, start: slot.start, worker: slotWorker, successes, conflicts }, 'PASS');
  });

});
