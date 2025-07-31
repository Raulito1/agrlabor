import React, { useMemo, useCallback } from 'react';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { useGetAgedReceivableDetailQuery } from '../services/accountingApi';
import { AgGridReact } from 'ag-grid-react';
import { agGridColumns } from '../utils/agGridColumns';
import { useDispatch } from 'react-redux';
import { accountingApi } from '../services/accountingApi';
import { useUpdateAgedReceivableDetailMutation } from '../services/accountingApi';
import type { ColDef } from 'ag-grid-community';

const DemandLetterPage: React.FC = () => {
    // Fetch all invoice entries
    const {
        data: rows = [],
        isLoading,
        error,
    } = useGetAgedReceivableDetailQuery();

    const [updateAgedReceivableDetail] = useUpdateAgedReceivableDetailMutation();
    const dispatch = useDispatch();
    const onCellValueChanged = useCallback(async (params) => {
      const { id, ...rest } = params.data;
      dispatch(
        accountingApi.util.updateQueryData('getAgedReceivableDetail', undefined, draft => {
          const idx = draft.findIndex(r => r.id === id);
          if (idx !== -1) Object.assign(draft[idx], rest);
        })
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
            const y = yRaw;
            return new Date(y, m - 1, d);
        }
        return new Date(value);
    };
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Compute 91+ day bucket
    const filteredRows91Plus = useMemo(() => {
        const today = new Date();
        return rows.filter((r) => {
            const due = parseDueDate(r.dueDate);
            const diffDays = Math.floor(
                (today.getTime() - due.getTime()) / MS_PER_DAY
            );
            return diffDays >= 91;
        });
    }, [rows]);

    const gridRows = useMemo(() => filteredRows91Plus.map(r => ({ ...r })), [filteredRows91Plus]);

    // Metrics for 91+ day bucket
    const bucketCount = filteredRows91Plus.length;
    const bucketBalance = filteredRows91Plus.reduce(
        (sum, r) => {
          const val = typeof r.openBalance === 'string'
            ? parseFloat(r.openBalance.replace(/,/g, '')) || 0
            : r.openBalance;
          return sum + val;
        },
        0
    );

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

    // Percentage of invoices in 91+ bucket relative to total invoices
    const pctInvoices91Plus =
        totalInvoices > 0 ? (bucketCount / totalInvoices) * 100 : 0;

    // Percentage of bucket balance relative to total outstanding balance
    const pctBalance91Plus =
        outstandingBalance > 0 ? (bucketBalance / outstandingBalance) * 100 : 0;

    const editableCols: ColDef[] = [
      {
        headerName: 'Action Taken',
        field: 'action_taken',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Demand letter sent', 'Demand letter drafted', 'Follow up with legal'],
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
                    title="% Invoices (91+)"
                    value={fmtPercent(pctInvoices91Plus)}
                />
                <MetricCard
                    title="Balance (91+)"
                    value={fmtCurrency(bucketBalance)}
                />
                <MetricCard
                    title="% Balance (91+)"
                    value={fmtPercent(pctBalance91Plus)}
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
                        immutableData={true}
                        deltaRowDataMode={true}
                        onCellValueChanged={onCellValueChanged}
                    />
                </div>
            </div>
        </div>
    );
};

export default DemandLetterPage;
