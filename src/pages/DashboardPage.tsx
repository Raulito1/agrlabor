import React, { useState } from 'react';

import { MetricCard } from '../features/dashboard/components/MetricCard';
import { FilterButton } from '../features/dashboard/components/Filter/FilterButton';
import { AgingChart } from '../features/dashboard/components/AgingChart';
import { TrendChart } from '../features/dashboard/components/TrendChart';
import { AgGridReact } from 'ag-grid-react';
import { useGetAgedReceivableDetailQuery } from '../services/accountingApi';

import { agGridColumns } from '../utils/agGridColumns';
import type { ColDef } from 'ag-grid-community';

const DashboardPage: React.FC = () => {
    // Move useState hooks up here to ensure they're always called
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(
        null
    );

    // Fetch aged receivable detail via RTK Query
    const {
        data: rows = [],
        error,
        isLoading,
    } = useGetAgedReceivableDetailQuery();

    // Normalize raw API data into our expected fields
    const normalizedRows = rows.map((r: any) => ({
        id: r.id,
        customer: r.customerFullName || '',
        dueDate: r.dueDate || '',
        openBalance: typeof r.openBalance === 'string'
            ? parseFloat(r.openBalance.replace(/,/g, ''))
            : Number(r.openBalance) || 0,
    }));

    console.log('[DashboardPage] Query state:', {
        rowsCount: rows.length,
        sampleRows: normalizedRows.slice(0, 5),
        isLoading,
        error,
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    // Utility to parse dates like "3/2/23" or ISO strings
    const parseDueDate = (value: string) => {
        if (!value) return new Date(NaN);
        const parts = value.split('/');
        if (parts.length === 3) {
            const [month, day, yearRaw] = parts.map((p) => parseInt(p, 10));
            let year = yearRaw;
            if (year < 100) year += 2000;
            return new Date(year, month - 1, day);
        }
        const d = new Date(value);
        return d;
    };
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Compute dynamic metrics with proper parsing and filtering
    const today = new Date();
    const parsedRows = normalizedRows.map((r) => ({
        ...r,
        dueDateObj: parseDueDate(r.dueDate),
        balanceNum: Number.isFinite(r.openBalance) ? r.openBalance : 0,
    }));
    console.log(
        '[DashboardPage] parsedRows count:',
        parsedRows.length,
        'sample:',
        parsedRows.slice(0, 5)
    );
    const validRows = parsedRows.filter((r) => !isNaN(r.dueDateObj.getTime()));
    console.log(
        '[DashboardPage] validRows count:',
        validRows.length,
        'sample:',
        validRows.slice(0, 5)
    );

    const totalAR = parsedRows.reduce((sum, r) => sum + r.balanceNum, 0);
    const pastDue = parsedRows
        .filter((r) => r.dueDateObj < today)
        .reduce((sum, r) => sum + r.balanceNum, 0);

    const avgDSO =
        validRows.length > 0
            ? Math.round(
                  validRows.reduce(
                      (sum, r) =>
                          sum +
                          (today.getTime() - r.dueDateObj.getTime()) /
                              MS_PER_DAY,
                      0
                  ) / validRows.length
              )
            : 0;

    const pctCollectedL30 =
        totalAR > 0 ? Math.round(((totalAR - pastDue) / totalAR) * 100) : 0;

    console.log('[DashboardPage] Metrics:', {
        totalAR,
        pastDue,
        avgDSO,
        pctCollectedL30,
    });

    // Compute aging buckets for the chart
    const agingBuckets = [
        { label: '0-30', value: 0 },
        { label: '31-60', value: 0 },
        { label: '61-90', value: 0 },
        { label: '91+', value: 0 },
    ];
    validRows.forEach((r) => {
        const diffDays = Math.floor(
            (today.getTime() - r.dueDateObj.getTime()) / MS_PER_DAY
        );
        if (diffDays <= 30) agingBuckets[0].value += r.balanceNum;
        else if (diffDays <= 60) agingBuckets[1].value += r.balanceNum;
        else if (diffDays <= 90) agingBuckets[2].value += r.balanceNum;
        else agingBuckets[3].value += r.balanceNum;
    });
    console.log('[DashboardPage] agingBuckets:', agingBuckets);

    // Compute trend data: sum openBalance by dueDate
    const trendMap: Record<string, number> = {};
    validRows.forEach((r) => {
        // Format date as YYYY-MM-DD for the chart
        const isoDate = r.dueDateObj.toISOString().split('T')[0];
        trendMap[isoDate] = (trendMap[isoDate] || 0) + r.balanceNum;
    });
    // Convert to array sorted by date
    const trendData = Object.entries(trendMap)
        .map(([date, value]) => ({ date, value }))
        .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
    console.log('[DashboardPage] trendData sample:', trendData.slice(0, 5));

    // Setup filters
    const buckets = ['0-30', '31-60', '61-90', '91+'];
    // Unique customer list
    const customerOptions = Array.from(
        new Set(normalizedRows.map((r) => r.customer))
    ).sort();
    // Filtered rows for grid
    const filteredRows = validRows.filter((r) => {
        // Bucket filter
        let passBucket = true;
        if (selectedBucket) {
            const diffDays = Math.floor(
                (today.getTime() - r.dueDateObj.getTime()) / MS_PER_DAY
            );
            let bucket = '';
            if (diffDays <= 30) bucket = '0-30';
            else if (diffDays <= 60) bucket = '31-60';
            else if (diffDays <= 90) bucket = '61-90';
            else bucket = '91+';
            passBucket = bucket === selectedBucket;
        }
        // Customer filter
        const passCustomer = selectedCustomer
            ? r.customer === selectedCustomer
            : true;
        return passBucket && passCustomer;
    });
    console.log(
        '[DashboardPage] filteredRows count:',
        filteredRows.length,
        'sample:',
        filteredRows.slice(0, 5)
    );

    // Format for display
    const fmtCurrency = (val: number) =>
        `$${val.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    const fmtPercent = (val: number) => `${val}%`;

    return (
        <div>
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <MetricCard title="Total AR" value={fmtCurrency(totalAR)} />
                <MetricCard title="Past-Due" value={fmtCurrency(pastDue)} />
                <MetricCard title="Avg DSO" value={String(avgDSO)} />
                <MetricCard
                    title="% Collected L30d"
                    value={fmtPercent(pctCollectedL30)}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Aging Bar
                    </h3>
                    <AgingChart data={agingBuckets} height={240} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Trend Analysis
                    </h3>
                    <TrendChart data={trendData} height={240} area />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <FilterButton
                        active={!selectedBucket}
                        label="All Buckets"
                        onClick={() => setSelectedBucket(null)}
                    />
                    {buckets.map((b) => (
                        <FilterButton
                            key={b}
                            active={selectedBucket === b}
                            label={b}
                            onClick={() => setSelectedBucket(b)}
                        />
                    ))}
                    <select
                        className="ml-4 p-2 border rounded"
                        value={selectedCustomer || ''}
                        onChange={(e) =>
                            setSelectedCustomer(e.target.value || null)
                        }
                        aria-label="Filter by customer"
                    >
                        <option key="all-customers" value="">All Customers</option>
                        {customerOptions.map((c) => (
                            <option key={`customer-${c}`} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div
                    className="ag-theme-alpine"
                    style={{ width: '100%', minHeight: 350 }}
                >
                    <AgGridReact
                        columnDefs={agGridColumns as ColDef[]}
                        defaultColDef={{
                            flex: 1,
                            minWidth: 100,
                            resizable: true,
                        }}
                        domLayout="autoHeight"
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

export default DashboardPage;
