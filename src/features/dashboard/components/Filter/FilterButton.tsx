import React from 'react';
import clsx from 'clsx';

export interface FilterButtonProps {
    /** What the pill displays. */
    label: React.ReactNode;
    /** Active / selected visual state. */
    active?: boolean;
    /** Click handler. */
    onClick: () => void;
    /** Extra utility classes. */
    className?: string;
    /** Optional children for additional content. */
    children?: React.ReactNode;
}

/**
 * **FilterButton** – pill‑shaped toggle used inside FilterBar
 * for quick binary filters (e.g. “Open / Closed”).
 *
 * - Pure presentational; the parent owns state.
 * - Memoised to avoid rerenders when siblings change.
 */
function FilterButtonInner({
    label,
    active = false,
    onClick,
    className,
}: FilterButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition',
                active
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                className
            )}
        >
            {label}
        </button>
    );
}

export const FilterButton = React.memo(FilterButtonInner);
