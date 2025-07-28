# Market Seasonality Explorer

A web application for analyzing seasonal patterns in cryptocurrency markets using real-time data from the Binance API. The project provides an interactive dashboard with visualizations to track market performance, compare assets, and analyze technical indicators.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Components](#components)
- [Submission Details](#submission-details)
- [License](#license)
- [Contributing](#contributing)

## Features
- **Real-time Data Streaming**: Connects to Binance WebSocket streams (`wss://stream.binance.com:9443/stream`) for live kline, order book, and ticker data.
- **Calendar View**: Visualizes market performance in daily, weekly, or monthly grids, highlighting volatility, volume, and price changes.
- **Comparison Tool**: Supports comparisons across time periods, multiple symbols, benchmarks, and period-over-period analysis.
- **Technical Indicators**: Displays MACD (12,26,9) and RSI (14) charts for technical analysis.
- **Responsive Design**: Built with Next.js and shadcn/ui, featuring light/dark mode, mobile-friendly navigation, and swipeable controls.
- **Performance Optimization**: Utilizes memoization, debouncing, and efficient data aggregation for smooth real-time updates.
- **Error Handling**: Robust error management with retry mechanisms and user-friendly error messages.
- **Accessibility**: Keyboard navigation, swipe gestures, and zoom controls for enhanced usability.

## Tech Stack
- **Frontend**: Next.js, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Data Visualization**: Recharts
- **WebSocket Client**: Custom `UnifiedBinanceClient` for Binance API integration
- **Animations**: Framer Motion
- **Theming**: Next Themes
- **Fonts**: Inter (via Next.js Font)
- **Other Libraries**: react-swipeable, lucide-react

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd market-seasonality-explorer

2. ```bash
    npm install

3.  **ENV Setup**
```bash
NEXT_PUBLIC_API_URL=https://api.binance.com/api/v3
NEXT_PUBLIC_WS_STREAM_URL=wss://stream.binance.com:9443/stream

4. ```bash
npm run dev