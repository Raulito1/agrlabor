// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import agedReceivableDetail from './fixtures/agedReceivableDetail.json';

export const handlers = [
    http.get(
        '/api/accounting/v3/company/:realmId/reports/AgedReceivableDetail',
        () => {
            // Map raw CSV rows into QuickBooks Row/ColData shape
            const rows = agedReceivableDetail.map((r: Record<string, any>) => ({
                type: 'Data',
                ColData: [
                    { value: r['Customer full name'] },
                    { value: r['Due date'] },
                    { value: r['Open balance'] },
                ],
            }));
            // Return a mocked HTTP JSON response
            return HttpResponse.json(
                {
                    Header: {
                        ReportName: 'AgedReceivableDetail',
                        StartPeriod: '2025-01-01',
                        EndPeriod: '2025-06-30',
                        Time: new Date().toISOString(),
                        Currency: 'USD',
                        Option: [{ Name: 'NoReportData', Value: 'false' }],
                    },
                    Columns: {
                        Column: [
                            { ColTitle: 'Customer', ColType: 'String' },
                            { ColTitle: 'DueDate', ColType: 'Date' },
                            { ColTitle: 'OpenBalance', ColType: 'Money' },
                        ],
                    },
                    Rows: { Row: rows },
                },
                { status: 200 }
            );
        }
    ),
    // Allow all other GET requests (e.g. navigation) to bypass MSW
    http.get('*', (req) => {
        return req.passthrough();
    }),
];
