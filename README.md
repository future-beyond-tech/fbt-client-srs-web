# Shree Ramalingam Sons Billing Prototype

Production-style frontend prototype for a vehicle dealership billing workflow (bike and car buying/selling), built with Next.js App Router, Tailwind CSS, and JavaScript.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- JavaScript (no TypeScript code)

## Folder Structure

```text
.
├── app/
│   ├── billing/page.js
│   ├── customers/page.js
│   ├── invoice/page.js
│   ├── vehicles/page.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── forms/
│   │   ├── FormInput.js
│   │   ├── FormSelect.js
│   │   └── FormTextarea.js
│   ├── layout/
│   │   ├── AppShell.js
│   │   ├── Navbar.js
│   │   └── Sidebar.js
│   └── ui/
│       ├── EmptyState.js
│       ├── ResponsiveTable.js
│       ├── SectionHeader.js
│       ├── StatCard.js
│       └── StatusBadge.js
├── features/
│   ├── billing/BillingContext.js
│   ├── data/staticData.js
│   └── utils/formatters.js
├── styles/
│   ├── print.css
│   └── theme.css
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── tailwind.config.js
```

## Features Implemented

- Responsive dashboard with cards:
  - Total Vehicles
  - Vehicles Sold
  - Total Revenue
  - Today’s Revenue
- Vehicles page:
  - Static vehicle list
  - Add vehicle form
  - Mobile-friendly stacked table cards
- Customers page:
  - Static customer list
  - Add customer form
  - Fully responsive layout
- Billing page:
  - Customer dropdown
  - Available vehicle dropdown
  - Auto-filled selling price
  - GST toggle (18%)
  - Payment mode selector
  - Live total calculation
- Invoice preview page:
  - Printable invoice layout
  - Business details, customer details, vehicle details
  - GST and final total breakdown
  - Date and invoice number
  - Print button with print-optimized CSS
- Shared shell layout:
  - Sidebar (desktop)
  - Collapsible mobile menu (small screens)
  - Top navbar
  - Footer: `Powered by Future Beyond Tech`

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

