# 🇮🇩 HealthyCoaching Indonesia

Aplikasi health & wellness coaching yang dikhususkan untuk pasar Indonesia dengan database makanan lokal dan konteks budaya Indonesia.

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Android-green.svg)

## 🎯 Fitur Utama

### 🍽️ Database Makanan Indonesia
- **1000+ makanan lokal** dengan nutrisi lengkap
- **Cakupan regional**: Jawa, Sumatera, Bali, Sulawesi, Kalimantan
- **Sertifikasi Halal**: 100% terverifikasi
- **Informasi alergen**: Lengkap dan akurat

### 💳 Pembayaran Lokal
- **GoPay** - Integrasi native SDK
- **OVO** - Deep linking support
- **DANA** - Web view integration
- **Transfer Bank** - Bank Indonesia terkemuka

### 📱 Android Optimized
- **Performa tinggi**: <2 detik startup, <120MB memory
- **Device support**: Low-end hingga high-end
- **Battery efficient**: <2% background usage
- **Bundle size**: <50MB optimized

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- React Native CLI
- Android Studio
- Android SDK API Level 34
- Java 11 (JDK)

### Installation
```bash
# Clone repository
git clone https://github.com/neimasilk/healthycoaching-id.git
cd healthycoaching-id

# Install dependencies
npm install

# Android setup
cd android && ./gradlew clean && cd ..

# Run development server
npm start

# Run on Android device/emulator
npm run android:device      # Physical device
npm run android:emulator    # Android emulator
```

### Development Commands
```bash
npm start                  # Start Metro bundler
npm run android:debug       # Debug build
npm run test:android        # Run Android tests
npm run lint                # Code linting
npm run type-check          # TypeScript validation
```

## 🏗️ Architecture

### Clean Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐
│  Presentation   │───▶│     Domain      │
│    (UI Layer)   │    │ (Business Logic)│
└─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Shared      │    │      Data       │
│   (Utilities)   │    │ (Repositories)  │
└─────────────────┘    └─────────────────┘
```

### Project Structure
```
healthycoaching-id/
├── src/
│   ├── core/                    # Foundation Layer
│   │   ├── domain/             # Business Logic
│   │   ├── data/               # Data Implementation
│   │   ├── presentation/       # UI Layer
│   │   └── network/           # Network Layer
│   ├── features/               # Feature Modules
│   │   ├── auth/             # Authentication
│   │   ├── nutrition/        # Food tracking
│   │   ├── workout/          # Exercise tracking
│   │   ├── profile/          # User management
│   │   └── recommendations/   # AI suggestions
│   └── shared/               # Shared utilities
├── android/                  # Android-specific code
├── docs/                     # Documentation
├── tests/                    # Test files
└── scripts/                  # Build & deployment scripts
```

## 🧪 Testing

### Test Coverage
- **Unit Tests**: 70% - Business logic & utilities
- **Integration Tests**: 27% - Layer interactions & Android APIs
- **E2E Tests**: 3% - Critical user journeys

### Running Tests
```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:android       # Android-specific tests
npm run test:coverage      # With coverage report
```

## 📱 Android Optimization

### Performance Targets
- **App Launch**: < 2 seconds cold start
- **Memory Usage**: < 120MB average
- **Battery Usage**: < 2%/hour background
- **UI Performance**: 60 FPS consistent

### Device Support
- **Low-end**: 2-3GB RAM (Samsung A12, Xiaomi Redmi 9)
- **Mid-range**: 4-6GB RAM (Samsung A52, Xiaomi Redmi Note 11)
- **High-end**: 8-12GB RAM (Samsung S22, Google Pixel 7)

## 🇮🇩 Indonesian Context

### Features
- **Puasa Tracking**: Special Ramadan fasting mode
- **Kalender Lokal**: Indonesian holidays & events
- **Preferensi Budaya**: Halal, vegetarian, local diet
- **Unit Lokal**: Gram, sendok makan, piring

### Regional Coverage
- **Jawa**: Soto, Gudeg, Rendang
- **Sumatera**: Padang, Palembang, Medan
- **Bali**: Ayam betutu, Lawar, Babi guling
- **Sulawesi**: Coto, Konro, Pallu Kacci
- **Kalimantan**: Amparan, Pansoh, Manday

## 🚀 Deployment

### Build Process
```bash
# Android development builds
npm run build:android:debug      # Debug APK
npm run build:android:release    # Release APK
npm run build:android:bundle     # Play Store bundle

# Optimization
npm run build:android:optimize   # Optimize bundle size
npm run build:android:analyze    # Analyze bundle content
```

### Store Deployment
```bash
# Pre-launch checks
npm run check:android:requirements
npm run check:android:performance

# Deploy to Play Store
npm run deploy:android:internal     # Internal testing
npm run deploy:android:production   # Production
```

## 📊 Documentation

- [📋 Architecture Design](./docs/ARCHITECTURE.md)
- [🏗️ Core Modules](./docs/CORE_MODULES.md)
- [🚨 Error Handling](./docs/ERROR_HANDLING.md)
- [🧪 Testing Strategy](./docs/TESTING_STRATEGY.md)
- [🤖 Android Optimization](./docs/ANDROID_OPTIMIZATION.md)
- [📦 Deployment Guide](./docs/ANDROID_DEPLOYMENT.md)
- [📚 Claude Developer Guide](./docs/CLAUDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Maintain >80% test coverage
- Use conventional commit messages
- Write unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Neima Silk** - [GitHub](https://github.com/neimasilk) - neimasilk@gmail.com

## 🙏 Acknowledgments

- React Native team for excellent framework
- Indonesian nutritionists for food database
- Android community for performance optimization tips
- Firebase for analytics and crash reporting

---

**Made with ❤️ for Indonesian healthy living**