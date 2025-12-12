# Agroinform Prices Frontend

Agricultural market prices and information platform built with Nuxt.js 2 and Vuetify.

## Features

- **Multi-language Support**: English, Russian, Tajik, and Kyrgyz
- **Market Price Tracking**: Real-time agricultural commodity prices
- **Data Visualization**: Interactive charts using Chart.js and ApexCharts
- **Weekly Reports**: Market analysis and trends reports
- **Regional Data**: Coverage for Tajikistan and Kyrgyzstan markets
- **Responsive Design**: Mobile-friendly interface with Vuetify

## Tech Stack

- **Framework**: Nuxt.js 2.15.7 (SPA mode)
- **UI Library**: Vuetify 2.5.5
- **Charts**: Chart.js 3.9.1, ApexCharts 3.27.3
- **HTTP Client**: Axios
- **Internationalization**: @nuxtjs/i18n
- **Analytics**: Google Analytics (gtag)

## Prerequisites

- Node.js (v14 or higher)
- Yarn 1.22.22 or npm

## Installation

```bash
# Install dependencies
yarn install
# or
npm install
```

## Development

```bash
# Start development server at localhost:3000
yarn dev
# or
npm run dev
```

## Build

```bash
# Build for production
yarn build
# or
npm run build

# Start production server
yarn start
# or
npm run start
```

## Generate Static Site

```bash
# Generate static files
yarn generate
# or
npm run generate
```

## Environment Configuration

The application uses different API endpoints based on the environment:

- **Development**: `http://backend.test/api`
- **Production**: `https://data.agroinform.asia/api`

PDF service endpoints:
- **Development**: `http://localhost:3002`
- **Production**: `https://prices.agroinform.asia/api/pdf`

## Project Structure

```
.
├── assets/           # Styles and global assets
├── components/       # Vue components
├── lang/            # i18n language files
├── layouts/         # Nuxt layouts
├── pages/           # Application pages/routes
├── plugins/         # Vue plugins
├── static/          # Static files
└── store/           # Vuex store
```

## Pages

- `/` - Home page
- `/prices` - Market prices
- `/reports` - Weekly market reports
- `/about` - About Agroinform
- `/our-services` - Services information
- `/our-achievements` - Achievements and certificates

## Language Support

Default language: Russian (ru)
Fallback language: Russian (ru)

Available languages:
- English (en)
- Russian (ru)
- Tajik (tj)
- Kyrgyz (kg)

Language is automatically detected from browser settings and stored in cookies.

## License

Private

## Version

2.0.0
