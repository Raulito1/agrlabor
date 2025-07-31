import React from 'react';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { useGetAgedReceivableDetailQuery } from '../services/accountingApi';
import { AgGridReact } from 'ag-grid-react';
import { agGridColumns } from '../utils/agGridColumns';
import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { accountingApi } from '../services/accountingApi';
import { useUpdateAgedReceivableDetailMutation } from '../services/accountingApi';
import type { ColDef } from 'ag-grid-community';
import { useCallback } from 'react';

const SalesPage: React.FC = () => {
    // Fetch all invoice entries
    const {
        data: rows = [],
        isLoading,
        error,
    } = useGetAgedReceivableDetailQuery();
    const [updateAgedReceivableDetail] = useUpdateAgedReceivableDetailMutation();
    const dispatch = useDispatch();
    const onCellValueChanged = useCallback(
      async (params) => {
        const { id, ...rest } = params.data;
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
    // Editable columns for ag-grid
    const editableCols: ColDef[] = [
      {
        headerName: 'Action Taken',
        field: 'action_taken',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['CSM/AE Email sent', 'Payment plan proposed', 'Payment plan established', 'Client unresponsive', 'Escalated to management'],
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

    // Compute 31–45 day bucket
    const filteredRows31To45 = useMemo(() => {
        const today = new Date();
        return rows.filter((r) => {
            const due = parseDueDate(r.dueDate);
            const diffDays = Math.floor(
                (today.getTime() - due.getTime()) / MS_PER_DAY
            );
            return diffDays >= 31 && diffDays <= 45;
        });
    }, [rows, MS_PER_DAY]);
    // Clone row objects for mutability for AG Grid
    const gridRows = useMemo(
      () => filteredRows31To45.map(r => ({ ...r })),
      [filteredRows31To45]
    );
    console.log(
        '[SalesPage] filteredRows31To45:',
        filteredRows31To45.length,
        'rows',
        filteredRows31To45.slice(0, 5)
    );
    // Debug: log sample diffDays for first 10 rows
    const todayDebug = new Date();
    const sampleDiffs = rows.slice(0, 10).map((r) => {
        const due = parseDueDate(r.dueDate);
        const diffDays = Math.floor(
            (todayDebug.getTime() - due.getTime()) / MS_PER_DAY
        );
        return { dueDate: r.dueDate, diffDays };
    });
    console.log('[SalesPage] sample diffDays:', sampleDiffs);

    // Metrics for 31–45 day bucket
    const bucketCount = filteredRows31To45.length;
    const bucketBalance = filteredRows31To45.reduce(
        (sum, r) => {
            const val = typeof r.openBalance === 'string'
                ? parseFloat(r.openBalance.replace(/,/g, '')) || 0
                : r.openBalance;
            return sum + val;
        },
        0
    );
    console.log('[SalesPage] bucket metrics:', {
        bucketCount,
        bucketBalance,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    // Compute dynamic metrics
    const totalInvoices = rows.length;
    const outstandingBalance = rows.reduce(
        (sum, r) => {
            const val = typeof r.openBalance === 'string'
                ? parseFloat(r.openBalance.replace(/,/g, '')) || 0
                : r.openBalance;
            return sum + val;
        },
        0
    );

    const fmtCurrency = (val: number) =>
        `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtPercent = (val: number) => `${val.toFixed(2)}%`;

    // Percentage of invoices in 31–45d bucket relative to total invoices
    const pctInvoices31To45 =
        totalInvoices > 0 ? (bucketCount / totalInvoices) * 100 : 0;

    // Percentage of bucket balance relative to total outstanding balance
    const pctBalance31To45 =
        outstandingBalance > 0 ? (bucketBalance / outstandingBalance) * 100 : 0;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Accounting Overview</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="% Invoices (31–45d)"
                    value={fmtPercent(pctInvoices31To45)}
                />
                <MetricCard
                    title="Balance (31–45d)"
                    value={fmtCurrency(bucketBalance)}
                />
                <MetricCard
                    title="% Balance (31–45d)"
                    value={fmtPercent(pctBalance31To45)}
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
                        getRowId={(params) => params.data.id}
                        immutableData={true}
                        deltaRowDataMode={true}
                        onCellValueChanged={onCellValueChanged}
                    />
                </div>
            </div>
        </div>
    );
};

export default SalesPage;
