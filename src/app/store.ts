import { configureStore } from '@reduxjs/toolkit';
import { accountingApi } from '../services/accountingApi';

export const store = configureStore({
    reducer: {
        // Add RTK Query data reducer
        [accountingApi.reducerPath]: accountingApi.reducer,
        // Add other reducers here
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(accountingApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
