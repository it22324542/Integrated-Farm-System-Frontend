# Quick Start Guide - Poultry Health Detection App

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
npx expo install expo-document-picker
```

### 2. Configure Backend URL
If your backend is not running on `localhost:5000`, update the API URL:

**File**: `src/config/api.js`
```javascript
const API_BASE_URL = 'http://YOUR_BACKEND_URL:5000/api';
```

**Common configurations:**
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5000/api`

### 3. Start the App
```bash
npm start
```

Then:
- Press **`a`** for Android
- Press **`i`** for iOS
- Scan QR code with Expo Go for physical device

---

## 📱 How to Use the App

### Step 1: Sound Analysis
1. **Open the app** → You'll see "Sound Upload" screen
2. **Tap "Pick Audio File"** → Select a poultry sound recording
3. **Tap "Analyze Sound"** → Wait for AI analysis
4. **View Result**:
   - 🟢 **Healthy**: Poultry sounds healthy
   - 🔴 **Sick**: Proceed to image upload
   - 🟠 **None**: No clear sounds detected - try again

### Step 2: Image Analysis (Only if sound is Unhealthy)
1. **Tap "Next: Image Upload"** (or it will prompt you)
2. **Choose image source**:
   - 📷 **Camera**: Take a new photo
   - 🖼️ **Gallery**: Select existing photo
3. **Tap "Analyze Image"** → Wait for AI analysis
4. **View Result**:
   - 🟢 **Healthy**: Poultry looks healthy
   - 🔴 **Unhealthy**: Health issues detected

---

## 🎯 Features

### Sound Upload Screen
- Audio file picker for poultry sounds
- Real-time upload progress
- Color-coded results (Green/Red/Orange)
- Confidence score display
- Auto-navigation to image upload if unhealthy

### Image Upload Screen
- Camera capture support
- Gallery/photo picker
- Image preview before upload
- Real-time upload progress
- Detailed health assessment results

---

## 🔧 Troubleshooting

### Cannot Connect to Backend
**Solution**: Update API URL in `src/config/api.js`
```javascript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For Physical Device (replace with your computer's IP)
const API_BASE_URL = 'http://192.168.1.XXX:5000/api';
```

### File Picker Not Working
**Solution**: Reinstall dependencies
```bash
npx expo install expo-document-picker
```

### Camera Permission Denied
**Solution**: 
1. Go to device Settings
2. Find your app
3. Enable Camera and Photos permissions
4. Restart the app

### Upload Timeout
**Solution**: The timeout is already set to 30 seconds. If still timing out:
- Check your network connection
- Ensure backend is running
- Try smaller audio/image files

---

## 📂 Project Structure

```
src/
├── screens/
│   ├── SoundUploadScreen.js    # Step 1: Audio analysis
│   └── ImageUploadScreen.js    # Step 2: Image analysis
├── services/
│   └── poultryService.js       # API integration
├── navigation/
│   └── RootNavigator.js        # Screen navigation
└── config/
    └── api.js                  # Backend configuration
```

---

## 🧪 Testing

### Test Sound Upload
1. Record or find a poultry sound clip (WAV, MP3, OGG, M4A, FLAC)
2. Upload through the app
3. Verify result appears correctly

### Test Image Upload
1. Ensure sound analysis returns "Sick"
2. Take or select a clear poultry image (JPG, PNG)
3. Upload through the app
4. Verify result appears correctly

---

## 📋 Requirements

- **Node.js**: v14 or higher
- **Expo CLI**: Latest version
- **iOS**: iOS 13.0+ (for iOS testing)
- **Android**: Android 5.0+ (for Android testing)
- **Backend**: Must be running on accessible URL

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "Network Error" | Check backend URL and ensure backend is running |
| "File not found" | Verify audio/image file is accessible |
| "Permission denied" | Grant Camera/Photos permissions in settings |
| "Upload failed" | Check file format (audio: WAV/MP3, image: JPG/PNG) |
| App crashes on file pick | Reinstall `expo-document-picker` |

---

## 📞 Need Help?

1. Check backend is running: `http://YOUR_BACKEND_URL:5000/health`
2. Verify API endpoint: `http://YOUR_BACKEND_URL:5000/api/ping`
3. Check logs in terminal for error messages
4. Refer to main documentation: `../POULTRY_HEALTH_WORKFLOW.md`

---

## ✅ Pre-Launch Checklist

- [ ] Backend server is running
- [ ] API URL is correctly configured
- [ ] Dependencies are installed
- [ ] expo-document-picker is installed
- [ ] Device has internet connection
- [ ] Camera/Photos permissions granted (for physical devices)
- [ ] Test audio file is ready
- [ ] Test image is ready

---

Happy detecting! 🐔🏥
