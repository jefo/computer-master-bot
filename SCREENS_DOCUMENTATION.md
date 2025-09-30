# eSIM Travel Bot - UI Screens Documentation

## Overview
This document provides detailed information about all UI screens available in the eSIM Travel Telegram bot. All screens are fully functional and use realistic fixture data as per the PoC requirements.

## Screen List

### 1. Main Menu (`showMainMenu`)
**Trigger:** `/start` command or `back_to_main` callback

**Features:**
- Welcome message with eSIM Travel branding
- Overview of what users can do with the bot
- Access to main navigation options:
  - 🌍 Каталог eSIM (Browse eSIM plans by region)
  - 📦 Мои заказы (View order history)
  - Популярные планы (View popular plans)
  - i Помощь (Get help and information)

**Design Elements:**
- Attractive header with travel emojis
- Clear section organization
- Prominent call-to-action buttons

---

### 2. eSIM Catalog (`showESimCatalog`)
**Trigger:** `show_esim_catalog` callback

**Features:**
- Lists all available regions with eSIM plans
- Shows region details: coverage, popularity
- Provides access to country-specific options
- Includes link to popular plans

**Available Regions:**
- Europe (Европа) - Covers 25+ countries
- USA (США) - Covers USA and Canada
- Asia (Азия) - Covers 20+ countries
- Worldwide (Мир) - Global coverage

**Design Elements:**
- Regional flags and descriptions
- Coverage and popularity indicators
- Visual appeal with emojis and icons

---

### 3. Country-Specific Plans with Navigation (`showCountryESimOptions`)
**Trigger:** `select_country_{countryId}` callback

**Features:**
- Shows the first plan for the selected country
- Displays counter showing current plan position (e.g., "Plan 1 of 3")
- Provides navigation buttons:
  - "⬅️ Предыдущий" to go to the previous plan
  - "➡️ Следующий" to go to the next plan
- Option to add current plan to comparison with "➕ Сравнить"
- Purchase button for the current plan
- Navigation to other sections

**Design Elements:**
- Clear plan counter showing position
- Intuitive navigation controls
- Consistent formatting for all plans
- Wrap-around navigation (last plan connects to first)

---

### 4. Plan Comparison (`showComparisonView`)
**Trigger:** `start_comparison` callback

**Features:**
- Displays two selected plans side-by-side
- Shows first plan with all details (price, duration, data, features)
- Shows second plan with all details below the first
- Clear comparison of features and specifications
- Options to purchase either plan directly
- Ability to replace one of the plans or clear comparison

**Design Elements:**
- Clear separation between the two plans
- Consistent formatting for both plans
- Easy access to purchase either plan
- Option to continue browsing or comparing

---

### 5. Add to Comparison (`addToComparison`)
**Trigger:** `add_to_compare_{planId}` callback

**Features:**
- Confirms addition of plan to comparison list
- Shows how many plans are currently in comparison (1 or 2)
- Provides options to start comparison, add another plan, or go back
- Manages the comparison list (max 2 plans)

**Design Elements:**
- Clear confirmation message
- Visual indication of comparison count
- Intuitive next-step options

---

### 6. Popular Plans (`showPopularPlans`)
**Trigger:** `show_popular_plans` callback

**Features:**
- Displays most popular eSIM plans
- Shows detailed information about each plan
- Pricing and plan specifications
- Special features of each plan

**Available Popular Plans:**
- Europe: 7 days, 10 GB - $25
- Asia: 10 days, 15 GB - $35
- Other plans based on popularity

**Design Elements:**
- Highlighted as popular choices
- Clear plan specifications
- Feature highlights with emojis

---

### 3. Popular Plans (`showPopularPlans`)
**Trigger:** `show_popular_plans` callback

**Features:**
- Displays most popular eSIM plans
- Shows detailed information about each plan
- Pricing and plan specifications
- Special features of each plan

**Available Popular Plans:**
- Europe: 7 days, 10 GB - $25
- Asia: 10 days, 15 GB - $35
- Other plans based on popularity

**Design Elements:**
- Highlighted as popular choices
- Clear plan specifications
- Feature highlights with emojis

---

### 4. Country-Specific eSIM Options (`showCountryESimOptions`)
**Trigger:** `select_country_{countryId}` callback

**Features:**
- Shows all plans available for a specific region
- Details about each plan in the selected region
- Pricing, duration, and data specifications
- Coverage information

**Design Elements:**
- Region-specific header
- Detailed plan information
- Clear pricing and specification lists

---

### 5. Plan Details (`showPlanDetails`)
**Trigger:** `select_plan_{planId}` callback

**Features:**
- Comprehensive details about a specific plan
- Coverage information
- Special features of the plan
- Pricing and technical specifications
- Purchase option

**Information Included:**
- Plan duration and data allowance
- Coverage area
- Special features (WhatsApp unlimited, 4G/5G support, etc.)
- Device compatibility information
- Purchase call-to-action

**Design Elements:**
- Structured information sections
- Clear pricing display
- Feature highlights with checkmarks

---

### 6. Checkout View (`showCheckout`)
**Trigger:** Purchase flow step

**Features:**
- Purchase confirmation information
- Information about what happens after purchase
- Payment instructions (simulated in PoC)
- eSIM activation details

**Design Elements:**
- Confirmation messaging
- Information about post-purchase process
- Clear call-to-action for purchase

---

### 7. Purchase Confirmation (`showPurchaseConfirmation`)
**Trigger:** `purchase_plan` callback

**Features:**
- Success message for completed purchase
- Order details with mock information
- eSIM activation instructions
- Order ID and status information
- Links to support resources

**Information Included:**
- Mock order ID
- Purchase date
- eSIM plan details
- Activation steps
- Support information

**Design Elements:**
- Celebration message with success indicators
- Structured order details
- Clear activation instructions

---

### 8. My Orders (`showMyOrders`)
**Trigger:** `my_orders` callback

**Features:**
- Displays user's order history with mock data
- Shows order status, date, and plan details
- Option to reorder previous plans
- Support links

**Mock Orders Included:**
- Europe, 7 days - Completed
- USA, 5 days - Completed
- Japan, 14 days - Active
- Asia, 10 days - Active

**Design Elements:**
- Organized order list
- Status indicators with appropriate emojis
- Clear date and ID information

---

### 9. Help (`showHelp`)
**Trigger:** `help` callback

**Features:**
- General information about eSIM Travel service
- Instructions on how to use the service
- Information about what eSIM is
- Benefits of using eSIM
- FAQ section with common topics
- Support contact information

**Design Elements:**
- Numbered steps for using the service
- Clear benefit highlights
- Organized FAQ section

---

### 10. eSIM Info (`showESimInfo`)
**Trigger:** `show_esim_info` or `esim_settings_help` callback

**Features:**
- Detailed information about eSIM technology
- Benefits of using eSIM
- Device compatibility information
- Activation process steps
- Support information

**Information Included:**
- eSIM technology explanation
- Device compatibility list
- Activation process steps
- Benefits summary

**Design Elements:**
- Clear sections for different information types
- Numbered activation steps
- Device compatibility list with icons

---

## Navigation Flow

The bot supports both forward and backward navigation:

- Main Menu → Catalog → Country Plans → Plan Details → Purchase Flow → Confirmation
- Main Menu → Popular Plans → Plan Details → Purchase Flow → Confirmation
- Main Menu → My Orders → Reorder
- All screens have a "← Назад" (Back) button to return to previous screens
- Users can always return to the main menu using the "← Назад" button

## Data Structure

The bot uses mock data defined in `telegram-views.ts`:

### Mock eSIM Plans:
- Europe plan: 7 days, 10GB - $25 with unlimited WhatsApp
- USA plan: 5 days, 5GB - $20 with 4G support
- Asia plan: 10 days, 15GB - $35 with unlimited messengers
- Worldwide plan: 15 days, 20GB - $50 with 200+ countries coverage

### Mock Countries:
- Europe: Covers Germany, France, Italy, Spain, Netherlands
- USA: Covers USA and Canada
- Asia: Covers Thailand, Vietnam, Indonesia, Malaysia, Singapore
- Worldwide: Global coverage

## UI/UX Features

1. **Visual Appeal:**
   - Emojis used throughout for better engagement
   - Structured information with clear headings
   - Consistent formatting

2. **User Experience:**
   - Intuitive navigation
   - Clear calls-to-action
   - Informative messages
   - Success/error/warning indicators

3. **Information Architecture:**
   - Prioritized information display
   - Grouped related information
   - Clear visual hierarchy

## Implementation Notes

- All screens are fully functional with realistic fixture data
- No real API connections - all data is mocked as per PoC requirements
- Uses Telegram's MarkdownV2 formatting for rich text display
- State management through conversation states
- Comprehensive error handling