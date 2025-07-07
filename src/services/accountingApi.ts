import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AgedReceivableDetailParams {
    realmId: string;
    reportDate: string; // YYYY-MM-DD
    startDueDate: string; // YYYY-MM-DD
    endDueDate: string; // YYYY-MM-DD
    columns?: string; // comma-separated list of fields, e.g. "due_date,cust_name"
}

export interface AgedReceivableDetailResponse {
    // QuickBooks report payload; replace `any` with a proper shape if desired
    [key: string]: any;
}

export const accountingApi = createApi({
    reducerPath: 'accountingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/accounting', // your server proxy base path
    }),
    endpoints: (builder) => ({
        getAgedReceivableDetail: builder.query<
            { customer: string; dueDate: string; openBalance: number }[],
            AgedReceivableDetailParams
        >({
            query: ({
                realmId,
                reportDate,
                startDueDate,
                endDueDate,
                columns,
            }) => {
                const params = new URLSearchParams({
                    report_date: reportDate,
                    start_due_date: startDueDate,
                    end_due_date: endDueDate,
                    ...(columns ? { columns } : {}),
                });
                return {
                    url: `/v3/company/${realmId}/reports/AgedReceivableDetail?${params.toString()}`,
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                };
            },
            transformResponse: (raw: AgedReceivableDetailResponse) => {
                // Skip first 3 rows and map into array of invoice entries
                return (raw.Rows?.Row ?? []).slice(3).map((row) => {
                    const customerRaw: string = row.ColData[0].value;
                    // Normalize name before colon
                    const customer = customerRaw.includes(':')
                        ? customerRaw.split(':')[0].trim()
                        : customerRaw.trim();
                    const dueDate = row.ColData[1].value;
                    const openBalance = parseFloat(
                        String(row.ColData[2].value).replace(/,/g, '')
                    );
                    return { customer, dueDate, openBalance };
                });
            },
        }),
    }),
});

export const { useGetAgedReceivableDetailQuery } = accountingApi;
