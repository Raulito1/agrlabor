/**
 * Centralised mock data for Storybook and unit tests.
 *
 * Import these in stories or tests rather than redefining
 * sample payloads in multiple places.
 */

import type { AgingDatum } from './components/AgingChart';
import type { TrendDatum } from './components/TrendChart';

/* ------------------------------------------------------------------ */
/*                            Aging buckets                           */
/* ------------------------------------------------------------------ */

export const sampleAgingData: AgingDatum[] = [
    { label: '0‑30', value: 12_000 },
    { label: '31‑60', value: 5_400 },
    { label: '61‑90', value: 3_100 },
    { label: '91+', value: 800 },
];

/* ------------------------------------------------------------------ */
/*                        Trend (time‑series)                         */
/* ------------------------------------------------------------------ */

export const sampleTrendData: TrendDatum[] = [
    { date: '2025-06-01', value: 1_200 },
    { date: '2025-06-08', value: 1_800 },
    { date: '2025-06-15', value: 1_500 },
    { date: '2025-06-22', value: 2_300 },
    { date: '2025-06-29', value: 2_000 },
];

/* ------------------------------------------------------------------ */
/*                            Table rows                              */
/* ------------------------------------------------------------------ */

export interface SampleTableRow {
    customer: string;
    invoice: string;
    hfid: string;
    amount: string;
    stage: string;
    nextAction: string;
    agingDays: number;
}

export const sampleTableRows: SampleTableRow[] = [
    {
        customer: 'Adams Ltd',
        invoice: 'H7732',
        hfid: 'HF15',
        amount: '$342 000',
        stage: 'Current',
        nextAction: 'April 31',
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
        amount: '$372 000',
        stage: '60+',
        nextAction: 'Jomson',
        agingDays: 75,
    },
    {
        customer: 'Williams',
        invoice: 'HF835',
        hfid: 'E258',
        amount: '$155 600',
        stage: 'Aug',
        nextAction: 'Smith',
        agingDays: 45,
    },
    {
        customer: 'Brown',
        invoice: 'H7822',
        hfid: 'E678',
        amount: '$2 000',
        stage: 'May',
        nextAction: 'Brown',
        agingDays: 30,
    },
];

/* ------------------------------------------------------------------ */
/*                      Reusable filter options                       */
/* ------------------------------------------------------------------ */

export const owners = ['All', 'Alice', 'Bob', 'Charlie'] as const;
export const regions = ['North', 'Central', 'South'] as const;
