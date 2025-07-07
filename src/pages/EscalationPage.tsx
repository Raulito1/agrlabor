import React, { useMemo } from 'react';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { useGetAgedReceivableDetailQuery } from '../services/accountingApi';
import { AgGridReact } from 'ag-grid-react';
import { agGridColumns } from '../utils/agGridColumns';
import type { ColDef } from 'ag-grid-community';

const EscalationPage: React.FC = () => {
    // Fetch all invoice entries
    const {
        data: rows = [],
        isLoading,
        error,
    } = useGetAgedReceivableDetailQuery({
        realmId: '1386066315',
        reportDate: '2025-06-30',
        startDueDate: '2025-01-01',
        endDueDate: '2025-06-30',
    });

    // Helper to parse MM/DD/YY strings into Date
    const parseDueDate = (value: string) => {
        const parts = value.split('/');
        if (parts.length === 3) {
            const [m, d, yRaw] = parts.map((p) => parseInt(p, 10));
            const y = yRaw;
            return new Date(y, m - 1, d);
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

    // Metrics for 46–90 day bucket
    const bucketCount = filteredRows46To90.length;
    const bucketBalance = filteredRows46To90.reduce(
        (sum, r) => sum + (Number.isFinite(r.openBalance) ? r.openBalance : 0),
        0
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    // Compute dynamic metrics
    const totalInvoices = rows.length;
    const outstandingBalance = rows.reduce(
        (sum, r) => sum + (Number.isFinite(r.openBalance) ? r.openBalance : 0),
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
                        rowData={filteredRows46To90}
                        columnDefs={agGridColumns as ColDef[]}
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
                    />
                </div>
            </div>
        </div>
    );
};

export default EscalationPage;
