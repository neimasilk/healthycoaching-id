# Claude Code Guide - HealthyCoaching Indonesia Project

## 📋 Project Overview

**HealthyCoaching Indonesia** adalah aplikasi health & wellness coaching yang dikhususkan untuk pasar Indonesia dengan fokus pada makanan lokal dan konteks budaya Indonesia.

**Stack:** React Native + TypeScript + SQLite + Node.js API
**Architecture:** Clean Architecture dengan Modular Design
**Target:** Android & iOS (Google Play Store & App Store)

---

## 🏗️ Project Structure & Architecture

```
health-coaching-id/
├── src/
│   ├── core/                    # Foundation Layer (Clean Architecture)
│   │   ├── domain/             # Business Logic & Rules
│   │   │   ├── entities/       # Core business entities
│   │   │   ├── repositories/   # Repository interfaces
│   │   │   ├── usecases/       # Business logic use cases
│   │   │   └── services/       # Domain services
│   │   ├── data/               # Data Layer Implementation
│   │   │   ├── local/         # SQLite database, cache
│   │   │   ├── remote/        # API services
│   │   │   └── repositories/  # Repository implementations
│   │   ├── presentation/       # UI Layer (React Native)
│   │   │   ├── common/        # Shared UI components
│   │   │   ├── navigation/    # Navigation structure
│   │   │   └── providers/     # State management
│   │   └── network/           # HTTP clients, error handling
│   ├── features/              # Feature Modules (Vertical Slices)
│   │   ├── auth/             # Authentication flow
│   │   ├── nutrition/        # Food tracking, meal planning
│   │   ├── workout/          # Exercise tracking, plans
│   │   ├── profile/          # User management
│   │   └── recommendations/   # AI-powered suggestions
│   └── shared/               # Shared utilities
│       ├── constants/        # App constants, error codes
│       ├── types/           # TypeScript type definitions
│       ├── utils/           # Helper functions
│       └── errors/          # Custom error classes
```

---

## 🎯 Key Features & Business Logic

### Core Indonesian Context
- **Makanan Indonesia Database**: 1000+ makanan lokal dengan nutrisi
- **Regional Availability**: Cek ketersediaan makanan per daerah
- **Cultural Integration**: Puasa tracking, lebaran meal plans
- **Local Payment**: GoPay, OVO, DANA integration
- **Halal Certification**: Verification and filtering

### Main Features
1. **Nutrition Tracking**: Track kalori, garam, gula makanan Indonesia
2. **Workout Plans**: Custom exercise untuk lingkungan Indonesia
3. **Meal Recommendations**: AI-powered suggestions based on preferences
4. **Progress Analytics**: Visual charts and insights
5. **Social Features**: Share progress, challenges with friends

---

## 🚨 Error Handling Strategy

### Error Class Hierarchy
```typescript
BaseError
├── BusinessLogicError
│   ├── MakananError
│   ├── NutrisiAnalysisError
│   └── WorkoutError
├── ValidationError
├── NetworkError
└── DatabaseError
```

### Error Tracking Features
- **Correlation IDs**: Every error gets unique ID for tracing
- **Context Logging**: Full context (user, action, device, timestamp)
- **Indonesian Messages**: User-friendly error messages in Bahasa
- **Monitoring Integration**: Automatic alerts to developers
- **Graceful Degradation**: App continues working with non-critical errors

### Key Error Codes
- `ID_FOOD_NOT_FOUND` - Makanan tidak ada di database
- `REGIONAL_AVAILABILITY_ERROR` - Makanan tidak tersedia di daerah
- `HALAL_VERIFICATION_FAILED` - Verifikasi halal gagal
- `LOCAL_PAYMENT_FAILED` - Pembayaran lokal gagal

---

## 🛠️ Development Guidelines

### Code Style & Patterns
- **TypeScript Strict Mode**: All files must be strongly typed
- **Functional Components**: Use React hooks, no classes
- **Immutable Data**: No direct mutations, use spread operators
- **Error Boundaries**: Wrap components in error boundaries
- **Repository Pattern**: Always use repositories for data access

### Testing Strategy
```bash
# Run tests
npm test                    # All tests
npm test -- --watch        # Watch mode
npm run test:coverage      # With coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
```

### Build & Deploy
```bash
# Development
npm run start              # Metro bundler
npm run android            # Run on Android
npm run ios                # Run on iOS

# Production
npm run build:android      # Build APK/AAB
npm run build:ios          # Build IPA
npm run release            # Release to app stores
```

---

## 📱 Key Components & Screens

### Navigation Structure
```
AuthNavigator
├── LoginScreen
├── RegisterScreen
└── ForgotPasswordScreen

AppNavigator (Authenticated)
├── TabNavigator
│   ├── HomeTab
│   │   ├── DashboardScreen
│   │   └── QuickActionsScreen
│   ├── NutritionTab
│   │   ├── MealTrackerScreen
│   │   ├── FoodSearchScreen
│   │   └── NutritionReportScreen
│   ├── WorkoutTab
│   │   ├── WorkoutListScreen
│   │   ├── WorkoutTrackerScreen
│   │   └── ProgressScreen
│   └── ProfileTab
│       ├── ProfileScreen
│       ├── SettingsScreen
│       └── GoalsScreen
└── ModalStack
    ├── AddMealModal
    ├── WorkoutDetailModal
    └── SettingsModal
```

### Critical Components
- **MakananCard**: Display Indonesian food with nutrition info
- **NutritionChart**: Visual representation of daily nutrition
- **WorkoutTimer**: Exercise session tracking
- **RecommendationList**: AI-powered food/workout suggestions
- **ProgressTracker**: User progress visualization

---

## 🔧 Configuration & Setup

### Environment Variables
```env
# API Configuration
REACT_APP_API_URL=https://api.healthcoaching.id
REACT_APP_API_VERSION=v1

# Database
REACT_APP_DB_NAME=health_coaching_id
REACT_APP_DB_VERSION=1

# Features
REACT_APP_ENABLE_AI_RECOMMENDATIONS=true
REACT_APP_ENABLE_PAYMENT=true
REACT_APP_ENABLE_SOCIAL=true

# Development
REACT_APP_ENABLE_DEBUG_MODE=false
REACT_APP_LOG_LEVEL=info

# Indonesian Specific
REACT_APP_DEFAULT_LOCALE=id-ID
REACT_APP_DEFAULT_CURRENCY=IDR
REACT_APP_ENABLE_HALAL_FILTER=true
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:ios": "cd ios && xcodebuild -workspace HealthyCoaching.xcworkspace",
    "clean": "react-native clean",
    "clean:android": "cd android && ./gradlew clean",
    "clean:ios": "rm -rf ios/build"
  }
}
```

---

## 🔍 Debugging & Troubleshooting

### Common Debugging Commands
```bash
# Check logs
npx react-native log-android
npx react-native log-ios

# Debug with Flipper
npx react-native flipper

# Clean caches
npm start -- --reset-cache
npx react-native start -- --reset-cache

# Check dependencies
npm outdated
npm audit
```

### Error Investigation Process
1. **Check Error Correlation ID**: Find in monitoring dashboard
2. **Review Stack Trace**: Identify root cause location
3. **Check Context**: User data, device info, network status
4. **Reproduce Issue**: Use same inputs and conditions
5. **Fix & Test**: Implement fix with proper testing

### Performance Monitoring
- Use Flipper for network debugging
- Monitor bundle size with `react-native-bundle-visualizer`
- Track memory usage with React DevTools Profiler
- Monitor API response times

---

## 📊 Database Schema

### Core Tables
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  profile_data TEXT, -- JSON
  preferences TEXT, -- JSON
  created_at INTEGER,
  updated_at INTEGER
);

-- Indonesian food database
CREATE TABLE makanan_indonesia (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  asal TEXT,
  nutrisi_per_100g TEXT, -- JSON
  halal_certified INTEGER,
  popularitas INTEGER,
  created_at INTEGER
);

-- Food tracking logs
CREATE TABLE makanan_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  makanan_id TEXT NOT NULL,
  porsi_index INTEGER,
  waktu_makan INTEGER,
  created_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (makanan_id) REFERENCES makanan_indonesia(id)
);
```

---

## 🚀 Deployment & Release

### Release Process
1. **Code Review**: All changes must be reviewed
2. **Testing**: Unit + integration + E2E tests
3. **Build**: Create production builds
4. **Store Submission**: Submit to Google Play & App Store
5. **Monitoring**: Monitor for crashes and errors

### Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Maintain backward compatibility for API
- Database migrations handled automatically
- Feature flags for gradual rollouts

---

## 👥 Team Collaboration

### Git Workflow
```
main (production)
├── develop (staging)
├── feature/nutrition-tracker
├── feature/workout-planner
├── fix/halal-verification-bug
└── hotfix/critical-payment-issue
```

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] Error handling implemented
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Performance considered
- [ ] Security reviewed
- [ ] Indonesian context considered

---

## 🎯 Current Development Focus

### Phase 1: Foundation (Current)
- [x] Architecture design
- [x] Error handling foundation
- [x] Database schema design
- [ ] Core entity implementation
- [ ] Basic auth flow

### Phase 2: Core Features
- [ ] Makanan search & tracking
- [ ] Nutrition analysis engine
- [ ] User profile management
- [ ] Basic workout tracking

### Phase 3: Advanced Features
- [ ] AI-powered recommendations
- [ ] Social features
- [ ] Payment integration
- [ ] Advanced analytics

---

## 📞 Support & Resources

### Documentation
- Architecture Details: `ARCHITECTURE.md`
- Core Modules: `CORE_MODULES.md`
- Error Handling: `ERROR_HANDLING.md`
- Implementation: `IMPLEMENTATION_GUIDE.md`

### Helpful Commands for Claude
```bash
# Find Indonesian food entities
find src -name "*Makanan*" -type f

# Search for error handling
grep -r "correlationId" src/

# Find repository implementations
find src -name "*Repository*" -type f

# Check test coverage
npm run test:coverage

# Type checking
npm run type-check
```

### Common Tasks
- **Adding New Food Entity**: Follow `MakananIndonesia` pattern
- **Implementing New Use Case**: Create in `domain/usecases/`
- **Adding Error Handling**: Use error classes from `shared/errors/`
- **Creating New Feature**: Follow feature folder structure
- **Database Migration**: Add to `data/local/database/migrations/`

---

## 🌟 Success Metrics

### Technical Metrics
- App crash rate < 0.1%
- API response time < 500ms
- Test coverage > 80%
- Bundle size < 50MB

### Business Metrics
- Daily active users growth 20%/month
- Food database entries > 10,000
- User meal tracking consistency > 70%
- App Store rating > 4.5 stars

### Indonesian Market Specific
- Coverage of major Indonesian foods
- Regional availability accuracy > 95%
- Halal verification completeness 100%
- Local payment success rate > 98%

---

**🎯 Mission:** Membuat aplikasi health coaching terbaik untuk pasar Indonesia dengan teknologi yang scalable dan error handling yang robust.