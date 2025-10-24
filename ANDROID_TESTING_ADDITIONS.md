# Android-Specific Testing Additions

## 🤖 Android Performance Testing

### Android Device Performance Tests
```typescript
// tests/android/performance/AndroidPerformance.test.ts
describe('Android Performance Optimization', () => {
  describe('App Startup Performance', () => {
    it('should start within 3 seconds on target devices', async () => {
      // Test on Android device matrix
      for (const device of androidTestDevices.lowEnd) {
        const startupTime = await measureAppStartup(device);
        expect(startupTime).toBeLessThan(3000);
      }
    });

    it('should load main screen within 500ms after app startup', async () => {
      const app = await launchApp();
      const mainScreenLoadTime = await measureScreenLoad(app, 'MainScreen');
      expect(mainScreenLoadTime).toBeLessThan(500);
    });
  });

  describe('Memory Management', () => {
    it('should not exceed 120MB memory usage', async () => {
      const initialMemory = await getMemoryUsage();

      // Perform intensive operations
      await loadLargeDataSet();
      await scrollHeavyList(100); // 100 items
      await processImages(20);     // 20 images

      const finalMemory = await getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(120 * 1024 * 1024); // 120MB
    });

    it('should not leak memory after navigation cycles', async () => {
      const initialMemory = await getMemoryUsage();

      // Navigate through all screens 10 times
      for (let i = 0; i < 10; i++) {
        await navigateTo('NutritionScreen');
        await navigateTo('WorkoutScreen');
        await navigateTo('ProfileScreen');
      }

      await forceGarbageCollection();
      const finalMemory = await getMemoryUsage();

      // Should not increase by more than 10MB
      expect(finalMemory - initialMemory).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Battery Optimization', () => {
    it('should not drain more than 2% battery in 15 minutes', async () => {
      const initialBattery = await getBatteryLevel();

      // Simulate typical user session
      await simulateUserSession({
        duration: 15, // 15 minutes
        activities: ['food_search', 'meal_logging', 'workout_tracking']
      });

      const finalBattery = await getBatteryLevel();
      const batteryDrain = initialBattery - finalBattery;

      expect(batteryDrain).toBeLessThan(2);
    });

    it('should minimize background CPU usage', async () => {
      await putAppInBackground();

      // Monitor CPU usage for 5 minutes
      const cpuUsage = await measureCPUUsage(300000); // 5 minutes in ms

      // Should use less than 10% CPU in background
      expect(cpuUsage).toBeLessThan(10);
    });
  });
});
```

### Android Device Compatibility Testing
```typescript
// tests/android/device-compatibility/DeviceCompatibility.test.ts
describe('Android Device Compatibility', () => {
  const testDevices = [
    ...androidTestDevices.lowEnd,
    ...androidTestDevices.midRange,
    ...androidTestDevices.highEnd
  ];

  testDevices.forEach(device => {
    describe(`Testing on ${device.name}`, () => {
      it('should install and launch successfully', async () => {
        const installResult = await installApp(device);
        const launchResult = await launchAppOnDevice(device);

        expect(installResult.success).toBe(true);
        expect(launchResult.success).toBe(true);
      });

      it('should render Indonesian fonts correctly', async () => {
        await navigateTo('FoodSearchScreen');
        const fontRendering = await checkFontRendering(device);

        expect(fontRendering.indonesianCharacters).toBe(true);
        expect(fontRendering.emojiSupport).toBe(true);
      });

      it('should handle different screen densities', async () => {
        const renderingTest = await testScreenDensityCompatibility(device);
        expect(renderingTest.layoutBreaks).toBe(false);
        expect(renderingTest.imageQuality).toBe(true);
      });

      it('should work with different network conditions', async () => {
        // Test with 3G network
        await setNetworkCondition('3g');
        const searchTime3G = await measureSearchTime('nasi goreng');

        // Test with 4G network
        await setNetworkCondition('4g');
        const searchTime4G = await measureSearchTime('nasi goreng');

        // Should work with both conditions
        expect(searchTime3G).toBeLessThan(5000); // 5 seconds on 3G
        expect(searchTime4G).toBeLessThan(2000); // 2 seconds on 4G
      });
    });
  });
});
```

### Android Storage Testing
```typescript
// tests/android/storage/AndroidStorage.test.ts
describe('Android Storage Management', () => {
  describe('SQLite Database Performance', () => {
    it('should handle 10,000+ food entries efficiently', async () => {
      // Seed database with 10,000 Indonesian foods
      await seedFoodDatabase(10000);

      const searchTime = await measureDatabaseSearch('nasi goreng');
      expect(searchTime).toBeLessThan(100); // < 100ms for search

      const insertTime = await measureDatabaseInsert(createNewMakanan());
      expect(insertTime).toBeLessThan(50);   // < 50ms for insert
    });

    it('should handle database upgrades without data loss', async () => {
      // Insert data with version 1
      await insertTestDatabaseVersion1();

      // Upgrade to version 2
      await upgradeDatabaseToVersion2();

      // Verify data integrity
      const preservedData = await getPreservedFoodData();
      expect(preservedData.length).toBeGreaterThan(0);
      expect(preservedData[0].nama).toBe('Nasi Goreng');
    });
  });

  describe('Local Storage Optimization', () => {
    it('should cache images efficiently', async () => {
      const cacheManager = new AndroidImageCacheManager();

      // Cache 100 food images
      for (let i = 0; i < 100; i++) {
        await cacheManager.cacheImage(`food-${i}`, `image-${i}.jpg`);
      }

      const cacheSize = await cacheManager.getCacheSize();
      expect(cacheSize).toBeLessThan(50 * 1024 * 1024); // < 50MB
    });

    it('should clear cache when storage is low', async () => {
      // Simulate low storage (only 100MB available)
      await setStorageAvailable(100);

      const cacheManager = new AndroidImageCacheManager();
      await cacheManager.handleLowStorage();

      const cacheSize = await cacheManager.getCacheSize();
      expect(cacheSize).toBeLessThan(10 * 1024 * 1024); // < 10MB
    });
  });
});
```

### Android Integration Testing
```typescript
// tests/android/integration/AndroidIntegration.test.ts
describe('Android API Integration', () => {
  describe('Local Payment Methods', () => {
    it('should integrate with GoPay correctly', async () => {
      const goPayService = new GoPayService();
      const paymentResult = await goPayService.processPayment({
        amount: 50000,
        itemId: 'nutrition-premium',
        userId: 'user-123'
      });

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.transactionId).toBeDefined();
      expect(paymentResult.method).toBe('gopay');
    });

    it('should handle OVO payment flow', async () => {
      const ovoService = new OVOService();

      // Start OVO payment
      const paymentInit = await ovoService.initiatePayment({
        amount: 75000,
        description: 'Premium Plan - 1 Month'
      });

      expect(paymentInit.deeplink).toBeDefined();
      expect(paymentInit.transactionId).toBeDefined();

      // Simulate OVO callback
      const callbackResult = await ovoService.handleCallback({
        transactionId: paymentInit.transactionId,
        status: 'success',
        signature: 'mock-signature'
      });

      expect(callbackResult.verified).toBe(true);
    });
  });

  describe('Android Background Services', () => {
    it('should sync food data in background', async () => {
      const backgroundSync = new AndroidBackgroundSync();

      // Start background sync
      const syncJob = await backgroundSync.scheduleSync({
        type: 'food_data',
        interval: 24 * 60 * 60 * 1000 // 24 hours
      });

      expect(syncJob.scheduled).toBe(true);

      // Wait for sync to complete
      await waitForBackgroundJob(syncJob.jobId, 30000); // 30 seconds timeout

      // Verify data was synced
      const syncedData = await getLatestFoodData();
      expect(syncedData.length).toBeGreaterThan(1000); // Should have many foods
    });

    it('should handle nutrition analysis in background', async () => {
      const analysisService = new NutritionAnalysisService();

      const result = await analysisService.analyzeDailyNutrition({
        userId: 'user-123',
        date: new Date(),
        runInBackground: true
      });

      expect(result.success).toBe(true);
      expect(result.analysis.totalKalori).toBeGreaterThan(0);
      expect(result.analysis.protein).toBeGreaterThan(0);
    });
  });
});
```

## 🧪 Android UI Testing (Espresso)

### MainActivity Tests
```kotlin
// android/app/src/androidTest/java/com/healthycoaching/id/MainActivityTest.kt
@RunWith(AndroidJUnit4::class)
class MainActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun testAppLaunchPerformance() {
        val startTime = System.currentTimeMillis()

        // Wait for app to fully load
        onView(withId(R.id.main_navigation))
            .check(matches(isDisplayed()))

        val loadTime = System.currentTimeMillis() - startTime

        // Should load within 3 seconds
        assertThat(loadTime).isLessThan(3000)
    }

    @Test
    fun testIndonesianTextRendering() {
        // Navigate to food search
        onView(withId(R.id.navigation_nutrition))
            .perform(click())

        // Check Indonesian text renders correctly
        onView(withText("Cari makanan..."))
            .check(matches(isDisplayed()))

        onView(withText("Nasi Goreng"))
            .check(matches(isDisplayed()))

        // Check Indonesian characters render
        onView(withText("Soto Ayam"))
            .check(matches(isDisplayed()))
    }
}
```

### Compose UI Tests
```kotlin
// android/app/src/androidTest/java/com/healthycoaching/id/ComposeUITests.kt
@RunWith(AndroidJUnit4::class)
class HealthyCoachingUITests {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun testFoodSearchPerformance() {
        composeTestRule.setContent {
            HealthyCoachingTheme {
                NutritionScreen()
            }
        }

        val startTime = System.currentTimeMillis()

        composeTestRule
            .onNodeWithText("Cari makanan...")
            .performTextInput("nasi goreng")

        val endTime = System.currentTimeMillis()
        val searchTime = endTime - startTime

        // Search should complete within 1 second
        assertThat(searchTime).isLessThan(1000)

        // Verify results are displayed
        composeTestRule
            .onAllNodesWithText("Nasi Goreng")
            .assertAnyExists()
    }

    @Test
    fun testMealTrackingFlow() {
        composeTestRule.setContent {
            HealthyCoachingTheme {
                MealTrackerScreen()
            }
        }

        // Search for food
        composeTestRule
            .onNodeWithText("Tambah Makanan")
            .performClick()

        composeTestRule
            .onNodeWithText("Cari makanan...")
            .performTextInput("sate ayam")

        // Select food
        composeTestRule
            .onNodeWithText("Sate Ayam")
            .performClick()

        // Set portion
        composeTestRule
            .onNodeWithText("Porsi")
            .performClick()
        composeTestRule
            .onNodeWithText("10 Tusuk")
            .performClick()

        // Save meal
        composeTestRule
            .onNodeWithText("Simpan")
            .performClick()

        // Verify meal is saved
        composeTestRule
            .onNodeWithText("Sate Ayam")
            .assertIsDisplayed()
    }

    @Test
    fun testMemoryEfficiencyInHeavyUsage() {
        repeat(50) {
            composeTestRule.setContent {
                HealthyCoachingTheme {
                    FoodSearchScreen()
                }
            }

            // Perform intensive operations
            composeTestRule
                .onNodeWithText("Cari makanan...")
                .performTextInput("nasi")

            // Scroll through results
            composeTestRule
                .onNodeWithTag("food-list")
                .performScrollToIndex(20)

            // Go back
            Espresso.pressBack()
        }

        // Verify no memory leaks
        val memoryInfo = getMemoryInfo()
        assertThat(memoryInfo.nativeHeapSize).isLessThan(150 * 1024 * 1024) // 150MB
    }

    @Test
    fun testAndroidPaymentIntegration() {
        composeTestRule.setContent {
            HealthyCoachingTheme {
                PaymentScreen()
            }
        }

        // Test GoPay payment
        composeTestRule
            .onNodeWithText("GoPay")
            .performClick()

        // Verify GoPay flow starts
        composeTestRule
            .onNodeWithText("Lanjut ke GoPay")
            .assertIsDisplayed()

        // Test OVO payment
        composeTestRule
            .onNodeWithText("OVO")
            .performClick()

        // Verify OVO flow starts
        composeTestRule
            .onNodeWithText("Buka OVO")
            .assertIsDisplayed()
    }
}
```

## 📱 Android Device Testing Setup

### Firebase Test Lab Configuration
```yaml
# firebase.json
{
  "testLab": {
    "android": {
      "devices": [
        {
          "model": "Pixel2",
          "version": "28",
          "orientation": "portrait"
        },
        {
          "model": "NexusLowRes",
          "version": "28",
          "orientation": "portrait"
        },
        {
          "model": "Nexus5X",
          "version": "28",
          "orientation": "portrait"
        }
      ],
      "testTargets": [
        "androidx.test.runner.AndroidJUnitRunner"
      ]
    }
  }
}
```

### Android Test Commands
```bash
# Run Android unit tests
npm run test:android:unit

# Run Android instrumented tests
npm run test:android:instrumented

# Run Android UI tests with Espresso
npm run test:android:ui

# Run performance tests on Android emulator
npm run test:android:performance

# Run Firebase Test Lab tests
npm run test:firebase

# Test on specific device configurations
npm run test:android:lowend
npm run test:android:midrange
npm run test:android:highend
```

**Android testing strategy complete with device compatibility and performance focus!** 🤖✅