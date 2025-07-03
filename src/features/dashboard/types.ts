/**
 * Canonical TypeScript models used by the **dashboard** feature.
 *
 * Instead of duplicating small interfaces across components / slices /
 * fixtures, import from this file.  This keeps refactors safe and DRY.
 */

/* ------------------------------------------------------------------ */
/*                          KPI & Charts                              */
/* ------------------------------------------------------------------ */

/** Age–bucket datum consumed by <AgingChart />. */
export interface AgingDatum {
    label: string;
    value: number;
}

/** Time‑series datum consumed by <TrendChart />. */
export interface TrendDatum {
    /** JS `Date`, ISO string, or unix (ms). */
    date: Date | string | number;
    value: number;
}

/* ------------------------------------------------------------------ */
/*                             Table row                              */
/* ------------------------------------------------------------------ */

/**
 * Row shape used by the dashboard’s AR table.  If you later fetch this
 * from an API, update only this interface and the rest of the UI stays
 * type‑safe.
 */
export interface TableRow {
    customer: string;
    invoice: string;
    hfid: string;
    amount: string;
    stage: string;
    nextAction: string;
    agingDays: number;
}

/* ------------------------------------------------------------------ */
/*                        Filter bar models                           */
/* ------------------------------------------------------------------ */

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface FilterConfig {
    id: string;
    label: string;
    options: FilterOption[];
    multiple?: boolean;
}
