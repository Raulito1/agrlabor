import React from 'react';
import { MetricCard } from '../features/dashboard/components/MetricCard';

// TODO: Replace these hardcoded values with real data from your API or state
const AccountingPage: React.FC = () => (
    <div>
        <h2 className="text-2xl font-bold mb-6">Accounting Overview</h2>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Total Invoices" value="128" />
            <MetricCard title="Total Payments" value="$42.7K" />
            <MetricCard title="Outstanding Balance" value="$9.3K" />
            <MetricCard title="Overdue Invoices" value="5" />
        </div>

        {/* Placeholder for detailed tables, charts, or other components */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600">
                Detailed accounting tables and charts will appear here.
            </p>
        </div>
    </div>
);

export default AccountingPage;
