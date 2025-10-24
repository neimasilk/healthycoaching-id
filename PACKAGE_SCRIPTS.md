# Android Package Scripts - Enhanced package.json

## 📦 Complete package.json Scripts for Android Optimization

```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",

    "### Android Development ###": "",
    "android:setup": "./scripts/setup-android.sh",
    "android:device": "react-native run-android --device",
    "android:emulator": "react-native run-android",
    "android:debug": "cd android && ./gradlew assembleDebug && ./gradlew installDebug",
    "android:release": "cd android && ./gradlew assembleRelease",
    "android:clean": "cd android && ./gradlew clean",
    "android:log": "adb logcat -s ReactNativeJS,ReactNative:V8,ReactNative:JSC",
    "android:test": "npm run test:android:unit && npm run test:android:instrumented",

    "### Android Building ###": "",
    "build:android:debug": "cd android && ./gradlew assembleDebug",
    "build:android:release": "cd android && ./gradlew assembleRelease",
    "build:android:bundle": "cd android && ./gradlew bundleRelease",
    "build:android:staging": "cd android && ./gradlew assembleStaging",
    "build:android:optimize": "./scripts/optimize-android-bundle.sh",
    "build:android:split": "cd android && ./gradlew assembleIndonesiaRelease",
    "build:android:analyze": "./scripts/analyze-bundle-size.sh",

    "### Android Testing ###": "",
    "test:android:unit": "jest --testPathPattern=unit/android",
    "test:android:instrumented": "cd android && ./gradlew connectedAndroidTest",
    "test:android:performance": "jest --testPathPattern=performance/android",
    "test:android:memory": "jest --testPathPattern=memory/android",
    "test:android:compatibility": "./scripts/test-device-compatibility.sh",
    "test:android:security": "npm audit --audit-level high && ./scripts/android-security-scan.sh",

    "### Android Deployment ###": "",
    "deploy:android:internal": "./scripts/deploy-internal.sh",
    "deploy:android:staging": "./scripts/deploy-staging.sh",
    "deploy:android:production": "./scripts/deploy-production.sh",
    "deploy:android:rollback": "./scripts/emergency-rollback.sh",

    "### Store Preparation ###": "",
    "check:android:requirements": "./scripts/check-play-store-requirements.sh",
    "check:android:performance": "./scripts/android-performance-check.sh",
    "check:android:security": "./scripts/android-security-check.sh",
    "check:android:compatibility": "./scripts/android-compatibility-check.sh",
    "prepare:android:store": "./scripts/prepare-play-store-assets.sh",
    "prepare:android:screenshots": "./scripts/generate-android-screenshots.sh",
    "prepare:android:metadata": "./scripts/generate-store-metadata.sh",

    "### Legacy Commands ###": "",
    "build:ios": "cd ios && xcodebuild -workspace HealthyCoaching.xcworkspace",
    "clean": "react-native clean",
    "clean:ios": "rm -rf ios/build"
  }
}
```

## 🚀 Android Script Descriptions

### Development Scripts
- **`android:setup`**: Initialize Android development environment
- **`android:device`**: Run on physical Android device
- **`android:emulator`**: Run on Android emulator
- **`android:debug`**: Build and install debug APK
- **`android:release`**: Build release APK for testing
- **`android:log`**: Monitor Android logs for React Native

### Build Scripts
- **`build:android:debug`**: Build debug APK
- **`build:android:release`**: Build release APK
- **`build:android:bundle`**: Build Play Store bundle (.aab)
- **`build:android:staging`**: Build staging variant
- **`build:android:optimize`**: Optimize bundle size
- **`build:android:split`**: Create split APKs by architecture
- **`build:android:analyze`**: Analyze bundle content and size

### Testing Scripts
- **`test:android:unit`**: Run Android-specific unit tests
- **`test:android:instrumented`**: Run device tests with Espresso
- **`test:android:performance`**: Run performance benchmarks
- **`test:android:memory`**: Test memory usage and leaks
- **`test:android:compatibility`**: Test on device matrix
- **`test:android:security`**: Run security vulnerability scans

### Deployment Scripts
- **`deploy:android:internal`**: Deploy to Play Store internal testing
- **`deploy:android:staging`**: Deploy to closed testing
- **`deploy:android:production`**: Deploy to production
- **`deploy:android:rollback`**: Emergency rollback procedure

### Store Preparation Scripts
- **`check:android:requirements`**: Verify Play Store requirements
- **`check:android:performance`**: Validate performance benchmarks
- **`check:android:security`**: Security compliance check
- **`check:android:compatibility`**: Device compatibility validation
- **`prepare:android:store`**: Generate Play Store assets
- **`prepare:android:screenshots`**: Capture device screenshots
- **`prepare:android:metadata`**: Generate store metadata

## 🎯 Usage Examples

### Development Workflow
```bash
# First time setup
npm run android:setup

# Development cycle
npm run android:debug          # Build debug APK
npm run android:log            # Monitor logs
npm run test:android:unit      # Run tests
npm run lint:fix              # Fix linting issues
```

### Build Process
```bash
# Optimized production build
npm run build:android:optimize
npm run build:android:bundle
npm run build:android:analyze
```

### Testing Before Deployment
```bash
# Complete testing suite
npm run test:android:unit
npm run test:android:instrumented
npm run test:android:performance
npm run test:android:compatibility
npm run check:android:requirements
```

### Deployment to Play Store
```bash
# Preparation
npm run prepare:android:store
npm run prepare:android:screenshots
npm run check:android:security

# Deployment
npm run deploy:android:internal
npm run deploy:android:production
```

**Complete Android optimization scripts ready!** 🚀📱