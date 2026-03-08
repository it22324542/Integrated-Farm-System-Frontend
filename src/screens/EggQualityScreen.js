import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { EggQualityAPI } from '../config/api';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const EggQualityScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cageNo, setCageNo] = useState('');

  const requestPermissions = async (useCamera = false) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission Denied', `Please allow access to your ${useCamera ? 'camera' : 'photos'}.`);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (!(await requestPermissions())) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
      if (!res.canceled) {
        setImageUri(res.assets[0].uri);
        setResult(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') return;
    if (!(await requestPermissions(true))) return;
    try {
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
      if (!res.canceled) {
        setImageUri(res.assets[0].uri);
        setResult(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const getBase64 = async (uri) => {
    if (Platform.OS === 'web') {
      return await new Promise((resolve, reject) => {
        fetch(uri)
          .then(r => r.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      });
    } else {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    }
  };

  const handlePredict = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select or capture an egg photo first.');
      return;
    }
    if (!cageNo) {
      Alert.alert('Missing Cage', 'Please select a cage number.');
      return;
    }

    setLoading(true);
    try {
      const base64 = await getBase64(imageUri);
      const response = await EggQualityAPI.predictQualityBase64(base64, parseInt(cageNo));

      if (response.success) {
        setResult(response.data);
      } else {
        Alert.alert('Analysis Failed', response.error || 'Unknown error');
      }
    } catch (err) {
      Alert.alert('Connection Issue', 'Failed to reach the analysis service.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
    setCageNo('');
  };

  const isGood = result?.quality === 'Good' || result?.status === 'Good';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconRing}>
              <Text style={styles.icon}>📸</Text>
            </View>
            <Text style={styles.title}>Egg Quality AI</Text>
            <Text style={styles.subtitle}>Instant defect detection from photo</Text>
          </View>

          {/* Image Area */}
          <View style={styles.imageArea}>
            {imageUri ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.clearBtn} onPress={reset}>
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyImage}>
                <Text style={styles.emptyIcon}>🐣</Text>
                <Text style={styles.emptyText}>Ready to scan an egg</Text>
                <Text style={styles.emptyHint}>Take or upload a clear photo</Text>
              </View>
            )}
          </View>

          {/* Source Buttons */}
          <View style={styles.sourceRow}>
            <TouchableOpacity style={styles.sourceBtn} onPress={pickImage}>
              <Text style={styles.sourceIcon}>🖼️</Text>
              <Text style={styles.sourceLabel}>Gallery</Text>
            </TouchableOpacity>

            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.sourceBtn} onPress={takePhoto}>
                <Text style={styles.sourceIcon}>📷</Text>
                <Text style={styles.sourceLabel}>Camera</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cage + Analyze */}
          <View style={styles.controlSection}>
            <View style={styles.cageGroup}>
              <Text style={styles.label}>Cage Number</Text>
              <View style={styles.selectWrapper}>
                <select
                  value={cageNo}
                  onChange={(e) => setCageNo(e.target.value)}
                  style={styles.webSelect}
                >
                  <option value="">Select cage</option>
                  {[1,2,3].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.analyzeBtn, loading && styles.analyzeBtnLoading]}
              onPress={handlePredict}
              disabled={loading || !imageUri || !cageNo}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.analyzeText}>Analyze Egg</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Result */}
          {result && (
            <View style={styles.resultCard}>
              <View style={[
                styles.qualityBadge,
                { borderColor: isGood ? '#22c55e' : '#ef4444' }
              ]}>
                <Text style={styles.qualityEmoji}>{isGood ? '✅' : '⚠️'}</Text>
                <Text style={[
                  styles.qualityText,
                  { color: isGood ? '#15803d' : '#b91c1c' }
                ]}>
                  {result.status || result.quality}
                </Text>
                <Text style={styles.confidenceRing}>
                  {Math.round(result.confidence || 0)}%
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Analysis Summary</Text>
                <Text style={styles.infoContent}>{result.description || '—'}</Text>
              </View>

              <View style={[styles.infoBox, styles.recommendBox]}>
                <Text style={styles.infoTitle}>Next Action</Text>
                <Text style={styles.infoContent}>{result.recommendation || '—'}</Text>
              </View>

              <TouchableOpacity style={styles.newScanBtn} onPress={reset}>
                <Text style={styles.newScanText}>Scan Another Egg</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 60 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  header: { alignItems: 'center', marginBottom: 28 },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  icon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },

  imageArea: { marginBottom: 20 },
  imageWrapper: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  selectedImage: { width: '100%', height: 300, resizeMode: 'cover' },
  clearBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  emptyImage: {
    height: 300,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 64, marginBottom: 12, opacity: 0.6 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#475569', marginBottom: 4 },
  emptyHint: { fontSize: 13, color: '#94a3b8' },

  sourceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sourceBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sourceIcon: { fontSize: 24, marginBottom: 6 },
  sourceLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },

  controlSection: { marginBottom: 24 },
  cageGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  selectWrapper: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  webSelect: {
    width: '100%',
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  analyzeBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  analyzeBtnLoading: { backgroundColor: '#60a5fa' },
  analyzeText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  resultCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qualityBadge: {
    alignItems: 'center',
    borderWidth: 4,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  qualityEmoji: { fontSize: 48, marginBottom: 8 },
  qualityText: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  confidenceRing: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recommendBox: { borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  infoContent: { fontSize: 14, color: '#475569', lineHeight: 20 },

  newScanBtn: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  newScanText: { fontSize: 15, fontWeight: '700', color: '#334155' },
});

export default EggQualityScreen;