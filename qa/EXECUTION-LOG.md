# PODOLOGY — ЖУРНАЛ ИСПОЛНЕНИЯ ТЕСТОВ (EXECUTION-LOG.MD)

**Дата актуализации:** 2026-11-08T22:45:00+02:00  
**Методология:** Zero-Trust QA (Никаких искусственных PASS, полный AST-контроль assertions)  
**Общее число подтвержденных запусков:** 240 (232 UI-элемента + 8 E2E бизнес-процессов)  

---

## 1. Сводные партии выполнения (Batches)

| Партия | Исполняемый сьют | Количество тестов | PASS | FAIL | Фактическая команда запуска | Доказательства |
|---|---|---|---|---|---|---|
| **Batch 1 (CRM Owner 1)** | `qa/v2-tests/v2-crm-batch-1.spec.js` | 26 | 20 | 6 | `npx playwright test qa/v2-tests/v2-crm-batch-1.spec.js` | `evidence/v2-executions/V2-UI-OWNER-001..026.json` |
| **Batch 2 (CRM Owner 2 + Manager 1)** | `qa/v2-tests/v2-crm-batch-2.spec.js` | 26 | 17 | 9 | `npx playwright test qa/v2-tests/v2-crm-batch-2.spec.js` | `evidence/v2-executions/V2-UI-OWNER-027..MANAGER-052.json` |
| **Batch 3 (CRM Manager 2 + Admin 1)** | `qa/v2-tests/v2-crm-batch-3.spec.js` | 26 | 20 | 6 | `npx playwright test qa/v2-tests/v2-crm-batch-3.spec.js` | `evidence/v2-executions/V2-UI-MANAGER-053..ADMIN-078.json` |
| **Batch 4 (CRM Admin 2 + Specialist)** | `qa/v2-tests/v2-crm-batch-4.spec.js` | 26 | 16 | 10 | `npx playwright test qa/v2-tests/v2-crm-batch-4.spec.js` | `evidence/v2-executions/V2-UI-ADMIN-079..SPECIALIST-104.json` |
| **Batch 5 (Client Portal 1)** | `qa/v2-tests/v2-client-batch-1.spec.js` | 32 | 10 | 22 | `npx playwright test qa/v2-tests/v2-client-batch-1.spec.js` | `evidence/v2-executions/V2-UI-CLIENT-001..032.json` |
| **Batch 6 (Client Portal 2)** | `qa/v2-tests/v2-client-batch-2.spec.js` | 32 | 5 | 27 | `npx playwright test qa/v2-tests/v2-client-batch-2.spec.js` | `evidence/v2-executions/V2-UI-CLIENT-033..064.json` |
| **Batch 7 (Client Portal 3)** | `qa/v2-tests/v2-client-batch-3.spec.js` | 32 | 6 | 26 | `npx playwright test qa/v2-tests/v2-client-batch-3.spec.js` | `evidence/v2-executions/V2-UI-CLIENT-065..096.json` |
| **Batch 8 (Client Portal 4)** | `qa/v2-tests/v2-client-batch-4.spec.js` | 32 | 8 | 24 | `npx playwright test qa/v2-tests/v2-client-batch-4.spec.js` | `evidence/v2-executions/V2-UI-CLIENT-097..128.json` |
| **Batch 9 (E2E Business Flows)** | `qa/tests/e2e-business-flows.spec.js` | 8 | 8 | 0 | `npx playwright test qa/tests/e2e-business-flows.spec.js` | `evidence/raw-executions/E2E-FLOW-01..08_DEEP_RUN.json` |
| **Batch 10 (Load Testing k6)** | `load-raw/raw-k6-50vu.json` | 1 (50 VU) | 1 | 0 | `k6 run ...` | `load-raw/raw-k6-50vu.json` (2114 точек метрик) |

---

## 2. Протокол детализации партий

### Партия 9: Сквозные бизнес-сценарии (E2E)
- `E2E-FLOW-01`: Запись через портал $\rightarrow$ фиксация в расписании CRM (**PASS**, 725 мс)
- `E2E-FLOW-02`: Перенос визита администратором в CRM $\rightarrow$ отображение нового времени в портале клиента (**PASS**, 735 мс)
- `E2E-FLOW-03`: Отмена визита в портале $\rightarrow$ освобождение слота в CRM (**PASS**, 805 мс)
- `E2E-FLOW-04`: Проведение визита специалистом $\rightarrow$ закрытие визита и расчет дохода (**PASS**, 1000 мс)
- `E2E-FLOW-05`: Приемка поставки администратором $\rightarrow$ увеличение складского остатка (**PASS**, 483 мс)
- `E2E-FLOW-06`: Ограничение прав роли specialist на создание выплат (403 Forbidden) (**PASS**, 428 мс)
- `E2E-FLOW-07`: Частичная оплата (наличные + карта) $\rightarrow$ сведение баланса до нуля (**PASS**, 1400 мс)
- `E2E-FLOW-08`: Конкурентная запись 3 клиентов на 1 слот $\rightarrow$ 1 успех (200), 2 конфликта (409) (**PASS**, 552 мс)
