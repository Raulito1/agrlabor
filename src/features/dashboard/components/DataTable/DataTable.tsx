import React from 'react';
import type { JSX } from 'react';
import clsx from 'clsx';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ColGroupDef, CellClickedEvent } from 'ag-grid-community';
import { themeAlpine } from 'ag-grid-community';

export interface Column<T> {
    id: keyof T & string;
    header: React.ReactNode;
    /**
     * Cell renderer – receives the full row.
     * If omitted, the grid falls back to the raw `row[id]` value.
     */
    accessor?: (row: T) => React.ReactNode;
    /** Pixel width or CSS utility (ignored by ag‑Grid if non‑numeric). */
    width?: number;
    /** Left / centre / right alignment helper. */
    align?: 'left' | 'center' | 'right';
    /** Extra Tailwind classes applied to the cell wrapper. */
    className?: string;
}

export interface DataTableProps<T> {
    /** Row objects. */
    data: T[];
    /** Column definitions (see {@link Column}). */
    columns: Column<T>[];
    /** Extra classes for the outer wrapper. */
    className?: string;
    /** Row‑click handler. */
    onRowClick?: (row: T) => void;
}

function DataTableInner<T>({
    data,
    columns,
    className,
    onRowClick,
}: DataTableProps<T>) {
    const columnDefs = React.useMemo<ColDef[] | ColGroupDef[]>(
        () =>
            columns.map((c): ColDef => {
                const align =
                    c.align === 'right'
                        ? 'ag-right-aligned-cell'
                        : c.align === 'center'
                          ? 'ag-center-aligned-cell'
                          : undefined;

                interface CustomHeaderComponentParams {
                    template: string;
                }

                interface CustomCellRendererParams<T> {
                    data: T;
                }

                interface CustomColDef<T> extends ColDef {
                    field: keyof T & string;
                    headerName?: string;
                    headerComponentParams?: CustomHeaderComponentParams;
                    width?: number;
                    cellRenderer?: (
                        params: CustomCellRendererParams<T>
                    ) => React.ReactNode;
                    cellClass?: string;
                    autoHeight?: boolean;
                    resizable?: boolean;
                }

                return {
                    field: c.id as keyof T & string,
                    headerName:
                        typeof c.header === 'string' ? c.header : undefined,
                    headerComponentParams:
                        typeof c.header !== 'string'
                            ? ({
                                  template: `<span></span>`,
                              } as CustomHeaderComponentParams) // we’ll render JSX via accessor
                            : undefined,
                    width: typeof c.width === 'number' ? c.width : undefined,
                    cellRenderer: c.accessor
                        ? (params: CustomCellRendererParams<T>) =>
                              c.accessor ? c.accessor(params.data as T) : null
                        : undefined,
                    cellClass: clsx(c.className, align),
                    autoHeight: true,
                    resizable: true,
                } as CustomColDef<T>;
            }),
        [columns]
    );

    /* -------------------------------------------------- */
    /*           Event proxy for parent consumers         */
    /* -------------------------------------------------- */
    const handleRowClick = React.useCallback(
        (e: CellClickedEvent) => {
            if (onRowClick) onRowClick(e.data as T);
        },
        [onRowClick]
    );

    /* -------------------------------------------------- */
    /*                     Render                         */
    /* -------------------------------------------------- */
    return (
        <div
            className={clsx('ag-theme-alpine w-full h-full', className)}
            style={{ minHeight: 320 }}
        >
            <AgGridReact<T>
                rowData={data}
                theme={themeAlpine}
                columnDefs={columnDefs}
                headerHeight={38}
                rowHeight={36}
                onCellClicked={handleRowClick}
                tooltipShowDelay={500}
                domLayout="autoHeight"
            />
        </div>
    );
}

export const DataTable = React.memo(DataTableInner) as <T>(
    props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => JSX.Element;
