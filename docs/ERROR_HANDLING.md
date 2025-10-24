# Error Handling Foundation - HealthyCoaching Indonesia

## 🚨 Error Handling Strategy

### 1. **Error Class Hierarchy**

```typescript
// src/shared/errors/BaseError.ts
export abstract class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly context: Record<string, any>;
  public readonly userId?: string;
  public readonly correlationId: string;

  constructor(
    message: string,
    public readonly code: string,
    context: Record<string, any> = {},
    userId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    this.userId = userId;
    this.correlationId = this.generateCorrelationId();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private generateCorrelationId(): string {
    return `HC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      userId: this.userId,
      correlationId: this.correlationId,
      stack: this.stack
    };
  }
}

// src/shared/errors/BusinessLogicError.ts
export class BusinessLogicError extends BaseError {
  constructor(
    message: string,
    code: string,
    context: Record<string, any> = {},
    userId?: string
  ) {
    super(message, code, context, userId);
  }
}

// src/shared/errors/ValidationError.ts
export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly field: string,
    value: any,
    context: Record<string, any> = {}
  ) {
    super(message, `VALIDATION_ERROR`, { field, value, ...context });
  }
}

// src/shared/errors/NetworkError.ts
export class NetworkError extends BaseError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string,
    context: Record<string, any> = {}
  ) {
    super(message, 'NETWORK_ERROR', { statusCode, endpoint, ...context });
  }
}

// src/shared/errors/DatabaseError.ts
export class DatabaseError extends BaseError {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly table?: string,
    context: Record<string, any> = {}
  ) {
    super(message, 'DATABASE_ERROR', { operation, table, ...context });
  }
}

// Indonesian-specific Errors
export class MakananError extends BusinessLogicError {
  constructor(message: string, makananId?: string, context: Record<string, any> = {}) {
    super(message, 'MAKANAN_ERROR', { makananId, ...context });
  }
}

export class NutrisiAnalysisError extends BusinessLogicError {
  constructor(message: string, analysisType: string, context: Record<string, any> = {}) {
    super(message, 'NUTRISI_ANALYSIS_ERROR', { analysisType, ...context });
  }
}

export class WorkoutError extends BusinessLogicError {
  constructor(message: string, workoutId?: string, context: Record<string, any> = {}) {
    super(message, 'WORKOUT_ERROR', { workoutId, ...context });
  }
}
```

### 2. **Error Codes Constants**

```typescript
// src/shared/constants/ErrorCodes.ts
export const ERROR_CODES = {
  // Network Errors
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  API_SERVER_ERROR: 'API_SERVER_ERROR',
  API_NOT_FOUND: 'API_NOT_FOUND',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',

  // Database Errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_MIGRATION_FAILED: 'DB_MIGRATION_FAILED',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',

  // Validation Errors
  VALIDATION_REQUIRED: 'VALIDATION_REQUIRED',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PHONE: 'VALIDATION_INVALID_PHONE',

  // Business Logic Errors
  MAKANAN_NOT_FOUND: 'MAKANAN_NOT_FOUND',
  MAKANAN_DATA_INVALID: 'MAKANAN_DATA_INVALID',
  MAKANAN_NOT_AVAILABLE: 'MAKANAN_NOT_AVAILABLE',

  NUTRISI_INSUFFICIENT_DATA: 'NUTRISI_INSUFFICIENT_DATA',
  NUTRISI_CALCULATION_ERROR: 'NUTRISI_CALCULATION_ERROR',
  NUTRISI_TARGET_UNREALISTIC: 'NUTRISI_TARGET_UNREALISTIC',

  WORKOUT_NOT_FOUND: 'WORKOUT_NOT_FOUND',
  WORKOUT_INCOMPATIBLE: 'WORKOUT_INCOMPATIBLE',
  WORKOUT_TOO_INTENSE: 'WORKOUT_TOO_INTENSE',

  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_PROFILE_INCOMPLETE: 'USER_PROFILE_INCOMPLETE',
  USER_GOALS_CONFLICTING: 'USER_GOALS_CONFLICTING',

  // Indonesian Context Errors
  INDONESIAN_FOOD_NOT_FOUND: 'ID_FOOD_NOT_FOUND',
  REGIONAL_AVAILABILITY_ERROR: 'REGIONAL_AVAILABILITY_ERROR',
  CULTURAL_RESTRICTION_VIOLATION: 'CULTURAL_RESTRICTION_VIOLATION',
  LOCAL_PAYMENT_FAILED: 'ID_PAYMENT_FAILED',
  HALAL_VERIFICATION_FAILED: 'HALAL_VERIFICATION_FAILED',

  // System Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;

// User-friendly error messages in Indonesian
export const ERROR_MESSAGES_ID = {
  [ERROR_CODES.NETWORK_OFFLINE]: 'Tidak ada koneksi internet. Silakan periksa jaringan Anda.',
  [ERROR_CODES.NETWORK_TIMEOUT]: 'Koneksi terlalu lama. Silakan coba lagi.',
  [ERROR_CODES.MAKANAN_NOT_FOUND]: 'Makanan tidak ditemukan dalam database kami.',
  [ERROR_CODES.NUTRISI_CALCULATION_ERROR]: 'Terjadi kesalahan dalam menghitung nutrisi.',
  [ERROR_CODES.WORKOUT_TOO_INTENSE]: 'Latihan terlalu berat untuk level Anda.',
  [ERROR_CODES.REGIONAL_AVAILABILITY_ERROR]: 'Makanan ini tidak tersedia di daerah Anda.',
  [ERROR_CODES.HALAL_VERIFICATION_FAILED]: 'Verifikasi halal gagal. Mohon hubungi admin.',
  [ERROR_CODES.LOCAL_PAYMENT_FAILED]: 'Pembayaran gagal. Silakan coba metode lain.',
  [ERROR_CODES.VALIDATION_REQUIRED]: 'Field ini wajib diisi.',
  [ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Format email tidak valid.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'
} as const;
```

### 3. **Error Handler & Logger**

```typescript
// src/core/network/ErrorHandler.ts
export class ErrorHandler {
  private logger: ILogger;
  private notificationService: INotificationService;
  private analyticsService: IAnalyticsService;

  constructor(
    logger: ILogger,
    notificationService: INotificationService,
    analyticsService: IAnalyticsService
  ) {
    this.logger = logger;
    this.notificationService = notificationService;
    this.analyticsService = analyticsService;
  }

  async handleError(error: Error, context?: Record<string, any>): Promise<void> {
    const processedError = this.processError(error, context);

    // 1. Log error
    await this.logError(processedError);

    // 2. Track in analytics
    await this.trackError(processedError);

    // 3. Show user notification
    await this.showUserNotification(processedError);

    // 4. Send to monitoring service
    await this.sendToMonitoring(processedError);
  }

  private processError(error: Error, context?: Record<string, any>): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    // Convert generic errors to specific ones
    if (error.message.includes('Network')) {
      return new NetworkError(error.message, undefined, undefined, context);
    }

    if (error.message.includes('Database')) {
      return new DatabaseError(error.message, 'unknown', undefined, context);
    }

    // Default fallback
    return new BusinessLogicError(
      error.message || 'Unknown error occurred',
      ERROR_CODES.UNKNOWN_ERROR,
      context
    );
  }

  private async logError(error: BaseError): Promise<void> {
    await this.logger.error('Error occurred', {
      error: error.toJSON(),
      buildNumber: process.env.REACT_APP_BUILD_NUMBER,
      appVersion: process.env.REACT_APP_VERSION,
      platform: this.getPlatform(),
      userAgent: navigator.userAgent
    });
  }

  private async trackError(error: BaseError): Promise<void> {
    await this.analyticsService.track('error_occurred', {
      errorCode: error.code,
      errorMessage: error.message,
      correlationId: error.correlationId,
      userId: error.userId,
      context: error.context
    });
  }

  private async showUserNotification(error: BaseError): Promise<void> {
    const userMessage = ERROR_MESSAGES_ID[error.code as keyof typeof ERROR_MESSAGES_ID] ||
                       'Terjadi kesalahan. Silakan coba lagi.';

    if (this.shouldShowUserNotification(error)) {
      await this.notificationService.showError(userMessage, {
        duration: this.getNotificationDuration(error),
        action: this.getErrorAction(error)
      });
    }
  }

  private async sendToMonitoring(error: BaseError): Promise<void> {
    if (this.isCriticalError(error)) {
      await this.sendCriticalAlert(error);
    }
  }

  private shouldShowUserNotification(error: BaseError): boolean {
    // Don't show notification for:
    // - Validation errors (handled by UI)
    // - Background sync errors
    // - Non-critical network timeouts
    const hiddenErrors = [
      ERROR_CODES.VALIDATION_REQUIRED,
      ERROR_CODES.VALIDATION_INVALID_FORMAT
    ];

    return !hiddenErrors.includes(error.code as any);
  }

  private getNotificationDuration(error: BaseError): number {
    // Critical errors: 8 seconds
    // Network errors: 5 seconds
    // Validation errors: 3 seconds
    if (this.isCriticalError(error)) return 8000;
    if (error instanceof NetworkError) return 5000;
    return 3000;
  }

  private getErrorAction(error: BaseError): { text: string; action: () => void } | null {
    if (error instanceof NetworkError) {
      return {
        text: 'Coba Lagi',
        action: () => window.location.reload()
      };
    }

    return null;
  }

  private isCriticalError(error: BaseError): boolean {
    const criticalCodes = [
      ERROR_CODES.DATABASE_CONNECTION_FAILED,
      ERROR_CODES.SYSTEM_MAINTENANCE,
      ERROR_CODES.API_SERVER_ERROR,
      ERROR_CODES.HALAL_VERIFICATION_FAILED
    ];

    return criticalCodes.includes(error.code as any);
  }

  private async sendCriticalAlert(error: BaseError): Promise<void> {
    // Send to monitoring service like Sentry, DataDog, etc.
    // Also send to admin team via email/Slack
  }

  private getPlatform(): string {
    return ReactNative ? 'mobile' : 'web';
  }
}
```

### 4. **Error Boundary Implementation**

```typescript
// src/core/presentation/common/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  private errorHandler: ErrorHandler;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.errorHandler = ServiceContainer.get<ErrorHandler>('ErrorHandler');
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    await this.errorHandler.handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      route: window.location.pathname
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };
}

// src/core/presentation/common/ErrorFallback.tsx
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={64} color={colors.error} />
      <Text style={styles.title}>Oops! Terjadi Kesalahan</Text>
      <Text style={styles.message}>
        {getIndonesianErrorMessage(error)}
      </Text>

      <View style={styles.actions}>
        <Button title="Coba Lagi" onPress={onRetry} variant="primary" />
        <Button
          title="Laporkan Masalah"
          onPress={handleReportIssue}
          variant="secondary"
        />
      </View>
    </View>
  );
};
```

### 5. **Repository Error Handling Pattern**

```typescript
// src/core/data/repositories/MakananRepositoryImpl.ts
export class MakananRepositoryImpl implements IMakananRepository {
  constructor(
    private localDb: AppDatabase,
    private apiService: MakananApiService,
    private errorHandler: ErrorHandler,
    private logger: ILogger
  ) {}

  async searchByNama(keyword: string): Promise<MakananIndonesia[]> {
    try {
      this.validateSearchInput(keyword);

      // Try local cache first
      const cachedResults = await this.localDb.searchMakanan(keyword);
      if (cachedResults.length > 0) {
        this.logger.info('Makanan found in cache', { keyword, count: cachedResults.length });
        return cachedResults;
      }

      // If not in cache, try API
      if (await this.isOnline()) {
        const apiResults = await this.apiService.searchMakanan(keyword);

        // Update cache
        await Promise.all(
          apiResults.map(m => this.localDb.saveMakanan(m))
        );

        return apiResults;
      }

      throw new NetworkError(
        'No internet connection and no cached data',
        ERROR_CODES.NETWORK_OFFLINE
      );

    } catch (error) {
      await this.errorHandler.handleError(error, {
        operation: 'searchMakanan',
        keyword
      });
      throw error; // Re-throw for use case to handle
    }
  }

  private validateSearchInput(keyword: string): void {
    if (!keyword || keyword.trim().length === 0) {
      throw new ValidationError(
        'Keyword pencarian tidak boleh kosong',
        'keyword',
        keyword
      );
    }

    if (keyword.length < 2) {
      throw new ValidationError(
        'Keyword minimal 2 karakter',
        'keyword',
        keyword
      );
    }
  }

  private async isOnline(): Promise<boolean> {
    try {
      const response = await fetch('/health', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 6. **Usage in Use Cases**

```typescript
// src/core/domain/usecases/nutrition/TrackMakanan.ts
export class TrackMakanan {
  constructor(
    private makananRepo: IMakananRepository,
    private userRepo: IUserRepository,
    private errorHandler: ErrorHandler
  ) {}

  async execute(request: TrackMakananRequest): Promise<TrackMakananResponse> {
    try {
      const user = await this.userRepo.getById(request.userId);
      const makanan = await this.makananRepo.getDetail(request.makananId);

      this.validateMakananForUser(makanan, user);

      const tracking = await this.saveTracking(user, makanan, request);

      return {
        success: true,
        tracking,
        totalKaloriHariIni: await this.calculateTodayKalori(request.userId)
      };

    } catch (error) {
      await this.errorHandler.handleError(error, {
        useCase: 'TrackMakanan',
        request: omit(request, ['sensitiveData'])
      });

      // Return user-friendly response instead of throwing
      return {
        success: false,
        error: getIndonesianErrorMessage(error),
        errorCode: error instanceof BaseError ? error.code : ERROR_CODES.UNKNOWN_ERROR
      };
    }
  }

  private validateMakananForUser(makanan: MakananIndonesia, user: User): void {
    // Check halal requirements
    if (user.preferences.halalOnly && !makanan.halalCertified) {
      throw new CulturalRestrictionError(
        'Makanan tidak tersertifikasi halal',
        ERROR_CODES.HALAL_VERIFICATION_FAILED,
        { makananId: makanan.id, userId: user.id }
      );
    }

    // Check dietary restrictions
    if (user.dietaryRestrictions.includes('vegetarian') && !makanan.isVegetarian) {
      throw new BusinessLogicError(
        'Makanan tidak sesuai dengan preferensi diet Anda',
        ERROR_CODES.CULTURAL_RESTRICTION_VIOLATION
      );
    }

    // Check allergies
    if (makanan.alergen.some(a => user.alergies.includes(a))) {
      throw new BusinessLogicError(
        `Makanan mengandung ${makanan.alergen.join(', ')} yang bisa menyebabkan alergi`,
        ERROR_CODES.CULTURAL_RESTRICTION_VIOLATION,
        { alergen: makanan.alergen }
      );
    }
  }
}
```

## 🎯 Key Benefits

1. **Traceability**: Setiap error memiliki correlation ID untuk tracking
2. **Context Awareness**: Error menyertakan konteks lengkap (user, action, data)
3. **User Experience**: Error messages dalam Bahasa Indonesia yang user-friendly
4. **Monitoring Integration**: Otomatis terintegrasi dengan monitoring services
5. **Debugging Support**: Complete stack trace dan context untuk developers
6. **Graceful Degradation**: App tetap berjalan meski ada error non-critical

Error handling foundation ini memudahkan tracking dan debugging di production environment!