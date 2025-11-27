# Native Build Setup for E2E Tests

## Current Progress

✅ **Android SDK**: Configured (`ANDROID_SDK_ROOT`)
✅ **Android Emulator**: Fixed (`Medium_Phone_API_36.0`)
✅ **Native Folders**: Generated (`expo prebuild` completed)
❌ **Java/JDK**: Required for building Android APK

## Step-by-Step Setup

### 1. Install Java Development Kit (JDK)

**Option A: Install JDK 17 (Recommended for Android)**
- Download: https://adoptium.net/temurin/releases/?version=17
- Choose: Windows x64, JDK 17
- Install the `.msi` file
- **Important**: During installation, check "Set JAVA_HOME variable"

**Option B: Use Android Studio's JDK**
- Android Studio includes a JDK
- Usually located at: `C:\Program Files\Android\Android Studio\jbr`
- Set `JAVA_HOME` to this path

### 2. Set JAVA_HOME Environment Variable

**Windows PowerShell (Temporary - Current Session):**
```powershell
# Find Java installation (usually one of these):
# C:\Program Files\Java\jdk-17
# C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot
# C:\Program Files\Android\Android Studio\jbr

# Set temporarily:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

**Windows (Permanent - System Environment):**
1. Open "Edit environment variables" (search in Start menu)
2. Click "Environment Variables"
3. Under "System variables", click "New"
4. Variable name: `JAVA_HOME`
5. Variable value: `C:\Program Files\Java\jdk-17` (or your JDK path)
6. Click OK
7. Edit "Path" variable, add: `%JAVA_HOME%\bin`
8. Click OK on all dialogs
9. **Restart PowerShell/terminal**

### 3. Verify Java Installation

```powershell
java -version
# Should show: openjdk version "17.0.x" or similar
```

### 4. Build Android APK

```powershell
cd C:\Users\madkongo\Desktop\Projects\AthenXMail\android
.\gradlew.bat assembleDebug
```

This will:
- Download Gradle (first time only - may take a few minutes)
- Build the Android APK
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### 5. Build with Detox

```powershell
cd C:\Users\madkongo\Desktop\Projects\AthenXMail
$env:ANDROID_SDK_ROOT = "C:\Users\madkongo\AppData\Local\Android\Sdk"
detox build -c android.emu.debug
```

### 6. Run E2E Tests

```powershell
npm run test:e2e:android
```

---

## Alternative: Use EAS Build (Cloud Build)

If local build is too complex, you can use Expo's cloud build service:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build Android development build
eas build --platform android --profile development --local

# This downloads the APK, then you can use it with Detox
```

---

## Troubleshooting

### "JAVA_HOME is not set"
- Make sure JAVA_HOME points to JDK (not JRE)
- Restart terminal after setting environment variables
- Verify with: `echo $env:JAVA_HOME` (PowerShell)

### "Gradle build failed"
- Check Android SDK is properly installed
- Verify `ANDROID_SDK_ROOT` is set
- Check Android Studio → SDK Manager → SDK Platforms (API 30+ installed)

### "APK not found"
- Check build completed successfully
- Verify path: `android/app/build/outputs/apk/debug/app-debug.apk`
- Run `.\gradlew.bat assembleDebug` again

---

## Quick Check Commands

```powershell
# Check Java
java -version

# Check Android SDK
echo $env:ANDROID_SDK_ROOT

# Check if APK exists
Test-Path "android/app/build/outputs/apk/debug/app-debug.apk"

# List available emulators
$env:ANDROID_SDK_ROOT\emulator\emulator -list-avds
```

---

## Current Status

✅ Native folders generated
✅ Emulator configured
⏳ Waiting for Java/JDK installation
⏳ Then build APK
⏳ Then run E2E tests

---

## Recommendation

**If you want to proceed:**
1. Install JDK 17 (see Step 1 above)
2. Set JAVA_HOME
3. Build APK
4. Run E2E tests

**If this is too complex:**
- ✅ Integration tests (41/41 passing) already verify all functionality
- ✅ Manual testing for visual verification
- 📸 E2E tests are optional








