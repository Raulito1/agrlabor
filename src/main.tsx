import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';

console.log('Starting Seso Dashboard...', import.meta.env);
if (import.meta.env.DEV) {
    // Start MSW before rendering the app
    const { worker } = await import('./mocks/browser');
    await worker.start();
}

import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './app/store';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
