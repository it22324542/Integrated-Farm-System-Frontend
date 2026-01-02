# Integrated Farm System - Frontend

A production-ready React Native mobile application built with Expo for integrated farm management. This project provides a scalable foundation for building features related to farm operations, livestock management, disease detection, and health monitoring.

## 🚀 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **State Management**: React Context API
- **API Communication**: Axios with interceptors
- **Storage**: AsyncStorage
- **Form Handling**: Formik + Yup
- **Image Handling**: Expo Image Picker & Camera
- **Code Quality**: ESLint + Prettier

## 📁 Project Structure

```
Integrated-Farm-System-Frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and storage services
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── constants/        # App constants and configuration
│   └── config/           # API and app configuration
├── assets/               # Images, fonts, and static files
├── App.js               # Root component
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── .env                 # Environment variables
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v20.12.0 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Integrated-Farm-System-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update `API_BASE_URL` with your backend API URL
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **iOS**: Press `i` in the terminal (Mac only) or scan QR code with Camera app
   - **Web**: Press `w` in the terminal

## 📦 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (Mac only)
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint (to be added)
- `npm run format` - Run Prettier (to be added)

## 🔧 Configuration

### API Configuration

The API configuration is centralized in `src/config/api.js`. Update the base URL in `.env`:

```env
API_BASE_URL=https://your-api-url.com/api
```

### Environment Variables

Environment variables are managed through `.env` file and accessed via `expo-constants`:

```javascript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

## 🏗️ Key Features (Foundation)

- ✅ Complete project structure
- ✅ Navigation system ready
- ✅ API service with interceptors
- ✅ Authentication context
- ✅ AsyncStorage service
- ✅ Custom hooks
- ✅ Utility functions
- ✅ Constants and configuration
- ✅ ESLint and Prettier setup
- ⏳ UI screens (to be implemented)
- ⏳ Authentication flow (to be implemented)
- ⏳ Disease detection feature (to be implemented)

## 🎯 Next Steps

1. **Implement Authentication Screens**
   - Login screen
   - Registration screen
   - Password reset

2. **Build Main Features**
   - Home dashboard
   - Camera/image upload for disease detection
   - Results display
   - History of detections

3. **Add UI Components**
   - Buttons, inputs, cards
   - Loading indicators
   - Error boundaries

4. **Connect to Backend API**
   - Update API endpoints in `src/constants/index.js`
   - Implement authentication API calls
   - Implement disease prediction API calls

## 📱 Permissions

The app requires the following permissions (configured in `app.json`):

- **Camera**: For capturing poultry images
- **Photo Library**: For selecting existing images
- **Storage**: For caching data

## 🤝 Contributing

This is a foundation project ready for collaborative development. When adding features:

1. Follow the established folder structure
2. Use functional components and hooks
3. Maintain code quality with ESLint/Prettier
4. Add comments for complex logic
5. Keep components modular and reusable

## 📄 License

[Add your license here]

## 👥 Authors

[Add author information]

## 🐛 Known Issues

None at this stage - this is a clean foundation project.

## 📞 Support

For questions or issues, please contact [add contact information]

---

**Note**: This is a foundation project with no UI screens implemented yet. It's ready for incremental feature development.
