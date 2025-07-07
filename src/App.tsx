import React from 'react';
import './styles/index.css';
import AppRoutes from './routes/AppRoutes';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const App: React.FC = () => {
    return <AppRoutes />;
};

export default App;
