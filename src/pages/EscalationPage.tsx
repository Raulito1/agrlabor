import React, { useMemo, useCallback } from 'react';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { useGetAgedReceivableDetailQuery } from '../services/accountingApi';
import { AgGridReact } from 'ag-grid-react';
import { agGridColumns } from '../utils/agGridColumns';
import { useDispatch } from 'react-redux';
import { accountingApi } from '../services/accountingApi';
import { useUpdateAgedReceivableDetailMutation } from '../services/accountingApi';
import type { ColDef } from 'ag-grid-community';
import type { AppDispatch } from '@/app/store';

const EscalationPage: React.FC = () => {
    // Fetch all invoice entries
    const {
        data: rows = [],
        isLoading,
        error,
    } = useGetAgedReceivableDetailQuery();

    const [updateAgedReceivableDetail] = useUpdateAgedReceivableDetailMutation();
    const dispatch = useDispatch<AppDispatch>();
    const onCellValueChanged = useCallback(async (params) => {
      const { id, ...rest } = params.data;
      // Optimistic update
      dispatch(
        accountingApi.util.updateQueryData(
          'getAgedReceivableDetail',
          undefined,
          draft => {
            const idx = draft.findIndex(r => r.id === id);
            if (idx !== -1) Object.assign(draft[idx], rest);
          }
        )
      );
      try {
        await updateAgedReceivableDetail({ id, ...rest }).unwrap();
      } catch (err) {
        console.error('Failed to update record', id, err);
      }
    }, [dispatch, updateAgedReceivableDetail]);

    // Helper to parse MM/DD/YY strings into Date
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

    // Compute 46–90 day bucket
    const filteredRows46To90 = useMemo(() => {
        const today = new Date();
        return rows.filter((r) => {
            const due = parseDueDate(r.dueDate);
            const diffDays = Math.floor(
                (today.getTime() - due.getTime()) / MS_PER_DAY
            );
            return diffDays >= 46 && diffDays <= 90;
        });
    }, [rows, MS_PER_DAY]);

    // Clone for AG Grid mutability
    const gridRows = useMemo(
      () => filteredRows46To90.map(r => ({ ...r })),
      [filteredRows46To90]
    );

    console.log(
        '[EscalationPage] filteredRows46To90:',
        filteredRows46To90.length,
        'rows',
        filteredRows46To90.slice(0, 5)
    );
    // Debug: show sample diffDays for first 10 rows
    const todayDebug = new Date();
    const sampleDiffs = rows.slice(0, 10).map((r) => {
        const due = parseDueDate(r.dueDate);
        const diffDays = Math.floor(
            (todayDebug.getTime() - due.getTime()) / MS_PER_DAY
        );
        return { dueDate: r.dueDate, diffDays };
    });
    console.log('[EscalationPage] sample diffDays:', sampleDiffs);

    // Metrics for 46–90 day bucket
    const bucketCount = filteredRows46To90.length;
    const bucketBalance = filteredRows46To90.reduce(
        (sum, r) =>
            sum +
            (typeof r.openBalance === 'string'
                ? parseFloat(r.openBalance.replace(/,/g, '')) || 0
                : r.openBalance),
        0
    );
    console.log('[EscalationPage] bucket metrics:', {
        bucketCount,
        bucketBalance,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    // Compute dynamic metrics
    const totalInvoices = rows.length;
    const outstandingBalance = rows.reduce(
        (sum, r) =>
            sum +
            (typeof r.openBalance === 'string'
                ? parseFloat(r.openBalance.replace(/,/g, '')) || 0
                : r.openBalance),
        0
    );

    const fmtCurrency = (val: number) =>
        `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtPercent = (val: number) => `${val.toFixed(2)}%`;

    // Percentage of invoices in 46–90d bucket relative to total invoices
    const pctInvoices46To90 =
        totalInvoices > 0 ? (bucketCount / totalInvoices) * 100 : 0;

    // Percentage of bucket balance relative to total outstanding balance
    const pctBalance46To90 =
        outstandingBalance > 0 ? (bucketBalance / outstandingBalance) * 100 : 0;

    const editableCols: ColDef[] = [
      {
        headerName: 'Action Taken',
        field: 'action_taken',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Management reach out', 'Demand letter needed',  'Account suspension', 'Payment plan established'],
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
        headerName: 'Escalation Flag',
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
                    title="% Invoices (46–90d)"
                    value={fmtPercent(pctInvoices46To90)}
                />
                <MetricCard
                    title="Balance (46–90d)"
                    value={fmtCurrency(bucketBalance)}
                />
                <MetricCard
                    title="% Balance (46–90d)"
                    value={fmtPercent(pctBalance46To90)}
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div
                    className="ag-theme-alpine"
                    style={{ width: '100%', height: 400 }}
                >
                    <AgGridReact
                        rowData={gridRows}
                        columnDefs={[(agGridColumns as ColDef[]), ...editableCols].flat()}
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
                        getRowId={params => params.data.id}
                        onCellValueChanged={onCellValueChanged}
                    />
                </div>
            </div>
        </div>
    );
};

export default EscalationPage;
