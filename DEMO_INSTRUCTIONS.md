# eSIM Travel Bot - Demo Instructions

## Overview
This document provides instructions for running and demonstrating the eSIM Travel Telegram bot. The bot is a Proof-of-Concept implementation with all screens fully functional but using fixture data instead of real API connections.

## Prerequisites
- Install Bun runtime: https://bun.sh/
- A Telegram bot token (for full functionality) or use in demo mode

## Setup Instructions

### Option 1: Quick Start (Recommended for demo)
```bash
./run-esim-poc.sh
```

### Option 2: Manual Start
1. Navigate to the esim-bot directory:
```bash
cd esim-bot
```

2. Install dependencies:
```bash
bun install
```

3. Run the bot:
```bash
bun run dev
```

## Environment Variables
If you have a Telegram bot token, set it as an environment variable:
```bash
export BOT_TOKEN="your_bot_token_here"
```

If no token is provided, the bot will show an error message but you can still review the code structure.

## Demo Features

### 1. Main Menu
- Shows the welcome screen with options
- Provides access to all main features

### 2. eSIM Catalog
- Browse eSIM plans by region (Europe, USA, Asia, Worldwide)
- View details for each region

### 3. Popular Plans
- See the most popular eSIM options
- Quick access to best-selling plans

### 4. Plan Browsing with Navigation
- Browse multiple plans within a single country
- Use "Previous" and "Next" buttons to navigate between plans
- See plan counter showing position (e.g., "Plan 1 of 3")

### 5. Plan Comparison Feature
- Add plans to comparison list using "Compare" button
- View side-by-side comparison of two selected plans
- Clear comparison list when needed

### 6. Plan Details
- Detailed information about specific eSIM plans
- Coverage, features, and pricing information

### 7. Purchase Flow
- Simulated purchase process
- Shows confirmation after "purchase"

### 8. My Orders
- View order history with mock data
- See status of previous orders

### 9. Help & Support
- Information about eSIM technology
- FAQ and setup instructions

## Demo Script for Customer Presentation

1. Start by showing the main menu
2. Navigate to "Каталог eSIM" and show different regions
3. Select a region and demonstrate plan options
4. Show detailed information for a selected plan
5. Simulate the purchase process
6. Show the purchase confirmation
7. Display the "Мои заказы" (My Orders) screen
8. Access the help section to explain eSIM technology

## Architecture Notes for Technical Stakeholders

The implementation follows these key principles:
- Clean separation between infrastructure and presentation layers
- Mock data layer that can be easily replaced with real API integration
- Comprehensive UI/UX following Telegram bot best practices
- State management for conversation flow
- All screens fully functional with realistic fixture data

## Next Steps After PoC Approval

1. Integration with real eSIM provider APIs
2. Integration with payment systems
3. Implementation of persistent data storage
4. Addition of admin management interface