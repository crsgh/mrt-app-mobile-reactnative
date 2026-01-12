# MRT Mobile App

This is the mobile application for the MRT System, built with React Native and Expo.

## Prerequisites

- Node.js
- MRT Web System running locally on port 3000 (default)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on Android:
   - Press `a` in the terminal to open in Android Emulator
   - Or scan the QR code with Expo Go app on your Android device

## Configuration

The API Base URL is configured in `src/api/client.ts`.
Default is `http://10.0.2.2:3000` for Android Emulator.
If running on a physical device, update this to your computer's local IP address (e.g., `http://192.168.1.x:3000`).

## Features

- **Authentication**: Login with passenger credentials.
- **Scanner**: Scan Station QR codes to Tap In and Tap Out.
- **Wallet**: View balance (mocked) and trip history.
- **Profile**: View user details and logout.

## Architecture

- **Navigation**: React Navigation (Stack + Bottom Tabs).
- **State Management**: Zustand (Auth Store).
- **API**: Axios with Interceptors.
- **Storage**: Expo Secure Store.
- **Camera**: Expo Camera.
