# Local Development and Android Export Guide

## 1. Setting up Local Development Environment

To run this project on your computer, follow these steps:

### Prerequisites
- **Node.js**: Install the latest LTS version from [nodejs.org](https://nodejs.org/).
- **VS Code**: Recommended editor.

### Steps
1. **Download the Code**: Export the project as a ZIP file from the AI Studio settings menu and extract it.
2. **Open in VS Code**: Open the extracted folder in VS Code.
3. **Install Dependencies**: Open the terminal in VS Code and run:
   ```bash
   npm install
   ```
4. **Run the App**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 2. Exporting for Android (Capacitor)

This project uses Capacitor to bridge the web app to native platforms.

### Prerequisites
- **Android Studio**: Install from [developer.android.com](https://developer.android.com/studio).
- **Java JDK**: Ensure you have a compatible JDK installed (usually bundled with Android Studio).

### Steps
1. **Add Android Platform**:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```
2. **Build the Web Project**:
   ```bash
   npm run build
   ```
3. **Sync with Android**:
   ```bash
   npx cap sync
   ```
4. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```
5. **Run on Device/Emulator**:
   In Android Studio, click the **Run** button (green play icon) to launch the app on your connected device or an emulator.

---

## 3. Exporting for iOS (macOS only)

### Prerequisites
- **Xcode**: Install from the Mac App Store.

### Steps
1. **Add iOS Platform**:
   ```bash
   npm install @capacitor/ios
   npx cap add ios
   ```
2. **Build and Sync**:
   ```bash
   npm run build
   npx cap sync
   ```
3. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```
4. **Run in Xcode**:
   Select your device/simulator and click **Run**.
