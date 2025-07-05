import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardPage from '@/pages/DashboardPage';
import AccountingPage from '@/pages/AccountingPage';
import SalesPage from '@/pages/SalesPage';
import EscalationPage from '@/pages/EscalationPage';
import DemandLetterPage from '@/pages/DemandLetterPage';
import SettingsPage from '@/pages/SettingsPage';
import DashboardLayout from '@/layout/DashboardLayout';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="accounting" element={<AccountingPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="escalations" element={<EscalationPage />} />
                <Route path="demand-letters" element={<DemandLetterPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
