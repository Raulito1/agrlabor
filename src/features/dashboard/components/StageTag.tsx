import React from 'react';
import clsx from 'clsx';

/**
 * Semantic stage → Tailwind colour classes.
 * Extend this map whenever you introduce a new status.
 */
const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
    new: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
    },
    pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
    },
    inprogress: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
    },
    completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
    },
    escalated: {
        bg: 'bg-red-100',
        text: 'text-red-800',
    },
};

/**
 * Props accepted by <StageTag />.
 */
export interface StageTagProps {
    /** Raw stage string. Case-insensitive; spaces ignored. */
    stage: string;
    /** Extra classes to tweak spacing or font weight. */
    className?: string;
}

/**
 * **StageTag** – tiny pill that colours itself based on stage.
 *
 * Unknown stages fall back to neutral gray.
 */
function StageTagInner({ stage, className }: StageTagProps) {
    const key = stage.replace(/\s+/g, '').toLowerCase();
    const color = STAGE_COLORS[key] ?? {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                color.bg,
                color.text,
                className
            )}
        >
            {stage}
        </span>
    );
}

export const StageTag = React.memo(StageTagInner);
