// Example cell renderer function for the 'Stage' column
function stageCellRenderer(params: any) {
    // Customize rendering logic as needed
    return params.value;
}

export const agGridColumns = [
    {
        headerName: 'Customer',
        field: 'customer',
        sortable: true,
        filter: true,
    },
    {
        headerName: 'Invoice',
        field: 'invoice',
        sortable: true,
        filter: true,
    },
    { headerName: 'HFID', field: 'hfid', sortable: true, filter: true },
    {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        filter: true,
        cellStyle: { textAlign: 'right' },
    },
    {
        headerName: 'Stage',
        field: 'stage',
        sortable: true,
        filter: true,
        cellRenderer: stageCellRenderer,
    },
    {
        headerName: 'Next Action',
        field: 'nextAction',
        sortable: true,
        filter: true,
    },
];
