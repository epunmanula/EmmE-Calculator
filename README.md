# 🌌 EmmE Calculator

[![Release](https://img.shields.io/badge/Release-v1.0.0-blueviolet?style=for-the-badge)](https://github.com/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Android-blue?style=for-the-badge)](https://github.com/)
[![Desktop Size](https://img.shields.io/badge/Desktop%20Size-1.83%20MB-success?style=for-the-badge)](https://github.com/)
[![Android Build](https://github.com/your-username/emme-calculator/actions/workflows/build-apk.yml/badge.svg)](https://github.com/your-username/emme-calculator/actions)

A stunning, premium-grade, and futuristic calculator application designed with modern aesthetics (glassmorphism, vibrant HSL tailored colors, and sleek micro-animations) and packed with versatile functional workspaces for desktop and mobile!

---

## ⚡ Deployment Modes

### 💻 1. Lightweight Desktop App (~1.83MB)
Engineered using **Neutralinojs** to eliminate massive bundle runtimes like Chromium/Node.js, producing a single, self-contained, lightning-fast executable file of only **1.83MB** for Windows, macOS, or Linux.

### 📱 2. High-Performance Android App (APK)
A fully native Android application wrapper utilizing a full-screen **WebView** shell to render the premium Web UI. 
*   **Zero Loading Lag:** Assets are loaded locally from the device's internal packaging (`file:///android_asset/`).
*   **Fully Responsive:** Automatic scaling and viewport control designed to fit perfectly on any mobile screen aspect ratio.
*   **Cloud Compiled:** Integrated with **GitHub Actions** to automatically compile the APK file in the cloud on every push!

---

## ✨ Features

### 🎨 Premium Visual Aesthetics
*   **Futuristic Cyberpunk Glassmorphism Layout:** Gorgeous visual overlays, glowing holographic particles, and modern high-fidelity typography.
*   **Vibrant Interactive Elements:** Sleek pop-and-click feedback, fluid grid ripple animations on keystrokes, and a glowing pulse effect on the equals key.
*   **Theme Engine:** Instantly switch between multiple high-contrast neon accents (Neon Lime, Pink Cyber, Cyan Haze, Yellow Aura).
*   **Responsive Control Dashboard:** Clean vertical sidebar with smooth transitions for quick navigation between toolsets.

### 🧮 Multi-Disciplinary Workspaces
1.  **Standard Mode:** Classic calculations with clear history and a mini-terminal debugger screen showing internal program actions in real-time.
2.  **Scientific Mode:** Dedicated calculations for engineers, including trigonometric operations ($sin$, $cos$, $tan$), logarithms ($log$, $ln$), brackets, and powers.
3.  **Developer Mode:** Real-time multi-base calculator (Hexadecimal `HEX`, Decimal `DEC`, Octal `OCT`, Binary `BIN`) syncing keystrokes instantly across all four bases.
4.  **Exchange Rate Converter:** Livesync global currency streams (converting between USD, EUR, LKR, GBP, AUD, etc.) using live API feeds, with active rate swap and live conversion toggles.

### 🛠️ Advanced Utility Extensions
*   **Smart Data Tape:** A scrolling calculation history tape allowing you to view and copy past equations and answers instantly using a clipboard copier.
*   **Developer Quick Converter:**
    *   **Data Storage:** Dynamic Byte-to-Kilobyte/Megabyte/Gigabyte calculator.
    *   **CSS Layout Units:** Real-time Pixels (px) to REM design converter.
*   **System Settings:** Personalize UI configurations, toggle key sounds, set up custom API keys for currency APIs, and view session statistics.

---

## 📂 Project Structure

```
.
├── resources/                     # Common Web assets (HTML, CSS, JS, Logos)
├── Releases/                      # Pre-compiled application builds
│   ├── Windows/                   # Lightweight standalone Windows desktop app (.exe & .zip)
│   └── Android/                   # High-performance Android installation file (.apk)
├── emmecalculator-android/        # Native Android project (Kotlin / Gradle wrapper)
│   └── app/src/main/assets/       # Embedded Web assets for Android WebView
├── .github/workflows/             # GitHub Actions CI/CD workflows
│   └── build-apk.yml              # Automated APK Compiler script
├── neutralino.config.json         # Desktop App Packaging configuration
└── README.md                      # Project documentation
```

---

## ⚡ Quick Start (Windows Standalone)

We have packaged the Windows application in an extremely compact, ready-to-run format in the `Releases/Windows/` directory.

1.  Navigate to the [Releases/Windows/](file:///d:/web/software/calculator/Releases/Windows/) folder in this repository.
2.  You can double-click **`EmmECalculator.exe`** to launch it instantly, or download and extract the compressed **`EmmECalculator-Windows.zip`** archive.
3.  Enjoy using the sleek, lightweight desktop app!

> [!NOTE]
> Since this is a custom-compiled standalone C++ executable, your Windows Defender/SmartScreen may show a security prompt when opening it for the first time. Simply click **"More info"** and select **"Run anyway"** to launch.

---

## 📱 Quick Start (Android APK)

We have provided a pre-compiled high-performance installation APK in the `Releases/Android/` directory, and also configured **automated cloud compilation** on GitHub!

### Method 1: Instant Installation (Recommended)
1.  Navigate to [Releases/Android/](file:///d:/web/software/calculator/Releases/Android/).
2.  Download **`EmmECalculator.apk`** to your Android device.
3.  Tap the downloaded file to install and launch the calculator!

### Method 2: Cloud Compiler (Compile from Source)
1.  Push this codebase to your personal GitHub repository.
2.  Navigate to the **Actions** tab on your GitHub repository page.
3.  Under the workflows list, click on **Build Android APK**.
4.  You will see a running workflow. Once it completes successfully (indicated by a green checkmark), click on the completed run.
5.  Scroll down to the **Artifacts** section at the bottom, and click on **`EmmECalculator-Android-Debug-APK`** to download your custom `.apk` file!
6.  Transfer the `.apk` file to your mobile phone, tap it to install, and enjoy your stunning calculator app on the go!

---

## 🛠️ Development & Building from Source (Local)

### 💻 For Desktop:
1.  **Prerequisites:** Node.js (v16+) installed.
2.  **Download binaries:** `npx @neutralinojs/neu update`
3.  **Run in Dev mode:** `npx @neutralinojs/neu run`
4.  **Build binary:** `npx @neutralinojs/neu build --embed-resources`

### 📱 For Android:
1.  **Prerequisites:** Java JDK 17 and Android Studio installed.
2.  **Open Project:** Open the `emmecalculator-android` folder in Android Studio.
3.  **Build debug APK locally:** Open your terminal inside the `emmecalculator-android/` directory and run:
    ```bash
    ./gradlew assembleDebug
    ```
    Your compiled APK will be generated at `emmecalculator-android/app/build/outputs/apk/debug/app-debug.apk`!

---

## 📄 License

This project is licensed under the MIT License - feel free to use, modify, and distribute it!

---

*Made with 💖 by Epun Manula.*
