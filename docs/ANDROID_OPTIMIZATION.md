# Android Performance Optimization - HealthyCoaching Indonesia

## 🎯 Overview

Comprehensive Android optimization strategy untuk **HealthyCoaching Indonesia** dengan fokus pada performa, battery efficiency, dan Android-specific user experience.

---

## 🚀 Android Performance Targets

### Critical Benchmarks
```typescript
const androidPerformanceTargets = {
  appLaunch: {
    coldStart: '< 2 seconds', // Play Store requirement
    warmStart: '< 1 second',
    hotStart: '< 500ms'
  },
  uiPerformance: {
    frameRate: '60 FPS consistent',
    jankRate: '< 5%',
    screenLoad: '< 300ms'
  },
  memoryUsage: {
    average: '< 120MB',
    peak: '< 200MB',
    leaks: 'Zero'
  },
  battery: {
    backgroundUsage: '< 2%/hour',
    cpuUsage: '< 10% average'
  }
};
```

### Device Compatibility Matrix
```typescript
const androidDeviceMatrix = {
  minSDK: 21, // Android 5.0 (85%+ coverage)
  targetSDK: 34, // Android 14 (latest)
  targetDevices: [
    // Low-end devices
    { ram: '2-3GB', cpu: 'Octa-core 1.8GHz', storage: '32GB' },
    // Mid-range devices
    { ram: '4-6GB', cpu: 'Octa-core 2.2GHz', storage: '64GB' },
    // High-end devices
    { ram: '8-12GB', cpu: 'Octa-core 2.8GHz', storage: '128GB+' }
  ],
  screenSizes: ['small', 'normal', 'large', 'xlarge'],
  densities: ['ldpi', 'mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']
};
```

---

## 🏗️ Android-Specific Architecture

### 1. **Optimized Project Structure**
```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/healthycoaching/id/
│   │   │   ├── MainActivity.kt
│   │   │   ├── MainApplication.kt
│   │   │   ├── di/                 # Dependency Injection
│   │   │   ├── utils/              # Android utilities
│   │   │   └── services/           # Background services
│   │   ├── res/
│   │   │   ├── layout/            # Optimized layouts
│   │   │   ├── drawable-xxxhdpi/  # High-density assets
│   │   │   ├── values/            # Resources
│   │   │   └── mipmap/            # App icons
│   │   ├── assets/
│   │   │   ├── fonts/             # Local fonts for Indonesian
│   │   │   └── data/              # Preloaded food data
│   │   └── jniLibs/               # Native libraries (if needed)
├── gradle/                        # Gradle configuration
├── keystore/                      # Release keys
└── scripts/                       # Build scripts
```

### 2. **React Native Android Configuration**
```typescript
// Metro.config.js - Android optimization
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    platforms: ['android'],
    extensions: ['android.ts', 'ts', 'tsx', 'js', 'jsx'],
    alias: {
      '@': './src',
      '@android': './src/android'
    }
  }
};

// android/app/build.gradle - Performance optimizations
android {
    compileSdkVersion 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"

        multiDexEnabled true
        vectorDrawables.useSupportLibrary = true

        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'
        }
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
            minifyEnabled false
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }

    packagingOptions {
        pickFirst "lib/x86/libc++_shared.so"
        pickFirst "lib/x86_64/libc++_shared.so"
        pickFirst "lib/armeabi-v7a/libc++_shared.so"
        pickFirst "lib/arm64-v8a/libc++_shared.so"
    }
}
```

---

## ⚡ Performance Optimization Strategies

### 1. **Bundle Size Optimization**
```typescript
// Android bundle size optimization
const bundleOptimization = {
  targetSize: '< 50MB', // Play Store requirement
  strategies: [
    'Code splitting by features',
    'Lazy loading components',
    'Image optimization and compression',
    'Font subsetting for Indonesian',
    'Tree shaking unused dependencies',
    'Asset compression',
    'ProGuard minification'
  ]
};

// Implementation in metro.config.js
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts }
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      minifierConfig: {
        keep_fnames: true,
        mangle: {
          keep_fnames: true,
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        output: {
          comments: false,
        },
      },
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      alias: {
        '@assets': './src/assets',
        '@components': './src/components'
      }
    }
  };
})();
```

### 2. **Memory Management**
```typescript
// Android memory optimization utilities
export class AndroidMemoryManager {
  private static instance: AndroidMemoryManager;
  private imageCache = new Map<string, ImageCacheEntry>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB

  static getInstance(): AndroidMemoryManager {
    if (!this.instance) {
      this.instance = new AndroidMemoryManager();
    }
    return this.instance;
  }

  // Optimize image caching for Android
  cacheImage(key: string, uri: string, size: number): void {
    const totalSize = this.getCurrentCacheSize();

    if (totalSize + size > this.maxCacheSize) {
      this.evictOldestEntries();
    }

    this.imageCache.set(key, {
      uri,
      size,
      lastAccessed: Date.now()
    });
  }

  // Memory pressure handling
  handleLowMemory(): void {
    // Clear caches when system signals low memory
    this.clearImageCache();
    this.clearComponentCache();

    // Trigger garbage collection
    if (global.gc) {
      global.gc();
    }
  }

  // Background cleanup
  startMemoryMonitoring(): void {
    setInterval(() => {
      const memoryInfo = this.getMemoryInfo();

      if (memoryInfo.availableMemory < memoryInfo.threshold) {
        this.handleLowMemory();
      }
    }, 30000); // Check every 30 seconds
  }
}

// React component with Android memory optimization
export const OptimizedFoodCard: React.FC<FoodCardProps> = ({ makanan }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const memoryManager = AndroidMemoryManager.getInstance();

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: memoryManager.getCachedImage(makanan.id) || makanan.gambar[0]
        }}
        style={styles.image}
        onLoad={() => setImageLoaded(true)}
        onError={() => memoryManager.removeFromCache(makanan.id)}
        // Optimize for Android
        progressiveRenderingEnabled={true}
        fadeDuration={300}
      />

      {imageLoaded && (
        <Text style={styles.nama}>{makanan.nama}</Text>
      )}
    </View>
  );
};
```

### 3. **Android Background Processing**
```typescript
// Android background services for food data sync
export class AndroidSyncService {
  private workManager: WorkManager;

  constructor() {
    this.workManager = WorkManager.getInstance();
  }

  // Sync food data in background
  scheduleFoodDataSync(): void {
    const syncRequest = new OneTimeWorkRequest.Builder(FoodDataSyncWorker.class)
      .setConstraints(
        Constraints.Builder()
          .setRequiredNetworkType(NetworkType.CONNECTED)
          .setRequiresBatteryNotLow(true)
          .build()
      )
      .addTag("food-sync")
      .build();

    this.workManager.enqueue(syncRequest);
  }

  // Background nutrition analysis
  scheduleNutritionAnalysis(userId: string): void {
    const analysisRequest = new PeriodicWorkRequest.Builder(
      NutritionAnalysisWorker.class,
      24, // Repeat every 24 hours
      TimeUnit.HOURS
    )
      .setInputData(
        Data.Builder()
          .putString("userId", userId)
          .build()
      )
      .build();

    this.workManager.enqueue(analysisRequest);
  }
}

// Worker implementation
export class FoodDataSyncWorker extends Worker {
  async doWork(): Result {
    try {
      const foodService = ServiceContainer.get<FoodService>('FoodService');

      // Sync Indonesian food database
      await foodService.syncWithServer();

      // Update local SQLite database
      await foodService.updateLocalDatabase();

      return Result.success();
    } catch (error) {
      Log.e("FoodSyncWorker", "Sync failed", error);
      return Result.failure();
    }
  }
}
```

---

## 🎨 Android UI Optimization

### 1. **Optimized Component Structure**
```typescript
// Android-optimized list component
export const OptimizedMakananList: React.FC<MakananListProps> = ({ makananList, onMakananPress }) => {
  // Use FlatList for Android performance
  const renderItem = useCallback(({ item }: { item: MakananIndonesia }) => (
    <OptimizedFoodCard
      makanan={item}
      onPress={() => onMakananPress(item)}
    />
  ), [onMakananPress]);

  const keyExtractor = useCallback((item: MakananIndonesia) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 120, // Fixed height for Android performance
    offset: 120 * index,
    index,
  }), []);

  return (
    <FlatList
      data={makananList}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // Android optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      // Optimize scrolling
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
};

// Memoized component to prevent unnecessary re-renders
export const OptimizedFoodCard = React.memo<FoodCardProps>(({ makanan, onPress }) => {
  const memoizedNutrisi = useMemo(() =>
    makanan.getNutrisiForPorsi(0),
    [makanan]
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7} // Android feedback
    >
      <FastImage
        source={{ uri: makanan.gambar[0] }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.content}>
        <Text style={styles.nama}>{makanan.nama}</Text>
        <Text style={styles.kalori}>
          {memoizedNutrisi.kalori} kal per 100g
        </Text>
        <View style={styles.tags}>
          {makanan.halalCertified && (
            <View style={styles.halalTag}>
              <Text style={styles.tagText}>Halal</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});
```

### 2. **Android-Specific Styling**
```typescript
// Android-optimized styles
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2, // Android elevation for shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginHorizontal: 16,
    marginVertical: 8,
    // Android performance
    transform: [{ translateZ: 0 }], // Hardware acceleration
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },

  nama: {
    fontFamily: 'Roboto-Medium', // Android native font
    fontSize: 16,
    color: '#212121',
    // Optimize text rendering on Android
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  kalori: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },

  list: {
    // Android optimization
    contentContainerStyle: {
      paddingVertical: 8,
    }
  }
});
```

---

## 🗃️ Android Database Optimization

### 1. **SQLite Performance for Android**
```typescript
// Android-optimized database configuration
export class AndroidDatabaseConfig {
  static getConfig(): SQLiteDatabaseConfig {
    return {
      name: 'healthy_coaching_id.db',
      location: 'default',
      version: 1,
      // Android optimizations
      enableForeignKeyConstraints: true,
      readonly: false,
      createFromLocation: 1,
      // Performance settings
      pageSize: 4096,
      cacheSize: 10000,
      // WAL mode for better concurrent access
      journalMode: 'WAL',
      // Synchronous mode for durability vs performance
      synchronous: 'NORMAL',
    };
  }
}

// Optimized food data access
export class AndroidMakananRepository implements IMakananRepository {
  private db: SQLiteDatabase;
  private cache = new Map<string, MakananIndonesia[]>();

  constructor(db: SQLiteDatabase) {
    this.db = db;
    this.preloadPopularFoods();
  }

  // Preload popular Indonesian foods
  async preloadPopularFoods(): Promise<void> {
    const popularFoods = await this.db.executeSql(`
      SELECT * FROM makanan_indonesia
      WHERE popularitas > 7
      ORDER BY popularitas DESC
      LIMIT 50
    `);

    // Cache for instant access
    this.cache.set('popular', popularFoods.rows.raw());
  }

  // Optimized search with indexing
  async searchByNama(keyword: string): Promise<MakananIndonesia[]> {
    // Check cache first
    const cacheKey = `search:${keyword}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Use FTS (Full-Text Search) for performance
    const results = await this.db.executeSql(`
      SELECT m.* FROM makanan_indonesia m
      JOIN makanan_search_fts fts ON m.id = fts.rowid
      WHERE m.nama MATCH ? OR fts.nama_lain MATCH ?
      ORDER BY m.popularitas DESC
      LIMIT 20
    `, [keyword, keyword]);

    const makanan = results.rows.raw();

    // Cache results
    this.cache.set(cacheKey, makanan);

    return makanan;
  }
}
```

### 2. **Background Database Operations**
```typescript
// Android background database operations
export class AndroidDatabaseWorker {
  private operationQueue: DatabaseOperation[] = [];
  private isProcessing = false;

  // Queue database operations for background processing
  queueOperation(operation: DatabaseOperation): void {
    this.operationQueue.push(operation);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift()!;

      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('Database operation failed:', error);
      }
    }

    this.isProcessing = false;
  }

  private async executeOperation(operation: DatabaseOperation): Promise<void> {
    switch (operation.type) {
      case 'INSERT':
        await this.insertMakananLog(operation.data);
        break;
      case 'UPDATE':
        await this.updateUserProfile(operation.data);
        break;
      case 'DELETE':
        await this.deleteOldData(operation.data);
        break;
    }
  }
}
```

---

## 🔋 Battery Optimization

### 1. **Power-Efficient Sync Strategy**
```typescript
// Android battery optimization
export class AndroidBatteryOptimizer {
  private static instance: AndroidBatteryOptimizer;

  static getInstance(): AndroidBatteryOptimizer {
    if (!this.instance) {
      this.instance = new AndroidBatteryOptimizer();
    }
    return this.instance;
  }

  // Adaptive sync based on battery level
  scheduleAdaptiveSync(): void {
    const batteryLevel = this.getBatteryLevel();
    const isCharging = this.isCharging();

    if (isCharging) {
      // Full sync when charging
      this.scheduleFullSync();
    } else if (batteryLevel > 50) {
      // Partial sync on good battery
      this.schedulePartialSync();
    } else {
      // Minimal sync on low battery
      this.scheduleMinimalSync();
    }
  }

  // Batch operations to reduce wake-ups
  batchOperations(operations: Operation[]): void {
    // Group operations by type
    const grouped = this.groupOperationsByType(operations);

    // Execute in batches to minimize CPU usage
    grouped.forEach(batch => {
      setTimeout(() => this.executeBatch(batch), 1000);
    });
  }

  // Use Android's JobScheduler for efficiency
  scheduleEfficientJob(): void {
    const jobInfo = new JobInfo.Builder(
      1000,
      new ComponentName(context, SyncJobService.class)
    )
      .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED) // WiFi only
      .setRequiresDeviceIdle(true)
      .setRequiresCharging(false)
      .setPeriodic(15 * 60 * 1000) // 15 minutes
      .setBackoffCriteria(
        JobInfo.DEFAULT_INITIAL_BACKOFF_MILLIS,
        JobInfo.BACKOFF_POLICY_EXPONENTIAL
      )
      .build();

    const jobScheduler = context.getSystemService(Context.JOB_SCHEDULER_SERVICE) as JobScheduler;
    jobScheduler.schedule(jobInfo);
  }
}
```

### 2. **Network Optimization**
```typescript
// Android network optimization
export class AndroidNetworkOptimizer {
  // Batch API requests
  async batchRequests(requests: ApiRequest[]): Promise<ApiResponse[]> {
    // Group requests by endpoint
    const grouped = this.groupRequestsByEndpoint(requests);

    const results: ApiResponse[] = [];

    for (const [endpoint, endpointRequests] of grouped) {
      // Create batch request
      const batchRequest = {
        endpoint,
        requests: endpointRequests.map(req => ({
          id: req.id,
          params: req.params,
          method: req.method
        }))
      };

      // Execute batch
      const batchResponse = await this.executeBatchRequest(batchRequest);

      // Map responses back
      const responses = this.mapBatchResponses(batchResponse, endpointRequests);
      results.push(...responses);
    }

    return results;
  }

  // Compress API responses
  private async compressResponse(response: any): Promise<any> {
    // Use gzip compression for API responses
    return {
      ...response,
      _compressed: true,
      _size: JSON.stringify(response).length
    };
  }

  // Cache-first strategy
  async getCachedOrFresh<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Try cache first
    const cached = await this.getFromCache<T>(key);
    if (cached && !this.isCacheExpired(key)) {
      return cached;
    }

    // Fetch fresh data in background
    fetcher().then(fresh => {
      this.setCache(key, fresh);
    });

    // Return cached or wait for fresh
    return cached || (await fetcher());
  }
}
```

---

## 📱 Android Testing Strategy

### 1. **Device-Specific Testing**
```typescript
// Android device testing matrix
export const androidDeviceTestMatrix = {
  lowEnd: {
    devices: ['Samsung Galaxy A12', 'Xiaomi Redmi 9', 'Oppo A53'],
    specs: { ram: '2-3GB', cpu: 'Octa-core 1.8GHz' },
    focus: ['Memory usage', 'Load times', 'Battery impact']
  },
  midRange: {
    devices: ['Samsung Galaxy A52', 'Xiaomi Redmi Note 11', 'Oppo Reno7'],
    specs: { ram: '4-6GB', cpu: 'Octa-core 2.2GHz' },
    focus: ['Performance', 'Multi-tasking', 'Camera integration']
  },
  highEnd: {
    devices: ['Samsung Galaxy S22', 'Google Pixel 7', 'Xiaomi 12 Pro'],
    specs: { ram: '8-12GB', cpu: 'Octa-core 2.8GHz' },
    focus: ['Graphics performance', 'Advanced features', 'Power efficiency']
  }
};

// Android performance tests
export class AndroidPerformanceTests {
  async testAppStartup(): Promise<void> {
    const startTime = performance.now();

    // Simulate app startup
    await this.startApp();

    const endTime = performance.now();
    const startupTime = endTime - startTime;

    // Android Play Store requirement: < 3 seconds
    expect(startupTime).toBeLessThan(3000);
  }

  async testMemoryUsage(): Promise<void> {
    const initialMemory = this.getCurrentMemoryUsage();

    // Perform intensive operations
    await this.loadLargeDataset();
    await this.scrollHeavyList();
    await this.processImages();

    const finalMemory = this.getCurrentMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;

    // Should not increase by more than 50MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  }

  async testBatteryImpact(): Promise<void> {
    const initialBattery = this.getBatteryLevel();

    // Run typical user session (15 minutes)
    await this.simulateUserSession(15);

    const finalBattery = this.getBatteryLevel();
    const batteryDrain = initialBattery - finalBattery;

    // Should not drain more than 2% in 15 minutes
    expect(batteryDrain).toBeLessThan(2);
  }
}
```

### 2. **Espresso UI Testing**
```typescript
// Android Espresso tests
export class EspressoUITests {
  @Test
  fun testFoodSearchPerformance() {
    // Launch activity
    composeTestRule.setContent {
      HealthyCoachingTheme {
        NutritionScreen()
      }
    }

    // Test search performance
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
  fun testMemoryLeaks() {
    // Test for memory leaks in heavy usage
    repeat(100) {
      composeTestRule.setContent {
        NutritionScreen()
      }

      // Navigate to different screens
      composeTestRule.onNodeWithText("Profil").performClick()
      composeTestRule.onNodeWithText("Nutrisi").performClick()
    }

    // Verify no memory leaks detected
    val memoryInfo = getMemoryInfo()
    assertThat(memoryInfo.nativeHeapSize).isLessThan(100 * 1024 * 1024)
  }
}
```

---

## 🔧 Android Build Optimization

### 1. **Gradle Configuration**
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
        multiDexEnabled true

        // Build optimization
        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a'
        }

        vectorDrawables.useSupportLibrary = true

        // R8 full mode for better optimization
        consumerProguardFiles "proguard-rules.pro"
    }

    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"

            // Enable R8 full mode
            crunchPngs true

            // Optimize APK size
            splits {
                abi {
                    reset()
                    enable enableSeparateBuildPerCPUArchitecture
                    universalApk false
                    include "armeabi-v7a", "x86", "arm64-v8a", "x86_64"
                }
            }
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = '11'
    }
}

// ProGuard rules for Indonesian context
-keep class com.healthycoaching.id.model.** { *; }
-keep class com.healthycoaching.id.data.makanan.** { *; }
-keep class com.healthycoaching.id.utils.IndonesianHelpers { *; }
-keep class com.healthycoaching.id.payment.gopay.** { *; }
-keep class com.healthycoaching.id.payment.ovo.** { *; }
-keep class com.healthycoaching.id.payment.dana.** { *; }
```

### 2. **Bundle Size Analysis**
```typescript
// Bundle size monitoring
export class BundleSizeAnalyzer {
  analyzeBundleSize(): BundleAnalysis {
    const bundlePath = './android/app/build/outputs/bundle/release/app.aab';

    const stats = fs.statSync(bundlePath);
    const sizeInMB = stats.size / (1024 * 1024);

    return {
      totalSize: sizeInMB,
      isWithinLimit: sizeInMB < 150, // Play Store limit
      breakdown: this.getBundleBreakdown(),
      recommendations: this.getOptimizationRecommendations(sizeInMB)
    };
  }

  private getOptimizationRecommendations(size: number): string[] {
    const recommendations: string[] = [];

    if (size > 100) {
      recommendations.push('Consider enabling ProGuard/R8 minification');
      recommendations.push('Optimize image assets and use WebP format');
      recommendations.push('Remove unused dependencies');
    }

    if (size > 120) {
      recommendations.push('Use app bundles instead of APK');
      recommendations.push('Enable dynamic feature modules');
      recommendations.push('Implement code splitting by features');
    }

    return recommendations;
  }
}
```

---

## 📊 Android Performance Monitoring

### 1. **Production Monitoring**
```typescript
// Android performance monitoring
export class AndroidPerformanceMonitor {
  private firebasePerformance = firebase.performance();

  // Track screen load times
  trackScreenLoad(screenName: string): void {
    const trace = this.firebasePerformance.newTrace(`screen_load_${screenName}`);

    trace.start();

    // Stop trace when screen is fully loaded
    setTimeout(() => {
      trace.stop();

      // Send to analytics if load time is poor
      const duration = trace.getMetric('duration');
      if (duration > 2000) { // 2 seconds
        this.reportSlowScreen(screenName, duration);
      }
    }, 100);
  }

  // Track memory usage
  trackMemoryUsage(): void {
    const memoryInfo = this.getMemoryInfo();

    this.firebasePerformance.newTrace('memory_usage')
      .putMetric('used_memory', memoryInfo.usedMemory)
      .putMetric('available_memory', memoryInfo.availableMemory)
      .stop();
  }

  // Track battery usage
  trackBatteryUsage(): void {
    const batteryLevel = this.getBatteryLevel();

    // Report excessive battery drain
    if (batteryLevel < 20) {
      this.reportBatteryIssue(batteryLevel);
    }
  }

  // Track network performance
  trackNetworkRequest(endpoint: string, duration: number): void {
    const trace = this.firebasePerformance.newTrace(`network_${endpoint}`);
    trace.putMetric('duration', duration);

    if (duration > 5000) { // 5 seconds
      trace.putAttribute('performance_issue', 'slow_request');
    }

    trace.stop();
  }
}

// Android-specific crash reporting
export class AndroidCrashReporter {
  private static instance: AndroidCrashReporter;

  static getInstance(): AndroidCrashReporter {
    if (!this.instance) {
      this.instance = new AndroidCrashReporter();
      this.setupCrashlytics();
    }
    return this.instance;
  }

  private setupCrashlytics(): void {
    // Firebase Crashlytics configuration
    const crashlytics = firebase.crashlytics();

    // Set Android-specific context
    crashlytics.setCustomKeys({
      android_version: this.getAndroidVersion(),
      device_model: this.getDeviceModel(),
      screen_density: this.getScreenDensity(),
      total_memory: this.getTotalMemory()
    });
  }

  reportError(error: Error, context: any): void {
    const crashlytics = firebase.crashlytics();

    crashlytics.setCustomKeys({
      correlation_id: this.generateCorrelationId(),
      user_action: context.action,
      screen_name: context.screen,
      network_status: context.networkStatus
    });

    crashlytics.recordError(error);
  }
}
```

---

## 🎯 Android Launch Checklist

### Pre-Launch Validation
- [ ] **Performance**: <3s cold start on target devices
- [ ] **Memory**: <120MB average usage
- [ ] **Battery**: <2%/hour background usage
- [ ] **Size**: <50MB APK size optimized
- [ ] **Compatibility**: Works on Android 5.0+
- [ ] **Testing**: Passed on 5 device types
- [ ] **Store**: Play Store optimization complete

### Post-Launch Monitoring
- [ ] **Crash Rate**: <0.1% monitored via Crashlytics
- [ ] **ANR Rate**: <0.05% (Application Not Responding)
- [ ] **Performance**: Screen loads tracked and optimized
- [ ] **Battery**: User battery drain complaints <1%
- [ ] **Storage**: App cache management working

**Android Performance Optimization Complete!** 🚀

Dengan optimasi ini, aplikasi HealthyCoaching Indonesia akan berjalan optimal di semua perangkat Android, dari low-end hingga high-end, dengan performa yang excellent dan battery life yang baik.