import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

/**
 * Bucketed ageing data expected by <AgingChart />.
 * Example:
 * ```ts
 * [
 *   { label: '0‑30', value: 12000 },
 *   { label: '31‑60', value: 5400 },
 *   { label: '61‑90', value: 3100 },
 *   { label: '91+',  value: 800 }
 * ]
 * ```
 */
export interface AgingDatum {
    label: string;
    value: number;
}

export interface AgingChartProps {
    /** Each element is rendered as a column. */
    data: AgingDatum[];
    /** Chart title. */
    title?: string;
    /** Fixed height (px).  Defaults to 280. */
    height?: number;
    /** Optional click handler for a column (bucket). */
    onPointClick?: (datum: AgingDatum) => void;
}

/**
 * **AgingChart** – thin Highcharts wrapper.
 *
 * * Responsive – resizes with parent width.
 * * Animated load & update for smooth UI.
 * * Accessible – adds `series.descriptionFormat`.
 */
function AgingChartInner({
    data,
    title = 'Aging Buckets',
    height = 280,
    onPointClick,
}: AgingChartProps) {
    // Derive the Highcharts options once per prop change.
    const options: Highcharts.Options = React.useMemo(() => {
        return {
            chart: {
                type: 'column',
                height,
                animation: {
                    duration: 600,
                },
                spacing: [8, 8, 8, 8],
            },
            title: { text: title, style: { fontSize: '14px' } },
            xAxis: {
                categories: data.map((d) => d.label),
                title: { text: null },
                accessibility: {
                    description: 'Aging bucket',
                },
            },
            yAxis: {
                min: 0,
                title: { text: 'Amount', align: 'high' },
                labels: {
                    overflow: 'justify',
                    formatter() {
                        return `$${(this.value as number).toLocaleString()}`;
                    },
                },
            },
            tooltip: {
                pointFormat: '<b>${point.y:,.0f}</b>',
            },
            plotOptions: {
                column: {
                    cursor: onPointClick ? 'pointer' : undefined,
                    dataLabels: {
                        enabled: true,
                        formatter() {
                            return `$${(this.y as number).toLocaleString()}`;
                        },
                    },
                    point: {
                        events: {
                            click() {
                                if (onPointClick) {
                                    // @ts-expect-error – Highcharts typings incomplete for userData
                                    const { label, value } = this
                                        .userData as AgingDatum;
                                    onPointClick({ label, value });
                                }
                            },
                        },
                    },
                },
            },
            series: [
                {
                    name: 'Outstanding',
                    // Attach original row on each point via `userData`
                    data: data.map((d) => ({
                        y: d.value,
                        userData: d,
                    })),
                    type: 'column',
                    colorByPoint: true,
                    accessibility: {
                        descriptionFormat: '{category}: ${value}',
                    },
                } as Highcharts.SeriesColumnOptions,
            ],
            credits: { enabled: false },
            legend: { enabled: false },
            responsive: {
                rules: [
                    {
                        condition: { maxWidth: 480 },
                        chartOptions: { xAxis: { labels: { rotation: -45 } } },
                    },
                ],
            },
        };
    }, [data, title, height, onPointClick]);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            immutable={true} // diffing handled via React
        />
    );
}

export const AgingChart = React.memo(AgingChartInner);
