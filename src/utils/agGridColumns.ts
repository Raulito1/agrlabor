export const agGridColumns = [
    {
        headerName: 'Customer',
        valueGetter: (params) => params.data.customer ?? params.data.customerFullName,
        sortable: true,
        filter: true,
    },
    {
        headerName: 'Due Date',
        field: 'dueDate',
        sortable: true,
        filter: 'agDateColumnFilter',
        // assume dates are strings in MM/DD/YY or similar – adjust parser as needed
        valueFormatter: (params) =>
            params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
        headerName: 'Open Balance',
        field: 'openBalance',
        sortable: true,
        filter: true,
        cellStyle: { textAlign: 'right' },
        // format as currency
        valueFormatter: (params) => {
            const val = params.value;
            if (val == null || val === '') return '';
            const num =
                typeof val === 'number'
                    ? val
                    : parseFloat(String(val).replace(/,/g, ''));
            if (isNaN(num)) return String(val);
            return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
    },
];
