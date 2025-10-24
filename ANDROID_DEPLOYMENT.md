# Android Deployment Guide - HealthyCoaching Indonesia

## 🎯 Overview

Comprehensive deployment guide untuk **HealthyCoaching Indonesia** dengan focus pada Google Play Store optimization dan Android-specific requirements.

---

## 🚀 Build Configuration

### 1. **Production Build Setup**
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        applicationId "com.healthycoaching.id"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"

        // MultiDex untuk app dengan banyak dependencies
        multiDexEnabled true

        // Vector drawable support
        vectorDrawables.useSupportLibrary = true

        // NDK configuration untuk performance
        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'
        }

        // Indonesian market specific
        resConfigs "en", "id"
        flavorDimensions "version"
    }

    buildTypes {
        debug {
            applicationIdSuffix ".debug"
            debuggable true
            minifyEnabled false
            shrinkResources false
            applicationIdSuffix ".debug"
            versionNameSuffix "-debug"
        }

        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release

            // Optimizations
            crunchPngs true
            crunchPngs true

            // Build performance
            ndk {
                debugSymbolLevel 'SYMBOL_TABLE'
            }
        }

        // Staging build for testing
        staging {
            initWith release
            applicationIdSuffix ".staging"
            debuggable true
            signingConfig signingConfigs.debug
            matchingFallbacks = ['release']
        }
    }

    // Build variants for different markets
    flavorDimensions "market"
    productFlavors {
        production {
            dimension "market"
            applicationIdSuffix ""
        }

        indonesia {
            dimension "market"
            applicationIdSuffix ".id"
            // Indonesian-specific configurations
            buildConfigField "String", "MARKET", '"indonesia"'
            buildConfigField "boolean", "ENABLE_LOCAL_PAYMENTS", "true"
            buildConfigField "String", "DEFAULT_CURRENCY", '"IDR"'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = '11'
    }

    // Split APKs for better performance
    splits {
        abi {
            reset()
            enable enableSeparateBuildPerCPUArchitecture
            universalApk false
            include "armeabi-v7a", "x86", "arm64-v8a", "x86_64"
        }
    }

    // Bundle optimization for Play Store
    bundle {
        language {
            enableSplit = true
        }
        density {
            enableSplit = true
        }
        abi {
            enableSplit = true
        }
    }
}
```

### 2. **ProGuard Rules for Indonesian Context**
```proguard
# proguard-rules.pro

# Keep Indonesian models and entities
-keep class com.healthycoaching.id.model.** { *; }
-keep class com.healthycoaching.id.data.makanan.** { *; }
-keep class com.healthycoaching.id.entities.** { *; }

# Keep payment method classes (Indonesian)
-keep class com.healthycoaching.id.payment.gopay.** { *; }
-keep class com.healthycoaching.id.payment.ovo.** { *; }
-keep class com.healthycoaching.id.payment.dana.** { *; }
-keep class com.healthycoaching.id.payment.banktransfer.** { *; }

# Keep Indonesian helpers and utilities
-keep class com.healthycoaching.id.utils.IndonesianHelpers { *; }
-keep class com.healthycoaching.id.utils.RupiahFormatter { *; }
-keep class com.healthycoaching.id.utils.IndonesianDateFormatter { *; }

# React Native specific rules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutor { *; }

# Keep Hermes and JSC
-keep class com.facebook.hermes.** { *; }
-keep class org.webkit.** { *; }

# Keep SQLite and database classes
-keep class android.database.sqlite.** { *; }
-keep class androidx.sqlite.** { *; }

# Keep network and HTTP classes
-keep class com.squareup.okhttp.** { *; }
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }

# Keep compression and image libraries
-keep class com.bumptech.glide.** { *; }
-keep class android.graphics.** { *; }

# Firebase specific
-keep class com.google.firebase.** { *; }
-keepclassmembers class * {
    @com.google.firebase.database.Ignore <fields>;
}

# Remove debug logs in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Indonesian-specific optimizations
-keep class com.healthycoaching.id.locale.** { *; }
-keep class java.text.** { *; }
-keep class java.util.** { *; }
```

---

## 🔐 Signing Configuration

### 1. **Release Key Setup**
```kotlin
// android/app/build.gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('HEALTHYCOACHING_RELEASE_STORE_FILE')) {
                storeFile file(HEALTHYCOACHING_RELEASE_STORE_FILE)
                storePassword HEALTHYCOACHING_RELEASE_STORE_PASSWORD
                keyAlias HEALTHYCOACHING_RELEASE_KEY_ALIAS
                keyPassword HEALTHYCOACHING_RELEASE_KEY_PASSWORD
            }
        }

        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
}
```

### 2. **Key Generation Script**
```bash
#!/bin/bash
# scripts/generate-release-key.sh

echo "Generating release keystore for HealthyCoaching Indonesia..."

# Create keystore directory
mkdir -p android/app/keystore

# Generate release keystore
keytool -genkey \
    -v \
    -keystore android/app/keystore/healthycoaching-release.keystore \
    -alias healthycoaching \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=HealthyCoaching ID, OU=Development, O=HealthyCoaching, L=Jakarta, ST=DKI Jakarta, C=ID"

echo "Release keystore generated successfully!"
echo ""
echo "Add these to your environment variables or gradle.properties:"
echo "HEALTHYCOACHING_RELEASE_STORE_FILE=../keystore/healthycoaching-release.keystore"
echo "HEALTHYCOACHING_RELEASE_STORE_PASSWORD=your_store_password"
echo "HEALTHYCOACHING_RELEASE_KEY_ALIAS=healthycoaching"
echo "HEALTHYCOACHING_RELEASE_KEY_PASSWORD=your_key_password"
```

### 3. **Environment Variables Setup**
```properties
# gradle.properties

# Release signing (do not commit to version control)
HEALTHYCOACHING_RELEASE_STORE_FILE=../keystore/healthycoaching-release.keystore
HEALTHYCOACHING_RELEASE_STORE_PASSWORD=your_store_password
HEALTHYCOACHING_RELEASE_KEY_ALIAS=healthycoaching
HEALTHYCOACHING_RELEASE_KEY_PASSWORD=your_key_password

# Build optimization
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
android.enableR8.fullMode=true

# Indonesian market
android.bundle.enableUncompressedNativeLibs=false
```

---

## 📦 Build Optimization

### 1. **Bundle Size Optimization**
```gradle
// Bundle optimization settings
android {
    bundle {
        language {
            enableSplit = true  // Split by language (ID, EN)
        }
        density {
            enableSplit = true  // Split by screen density
        }
        abi {
            enableSplit = true  // Split by architecture
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true

            // Optimize PNG
            crunchPngs true

            // Enable R8 full mode
            aaptOptions.cruncherEnabled = true

            // Optimize native libraries
            ndk {
                debugSymbolLevel 'SYMBOL_TABLE'
            }
        }
    }
}
```

### 2. **Asset Optimization Script**
```bash
#!/bin/bash
# scripts/optimize-assets.sh

echo "Optimizing assets for Android bundle size..."

# Optimize images
echo "Optimizing PNG images..."
find android/app/src/main/res/drawable* -name "*.png" | \
while read file; do
    if [[ $file == *"/drawable-"* ]]; then
        # Create WebP version for smaller size
        webp_file="${file%.png}.webp"
        cwebp -q 80 "$file" -o "$webp_file"

        # Check if WebP is smaller
        if [ -f "$webp_file" ] && [ $(stat -f%z "$webp_file") -lt $(stat -f%z "$file") ]; then
            rm "$file"
            echo "Converted $file to WebP"
        else
            rm "$webp_file"
        fi
    fi
done

# Optimize fonts
echo "Optimizing Indonesian fonts..."
# Font subset for Indonesian characters only
pyftsubset fonts/Roboto-Regular.ttf \
    --unicodes-file=indonesian-unicodes.txt \
    --output-file=android/app/src/main/assets/fonts/Roboto-ID-Regular.ttf

echo "Asset optimization completed!"
```

### 3. **Bundle Analysis**
```gradle
// Bundle size analysis task
android.applicationVariants.all { variant ->
    variant.outputs.all { output ->
        def task = project.tasks.create("analyzeBundle${variant.name.capitalize()}") {
            doLast {
                def bundleFile = output.outputFile
                println "Analyzing bundle: ${bundleFile}"

                // Run bundle analyzer
                exec {
                    commandLine "bundletool", "build-apks",
                        "--bundle=${bundleFile}",
                        "--output=${bundleFile}.apks",
                        --device-spec=android/device-specs/pixel2.json
                }

                // Get size information
                def size = bundleFile.length()
                def sizeMB = size / (1024 * 1024)
                println "Bundle size: ${sizeMB} MB"

                if (sizeMB > 150) {
                    println "WARNING: Bundle size exceeds Play Store limit (150MB)"
                }
            }
        }
        variant.assembleProvider.get().finalizedBy(task)
    }
}
```

---

## 🚀 Deployment Scripts

### 1. **Automated Build Script**
```bash
#!/bin/bash
# scripts/build-android.sh

set -e

echo "🚀 Building HealthyCoaching Indonesia for Android..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean

# Check environment variables
if [ -z "$HEALTHYCOACHING_RELEASE_STORE_PASSWORD" ]; then
    echo "❌ Missing release signing configuration!"
    exit 1
fi

# Build release bundle
echo "📦 Building release bundle..."
./gradlew assembleRelease bundleRelease

# Build APKs for device testing
echo "📱 Building APKs for testing..."
./gradlew assembleIndonesiaRelease

# Run automated tests
echo "🧪 Running tests..."
cd ..
npm run test:android:unit
npm run test:android:instrumented

# Analyze bundle size
echo "📊 Analyzing bundle size..."
cd android
./gradlew analyzeBundleIndonesiaRelease

echo "✅ Android build completed successfully!"
echo ""
echo "Generated files:"
echo "- Bundle: android/app/build/outputs/bundle/indonesiaRelease/app-indonesia-release.aab"
echo "- APKs: android/app/build/outputs/apk/indonesia/release/"
```

### 2. **Testing Script**
```bash
#!/bin/bash
# scripts/test-before-deploy.sh

echo "🧪 Running pre-deployment tests..."

# Unit tests
echo "🔬 Running unit tests..."
npm run test:unit

# Android instrumented tests
echo "📱 Running Android instrumented tests..."
npm run test:android:instrumented

# Performance tests
echo "⚡ Running performance tests..."
npm run test:android:performance

# Memory leak tests
echo "🧠 Running memory leak tests..."
npm run test:android:memory

# Device compatibility tests
echo "📲 Running device compatibility tests..."
npm run test:android:compatibility

# Security tests
echo "🔒 Running security tests..."
npm run test:security

echo "✅ All tests passed! Ready for deployment."
```

---

## 📱 Google Play Store Preparation

### 1. **Store Listing Setup**
```
📝 App Information:
- App Name: HealthyCoaching Indonesia
- Short Description: Health coaching app with Indonesian food database
- Full Description: Complete nutrition tracking with 1000+ Indonesian foods
- Category: Health & Fitness
- Content Rating: Everyone
- Tags: nutrition, fitness, indonesian food, diet, workout

🏷️ Store Listing (Indonesian):
Nama Aplikasi: HealthyCoaching Indonesia
Deskripsi Singkat: Aplikasi health coaching dengan database makanan Indonesia
Deskripsi Lengkap: Lacak nutrisi dengan 1000+ makanan lokal Indonesia
Kategori: Kesehatan & Kebugaran
```

### 2. **Screenshot Requirements**
```bash
# scripts/generate-screenshots.sh

echo "📸 Generating Android screenshots..."

# Install device frames
adb devices

# Take screenshots for different devices
devices=("Pixel2" "Nexus5X" "NexusLowRes")

for device in "${devices[@]}"; do
    echo "📱 Taking screenshots for $device..."

    # Main screens
    adb -s $device shell screencap -p /sdcard/healthycoaching-home.png
    adb -s $device pull /sdcard/healthycoaching-home.png screenshots/android/$device/home.png

    # Food search screen
    adb -s $device shell screencap -p /sdcard/healthycoaching-search.png
    adb -s $device pull /sdcard/healthycoaching-search.png screenshots/android/$device/search.png

    # Nutrition tracking screen
    adb -s $device shell screencap -p /sdcard/healthycoaching-nutrition.png
    adb -s $device pull /sdcard/healthycoaching-nutrition.png screenshots/android/$device/nutrition.png

    # Payment screen
    adb -s $device shell screencap -p /sdcard/healthycoaching-payment.png
    adb -s $device pull /sdcard/healthycoaching-payment.png screenshots/android/$device/payment.png
done

echo "✅ Screenshots generated in screenshots/android/"
```

### 3. **Release Checklist**
```markdown
## 🎯 Pre-Launch Checklist

### 📋 App Store Requirements
- [ ] App name available
- [ ] Bundle size < 150MB
- [ ] Target API level 33+ (Play Store requirement)
- [ ] 64-bit architecture supported
- [ ] Indonesian language support
- [ ] Privacy policy provided
- [ ] Content rating completed
- [ ] Target audience set (all ages)
- [ ] App screenshots (10-15)
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots for phone and tablet

### 🔧 Technical Requirements
- [ ] App signing configured
- [ ] ProGuard/R8 enabled
- [ ] Native libraries signed
- [ ] Debug symbols stripped
- [ ] Test mode disabled
- [ ] Analytics configured
- [ ] Crash reporting enabled
- [ ] Performance monitoring set up
- [ ] Security scan passed

### 🇮🇩 Indonesian Market Specific
- [ ] Indonesian translations complete
- [ ] Local payment methods integrated
- [ ] Indonesian currency support
- [ ] Halal features functional
- [ ] Indonesian food database complete
- [ ] Local server endpoints configured
- [ ] Indonesian privacy policy
- [ ] Local compliance checked

### 📊 Quality Assurance
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance benchmarks met
- [ ] Memory usage < 120MB
- [ ] App launch time < 3 seconds
- [ ] Battery optimization verified
- [ ] Device compatibility tested (5+ devices)
- [ ] Network condition testing passed
- [ ] Accessibility features working

### 📱 Deployment
- [ ] Release bundle (.aab) generated
- [ ] Signing configuration verified
- [ ] Bundle size analyzed
- [ ] Internal testing setup
- [ ] Closed testing group created
- [ ] Release notes prepared
- [ ] Store listing completed
- [ ] Marketing materials ready
```

---

## 🚀 Deployment Automation

### 1. **GitHub Actions Workflow**
```yaml
# .github/workflows/android-release.yml
name: Android Release

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: |
          npm run test:unit
          npm run test:android:instrumented

      - name: Run security scan
        run: npm audit --audit-level high

  build:
    needs: test
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Set up JDK 11
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Cache Gradle
        uses: actions/cache@v3
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Install dependencies
        run: npm ci

      - name: Decode keystore
        env:
          ENCODED_STRING: ${{ secrets.HEALTHYCOACHING_KEYSTORE }}
        run: |
          echo $ENCODED_STRING | base64 -di > android/app/keystore/healthycoaching-release.keystore

      - name: Build Android Bundle
        env:
          HEALTHYCOACHING_RELEASE_STORE_PASSWORD: ${{ secrets.RELEASE_STORE_PASSWORD }}
          HEALTHYCOACHING_RELEASE_KEY_PASSWORD: ${{ secrets.RELEASE_KEY_PASSWORD }}
        run: |
          cd android
          ./gradlew bundleIndonesiaRelease

      - name: Build APKs
        env:
          HEALTHYCOACHING_RELEASE_STORE_PASSWORD: ${{ secrets.RELEASE_STORE_PASSWORD }}
          HEALTHYCOACHING_RELEASE_KEY_PASSWORD: ${{ secrets.RELEASE_KEY_PASSWORD }}
        run: |
          cd android
          ./gradlew assembleIndonesiaRelease

      - name: Upload Bundle
        uses: actions/upload-artifact@v3
        with:
          name: android-bundle
          path: android/app/build/outputs/bundle/indonesiaRelease/

      - name: Upload APKs
        uses: actions/upload-artifact@v3
        with:
          name: android-apks
          path: android/app/build/outputs/apk/indonesia/release/

  deploy-internal:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')

    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: android-bundle
          path: bundle/

      - name: Deploy to Google Play Internal Testing
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.healthycoaching.id
          releaseFiles: 'bundle/*.aab'
          track: internal
          status: completed
```

### 2. **Gradle Tasks for Deployment**
```gradle
// android/app/build.gradle
task deployToInternalTesting(type: Exec) {
    dependsOn 'bundleIndonesiaRelease'
    group = 'deployment'
    description = 'Deploy to Google Play Internal Testing'

    def bundleFile = file("build/outputs/bundle/indonesiaRelease/app-indonesia-release.aab")
    def serviceAccount = file("../google-play-service-account.json")

    commandLine 'bundletool', 'upload-bundle',
        '--bundle=' + bundleFile.absolutePath,
        '--service-account=' + serviceAccount.absolutePath,
        '--package-name=com.healthycoaching.id',
        '--track=internal'
}

task deployToProduction(type: Exec) {
    dependsOn 'bundleIndonesiaRelease'
    group = 'deployment'
    description = 'Deploy to Google Play Production'

    def bundleFile = file("build/outputs/bundle/indonesiaRelease/app-indonesia-release.aab")
    def serviceAccount = file("../google-play-service-account.json")

    commandLine 'bundletool', 'upload-bundle',
        '--bundle=' + bundleFile.absolutePath,
        '--service-account=' + serviceAccount.absolutePath,
        '--package-name=com.healthycoaching.id',
        '--track=production'
}
```

---

## 📊 Post-Deployment Monitoring

### 1. **Analytics Setup**
```typescript
// Firebase Performance Monitoring
import { getPerformance, trace } from 'firebase/performance';
import { getAnalytics, logEvent } from 'firebase/analytics';

const perf = getPerformance();
const analytics = getAnalytics();

// Track app startup performance
export const trackAppStartup = () => {
  const startupTrace = trace(perf, 'app_startup');
  startupTrace.start();

  // Stop when app is ready
  startupTrace.stop();
};

// Track critical user journeys
export const trackUserJourney = (journeyName: string, duration: number) => {
  logEvent(analytics, 'user_journey_completed', {
    journey_name: journeyName,
    duration: duration,
    platform: 'android',
    country: 'indonesia'
  });
};

// Track Indonesian-specific features
export const trackIndonesianFeature = (feature: string, details: any) => {
  logEvent(analytics, 'indonesian_feature_used', {
    feature_name: feature,
    ...details,
    payment_method: details.paymentMethod || null,
    food_type: details.foodType || null,
    region: details.region || null
  });
};
```

### 2. **Crash Reporting Configuration**
```typescript
// Firebase Crashlytics with Indonesian context
import { getCrashlytics } from 'firebase/crashlytics';
import { getAuth } from 'firebase/auth';

const crashlytics = getCrashlytics();
const auth = getAuth();

// Set user context
export const setUserContext = (user: any) => {
  crashlytics.setUserId(user.uid);
  crashlytics.setCustomKeys({
    user_region: user.region,
    user_preferences: JSON.stringify(user.preferences),
    payment_methods: user.paymentMethods?.join(',') || '',
    account_type: user.accountType
  });
};

// Indonesian-specific error context
export const logIndonesianError = (error: Error, context: {
  feature: string;
  action: string;
  foodId?: string;
  paymentMethod?: string;
  region?: string;
}) => {
  crashlytics.setCustomKeys({
    feature_context: context.feature,
    action_context: context.action,
    food_id: context.foodId || null,
    payment_method: context.paymentMethod || null,
    region: context.region || null,
    user_locale: 'id-ID'
  });

  crashlytics.recordError(error);
};
```

---

## 🎯 Release Process

### 1. **Version Management**
```bash
# scripts/bump-version.sh

#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./bump-version.sh [major|minor|patch]"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(grep "versionName" android/app/build.gradle | sed 's/.*"v\(.*\)".*/\1/')

# Bump version
case $1 in
    major)
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1+1".0.0"}')
        ;;
    minor)
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2+1".0"}')
        ;;
    patch)
        NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2"."$3+1}')
        ;;
esac

# Update version in gradle file
sed -i "s/versionName \"$CURRENT_VERSION\"/versionName \"v$NEW_VERSION\"/" android/app/build.gradle

# Update version code
CURRENT_CODE=$(grep "versionCode" android/app/build.gradle | sed 's/.*versionCode \([0-9]*\).*/\1/')
NEW_CODE=$((CURRENT_CODE + 1))
sed -i "s/versionCode $CURRENT_CODE/versionCode $NEW_CODE/" android/app/build.gradle

# Create git tag
git add android/app/build.gradle
git commit -m "Bump version to v$NEW_VERSION"
git tag "v$NEW_VERSION"

echo "Version bumped to v$NEW_VERSION (code: $NEW_CODE)"
echo "Tag created: v$NEW_VERSION"
echo "Run 'git push origin v$NEW_VERSION' to trigger release"
```

### 2. **Rollback Strategy**
```bash
# scripts/emergency-rollback.sh

#!/bin/bash

echo "🚨 Emergency rollback procedure..."

# Get last stable version
LAST_STABLE_VERSION=$(git describe --tags --abbrev=0 HEAD~1)

echo "Rolling back to version: $LAST_STABLE_VERSION"

# Reset to last stable version
git checkout $LAST_STABLE_VERSION

# Build rollback version
./scripts/build-android.sh

# Deploy to production with rollback label
bundletool upload-bundle \
  --bundle=android/app/build/outputs/bundle/indonesiaRelease/app-indonesia-release.aab \
  --service-account=google-play-service-account.json \
  --package-name=com.healthycoaching.id \
  --track=production \
  --release-notes="Emergency rollback to stable version $LAST_STABLE_VERSION"

echo "✅ Rollback completed!"
echo "Version $LAST_STABLE_VERSION deployed to production"
```

**Android deployment guide complete!** 🚀📱

Dengan guide ini, aplikasi HealthyCoaching Indonesia siap untuk deployment ke Google Play Store dengan optimasi khusus untuk market Indonesia.