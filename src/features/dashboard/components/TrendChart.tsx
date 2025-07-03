import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

/**
 * A single data point for <TrendChart/>.
 *
 * The `date` can be:
 *  • a JS Date object
 *  • an ISO string – e.g. "2025-06-28"
 *  • a UNIX epoch (ms) number
 */
export interface TrendDatum {
    date: Date | string | number;
    value: number;
}

export interface TrendChartProps {
    /** Ordered chronological array (oldest ➞ newest). */
    data: TrendDatum[];
    /** Chart title – defaults to “Trend”. */
    title?: string;
    /** Fixed height in px – defaults to 280. */
    height?: number;
    /** Show shaded area under the line.  Default: `false`. */
    area?: boolean;
    /** Called when the user clicks a point. */
    onPointClick?: (datum: TrendDatum) => void;
}

/**
 * Converts the mixed `date` prop into a unix timestamp (ms).
 */
function toMillis(d: Date | string | number): number {
    if (d instanceof Date) return d.getTime();
    if (typeof d === 'string') return Date.parse(d);
    return d; // assume epoch
}

/**
 * **TrendChart** – a tiny, memoised Highcharts wrapper for time‑series.
 *
 *  • Responsive width, animated load/update
 *  • Optionally renders as area chart
 *  • Accessible description + point click callback
 */
function TrendChartInner({
    data,
    title = 'Trend',
    height = 280,
    area = false,
    onPointClick,
}: TrendChartProps) {
    const seriesData = React.useMemo(
        () =>
            data.map((d) => ({
                x: toMillis(d.date),
                y: d.value,
                userData: d,
            })),
        [data]
    );

    const options: Highcharts.Options = React.useMemo(
        () => ({
            chart: {
                type: area ? 'area' : 'line',
                height,
                spacing: [8, 8, 8, 8],
                animation: { duration: 600 },
            },
            title: { text: title, style: { fontSize: '14px' } },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%e %b',
                    week: '%e %b',
                    month: "%b '%y",
                },
                accessibility: { description: 'Date' },
            },
            yAxis: {
                title: { text: 'Value' },
                labels: {
                    formatter() {
                        return this.value.toLocaleString();
                    },
                },
            },
            tooltip: {
                xDateFormat: '%e %b %Y',
                pointFormat: '<b>{point.y:,.0f}</b>',
            },
            plotOptions: {
                series: {
                    marker: { enabled: false },
                    cursor: onPointClick ? 'pointer' : undefined,
                    point: {
                        events: {
                            click() {
                                if (onPointClick) {
                                    // @ts-expect-error incomplete typings
                                    const { userData } = this;
                                    onPointClick(userData as TrendDatum);
                                }
                            },
                        },
                    },
                },
                area: {
                    fillOpacity: 0.15,
                },
            },
            series: [
                {
                    name: 'Value',
                    type: area ? 'area' : 'line',
                    data: seriesData,
                    color: '#6366F1', // indigo-500
                } as Highcharts.SeriesOptionsType,
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
        }),
        [title, height, area, onPointClick, seriesData]
    );

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            immutable={true}
        />
    );
}

export const TrendChart = React.memo(TrendChartInner);
