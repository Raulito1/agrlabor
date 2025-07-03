import { configureStore } from '@reduxjs/toolkit';

// Import your reducers here
// import userReducer from '../features/user/userSlice';

const store = configureStore({
    reducer: {
        // user: userReducer,
        // Add more reducers here
    },
    // middleware, devTools, and other options can be customized here
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
