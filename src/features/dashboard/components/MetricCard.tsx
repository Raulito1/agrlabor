import React from 'react';
import clsx from 'clsx';
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

/**
 * Props accepted by <MetricCard />.
 */
export interface MetricCardProps {
    /** Short label shown under the value (e.g. “Total Balance”). */
    title: string;
    /** Primary number to highlight. */
    value: number | string;
    /**
     * Optional change indicator compared to previous period.
     * Positive numbers render green ↑, negatives red ↓.
     * Can be absolute or percentage.
     */
    delta?: number;
    /** If true, `delta` is treated as percentage (adds “%”). */
    deltaIsPercent?: boolean;
    /** Icon element displayed at top‑right (HeroIcon size 20px recommended). */
    icon?: React.ReactNode;
    /** Tailwind utilities for custom width / flex‑basis. */
    className?: string;
    /** Click handler if the card is actionable. */
    onClick?: () => void;
}

/**
 * **MetricCard** – tiny, reusable KPI tile.
 *
 * * Pure presentational component; external state drives rerenders.
 * * Uses memo to avoid unnecessary updates.
 */
function MetricCardInner({
    title,
    value,
    delta,
    deltaIsPercent = false,
    icon,
    className,
    onClick,
}: MetricCardProps) {
    const isPositive = typeof delta === 'number' && delta >= 0;

    return (
        <div
            {...(onClick ? { role: 'button', tabIndex: 0 } : {})}
            onClick={onClick}
            className={clsx(
                'relative rounded-lg border bg-white shadow-sm p-4',
                'transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500',
                onClick && 'cursor-pointer',
                className
            )}
        >
            {/* Optional icon */}
            {icon && (
                <span className="absolute top-3 right-3 text-gray-300">
                    {icon}
                </span>
            )}

            {/* Main metric */}
            <div className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </div>

            {/* Title */}
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                {title}
            </div>

            {/* Delta */}
            {typeof delta === 'number' && (
                <div
                    className={clsx(
                        'mt-2 inline-flex items-center text-xs font-medium',
                        isPositive ? 'text-green-600' : 'text-red-600'
                    )}
                >
                    {isPositive ? (
                        <ArrowTrendingUpIcon className="mr-0.5 h-3 w-3" />
                    ) : (
                        <ArrowTrendingDownIcon className="mr-0.5 h-3 w-3" />
                    )}
                    {deltaIsPercent
                        ? `${Math.abs(delta).toLocaleString()}%`
                        : Math.abs(delta).toLocaleString()}
                </div>
            )}
        </div>
    );
}

export const MetricCard = React.memo(MetricCardInner);
