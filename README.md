Certainly! Here is the full Markdown content for the README.md file. You can copy and paste this directly into a README.md file for your GitHub repository.

Farm Planner Dashboard

This is a modern, responsive, and feature-rich dashboard for "Farm Planner," an AI-powered platform designed to help farmers manage their inventory, orders, and shipments. The dashboard is built with Next.js, TypeScript, and Tailwind CSS.

Features

    Responsive Design: Fully responsive layout that adapts from large desktops down to mobile phones.

    Collapsible Sidebar: A fixed desktop sidebar that can be shrunk to an icon-only view, with a separate off-canvas drawer for mobile.

    Light/Dark Mode: A stylish, animated theme-switcher for light and dark modes, powered by next-themes.

    Dynamic Data: The dashboard is fully state-driven, with all cards and stats updating based on changes to the mock data.

    Inventory Management: View all crops, filter by status (Growing, Ready, Sold), and add new harvests via a modal.

    Order Management: View and approve/cancel pending orders from retailers and distributors.

    Live Shipment Tracking: Monitor in-transit shipments with real-time alerts for delays and high temperatures.

    Dynamic Alerts: The "Alerts & Notifications" card automatically populates with high-priority issues (e.g., production risks, shipment delays, temperature warnings).

    Interactive Charts: Data visualizations using recharts that include tooltips, legends, and a brush/zoom component.

    Hydration-Safe: Correctly handles server-side rendering mismatches for themes and dates using custom hooks and components.

Tech Stack

    Framework: Next.js (App Router)

    Language: TypeScript

    Styling: Tailwind CSS

    Animation: Framer Motion

    Charting: Recharts

    Icons: Lucide React

    Theming: next-themes

    UI Components: Radix UI (for Tooltips)

    Linting/Formatting: ESLint & Prettier (assumed)

Getting Started

Follow these steps to get the project running locally.

1. Prerequisites

   Node.js (v18.x or later)

   npm or yarn

2. Installation

Clone the repository and install the dependencies:
Bash

git clone https://github.com/your-username/farm-planner.git
cd farm-planner
npm install

Key Dependencies:
Bash

npm install next react react-dom
npm install tailwindcss autoprefixer postcss
npm install framer-motion recharts lucide-react next-themes @radix-ui/react-tooltip
npm install -D @types/node @types/react @types/react-dom typescript

3. Running the Development Server

Start the development server:
Bash

npm run dev

Open http://localhost:3000/dashboards/farmer in your browser to see the dashboard.

Project Structure

Here is an overview of the key files and directories:

/
├── app/
│ ├── dashboards/
│ │ └── farmer/
│ │ └── page.tsx # The main dashboard component
│ ├── hooks/
│ │ └── useMediaQuery.ts # Custom hook for responsive logic
│ ├── app/layout.tsx # Root layout, includes ThemeProvider
│ └── app/globals.css # Global Tailwind styles
│
├── components/
│ ├── DashboardLayout.tsx # Main layout wrapper
│ ├── Sidebar.tsx # Responsive sidebar (desktop/mobile)
│ ├── SmallStat.tsx # Stat card component
│ ├── Modal.tsx # Reusable modal for forms
│ ├── ThemeSwitcher.tsx # Animated light/dark mode button
│ ├── FormattedDate.tsx # Hydration-safe date component
│ └── FormattedTime.tsx # Hydration-safe time component
│
├── data/
│ └── mockData.ts # All TypeScript types and mock data
│
└── package.json
└── tailwind.config.ts

Next Steps & Future Improvements

    Connect to a Database: Replace the static mockData.ts file with a real-time database connection (e.g., Vercel Postgres, Supabase, or Firestore).

    Authentication: Add user authentication (e.g., NextAuth.js or Clerk) to protect the dashboard.

    API Routes: Create API routes in Next.js to handle data fetching and mutations.

    Expand Roles: Build out the dashboard pages for the "Retailer" and "Distributor" roles.
