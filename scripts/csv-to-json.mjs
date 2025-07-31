// scripts/csv-to-json.mjs
import csv from 'csvtojson';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const inputCsv = path.resolve(__dirname, '../data/agedReceivable.csv');
const outputJson = path.resolve(__dirname, '../db.json');

(async () => {
    try {
        // Parse starting at line 4, with explicit headers (first "skip" column is the leading blank)
        const rawArray = await csv({
            delimiter: ',',
            fromLine: 4,
            headers: [
                'skip',
                'Date',
                'Transaction type',
                'Num',
                'Customer full name',
                'Due date',
                'Amount',
                'Open balance',
            ],
        }).fromFile(inputCsv);

        // Remove the 'skip' column and inject demo fields
        const jsonArray = rawArray.map(({ skip, ...rest }, idx) => ({
            id: idx,
            ...rest,
            action_taken: '',
            slack_updated: false,
            follow_up: false,
            escalation: false,
        }));

        // Write out the fixture
        fs.mkdirSync(path.dirname(outputJson), { recursive: true });
        fs.writeFileSync(
            outputJson,
            JSON.stringify({ accounts: jsonArray }, null, 2),
            'utf8'
        );
        console.log(`✅ Wrote ${jsonArray.length} records to ${outputJson}`);
    } catch (err) {
        console.error('❌ CSV→JSON conversion failed:', err);
        process.exit(1);
    }
})();
