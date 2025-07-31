import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import supabase from '../supabaseClient';

export interface AgedReceivableDetailRecord {
  id: number;
  date: string;
  transactionType: string;
  num: string;
  customerFullName: string;
  dueDate: string;
  amount: string;
  openBalance: string;
  action_taken: string;
  slack_updated: boolean;
  follow_up: boolean;
  escalation: boolean;
}

export const accountingApi = createApi({
    reducerPath: 'accountingApi',
    baseQuery: fetchBaseQuery({
      baseUrl: `${supabase.supabaseUrl}/rest/v1`,
      prepareHeaders: (headers) => {
        headers.set('apikey', supabase.supabaseKey);
        headers.set('Authorization', `Bearer ${supabase.supabaseKey}`);
        return headers;
      },
    }),
    tagTypes: ['Accounts'],
    endpoints: (builder) => ({
        getAgedReceivableDetail: builder.query<
          AgedReceivableDetailRecord[],
          void
        >({
          query: () => ({
            url: 'accounts',
            params: { select: '*', order: 'id.asc' },
          }),
          transformResponse: (response: any[]) =>
            response.map((item) => ({
              id: Number(item.id),
              date: item.date,
              transactionType: item.transaction_type,
              num: item.num,
              customerFullName: item.customer_full_name,
              dueDate: item.due_date,
              amount: item.amount,
              openBalance: item.open_balance,
              action_taken: item.action_taken,
              slack_updated: item.slack_updated,
              follow_up: item.follow_up,
              escalation: item.escalation,
            })),
          providesTags: (result) =>
            result
              ? [
                  ...result.map(({ id }) => ({ type: 'Accounts' as const, id })),
                  { type: 'Accounts', id: 'LIST' },
                ]
              : [{ type: 'Accounts', id: 'LIST' }],
        }),
        updateAgedReceivableDetail: builder.mutation<
          AgedReceivableDetailRecord,
          Partial<AgedReceivableDetailRecord> & { id: number }
        >({
          queryFn: async ({ id, ...patch }, _queryApi, _extraOptions, fetchWithBQ) => {
            const { data, error } = await supabase
              .from('accounts')
              .update({
                date: patch.date,
                transaction_type: patch.transactionType,
                num: patch.num,
                customer_full_name: patch.customerFullName,
                due_date: patch.dueDate,
                amount: patch.amount,
                open_balance: patch.openBalance,
                action_taken: patch.action_taken,
                slack_updated: patch.slack_updated,
                follow_up: patch.follow_up,
                escalation: patch.escalation,
              })
              .eq('id', id)
              .single();
            if (error) {
              return { error };
            }
            return { data: data as AgedReceivableDetailRecord };
          },
          invalidatesTags: (result, error, { id }) => [
            { type: 'Accounts' as const, id },
          ],
        }),
    }),
});

export const {
  useGetAgedReceivableDetailQuery,
  useUpdateAgedReceivableDetailMutation,
} = accountingApi;
