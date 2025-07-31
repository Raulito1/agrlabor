import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { accountingApi } from '../services/accountingApi';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { useGetAgedReceivableDetailQuery } from '../services/accountingApi';
import { AgGridReact } from 'ag-grid-react';
import { agGridColumns } from '../utils/agGridColumns';
import type { ColDef } from 'ag-grid-community';
import { useUpdateAgedReceivableDetailMutation } from '../services/accountingApi';
import type { AppDispatch } from '@/app/store';

const AccountingPage: React.FC = () => {
    const {
        data: rows = [],
        isLoading,
        error,
    } = useGetAgedReceivableDetailQuery();

    // Parse numeric balance and unify field names
    const records = useMemo(() =>
      rows.map((r) => ({
        ...r,
        openBalanceNum:
          typeof r.openBalance === 'string'
            ? parseFloat(r.openBalance.replace(/,/g, '')) || 0
            : Number(r.openBalance) || 0,
      })),
      [rows]
    );

    // Helper to parse MM/DD/YY strings into Date, mapping 2-digit years to 2000s
    const parseDueDate = (value?: string) => {
        if (!value) return new Date(NaN);
        const parts = value.split('/');
        if (parts.length === 3) {
            const [m, d, yRaw] = parts.map((p) => parseInt(p, 10));
            // Handle two-digit years (e.g., '23' => 2023)
            const year = yRaw < 100 ? 2000 + yRaw : yRaw;
            return new Date(year, m - 1, d);
        }
        return new Date(value);
    };
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Compute 21–30 day bucket
    const filteredRows21To30 = useMemo(() => {
        const today = new Date();
        return records.filter((r) => {
            const due = parseDueDate(r.dueDate);
            const diffDays = Math.floor(
                (today.getTime() - due.getTime()) / MS_PER_DAY
            );
            return diffDays >= 21 && diffDays <= 30;
        });
    }, [records]);
    console.log(
        '[AccountingPage] filteredRows21To30:',
        filteredRows21To30.length,
        'rows',
        filteredRows21To30.slice(0, 5)
    );

    // Debug: log sample diffDays to understand bucket distribution
    const todayDebug = new Date();
    const sampleDiffs = records.slice(0, 10).map((r) => {
        const due = parseDueDate(r.dueDate);
        const diffDays = Math.floor(
            (todayDebug.getTime() - due.getTime()) / MS_PER_DAY
        );
        return { dueDate: r.dueDate, diffDays };
    });
    console.log('[AccountingPage] sample diffDays:', sampleDiffs);

    // Metrics for 21–30 day bucket
    const bucketCount = filteredRows21To30.length;
    const bucketBalance = filteredRows21To30.reduce(
        (sum, r) => sum + (Number.isFinite(r.openBalanceNum) ? r.openBalanceNum : 0),
        0
    );

    // Prepare grid rows from filtered subset, preserving API fields
    const gridRows = useMemo(
      () =>
        filteredRows21To30.map((r) => ({
          id: r.id,
          date: r.date,
          transactionType: r.transactionType,
          num: r.num,
          customerFullName: r.customerFullName,
          dueDate: r.dueDate,
          amount: r.amount,
          openBalance: r.openBalance,
          action_taken: r.action_taken,
          slack_updated: r.slack_updated,
          follow_up: r.follow_up,
          escalation: r.escalation,
        })),
      [filteredRows21To30]
    );
    console.log('[AccountingPage] gridRows prepared:', gridRows.length, 'rows');

    // RTK Query mutation for persisting updates
    const [updateAgedReceivableDetail] = useUpdateAgedReceivableDetailMutation();
    const dispatch = useDispatch<AppDispatch>();
    const onCellValueChanged = useCallback(
      async (params) => {
        const { id, ...rest } = params.data;
        // Optimistically update the RTK Query cache for the list
        dispatch(
          accountingApi.util.updateQueryData(
            'getAgedReceivableDetail',
            undefined,
            (draft) => {
              const idx = draft.findIndex((r) => r.id === id);
              if (idx !== -1) Object.assign(draft[idx], rest);
            }
          )
        );
        try {
          await updateAgedReceivableDetail({ id, ...rest }).unwrap();
        } catch (err) {
          console.error('Failed to update record', id, err);
        }
      },
      [dispatch, updateAgedReceivableDetail]
    );
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    // Compute dynamic metrics
    const totalInvoices = records.length;
    const outstandingBalance = records.reduce(
      (sum, r) => sum + r.openBalanceNum,
      0
    );
    const fmtCurrency = (val: number) =>
        `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtPercent = (val: number) => `${val.toFixed(2)}%`;

    // Percentage of invoices in 21–30d bucket relative to total invoices
    const pctInvoicesOfTotal =
        totalInvoices > 0 ? (bucketCount / totalInvoices) * 100 : 0;

    // Percentage of bucket balance relative to total outstanding balance
    const pctBalanceOfTotal =
        outstandingBalance > 0 ? (bucketBalance / outstandingBalance) * 100 : 0;

    // Additional editable columns
    const editableCols: ColDef[] = [
        // Dropdown column 1
        {
            headerName: 'Action Taken',
            field: 'action_taken',
            editable: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Accounting Email Sent', 'Payment Promised', 'Escalated to Sales', 'Payment Plan proposed'],
            },
        },
        {
            headerName: 'Slack Updated',
            field: 'slack_updated',
            editable: true,
            cellEditor: 'agCheckboxCellEditor',
            cellRenderer: 'agCheckboxCellRenderer',
        },
        {
            headerName: 'Follow Up',
            field: 'follow_up',
            editable: true,
            cellEditor: 'agCheckboxCellEditor',
            cellRenderer: 'agCheckboxCellRenderer',
        },
        {
            headerName: 'Escalation',
            field: 'escalation',
            editable: true,
            cellEditor: 'agCheckboxCellEditor',
            cellRenderer: 'agCheckboxCellRenderer',
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Accounting Overview</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="% Invoices (21–30d)"
                    value={fmtPercent(pctInvoicesOfTotal)}
                />
                <MetricCard
                    title="Balance (21–30d)"
                    value={fmtCurrency(bucketBalance)}
                />
                <MetricCard
                    title="% Balance (21–30d)"
                    value={fmtPercent(pctBalanceOfTotal)}
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div
                    className="ag-theme-alpine"
                    style={{ width: '100%', height: 400 }}
                >
                    <AgGridReact
                        rowData={gridRows}
                        columnDefs={[
                            ...(agGridColumns as ColDef[]),
                            ...editableCols,
                        ]}
                        defaultColDef={{
                            flex: 1,
                            minWidth: 100,
                            resizable: true,
                        }}
                        pagination
                        paginationPageSize={10}
                        paginationPageSizeSelector={false}
                        gridOptions={{
                            theme: 'legacy',
                        }}
                        getRowId={(params) => params.data.id}
                        onCellValueChanged={onCellValueChanged}
                    />
                </div>
            </div>
        </div>
    );
};

export default AccountingPage;
