import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadSound } from '../services/poultryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SoundUploadScreen = ({ navigation }) => {
  // ── Existing state (unchanged) ──────────────────────────────────────────
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);

  // ── Toast state ─────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // ── Animation refs ───────────────────────────────────────────────────────
  const chickenAnim    = useRef(new Animated.Value(0)).current;
  const uploadIconAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim    = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const stepDotAnim    = useRef(new Animated.Value(1)).current;
  const waveBarAnims   = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(0.3))
  ).current;
  const dotAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const resultScaleAnim = useRef(new Animated.Value(0.8)).current;
  const resultOpacity   = useRef(new Animated.Value(0)).current;
  const confidenceAnim  = useRef(new Animated.Value(0)).current;
  const toastAnim       = useRef(new Animated.Value(100)).current;

  // ── Idle animations ──────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(chickenAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(chickenAnim, { toValue: 0,  duration: 600, useNativeDriver: true }),
      ])
    ).start();

    shimmerAnim.setValue(-SCREEN_WIDTH);
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: SCREEN_WIDTH, duration: 1800, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(stepDotAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(stepDotAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Waveform + bouncing dots while uploading ─────────────────────────────
  useEffect(() => {
    if (uploading) {
      waveBarAnims.forEach(a => a.setValue(0.3));
      dotAnims.forEach(a => a.setValue(0));

      const waveLoops = waveBarAnims.map(anim =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1.0, duration: 350, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          ])
        )
      );
      Animated.stagger(80, waveLoops).start();

      const dotLoops = dotAnims.map(anim =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: -7, duration: 280, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0,  duration: 280, useNativeDriver: true }),
          ])
        )
      );
      Animated.stagger(150, dotLoops).start();

      return () => {
        waveLoops.forEach(a => a.stop());
        dotLoops.forEach(a => a.stop());
        waveBarAnims.forEach(a => a.setValue(0.3));
        dotAnims.forEach(a => a.setValue(0));
      };
    }
  }, [uploading]);

  // ── Result entrance + confidence bar ────────────────────────────────────
  useEffect(() => {
    if (result) {
      resultScaleAnim.setValue(0.8);
      resultOpacity.setValue(0);
      confidenceAnim.setValue(0);

      Animated.parallel([
        Animated.spring(resultScaleAnim, {
          toValue: 1.0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      const targetConfidence =
        result.confidence != null ? result.confidence * 100 : 100;
      Animated.timing(confidenceAnim, {
        toValue: targetConfidence,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [result]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    toastAnim.setValue(100);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 0,   duration: 300, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastAnim, { toValue: 100, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  // ── Existing functions (unchanged) ──────────────────────────────────────
  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;
        console.log('Picked file:', file);

        // On web, file.file contains the actual File object
        const fileData = Platform.OS === 'web' && file.file ? file.file : {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'audio/wav',
        };

        console.log('File data to upload:', fileData);
        setAudioFile(fileData);
        setResult(null); // Reset previous result
        showToast(`✓ ${file.name} selected`);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      Alert.alert('No File', 'Please select an audio file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadSound(audioFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setResult(response);

        // Show result alert
        Alert.alert(
          'Analysis Complete',
          response.message,
          [
            {
              text: 'OK',
              onPress: () => {
                // If result is "Sick" (Unhealthy), navigate to image upload
                if (response.result === 'Sick') {
                  Alert.alert(
                    'Next Step',
                    'Unhealthy sound detected. Would you like to upload an image for detailed analysis?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Upload Image',
                        onPress: () => navigation.navigate('ImageUpload', {
                          soundPredictionId: response.prediction_id
                        }),
                      },
                    ]
                  );
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to upload and analyze audio'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const navigateToImageUpload = () => {
    if (result && result.result === 'Sick') {
      navigation.navigate('ImageUpload', {
        soundPredictionId: result.prediction_id
      });
    }
  };

  const resetUpload = () => {
    setAudioFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  const getResultColor = (resultType) => {
    switch (resultType) {
      case 'Healthy': return '#3dba5c';
      case 'Sick':    return '#e53935';
      default:        return '#f9a825';
    }
  };

  // ── Display helpers ──────────────────────────────────────────────────────
  const getResultLabel = (r) => {
    if (!r) return '';
    if (r.result === 'Sick') return 'Unhealthy';
    return r.result || 'None';
  };

  const getResultMessage = (r) => {
    if (!r) return '';
    if (r.result === 'Healthy')
      return '🐔 Poultry sounds healthy. Proceed to image verification.';
    if (r.result === 'Sick')
      return '⚠️ Poultry sounds unhealthy. Proceed to image verification for detailed analysis.';
    return '🔇 No clear poultry sounds detected. Please record again with clear audio.';
  };

  const confidencePercent =
    result ? (result.confidence != null ? result.confidence * 100 : 100) : 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <LinearGradient colors={['#1a5c2a', '#3dba5c']} style={styles.header}>
        <Animated.Text style={[styles.headerChicken, { transform: [{ translateY: chickenAnim }] }]}>
          🐔
        </Animated.Text>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Poultry Health Detection</Text>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Powered</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Progress Steps Bar ──────────────────────────────────────── */}
        <View style={styles.progressBar}>
          <View style={[styles.stepPill, styles.stepPillActive]}>
            <Text style={[styles.stepPillText, styles.stepPillTextActive]}>
              ✓ 1 Sound Analysis
            </Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>2 Image Analysis</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>3 Health Report</Text>
          </View>
        </View>

        {/* ── Step Header ─────────────────────────────────────────────── */}
        <View style={styles.stepHeader}>
          <View style={styles.stepTagRow}>
            <Animated.View style={[styles.stepDot, { transform: [{ scale: stepDotAnim }] }]} />
            <Text style={styles.stepTag}>Step 1 of 3</Text>
          </View>
          <Text style={styles.stepTitle}>Sound Analysis</Text>
          <Text style={styles.stepSubtitle}>
            Upload a recording of poultry sounds to check for health indicators
          </Text>
        </View>

        {/* ── Audio Upload Card ────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardTopAccent} />
          <Text style={styles.cardTitle}>🎵 Select Audio File</Text>

          <TouchableOpacity
              style={[styles.pickBtn, audioFile && styles.pickBtnChanged]}
              onPress={pickAudioFile}
              disabled={uploading}
              activeOpacity={0.82}
            >
              <Text style={styles.pickBtnText}>
                {audioFile ? '🔄 Change Audio File' : '📂 Pick Audio File'}
              </Text>
            </TouchableOpacity>

          {audioFile && (
            <View style={styles.fileInfoRow}>
              <View style={styles.fileCheckBadge}>
                <Text style={styles.fileCheckBadgeText}>✓</Text>
              </View>
              <Text style={styles.fileInfoText} numberOfLines={1} ellipsizeMode="middle">
                {audioFile.name}
              </Text>
            </View>
          )}
        </View>

        {/* ── Analyze Button with shimmer ──────────────────────────────── */}
        {audioFile && !uploading && !result && (
          <TouchableOpacity
            onPress={handleUpload}
            activeOpacity={0.88}
            style={styles.analyzeWrapper}
          >
            <LinearGradient colors={['#2d8c45', '#1a5c2a']} style={styles.analyzeBtn}>
              <Animated.View
                style={[styles.shimmer, { transform: [{ translateX: shimmerAnim }] }]}
                pointerEvents="none"
              />
              <Text style={styles.analyzeBtnText}>🔬  Analyze Sound</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Waveform Loading State ───────────────────────────────────── */}
        {uploading && (
          <View style={styles.loadingCard}>
            <View style={styles.waveform}>
              {waveBarAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[styles.waveBar, { transform: [{ scaleY: anim }] }]}
                />
              ))}
            </View>
            <Text style={styles.loadingText}>Analyzing poultry sounds...</Text>
            <View style={styles.bounceDots}>
              {dotAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[styles.bounceDot, { transform: [{ translateY: anim }] }]}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Result Card ─────────────────────────────────────────────── */}
        {result && (
          <Animated.View
            style={[
              styles.resultCard,
              { borderColor: getResultColor(result.result) },
              { transform: [{ scale: resultScaleAnim }], opacity: resultOpacity },
            ]}
          >
            <Text style={[styles.resultLabel, { color: getResultColor(result.result) }]}>
              {getResultLabel(result)}
            </Text>

            <View style={styles.confBarTrack}>
              <Animated.View
                style={[
                  styles.confBarFill,
                  { backgroundColor: getResultColor(result.result) },
                  {
                    width: confidenceAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.confLabel}>
              Confidence: {confidencePercent.toFixed(1)}%
            </Text>

            <Text style={styles.resultMessage}>{getResultMessage(result)}</Text>

            <View style={styles.resultBtns}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetUpload} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>↺ Upload Another</Text>
              </TouchableOpacity>
              {result.result === 'Sick' && (
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={navigateToImageUpload}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>Next: Image Upload →</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* ── Instructions ─────────────────────────────────────────────── */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>💡 Instructions</Text>
          {[
            'Record or select an audio file of poultry sounds',
            'Ensure the recording is clear and contains poultry vocalizations',
            'Supported formats: WAV, MP3, OGG, M4A, FLAC',
            "If unhealthy sounds are detected, you'll proceed to image analysis",
          ].map((item, i) => (
            <View key={i} style={styles.instructionItem}>
              <View style={styles.instrNumBadge}>
                <Text style={styles.instrNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{item}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  // ── Root ─────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: '#f7fdf9',
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  headerChicken: {
    fontSize: 32,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  aiBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 48,
  },

  // ── Progress Bar ─────────────────────────────────────────────────────────
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: 4,
  },
  stepPill: {
    flex: 1,
    backgroundColor: '#e0ede3',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  stepPillActive: {
    backgroundColor: '#2d8c45',
  },
  stepPillText: {
    fontSize: 10,
    color: '#6a8a70',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  stepPillTextActive: {
    color: '#ffffff',
  },
  stepConnector: {
    height: 2,
    width: 10,
    backgroundColor: '#c5dec8',
  },

  // ── Step Header ──────────────────────────────────────────────────────────
  stepHeader: {
    marginBottom: 20,
  },
  stepTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3dba5c',
    marginRight: 8,
  },
  stepTag: {
    fontSize: 13,
    color: '#2d8c45',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  stepTitle: {
    fontFamily: 'PlayfairDisplay-Black',
    fontSize: 30,
    fontWeight: '900',
    color: '#1a5c2a',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#7a9a80',
    fontFamily: 'Nunito-Bold',
    lineHeight: 20,
  },

  // ── Upload Card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#1a5c2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#3dba5c',
  },
  cardTitle: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: '#1a5c2a',
    marginTop: 8,
    marginBottom: 16,
  },
  pickBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickBtnChanged: {
    backgroundColor: '#0D47A1',
  },
  pickBtnText: {
    color: '#ffffff',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    fontSize: 15,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginTop: 14,
    padding: 12,
  },
  fileCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileCheckBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fileInfoText: {
    color: '#1565C0',
    fontSize: 13,
    flex: 1,
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
  },

  // ── Analyze Button ────────────────────────────────────────────────────────
  analyzeWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
  },
  analyzeBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  analyzeBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold',
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Loading / Waveform ────────────────────────────────────────────────────
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#1a5c2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 16,
    gap: 5,
  },
  waveBar: {
    width: 8,
    height: 50,
    backgroundColor: '#3dba5c',
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 15,
    color: '#1a5c2a',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  bounceDots: {
    flexDirection: 'row',
    gap: 6,
  },
  bounceDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#3dba5c',
  },

  // ── Result Card ───────────────────────────────────────────────────────────
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 2.5,
    padding: 24,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  resultLabel: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  confBarTrack: {
    height: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  confBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  confLabel: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'right',
    marginBottom: 14,
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
  },
  resultMessage: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'Nunito-Bold',
    fontWeight: '600',
  },
  resultBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#757575',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#ffffff',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    fontSize: 14,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: '#e53935',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Instructions ──────────────────────────────────────────────────────────
  instructionsBox: {
    backgroundColor: '#fff8e1',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffca28',
    padding: 18,
    marginTop: 4,
  },
  instructionsTitle: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 15,
    fontWeight: '800',
    color: '#e65100',
    marginBottom: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instrNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff6d00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  instrNumText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 13.5,
    color: '#bf360c',
    lineHeight: 20,
    fontFamily: 'Nunito-Bold',
    fontWeight: '600',
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1a5c2a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#ffffff',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SoundUploadScreen;
