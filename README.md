# Computer Master, Sales Bot, and eSIM Bot Repository

This repository contains three separate Telegram bots:

1. **Computer Master Bot**: A Telegram bot for a computer master to provide services and manage appointments.
2. **Sales Bot**: A Telegram bot for sales reporting at retail locations.
3. **eSIM Bot**: A Telegram bot for selling eSIM cards for world travel.

## Repository Structure

- `computer-master/` - Contains the Computer Master bot
- `sales-bot/` - Contains the Sales reporting bot
- `esim-bot/` - Contains the eSIM card selling bot

## Running the Bots

### Computer Master Bot
```bash
bun run start:computer-master
```

### Sales Bot
```bash
bun run start:sales
```

### eSIM Bot
```bash
bun run start:esim
```

### Development Mode

For development:
- Computer Master Bot: `bun run dev:computer-master`
- Sales Bot: `bun run dev:sales`
- eSIM Bot: `bun run dev:esim`

### PoC eSIM Travel Bot Quick Start
```bash
./run-esim-poc.sh
```

## Computer Master Bot

This bot allows:
- Viewing the price list of computer master services
- Booking appointments through an external booking service
- Calculating approximate service costs

### Architecture

The Computer Master bot follows SotaJS architectural principles:
- Clean business logic in domain
- Use Cases as entry points to the application
- Ports and adapters for external dependencies
- Output Ports to separate logic and presentation

### Computer Master Bot Structure

```
computer-master/
├── src/
│   ├── app/                 # Application Use Cases
│   ├── infra/               # Infrastructure adapters
│   ├── views/               # View components
│   └── index.ts             # Entry point to application
```

## Sales Bot

This bot is for sales reporting at retail locations, allowing:
- Shift management for sales staff
- Revenue reporting with breakdowns (cash, card, QR, transfer, returns)
- Performance metrics for sellers, supervisors, and managers

### Sales Bot Structure

```
sales-bot/
├── src/
│   ├── app/                 # Application data and mock services
│   ├── infra/               # Infrastructure adapters
│   └── views/               # View components
├── sales-bot-demo.ts        # Entry point to application
```

## eSIM Bot

This bot allows users to purchase eSIM cards for international travel:
- Browse eSIM options by country/region
- Select appropriate data plans
- Process payments through Telegram
- Manage order history

### Architecture

The eSIM bot follows Telegram bot development best practices:
- Clean separation of concerns between infrastructure and presentation
- Comprehensive UX/UI based on Telegram guidelines
- Mock data layer that can be replaced with real API integration

### eSIM Bot Structure

```
esim-bot/
├── src/
│   ├── app/                 # Application logic and mock data
│   ├── infra/               # Infrastructure adapters
│   └── views/               # View components
├── index.ts                 # Entry point to application
```

## PoC eSIM Travel Implementation

The eSIM bot includes a complete Proof-of-Concept implementation with:
- All screens fully functional but using fixtures instead of real data
- Realistic UI/UX that creates the impression of a production application
- Instant response interface without artificial delays
- Complete purchase flow simulation
- Order history with mock data

### Documentation
- `esim-poc-requirements.md` - Requirements for the PoC implementation
- `esim-poc-implementation.md` - Implementation details