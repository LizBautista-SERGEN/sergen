
# Sergen Sustainability Suite

## Project Overview
Sergen Sustainability Suite is a comprehensive energy management platform designed for Peruvian businesses seeking to optimize their energy consumption, reduce costs, and improve sustainability metrics.

## Features
- **Energy Consumption Monitoring**: Track and analyze energy usage patterns
- **COES Data Integration**: Real-time data from the Peruvian power grid operator
- **Power Peak Management**: Identify and manage power consumption peaks
- **Energy Forecasting**: Predict future energy needs based on historical data
- **Report Generation**: Create detailed sustainability and energy usage reports
- **User Management**: Role-based access control for different organizational needs

## Tech Stack
This project is built with:
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL database, Auth, Storage)
- **Data Visualization**: Recharts
- **API Integration**: Supabase Edge Functions (Deno)

## Getting Started

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account (for backend services)

### Installation
```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd sergen-sustainability-suite

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment
This project is deployed using Lovable's deployment system. To deploy:
1. Go to the Lovable project dashboard
2. Click on "Share" in the top menu
3. Select "Publish" to deploy to Lovable hosting

## Project Structure
- `/src`: Frontend React application
  - `/components`: Reusable UI components
  - `/pages`: Main page layouts
  - `/hooks`: Custom React hooks
  - `/types`: TypeScript type definitions
  - `/integrations`: External service integrations
- `/supabase`: Backend functionality
  - `/functions`: Edge functions for API endpoints
  - `/migrations`: Database schema migrations

## Contributing
1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License
All rights reserved. This codebase is proprietary and confidential.

## Support
For issues or questions, please contact support@sergen.com.pe
