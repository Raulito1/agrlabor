import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    BarChart3,
    Calculator,
    TrendingUp,
    FileText,
    Mail,
    Settings,
    ChartColumnIncreasing,
} from 'lucide-react';

const navItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Calculator, label: 'Accounting', path: '/accounting' },
    { icon: TrendingUp, label: 'Sales', path: '/sales' },
    { icon: FileText, label: 'Escalations', path: '/escalations' },
    { icon: Mail, label: 'Demand Letters', path: '/demand-letters' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const DashboardLayout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen">
            {/* Top Logo/Title Bar */}
            <header className="w-full p-4 flex items-center justify-center border-b bg-gradient-to-r from-blue-600 to-blue-400">
                <ChartColumnIncreasing className="h-6 w-6 text-white mr-2 animate-pulse" />
                <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
                    Seso Dashboard
                </h1>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white border-r">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navItems.map((item, idx) => (
                            <NavLink
                                key={idx}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>
                {/* Main content area */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
