import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

/**
 * UI‑only state for the dashboard feature.
 *
 * Everything here is local to the dashboard page:
 * ‒ table sorting
 * ‒ filter selections
 * ‒ view preferences (future‑proof)
 *
 * Keeping this in RTK avoids prop‑drilling and allows
 * the state to survive route transitions if the user
 * navigates away and returns.
 */

/* -------------------------------------------------- */
/*                        Types                       */
/* -------------------------------------------------- */

export type SortDirection = 'asc' | 'desc';

export interface DashboardState {
    /** Current sort field – empty string means “no sort”. */
    sortField: string;
    /** Direction for the active sort. */
    sortDirection: SortDirection;
    /**
     * Arbitrary filter selections keyed by filter id.
     * Single‑valued dropdowns store a primitive, multi‑selects an array.
     */
    filters: Record<string, string | number | (string | number)[]>;
}

/* -------------------------------------------------- */
/*                  Initial state                     */
/* -------------------------------------------------- */

const initialState: DashboardState = {
    sortField: '',
    sortDirection: 'asc',
    filters: {},
};

/* -------------------------------------------------- */
/*                       Slice                        */
/* -------------------------------------------------- */

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        /**
         * Set (or toggle) the active sort field.
         *
         * If the payload matches the current field, the direction
         * is flipped. Otherwise the new field is applied with an
         * initial 'asc' direction.
         */
        setSort(state, action: PayloadAction<string>) {
            if (state.sortField === action.payload) {
                state.sortDirection =
                    state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortField = action.payload;
                state.sortDirection = 'asc';
            }
        },

        /** Explicitly set the sort direction. */
        setSortDirection(state, action: PayloadAction<SortDirection>) {
            state.sortDirection = action.payload;
        },

        /**
         * Replace or update a filter’s selected value(s).
         * Pass `undefined` or an empty array/string to remove it.
         */
        setFilter(
            state,
            action: PayloadAction<{
                id: string;
                value: string | number | (string | number)[] | undefined;
            }>
        ) {
            const { id, value } = action.payload;
            if (
                value === undefined ||
                (Array.isArray(value) && value.length === 0) ||
                value === ''
            ) {
                delete state.filters[id];
            } else {
                state.filters[id] = value as any;
            }
        },

        /** Resets all filters and sort. */
        resetDashboardState() {
            return initialState;
        },
    },
});

/* -------------------------------------------------- */
/*                     Selectors                      */
/* -------------------------------------------------- */

export const selectDashboardState = (state: RootState) => state.dashboard;

export const selectSortField = (state: RootState) => state.dashboard.sortField;
export const selectSortDirection = (state: RootState) =>
    state.dashboard.sortDirection;
export const selectFilters = (state: RootState) => state.dashboard.filters;

/* -------------------------------------------------- */
/*                      Exports                       */
/* -------------------------------------------------- */

export const { setSort, setSortDirection, setFilter, resetDashboardState } =
    dashboardSlice.actions;

export default dashboardSlice.reducer;
