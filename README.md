# Aging Summary App

## Features

- **Dashboard**:
    - AG Grid configuration with flexible columns, pagination, filtering, and sorting capabilities.
    - Highcharts integration featuring bar, area, and trend charts for comprehensive data visualization.
    - Key metrics cards displaying Total AR, Past-Due amounts, Average Days Sales Outstanding (DSO), and Percentage Collected in the Last 30 Days (% Collected L30d).
- **Customized Bucket Views**:
    - `/` (Dashboard): Overview of all receivables across all aging buckets.
    - `/accounting`: Displays invoices aged 21–30 days, including dynamic metrics and editable grid columns for detailed management.
    - `/sales`: Shows invoices aged 31–45 days with tailored metrics and grid configurations.
    - `/escalation`: Contains invoices aged 46–90 days for focused follow-up.
    - `/demand-letter`: Lists invoices aged 91+ days, representing the most overdue accounts.
- **QuickBooks Online Integration**:
    - RTK Query service setup through the `accountingApi` slice for efficient data fetching.
    - Utilizes `transformResponse` to map and aggregate the `AgedReceivableDetail` report data into usable formats.
    - Supports mocking via MSW to facilitate development and testing environments, with conditional usage based on production or development mode.
