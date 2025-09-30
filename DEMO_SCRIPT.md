# eSIM Travel Bot - Demo Script

## Overview
This script provides a step-by-step demonstration of the eSIM Travel Telegram bot, showcasing all major user journeys. The bot is a PoC implementation with all screens fully functional using realistic fixture data.

## Demo Setup
1. Ensure Bun is installed on your system
2. Run the bot with: `./run-esim-poc.sh`
3. Open Telegram and find your bot
4. Use the `/start` command to begin the demo

## Major User Journeys

### Journey 1: Complete Purchase Flow (Recommended for first-time demo)

**Step 1: Main Menu**
- Send `/start` to the bot
- Observe the welcome screen with options
- Highlight the value proposition: "Найдите и купите eSIM-карту для вашей поездки за границу"
- Note the available options: Каталог eSIM, Мои заказы, Популярные планы, Помощь

**Step 2: Browse eSIM Catalog**
- Click on "🌍 Каталог eSIM"
- Show the list of regions: Europe, USA, Asia, Worldwide
- Highlight the regional information (coverage, popularity)
- Note the visual appeal with flags and icons

### Journey 2: Plan Navigation Feature

**Step 1: Main Menu**
- Start by sending `/start`

**Step 2: Select a Country**
- Click on "🌍 Каталог eSIM"
- Select any country (e.g., "Европа")

**Step 3: Navigate Between Plans**
- Show the first plan for the selected country
- Note the counter showing "Plan X of Y"
- Click "➡️ Следующий" to go to the next plan
- Click "⬅️ Предыдущий" to go back to the previous plan
- Demonstrate the wrap-around behavior (going past the last plan returns to the first)

**Step 4: Add Plan for Comparison**
- While viewing a plan, click the "➕ Сравнить" button
- Show the confirmation that the plan has been added to comparison
- Note the option to "Сравнить планы" or "Выбрать другой"

### Journey 3: Plan Comparison Feature

**Step 1: Add First Plan to Comparison**
- Navigate to any country's plans
- Click "➕ Сравнить" on a plan

**Step 2: Add Second Plan to Comparison**
- Click "🔄 Выбрать другой" to continue browsing
- Navigate to another plan (can be same or different country)
- Click "➕ Сравнить" on the second plan
- Note that now both plans are ready for comparison

**Step 3: View Comparison**
- Click "📋 Сравнить планы"
- Show the side-by-side comparison of both plans
- Highlight the differences in price, duration, data, features
- Demonstrate the ability to purchase either plan directly from the comparison view

**Step 3: Select a Region**
- Click on "Европа" (or any region)
- Show the available plans for this region
- Highlight the plan details: price, duration, data, coverage
- Notice the features section with special benefits

**Step 4: View Plan Details**
- Click on any plan (e.g., "7 дней, 10 ГБ")
- Show the comprehensive details page
- Highlight:
  - Pricing information
  - Plan specifications (duration, data)
  - Coverage area
  - Special features
  - Compatibility information
- Note the purchase call-to-action

**Step 5: Purchase Confirmation**
- Click on "Купить за XX USD"
- Show the purchase confirmation screen
- Highlight:
  - Mock order ID
  - Purchase details
  - Activation instructions
  - Support information

**Step 6: Order History**
- Click on "📦 Мои заказы"
- Show the order history with mock data
- Highlight:
  - Previous orders
  - Status indicators
  - Order dates and details

### Journey 2: Quick Purchase via Popular Plans

**Step 1: Main Menu**
- Start by sending `/start`

**Step 2: Popular Plans**
- Click on "Популярные планы"
- Show the highlighted popular plans
- Explain why these plans are popular

**Step 3: Select Popular Plan**
- Choose any popular plan
- View detailed information

**Step 4: Complete Purchase**
- Go through the purchase flow
- Show confirmation

### Journey 3: Help and Information

**Step 1: Main Menu**
- Start by sending `/start`

**Step 2: Help Section**
- Click on "i Помощь"
- Show the help information:
  - How to use the service
  - What eSIM is
  - Benefits of eSIM
  - FAQ section

**Step 3: eSIM Information**
- Click on "i Центр поддержки" or "Подробнее об eSIM"
- Show:
  - Detailed eSIM technology explanation
  - Device compatibility
  - Activation process
  - Benefits

### Journey 4: Order Management

**Step 1: Main Menu**
- Start by sending `/start`

**Step 2: Order History**
- Click on "📦 Мои заказы"
- Show existing orders
- Highlight the ability to reorder

**Step 3: Reorder Process**
- Click "🔄 Повторить заказ"
- Show popular plans again (to encourage repeat purchase)

## Key Features to Highlight

### 1. User Experience (UX)
- Smooth navigation between screens
- Consistent UI elements
- Intuitive menu structure
- Quick response times (no artificial delays)

### 2. Information Architecture
- Clear prioritization of information
- Well-organized sections
- Visual hierarchy with headers and lists
- Appropriate use of emojis and icons

### 3. Content Quality
- Realistic pricing and plan information
- Detailed coverage areas
- Technical specifications
- Device compatibility information

### 4. Visual Design
- Consistent formatting using MarkdownV2
- Proper use of emojis for engagement
- Clear section breaks
- Structured information display

### 5. Functional Completeness
- All screens are fully functional
- Complete purchase flow simulation
- Order management capabilities
- Help and information sections

## Technical Implementation Notes

### Mock Data System
- All data comes from `mockESimPlans` and `mockCountries` arrays
- No real API connections in this PoC
- Data is realistic and mirrors actual eSIM offerings
- Easy to replace with real API integration later

### State Management
- Uses in-memory conversation state management
- Tracks user's current position in the flow
- Supports navigation between screens
- Can be easily replaced with persistent storage

### UI Components
- MessageBuilder class for consistent formatting
- Standardized formatting with escape sequences
- Consistent button layouts
- Clear visual hierarchy

## Demo Presentation Tips

1. **Emphasize the PoC Nature**: Explain that while this is using mock data, the UI/UX is identical to what would be in production.

2. **Show Realistic Data**: Point out how the pricing and plan details are realistic and based on actual eSIM offerings.

3. **Highlight the Complete Flow**: Demonstrate the end-to-end experience from browsing to purchase confirmation.

4. **Focus on Mobile Experience**: Mention that this is optimized for mobile use in Telegram.

5. **Explain Scalability**: Note how the mock data system can be replaced with real API calls in the full implementation.

6. **Show Navigation Flexibility**: Demonstrate how users can navigate back and forth between screens.

## Next Steps After Approval

1. Integrate with real eSIM provider APIs
2. Connect to payment processing systems
3. Implement persistent data storage
4. Add admin management interface
5. Enhance security and authentication