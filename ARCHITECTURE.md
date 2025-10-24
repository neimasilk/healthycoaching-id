# HealthyCoaching Indonesia - Architecture Design

## 📁 Project Structure

```
health-coaching-id/
├── src/
│   ├── core/                           # Foundation Layer
│   │   ├── domain/                     # Business Logic & Rules
│   │   │   ├── entities/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Makanan.ts
│   │   │   │   ├── Nutrisi.ts
│   │   │   │   ├── Workout.ts
│   │   │   │   └── UserProfile.ts
│   │   │   ├── repositories/
│   │   │   │   ├── IUserRepository.ts
│   │   │   │   ├── IMakananRepository.ts
│   │   │   │   ├── IWorkoutRepository.ts
│   │   │   │   └── INutrisiAnalyzer.ts
│   │   │   ├── usecases/
│   │   │   │   ├── user/
│   │   │   │   │   ├── CreateUser.ts
│   │   │   │   │   ├── UpdateProfile.ts
│   │   │   │   │   └── GetUserGoals.ts
│   │   │   │   ├── nutrition/
│   │   │   │   │   ├── AnalyzeMakanan.ts
│   │   │   │   │   ├── TrackKalori.ts
│   │   │   │   │   ├── GetRecommendations.ts
│   │   │   │   │   └── CalculateBMI.ts
│   │   │   │   └── workout/
│   │   │   │       ├── GenerateWorkout.ts
│   │   │   │       ├── TrackProgress.ts
│   │   │   │       └── GetWorkoutHistory.ts
│   │   │   └── services/
│   │   │       ├── NutritionAnalyzer.ts
│   │   │       ├── WorkoutGenerator.ts
│   │   │       └── RecommendationEngine.ts
│   │   ├── data/                        # Data Layer Implementation
│   │   │   ├── local/
│   │   │   │   ├── database/
│   │   │   │   │   ├── AppDatabase.ts
│   │   │   │   │   └── migrations/
│   │   │   │   ├── preferences/
│   │   │   │   │   └── SharedPreferences.ts
│   │   │   │   └── cache/
│   │   │   │       └── CacheManager.ts
│   │   │   ├── remote/
│   │   │   │   ├── api/
│   │   │   │   │   ├── ApiService.ts
│   │   │   │   │   ├── endpoints/
│   │   │   │   │   │   ├── user.ts
│   │   │   │   │   │   ├── makanan.ts
│   │   │   │   │   │   └── workout.ts
│   │   │   │   │   └── interceptors/
│   │   │   │   │       └── AuthInterceptor.ts
│   │   │   │   └── dto/
│   │   │   │       ├── UserDTO.ts
│   │   │   │       ├── MakananDTO.ts
│   │   │   │       └── WorkoutDTO.ts
│   │   │   └── repositories/
│   │   │       ├── UserRepositoryImpl.ts
│   │   │       ├── MakananRepositoryImpl.ts
│   │   │       ├── WorkoutRepositoryImpl.ts
│   │   │       └── NutritionAnalyzerImpl.ts
│   │   ├── presentation/                # UI Layer
│   │   │   ├── common/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Input/
│   │   │   │   │   ├── Card/
│   │   │   │   │   ├── Modal/
│   │   │   │   │   └── Loading/
│   │   │   │   ├── theme/
│   │   │   │   │   ├── Colors.ts
│   │   │   │   │   ├── Typography.ts
│   │   │   │   │   └── Spacing.ts
│   │   │   │   └── utils/
│   │   │   │       ├── Formatters.ts
│   │   │   │       ├── Validators.ts
│   │   │   │       └── Helpers.ts
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.ts
│   │   │   │   ├── AuthNavigator.ts
│   │   │   │   └── TabNavigator.ts
│   │   │   └── providers/
│   │   │       ├── AuthProvider.ts
│   │   │       ├── ThemeProvider.ts
│   │   │       └── NotificationProvider.ts
│   │   └── network/                     # Network Layer
│   │       ├── HttpClient.ts
│   │       ├── NetworkStatus.ts
│   │       └── ErrorHandler.ts
│   ├── features/                        # Feature Modules (Vertical Slice)
│   │   ├── auth/
│   │   │   ├── presentation/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   │   └── components/
│   │   │   │       ├── LoginForm.tsx
│   │   │   │       └── RegisterForm.tsx
│   │   │   └── domain/
│   │   │       └── usecases/
│   │   │           ├── Login.ts
│   │   │           ├── Register.ts
│   │   │           └── Logout.ts
│   │   ├── nutrition/
│   │   │   ├── presentation/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── FoodSearchScreen.tsx
│   │   │   │   │   ├── MealTrackerScreen.tsx
│   │   │   │   │   ├── NutritionReportScreen.tsx
│   │   │   │   │   └── MakananIndonesiaScreen.tsx
│   │   │   │   └── components/
│   │   │   │       ├── FoodCard.tsx
│   │   │   │       ├── NutritionChart.tsx
│   │   │   │       ├── MakananCard.tsx
│   │   │   │       └── MealPlanner.tsx
│   │   │   └── domain/
│   │   │       └── usecases/
│   │   │           ├── SearchMakanan.ts
│   │   │           ├── TrackMakanan.ts
│   │   │           └── GetNutritionReport.ts
│   │   ├── workout/
│   │   │   ├── presentation/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── WorkoutListScreen.tsx
│   │   │   │   │   ├── WorkoutDetailScreen.tsx
│   │   │   │   │   ├── WorkoutTrackerScreen.tsx
│   │   │   │   │   └── ProgressScreen.tsx
│   │   │   │   └── components/
│   │   │   │       ├── WorkoutCard.tsx
│   │   │   │       ├── ExerciseTimer.tsx
│   │   │   │       └── ProgressChart.tsx
│   │   │   └── domain/
│   │   │       └── usecases/
│   │   │           ├── GetRecommendedWorkout.ts
│   │   │           ├── TrackWorkoutSession.ts
│   │   │           └── GetWorkoutProgress.ts
│   │   ├── profile/
│   │   │   ├── presentation/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── ProfileScreen.tsx
│   │   │   │   │   ├── EditProfileScreen.tsx
│   │   │   │   │   ├── GoalsScreen.tsx
│   │   │   │   │   └── SettingsScreen.tsx
│   │   │   │   └── components/
│   │   │   │       ├── ProfileCard.tsx
│   │   │   │       ├── GoalTracker.tsx
│   │   │   │       └── SettingsList.tsx
│   │   │   └── domain/
│   │   │       └── usecases/
│   │   │           ├── UpdateUserProfile.ts
│   │   │           ├── GetUserProgress.ts
│   │   │           └── SetUserGoals.ts
│   │   └── recommendations/
│   │       ├── presentation/
│   │       │   ├── screens/
│   │       │   │   ├── DailyTipsScreen.tsx
│   │       │   │   ├── FoodRecommendationsScreen.tsx
│   │       │   │   └── WorkoutSuggestionsScreen.tsx
│   │       │   └── components/
│   │       │       ├── TipCard.tsx
│   │       │       ├── RecommendationList.tsx
│   │       │       └── SuggestionCard.tsx
│   │       └── domain/
│   │           └── usecases/
│   │               ├── GetPersonalizedTips.ts
│   │               ├── GetFoodRecommendations.ts
│   │               └── GetWorkoutSuggestions.ts
│   ├── shared/                         # Shared Utilities
│   │   ├── constants/
│   │   │   ├── ErrorCodes.ts
│   │   │   ├── ApiEndpoints.ts
│   │   │   ├── DatabaseConstants.ts
│   │   │   └── IndonesianFoods.ts
│   │   ├── types/
│   │   │   ├── Common.ts
│   │   │   ├── ApiResponse.ts
│   │   │   └── Navigation.ts
│   │   ├── utils/
│   │   │   ├── DateTime.ts
│   │   │   ├── Validation.ts
│   │   │   ├── Formatting.ts
│   │   │   ├── Storage.ts
│   │   │   └── IndonesianHelpers.ts
│   │   ├── extensions/
│   │   │   ├── StringExtensions.ts
│   │   │   ├── DateExtensions.ts
│   │   │   └── NumberExtensions.ts
│   │   └── errors/
│   │       ├── BaseError.ts
│   │       ├── NetworkError.ts
│   │       ├── ValidationError.ts
│   │       └── BusinessLogicError.ts
│   └── main.ts                         # App Entry Point
├── tests/                              # Test Structure
│   ├── unit/
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   └── presentation/
│   │   └── features/
│   ├── integration/
│   └── e2e/
├── docs/                               # Documentation
│   ├── api/
│   ├── architecture/
│   └── deployment/
├── scripts/                            # Build & Deploy Scripts
├── config/                             # Configuration Files
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔧 Architecture Principles

### 1. **Clean Architecture**
- **Domain Layer**: Pure business logic, no framework dependencies
- **Data Layer**: Repository pattern, abstract data sources
- **Presentation Layer**: UI components, state management
- **Network Layer**: HTTP clients, error handling

### 2. **Modular by Feature**
- Each feature is a vertical slice
- Contains presentation, domain, and data layers
- Independent deployment capability
- Clear boundaries and dependencies

### 3. **Dependency Injection**
- Repository interfaces in domain layer
- Implementation in data layer
- UI depends on abstractions, not concretions
- Easy testing and mocking

### 4. **Error Handling Strategy**
- Custom error classes for each layer
- Global error boundaries
- Contextual error messages
- Graceful degradation

### 5. **Indonesian Context Integration**
- Local food database
- Cultural considerations
- Regional payment methods
- Local compliance requirements