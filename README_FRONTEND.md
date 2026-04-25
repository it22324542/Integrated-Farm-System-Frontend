# Integrated Farm System - Frontend (React Native)

Mobile application for Poultry Farm Management System.

## 🎯 Features

- **Flock Profile Creation**: Create and manage chicken flocks
- **Growth Prediction**: Real-time weight predictions with ML
- **Image Upload**: Capture or upload feed plate images
- **Feed Consumption Detection**: AI-powered feed percentage analysis
- **Feed Optimization**: Personalized weekly feed plans
- **Beautiful UI**: Clean, modern interface with smooth navigation

## 📋 Prerequisites

- Node.js (v16+)
- Expo CLI
- React Native development environment
- Android Studio (for Android) or Xcode (for iOS)

## 🚀 Installation

### 1. Install Dependencies

```bash
cd Integrated-Farm-System-Frontend
npm install
```

### 2. Configure API URL

Open [src/config/apiConfig.js](src/config/apiConfig.js) and update the API URL:

```javascript
// For Android Emulator
export const API_URL = 'http://10.0.2.2:3000/api';

// For iOS Simulator  
export const API_URL = 'http://localhost:3000/api';

// For Physical Device (replace with your computer's IP)
export const API_URL = 'http://192.168.1.100:3000/api';
```

**How to find your computer's IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr show`

## 🏃 Running the App

### Start Expo Development Server

```bash
npm start
```

### Run on Android

```bash
npm run android
```

### Run on iOS (Mac only)

```bash
npm run ios
```

### Run on Web

```bash
npm run web
```

## 📱 App Flow

### Step 1: Create Flock Profile
1. Enter flock name (e.g., "Flock Alpha")
2. Select breed from dropdown
3. Enter initial chicken count
4. Enter age in weeks
5. Add optional notes

### Step 2: Growth Prediction
1. View flock details
2. Optionally enter actual weight
3. Select feed type (Starter/Grower/Layer)
4. Upload feed plate image (camera or gallery)
5. Get predictions:
   - Predicted weight from age
   - Feed consumption percentage (0%, 25%, 50%, 100%)
   - Growth status (Below/On/Above Target)
   - Personalized recommendations

### Step 3: Feed Optimization
1. View growth stage (Starter/Grower/Layer)
2. See nutrition requirements (protein, energy, calcium, phosphorus)
3. Get feed quantities:
   - Daily per chicken
   - Weekly per chicken
   - Total weekly for flock
4. View feed composition (corn, soybean, wheat, vitamins, minerals)
5. Read personalized recommendations

## 📁 Project Structure

```
Integrated-Farm-System-Frontend/
├── App.js                           # Main app entry
├── src/
│   ├── screens/
│   │   ├── FlockCreationScreen.js   # Step 1: Create flock
│   │   ├── GrowthPredictionScreen.js # Step 2: Predict growth
│   │   └── FeedOptimizationScreen.js # Step 3: Feed plan
│   ├── navigation/
│   │   └── AppNavigator.js          # Stack navigation
│   └── config/
│       └── apiConfig.js             # API configuration
└── package.json
```

## 🎨 Screens Preview

### 1. Flock Creation Screen (Green Theme)
- Clean form with validation
- Breed picker with 10+ breeds
- Numeric inputs for count and age
- Multi-line notes field

### 2. Growth Prediction Screen (Blue Theme)
- Flock details card
- Weight input (optional)
- Feed type selector
- Camera/Gallery image picker
- Results display:
  - Weight comparison
  - Growth status badge
  - Feed consumption with image
  - Detailed recommendations

### 3. Feed Optimization Screen (Green Theme)
- Growth stage indicator
- Nutrition requirements grid
- Feed quantity breakdown
- Visual feed composition bars
- Bullet-point recommendations
- Action buttons (History, New Prediction)

## 🔧 Troubleshooting

**Cannot connect to backend:**
1. Check if backend is running on `http://localhost:3000`
2. Update `API_URL` in `src/config/apiConfig.js`
3. Use computer's IP address for physical devices
4. Check firewall settings

**Image picker not working:**
1. Grant camera permissions when prompted
2. Grant gallery permissions when prompted
3. On Android, ensure permissions in AndroidManifest.xml

**App crashes on startup:**
1. Clear Metro bundler cache: `npm start -- --reset-cache`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clear Expo cache: `expo start -c`

**Axios network error:**
1. Ensure backend ML service is running first
2. Ensure backend API is running
3. Check API URL configuration
4. Test API with Postman first

## 📦 Key Dependencies

- **@react-navigation**: Navigation between screens
- **axios**: HTTP client for API calls
- **expo-image-picker**: Camera and gallery access
- **@react-native-picker/picker**: Dropdown selectors
- **react-native-gesture-handler**: Touch gestures

## 🌟 Features Highlights

### Beautiful UI Design
- Color-coded screens (Green → Blue → Green)
- Smooth animations and transitions
- Responsive layouts
- Professional card-based design

### Smart Image Handling
- Take photo with camera
- Choose from gallery
- Image preview before upload
- Automatic compression

### Real-time Validation
- Form field validation
- Error messages
- Loading indicators
- Success alerts

### Comprehensive Results
- Visual data presentation
- Color-coded status badges
- Growth charts (weight comparison)
- Actionable recommendations

## 📝 Notes

- Always ensure backend services are running before starting frontend
- For development, use Expo Go app on physical devices
- For production, build standalone APK/IPA
- Images are uploaded to backend and stored in `uploads/` folder

## 👥 Team

Research Project - Final Year
Built with React Native, Expo, Axios
