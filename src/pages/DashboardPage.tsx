import React from 'react';
import { MetricCard } from '../features/dashboard/components/MetricCard';
import { FilterButton } from '../features/dashboard/components/Filter/FilterButton';
import { AgingChart } from '../features/dashboard/components/AgingChart';
import { TrendChart } from '../features/dashboard/components/TrendChart';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ChevronDown } from 'lucide-react';

import { mockData } from '../utils/mockData';
import { agGridColumns } from '../utils/agGridColumns';

const DashboardPage: React.FC = () => (
    <div>
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <MetricCard title="Total AR" value="$3.4M" />
            <MetricCard title="Past-Due" value="$342K" />
            <MetricCard title="Avg DSO" value="41" />
            <MetricCard title="% Collected L30d" value="92%" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Aging Bar
                </h3>
                <AgingChart
                    data={[
                        { label: '0-30', value: 12000 },
                        { label: '31-60', value: 5400 },
                        { label: '61-90', value: 3100 },
                        { label: '91+', value: 800 },
                    ]}
                    height={240}
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Trend Analysis
                </h3>
                <TrendChart
                    data={[
                        { date: '2025-06-01', value: 1200 },
                        { date: '2025-06-08', value: 1800 },
                        { date: '2025-06-15', value: 1500 },
                        { date: '2025-06-22', value: 2300 },
                        { date: '2025-06-29', value: 2000 },
                    ]}
                    height={240}
                    area
                />
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap gap-3">
                <FilterButton active label="All Buckets" onClick={() => {}} />
                <FilterButton
                    label={
                        <span className="flex items-center">
                            Owner <ChevronDown className="ml-1 h-4 w-4" />
                        </span>
                    }
                    onClick={() => {}}
                />
                <FilterButton label="Region" onClick={() => {}} />
                <FilterButton label="Customer Group" onClick={() => {}} />
                <FilterButton
                    label={
                        <span className="flex items-center">
                            Aging Range <ChevronDown className="ml-1 h-4 w-4" />
                        </span>
                    }
                    onClick={() => {}}
                />
            </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div
                className="ag-theme-alpine"
                style={{ width: '100%', minHeight: 350 }}
            >
                <AgGridReact
                    rowData={mockData}
                    columnDefs={agGridColumns}
                    domLayout="autoHeight"
                    suppressRowClickSelection
                    pagination
                    paginationPageSize={10}
                />
            </div>
        </div>
    </div>
);

export default DashboardPage;
