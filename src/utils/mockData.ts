export type TableRow = {
    customer: string;
    invoice: string;
    hfid: string;
    amount: string;
    stage: string;
    nextAction: string;
    agingDays: number;
};

export const mockData: TableRow[] = [
    {
        customer: 'Adams Ltd',
        invoice: 'H7732',
        hfid: 'HF15',
        amount: '$342K',
        stage: 'Current',
        nextAction: 'April 31',
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
        amount: '$372K',
        stage: '60+',
        nextAction: 'Jomson',
        agingDays: 75,
    },
    {
        customer: 'Williams',
        invoice: 'HF835',
        hfid: 'E258',
        amount: '$155.6',
        stage: 'Aug',
        nextAction: 'Smith',
        agingDays: 45,
    },
    {
        customer: 'Brown',
        invoice: 'H7822',
        hfid: 'E678',
        amount: '$02T',
        stage: 'May',
        nextAction: 'Brown',
        agingDays: 30,
    },
];
