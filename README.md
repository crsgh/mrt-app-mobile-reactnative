# 📱 MRT System - Mobile Application

A modern React Native mobile app for the Metro Rapid Transit (MRT) system, enabling passengers to manage their commutes, scan station QR codes, track trips, and manage their digital wallet.

## 📋 Overview

The MRT Mobile App provides passengers with a seamless transit experience:
- **QR Code Scanning**: Quick tap-in and tap-out at stations
- **Digital Wallet**: Real-time balance tracking and top-up functionality
- **Trip History**: View past trips with fare breakdowns
- **Profile Management**: Update personal information and discount types
- **Real-time Fare Calculation**: Distance-based fare with automatic discounts
- **Secure Authentication**: JWT-based login and registration

## 🛠 Tech Stack

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Stack + Bottom Tabs)
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Storage**: Expo Secure Store
- **Camera**: Expo Camera
- **UI Components**: React Native core components
- **Icons**: Expo Vector Icons

## ✨ Features

### 🔐 Authentication
- User registration with discount type selection (Regular, PWD, Senior, Student)
- Secure login with JWT tokens
- Persistent authentication via Secure Store
- Automatic token refresh

### 🎫 QR Scanner
- Fast station QR code scanning
- Automatic tap-in/tap-out handling
- Real-time fare calculation
- Trip status indicators
- Support for discount application

### 💰 Wallet Management
- Real-time balance display
- Top-up via PayMongo integration
- Transaction history with filters
- Trip fare breakdowns
- Low balance notifications

### 👤 Profile
- View personal information
- Display discount type and status
- Secure logout
- Account statistics

### 🏠 Home Dashboard
- Quick access to all features
- Active trip status
- Recent transactions
- Navigation shortcuts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn
- Expo Go app (for physical device testing)
- Android Studio (for Android Emulator) or Xcode (for iOS Simulator)
- **MRT Web Application** running on `http://localhost:3000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mrt-app-mobile-reactnative
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure API Base URL**
   
   Edit `src/api/client.ts`:
   ```typescript
   // For Android Emulator
   const API_BASE_URL = 'http://10.0.2.2:3000';
   
   // For iOS Simulator
   const API_BASE_URL = 'http://localhost:3000';
   
   // For Physical Device (replace with your computer's IP)
   const API_BASE_URL = 'http://192.168.1.x:3000';
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Running on Devices

#### Android Emulator
```bash
npx expo start --android
# or press 'a' in the terminal
```

#### iOS Simulator (macOS only)
```bash
npx expo start --ios
# or press 'i' in the terminal
```

#### Physical Device
1. Install [Expo Go](https://expo.dev/client) on your device
2. Scan the QR code displayed in the terminal
3. Ensure your device is on the same network as your development machine

## 📁 Project Structure

```
mrt-app-mobile-reactnative/
├── src/
│   ├── api/                   # API configuration
│   │   ├── client.ts         # Axios instance with interceptors
│   │   └── endpoints.ts      # API endpoint functions
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── navigation/           # Navigation setup
│   │   ├── AppNavigator.tsx  # Main navigation structure
│   │   └── types.ts         # Navigation type definitions
│   ├── screens/              # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ScannerScreen.tsx
│   │   ├── WalletScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── FarePriceScreen.tsx
│   ├── store/                # State management
│   │   └── authStore.ts     # Authentication store (Zustand)
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                # Utility functions
│       └── storage.ts       # Secure storage helpers
├── assets/                   # Images, fonts, etc.
├── App.tsx                   # Root component
├── index.ts                  # Entry point
├── app.json                  # Expo configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🔌 API Integration

The app connects to the MRT Web Application API. Key endpoints:

### Authentication
```typescript
POST /api/mobile/auth/login      // Login
POST /api/mobile/auth/signup     // Register
GET  /api/mobile/auth/me         // Get current user
```

### Stations
```typescript
GET  /api/mobile/stations        // List all stations
POST /api/mobile/stations/tap    // Tap in/out
```

### Wallet
```typescript
GET  /api/mobile/wallet               // Get balance
GET  /api/mobile/wallet/transactions  // Transaction history
POST /api/mobile/wallet/topup         // Top up wallet
```

### Passenger
```typescript
GET  /api/mobile/passenger/profile    // Get profile
PUT  /api/mobile/passenger/profile    // Update profile
```

## 💳 Payment Flow

1. User initiates wallet top-up
2. App creates payment link via PayMongo
3. User redirects to PayMongo payment page
4. Payment processed (GCash, Card, etc.)
5. User returns to app
6. App verifies payment and updates balance

## 📱 Screen Details

### Login Screen
- Username/email and password input
- Remember me functionality
- Navigation to signup

### Signup Screen
- Full registration form
- Discount type selection with Picker
- Profile image upload
- Form validation

### Home Screen
- Quick action buttons
- Active trip status
- Recent transactions
- Welcome message

### Scanner Screen
- Camera-based QR code scanner
- Real-time scanning feedback
- Station information display
- Trip initiation/completion

### Wallet Screen
- Balance card
- Top-up button
- Transaction history list
- Filter by transaction type

### Profile Screen
- User information display
- Discount badge
- Account statistics
- Logout functionality

### Fare Price Screen
- Station-to-station selector
- Real-time fare calculation
- Discount application preview
- Distance information

## 🎨 UI/UX Features

- **Clean, modern interface** with intuitive navigation
- **Bottom tab navigation** for easy access to main features
- **Real-time updates** for wallet and trip status
- **Loading states** and error handling
- **Responsive design** for various screen sizes
- **Native animations** using React Native Reanimated

## 🔒 Security

- JWT tokens stored securely using Expo Secure Store
- Automatic token inclusion in API requests
- Token expiration handling with re-authentication
- Secure payment processing via PayMongo
- Camera permissions handling

## 🛠️ Available Scripts

```bash
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser (limited features)
```

## 🧪 Testing

### Test Accounts
Create test passengers using the web app:
```bash
cd ../mrt-app
node scripts/seed-test-passengers.js
```

### Test Flow
1. Login with test credentials
2. Navigate to Scanner
3. Scan station QR code (use web app's QR testing page)
4. Complete a trip
5. Check wallet for deductions
6. View transaction history

## 📋 Requirements

- **iOS**: iOS 13.4 or higher
- **Android**: Android 5.0 (API 21) or higher
- **Camera permissions**: Required for QR scanning
- **Storage permissions**: Required for secure token storage
- **Network access**: Required for API communication

## 🚀 Building for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA
```bash
npx expo build:ios
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 🐛 Troubleshooting

### Cannot connect to API
- Ensure the web server is running on port 3000
- Check API_BASE_URL in `src/api/client.ts`
- Verify network connectivity
- For Android Emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's local IP address

### Camera not working
- Check camera permissions in device settings
- Ensure Expo Camera is properly installed
- Test on a physical device (cameras don't work in simulators)

### Build errors
```bash
# Clear cache
npm start -- --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 🔄 Updates

To update Expo and dependencies:
```bash
npx expo upgrade
```

## 🤝 Integration with Web App

This mobile app requires the [MRT Web Application](../mrt-app/README.md) to be running. The web app provides:
- Authentication services
- Station data
- Trip management
- Wallet operations
- Payment processing

## 📄 License

This project is private and confidential.

## 👨‍💻 Author

Carlos Miranda

---

For web application documentation, see [MRT Web App README](../mrt-app/README.md)
