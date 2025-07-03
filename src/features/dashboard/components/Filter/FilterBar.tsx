import React from 'react';
import clsx from 'clsx';

/**
 * Option displayed inside a filter dropdown.
 */
export interface FilterOption {
    label: string;
    value: string | number;
}

/**
 * One filter control in the bar.
 */
export interface FilterConfig {
    /** Unique id used as key and in the change callback. */
    id: string;
    /** Human‑readable label shown above the <select>. */
    label: string;
    /** Available options.  An implicit “All” is added automatically. */
    options: FilterOption[];
    /** Whether multi‑select is allowed. */
    multiple?: boolean;
}

/**
 * Props accepted by <FilterBar />.
 */
export interface FilterBarProps {
    /** Array describing each dropdown. */
    filters: FilterConfig[];
    /**
     * Current selections ‒ keyed by filter id.
     * For `multiple === false` supply a single primitive; otherwise an array.
     */
    values: Record<string, string | number | (string | number)[]>;
    /**
     * Called whenever a dropdown changes.
     * @param id Filter id
     * @param value New value (matches shape in `values`)
     */
    onChange: (
        id: string,
        value: string | number | (string | number)[]
    ) => void;
    /** Extra Tailwind / utility classes on the wrapper. */
    className?: string;
}

/**
 * **FilterBar** – Simple, accessible select‑based filter controls.
 *
 * * Headless (no internal fetch); pass options + chosen state via props.
 * * Uncontrolled assumptions avoided so external state remains source‑of‑truth.
 */
export function FilterBar({
    filters,
    values,
    onChange,
    className,
}: FilterBarProps) {
    return (
        <section className={clsx('flex flex-wrap gap-4 items-end', className)}>
            {filters.map(({ id, label, options, multiple }) => {
                const currentValue = values[id] ?? (multiple ? [] : '');
                const handleChange = (
                    e: React.ChangeEvent<HTMLSelectElement>
                ) => {
                    if (multiple) {
                        // Convert HTMLCollection into primitive array
                        const selected = Array.from(
                            e.target.selectedOptions
                        ).map((o) => (o.value === '' ? '' : o.value));
                        onChange(id, selected);
                    } else {
                        onChange(id, e.target.value);
                    }
                };

                return (
                    <div key={id} className="flex flex-col">
                        <label
                            htmlFor={`filter-${id}`}
                            className="mb-1 text-xs font-medium text-gray-600"
                        >
                            {label}
                        </label>
                        <select
                            id={`filter-${id}`}
                            multiple={multiple}
                            value={
                                multiple
                                    ? (currentValue as (string | number)[]).map(
                                          (v) => String(v)
                                      )
                                    : currentValue !== undefined &&
                                        currentValue !== null
                                      ? String(currentValue)
                                      : ''
                            }
                            onChange={handleChange}
                            className={clsx(
                                'min-w-[8rem] rounded border border-gray-300',
                                'bg-white px-3 py-1.5 text-sm',
                                'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
                            )}
                        >
                            {!multiple && <option value="">All</option>}
                            {options.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
        </section>
    );
}
