import {
    Search,
    Sun,
    Bell,
    User,
    BarChart3,
    Calculator,
    TrendingUp,
    FileText,
    Mail,
    Settings,
    ChevronDown,
} from 'lucide-react';

import { MetricCard } from './MetricCard';
import { FilterButton } from './Filter/FilterButton';
import { AgingChart } from './AgingChart';
import { TrendChart } from './TrendChart';
import { StageTag } from './StageTag';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

/* ------------------------------------------------------------------ */
/*                             Mock Data                              */
/* ------------------------------------------------------------------ */

interface TableRow {
    customer: string;
    invoice: string;
    hfid: string;
    amount: string;
    stage: string;
    nextAction: string;
    agingDays: number;
}

const mockData: TableRow[] = [
    {
        customer: 'Adams Ltd',
        invoice: 'H7732',
        hfid: 'HF15',
        amount: '$342K',
        stage: 'Current',
        nextAction: 'April 31',
        agingDays: 15,
    },
    {
        customer: 'Company',
        invoice: 'HF121',
        hfid: 'HF13',
        amount: '$400',
        stage: 'Current',
        nextAction: 'Stcb',
        agingDays: 20,
    },
    {
        customer: 'Johanson',
        invoice: 'HF842',
        hfid: 'E592',
        amount: '$372K',
        stage: '60+',
        nextAction: 'Jomson',
        agingDays: 75,
    },
    {
        customer: 'Williams',
        invoice: 'HF835',
        hfid: 'E258',
        amount: '$155.6',
        stage: 'Aug',
        nextAction: 'Smith',
        agingDays: 45,
    },
    {
        customer: 'Brown',
        invoice: 'H7822',
        hfid: 'E678',
        amount: '$02T',
        stage: 'May',
        nextAction: 'Brown',
        agingDays: 30,
    },
];

/* ------------------------------------------------------------------ */
/*                            Component                               */
/* ------------------------------------------------------------------ */

const Dashboard = () => {
    const stageCellRenderer = (params: any) => (
        <StageTag stage={params.value} />
    );

    // ag-Grid column definitions
    const agGridColumns = [
        {
            headerName: 'Customer',
            field: 'customer',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Invoice',
            field: 'invoice',
            sortable: true,
            filter: true,
        },
        { headerName: 'HFID', field: 'hfid', sortable: true, filter: true },
        {
            headerName: 'Amount',
            field: 'amount',
            sortable: true,
            filter: true,
            cellStyle: { textAlign: 'right' },
        },
        {
            headerName: 'Stage',
            field: 'stage',
            sortable: true,
            filter: true,
            cellRenderer: stageCellRenderer,
        },
        {
            headerName: 'Next Action',
            field: 'nextAction',
            sortable: true,
            filter: true,
        },
    ];
    /* -------------------- render ---------------------- */
    return (
        <div className="flex h-screen bg-gray-50">
            {/* ---------------- Sidebar ---------------- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="flex items-center px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                A
                            </span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">
                            AgriLabor
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {[
                        { icon: BarChart3, label: 'Dashboard', active: true },
                        { icon: Calculator, label: 'Accounting' },
                        { icon: TrendingUp, label: 'Sales' },
                        { icon: FileText, label: 'Escalations' },
                        { icon: Mail, label: 'Demand Letters' },
                        { icon: Settings, label: 'Settings' },
                    ].map((item, idx) => (
                        <a
                            key={idx}
                            href="#"
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                item.active
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* ---------------- Main ---------------- */}
            <section className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                className="p-2 text-gray-400 hover:text-gray-500"
                                title="Toggle theme"
                            >
                                <Sun className="h-5 w-5" />
                            </button>
                            <button
                                className="p-2 text-gray-400 hover:text-gray-500"
                                title="Notifications"
                            >
                                <Bell className="h-5 w-5" />
                            </button>
                            <button
                                className="p-2 text-gray-400 hover:text-gray-500"
                                title="User menu"
                            >
                                <User className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6">
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
                            <FilterButton
                                active
                                label="All Buckets"
                                onClick={() => {}}
                            />
                            <FilterButton
                                label={
                                    <span className="flex items-center">
                                        Owner{' '}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </span>
                                }
                                onClick={() => {}}
                            />
                            <FilterButton label="Region" onClick={() => {}} />
                            <FilterButton
                                label="Customer Group"
                                onClick={() => {}}
                            />
                            <FilterButton
                                label={
                                    <span className="flex items-center">
                                        Aging Range{' '}
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </span>
                                }
                                onClick={() => {}}
                            />
                        </div>
                    </div>

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
                </main>
            </section>
        </div>
    );
};

export default Dashboard;
