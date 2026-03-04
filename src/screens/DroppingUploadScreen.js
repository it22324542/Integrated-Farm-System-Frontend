import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadDropping } from '../services/poultryService';

// ─────────────────────────────────────────────────────────────────────────────
// Disease information database
// Content sourced from msschippers.com with user-provided treatment summaries
// ─────────────────────────────────────────────────────────────────────────────
const DISEASE_INFO = {
  // ── Salmonella Disease ────────────────────────────────────────────────────
  salmo: {
    name: 'Salmonella Disease',
    color: '#E53935',
    emoji: '🦠',
    treatmentSummary:
      'Salmonella in poultry is best managed through strict biosecurity, sanitation, and nutritional additives ' +
      'rather than solely relying on antibiotics, which can lead to resistant strains. Key treatments include ' +
      'using organic acids in water/feed, implementing probiotic/competitive exclusion products, and maintaining ' +
      'a dry, clean environment.',
    treatmentDetails: [
      {
        heading: 'Sanitation & Biosecurity',
        body:
          'Rigorous disinfection of houses and equipment, along with pest control, is critical to break the ' +
          'infection cycle.',
      },
      {
        heading: 'Feed & Water Additives',
        body:
          'Organic acids (e.g., lactic, butyric) reduce Salmonella in the gastrointestinal tract. Probiotics ' +
          'and yeast extracts help boost gut health.',
      },
      {
        heading: 'Natural Alternatives',
        body:
          'Phytomolecules (e.g., thyme and oregano oils containing thymol/carvacrol) can disrupt bacterial cell ' +
          'membranes.',
      },
      {
        heading: 'Antibiotics',
        body:
          'While medications like enrofloxacin, ciprofloxacin, and neomycin can be used, they are generally less ' +
          'effective alone and should be part of a comprehensive, veterinarian-led plan.',
      },
      {
        heading: 'Vaccination',
        body: 'Vaccines are used to reduce colonization, particularly in breeding flocks.',
      },
    ],
    criticalNotes: [
      'Salmonella Pullorum (pullorum disease) is often treated with eradication, not medication, due to its high mortality.',
      'Salmonella in meat is eliminated by cooking to an internal temperature of 165°F (74°C).',
    ],
    causes: {
      title: 'What Causes Salmonellosis in Poultry?',
      body:
        'Salmonella is a gram-negative rod-shaped genus belonging to the Enterobacteriaceae family. There are more ' +
        'than 2,700 types of Salmonella known. Salmonella infections in poultry are categorised into three main types:\n\n' +
        '1. Host-Specific Infections: Caused by Salmonella pullorum and Salmonella gallinarum, which mainly affect ' +
        'poultry. Thanks to effective control measures, these are rare in most developed countries.\n\n' +
        '2. Non-Host-Specific Infections: Caused by paratyphoid Salmonella subspecies such as Salmonella Enteritidis ' +
        'and Salmonella Typhimurium. These can lead to food poisoning in humans.\n\n' +
        '3. Arizonosis in Poultry: Caused by infections with serotypes of the subgenus Salmonella Arizonae.',
    },
    spread: {
      title: 'How Does Salmonellosis Spread?',
      points: [
        'Contaminated Feed and Water – the most common transmission route.',
        'Infected Equipment – tools, cages, or clothing that have been contaminated.',
        'Rodents and Insects – rats, mice, lesser mealworm, and red mites can act as vectors.',
        'Visitors – contaminated clothing, footwear, or equipment.',
        'Transport Vehicles – animal transport and feed providers can spread bacteria farm-to-farm.',
      ],
    },
    symptoms: {
      title: 'Symptoms of Salmonellosis in Poultry',
      points: [
        'Reduced appetite and weight loss',
        'Watery diarrhoea',
        'Lethargy / drowsy birds',
        'Decreased egg production',
        'Reduced mobility, swollen joints and lameness',
        'Dehydration',
        'Lower hatchability',
      ],
    },
    preventionSteps: {
      title: 'The 5 Steps to Prevent Salmonellosis in Poultry',
      steps: [
        {
          step: 1,
          heading: 'Start with Proper Personal Hygiene',
          body:
            'Each person entering the farm needs to thoroughly shower and wash to reduce pathogen pressure and prevent ' +
            'the introduction of disease. Ensure thorough shoe disinfection.',
        },
        {
          step: 2,
          heading: 'Set Up a Colour System',
          body:
            'Use dedicated colours for tools, equipment, and clothing in each location to prevent cross-contamination. ' +
            'If Salmonella is detected in one barn, it cannot spread to others.',
        },
        {
          step: 3,
          heading: 'Clean and Disinfect the Poultry Barn',
          body:
            'Maintain a strict cleaning and disinfecting protocol for the living environment and all vehicles, tools, ' +
            'and equipment that enter the farm.',
        },
        {
          step: 4,
          heading: 'Water & Nutrition',
          body:
            'Prevent the spread of Salmonella through the drinking water system by cleaning and disinfecting water lines. ' +
            'Organic acids can lower Salmonella pressure.',
        },
        {
          step: 5,
          heading: 'Create a Dry Living Environment',
          body:
            'Bacteria need moisture to thrive. Maintaining a dry living environment helps control bacterial spread and ' +
            'reduces pathogen pressure.',
        },
      ],
    },
    sourceUrl: 'https://www.msschippers.com/en-EU/advice/the-5-steps-to-prevent-salmonellosis-in-poultry',
  },

  // ── Newcastle Disease ─────────────────────────────────────────────────────
  ncd: {
    name: 'Newcastle Disease',
    color: '#E65100',
    emoji: '🐔',
    treatmentSummary:
      'There is no direct cure or treatment for Newcastle disease (ND) in poultry, as it is caused by a virus. ' +
      'Management focuses on prevention via vaccination (e.g., I-2 vaccine) and strict biosecurity, as infected, ' +
      'unvaccinated birds often die. Supportive care includes antibiotics for secondary infections, vitamins, and ' +
      'culling infected birds to stop transmission.',
    treatmentDetails: [
      {
        heading: 'Vaccination (Best Prevention)',
        body:
          'Use vaccines like the I-2 Newcastle vaccine, which is thermostable, every 3–4 months.',
      },
      {
        heading: 'Supportive Care',
        body: 'Provide multivitamins (especially vitamin C) to boost immunity.',
      },
      {
        heading: 'Secondary Infection Control',
        body:
          'Use antibiotics to treat associated respiratory or bacterial issues, such as E. coli or Chronic ' +
          'Respiratory Disease (CRD).',
      },
      {
        heading: 'Biosecurity',
        body:
          'Quarantine new birds, control rodents/wild birds, and disinfect housing to prevent virus spread.',
      },
      {
        heading: 'Culling',
        body:
          'Infected, unvaccinated birds often need to be destroyed to stop the spread.',
      },
    ],
    criticalNotes: [
      'If you suspect an outbreak, contact a veterinarian immediately.',
      'The mortality rate in unvaccinated birds can reach 100%.',
    ],
    causes: {
      title: 'What Causes Newcastle Disease?',
      body:
        'The Newcastle disease virus (NDV), also called Exotic Newcastle Disease (END), is part of the ' +
        'Paramyxoviridae family and also known as Avian paramyxovirus type 1 (APMV-1). The virus is highly ' +
        'contagious and has significant impact on poultry including chickens, turkeys, and other bird species.\n\n' +
        'There are several strains of the NDV:\n\n' +
        '1. Lentogenic (Mild) Strains\n' +
        '2. Mesogenic (Moderate) Strains\n' +
        '3. Velogenic (Highly Virulent) Strains\n\n' +
        'Velogenic strains cause the most severe disease with high mortality. The virus survives for several weeks ' +
        'in a warm, humid environment and can survive indefinitely in frozen material.',
    },
    spread: {
      title: 'How Does Newcastle Disease Spread?',
      points: [
        'Direct contact with infected birds.',
        'Contaminated feed and water.',
        'Contaminated equipment, clothing, and shoes.',
        'Airborne transmission over short distances.',
        'The NDV virus survives for several weeks in the environment, even in cold weather.',
      ],
    },
    symptoms: {
      title: 'Symptoms of Newcastle Disease',
      points: [
        'Respiratory distress (gasping, coughing)',
        'Nervous signs (trembling, paralysis)',
        'Swelling of the head and neck',
        'Greenish, watery diarrhoea',
        'High mortality',
        'Cessation of egg production',
        'Depression, droopy wings, circling',
      ],
    },
    preventionSteps: {
      title: 'The 5 Steps to Prevent Newcastle Disease in Chickens',
      steps: [
        {
          step: 1,
          heading: 'Avoid Outbreaks Through Hygiene',
          body:
            'Each person entering the farm needs to thoroughly shower and wash. The NDV can be carried from one ' +
            'premises to another on contaminated shoes, clothing of service crews, visitors, and their vehicles.',
        },
        {
          step: 2,
          heading: 'Prevent Cross-Contamination',
          body:
            'Equip each poultry barn with distinct boots, tools, and clothing. If Newcastle disease is found in ' +
            'one barn, it can be contained and prevented from spreading.',
        },
        {
          step: 3,
          heading: 'Clean and Disinfect Your Poultry Farm Effectively',
          body:
            'A strict cleaning and disinfecting protocol for the living environment and all vehicles, tools, and ' +
            'equipment that enter the farm helps prevent the introduction and spread of disease.',
        },
        {
          step: 4,
          heading: 'Reduce Pathogen Pressure Through Clean Water',
          body:
            'Clean and disinfect the water lines to prevent spreading disease through the drinking water system. ' +
            'Clean, high-quality drinking water reduces pathogen pressure on the animals.',
        },
        {
          step: 5,
          heading: 'Create a Dry Living Environment',
          body:
            'The NDV virus needs moisture to survive. Creating and maintaining a dry environment can be a final ' +
            'barrier for indirect transmission of the disease.',
        },
      ],
    },
    sourceUrl:
      'https://www.msschippers.com/en-EU/advice/the-5-steps-to-prevent-newcastle-disease-in-chickens',
  },

  // ── Coccidiosis Disease ───────────────────────────────────────────────────
  cocci: {
    name: 'Coccidiosis Disease',
    color: '#6A1B9A',
    emoji: '🔬',
    treatmentSummary:
      'Coccidiosis in poultry is rapidly treated using anticoccidial drugs like Amprolium (usually via water for ' +
      '~7 days) or sulfa drugs, often targeting the entire flock to halt parasite reproduction. Effective management ' +
      'requires strict sanitation (removing wet litter), isolating sick birds, and potentially using vaccines or ' +
      'preventative, rotating coccidiostats to manage resistance.',
    treatmentDetails: [
      {
        heading: 'Amprolium',
        body:
          'The most common over-the-counter treatment; it works by inhibiting the parasite\'s thiamin metabolism ' +
          'and requires no withdrawal time.',
      },
      {
        heading: 'Sulfa Drugs (Sulfonamides)',
        body: 'Highly effective but must be used carefully to avoid toxicity.',
      },
      {
        heading: 'Toltrazuril',
        body: 'Another effective medication for treating established infections.',
      },
      {
        heading: 'Supportive Care',
        body:
          'Isolate sick birds, keep the environment dry to prevent further oocyst maturation, and maintain clean bedding.',
      },
    ],
    criticalNotes: [
      'Vaccination is often used for broiler breeders to build immunity.',
      'Maintain dry litter – Coccidia thrives in wet, warm conditions.',
      'Rotate between different types of coccidiostats (ionophores and synthetics) to prevent resistance.',
      'Some herbal extracts (e.g., Artemisia annua) may help reduce parasite shedding.',
    ],
    causes: {
      title: 'What Is Causing Coccidiosis in Chickens?',
      body:
        'Coccidiosis in chickens is a disease caused by several Eimeria species of protozoan parasites, each ' +
        'having a preference for infecting specific parts of the chicken\'s intestine. Common species include ' +
        'Eimeria acervulina, Eimeria maxima, and Eimeria tenella.\n\n' +
        'Eimeria parasites are transmitted through their eggs (oocysts). These are laid in the gut of the ' +
        'infected host and spread through their faeces. Chickens ingest the oocysts from the environment.',
    },
    spread: {
      title: 'Transmission and Spread of Coccidiosis Parasites',
      points: [
        'Introduction of infected birds.',
        'Contaminated equipment or clothing.',
        'Wild birds and rodents.',
        'Contaminated feed or water.',
        'Transportation / vehicles.',
        'Re-contamination due to poor cleaning & disinfection protocols.',
        'Oocysts thrive in warm, moist, dirty conditions often found in poultry housing.',
      ],
    },
    symptoms: {
      title: 'Symptoms of Coccidiosis',
      points: [
        'Diarrhoea',
        'Reduced feed intake',
        'Weight loss or poor growth',
        'Dehydration',
        'Pale combs and wattles',
        'Droopy posture and wings',
        'Ruffled or puffed-up feathers',
        'Droopy, dull, or glazed eyes',
      ],
    },
    preventionSteps: {
      title: 'The 5 Steps to Prevent Coccidiosis in Chickens',
      steps: [
        {
          step: 1,
          heading: 'Guard Your Flock: Hygiene Is Key',
          body:
            'Experts strongly recommend strict hygiene protocols. Every person entering the poultry farm must ' +
            'shower and wash thoroughly. Implementing a strict hygiene protocol is crucial for preventing any ' +
            'potential issues.',
        },
        {
          step: 2,
          heading: 'Prevent Cross-Contamination with a Colour System',
          body:
            'Dedicated colours for tools, equipment, and clothing for each location can help prevent cross-' +
            'contamination of oocysts between farms, locations, or barns.',
        },
        {
          step: 3,
          heading: 'Cleaning & Disinfecting',
          body:
            'A strict cleaning and disinfecting (C&D) protocol for all vehicles, tools, and equipment that enter ' +
            'the farm helps prevent the introduction of new Eimeria parasite types.',
        },
        {
          step: 4,
          heading: 'Ensure Safe Drinking Water',
          body:
            'Clean and disinfect the water lines to prevent the spread of oocysts through the drinking water ' +
            'system. Water quality has a direct link to the health status of livestock.',
        },
        {
          step: 5,
          heading: 'Lower pH with Organic Acids',
          body:
            'Decreasing the pH level in the intestines can be beneficial in reducing the count of Eimeria ' +
            'parasites in the intestinal tract. Organic acids are commonly used to support gastrointestinal health.',
        },
      ],
    },
    sourceUrl:
      'https://www.msschippers.com/en-EU/advice/the-5-steps-to-prevent-coccidiosis-in-chickens',
  },

  // ── Healthy ───────────────────────────────────────────────────────────────
  healthy: {
    name: 'Healthy Poultry',
    color: '#2E7D32',
    emoji: '✅',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: open external link
// ─────────────────────────────────────────────────────────────────────────────
const openLink = (url) => {
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components for disease detail sections
// ─────────────────────────────────────────────────────────────────────────────
const SectionCard = ({ children, style }) => (
  <View style={[styles.sectionCard, style]}>{children}</View>
);

const SectionHeading = ({ text, color }) => (
  <Text style={[styles.sectionHeading, color ? { color } : null]}>{text}</Text>
);

const BulletList = ({ items }) => (
  <View>
    {items.map((item, idx) => (
      <View key={idx} style={styles.bulletRow}>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

const TreatmentItem = ({ heading, body }) => (
  <View style={styles.treatmentItem}>
    <Text style={styles.treatmentHeading}>{heading}:</Text>
    <Text style={styles.treatmentBody}>{body}</Text>
  </View>
);

const StepItem = ({ step, heading, body }) => (
  <View style={styles.stepItem}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepBadgeText}>Step {step}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>{heading}</Text>
      <Text style={styles.stepBody}>{body}</Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Disease detail renderer
// ─────────────────────────────────────────────────────────────────────────────
const DiseaseDetail = ({ classLabel }) => {
  const info = DISEASE_INFO[classLabel];
  if (!info) return null;

  if (classLabel === 'healthy') {
    return (
      <SectionCard style={styles.healthyCard}>
        <Text style={styles.healthyEmoji}>✅</Text>
        <Text style={styles.healthyTitle}>Healthy Poultry</Text>
        <Text style={styles.healthyBody}>
          No disease indicators were detected in the dropping image. Your poultry appears to be healthy.
          Continue to maintain good biosecurity, hygiene practices, clean water, and balanced nutrition
          to keep your flock in top condition.
        </Text>
      </SectionCard>
    );
  }

  return (
    <View>
      {/* ── Treatment Summary ─────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading text="Treatment Overview" color={info.color} />
        <Text style={styles.bodyText}>{info.treatmentSummary}</Text>

        <Text style={[styles.subHeading, { marginTop: 14 }]}>Key Treatment & Control Measures:</Text>
        {info.treatmentDetails.map((item, idx) => (
          <TreatmentItem key={idx} heading={item.heading} body={item.body} />
        ))}

        {info.criticalNotes && info.criticalNotes.length > 0 && (
          <View style={[styles.criticalBox, { borderColor: info.color }]}>
            <Text style={[styles.criticalTitle, { color: info.color }]}>Critical Considerations:</Text>
            <BulletList items={info.criticalNotes} />
          </View>
        )}
      </SectionCard>

      {/* ── Causes ───────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading text={info.causes.title} color={info.color} />
        <Text style={styles.bodyText}>{info.causes.body}</Text>
      </SectionCard>

      {/* ── Spread ───────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading text={info.spread.title} color={info.color} />
        <BulletList items={info.spread.points} />
      </SectionCard>

      {/* ── Symptoms ─────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading text={info.symptoms.title} color={info.color} />
        <BulletList items={info.symptoms.points} />
      </SectionCard>

      {/* ── Prevention Steps ─────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading text={info.preventionSteps.title} color={info.color} />
        {info.preventionSteps.steps.map((s) => (
          <StepItem key={s.step} step={s.step} heading={s.heading} body={s.body} />
        ))}
      </SectionCard>

      {/* ── Source Link ──────────────────────────────────────────────── */}
      <SectionCard style={styles.sourceCard}>
        <Text style={styles.sourceTitle}>Learn More</Text>
        <TouchableOpacity onPress={() => openLink(info.sourceUrl)}>
          <Text style={[styles.sourceLink, { color: info.color }]}>{info.sourceUrl}</Text>
        </TouchableOpacity>
      </SectionCard>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────
const DroppingUploadScreen = ({ navigation, route }) => {
  const { imagePredictionId } = route.params || {};

  const [imageFile, setImageFile]         = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult]               = useState(null);

  // ── Permission helpers ───────────────────────────────────────────────────
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos');
      return false;
    }
    return true;
  };

  // ── Camera / gallery pickers ─────────────────────────────────────────────
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        const image = pickerResult.assets[0];
        const fileData =
          Platform.OS === 'web' && image.file
            ? image.file
            : { uri: image.uri, name: `dropping_${Date.now()}.jpg`, type: 'image/jpeg' };
        setImageFile(fileData);
        setResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        const image = pickerResult.assets[0];
        const fileData =
          Platform.OS === 'web' && image.file
            ? image.file
            : { uri: image.uri, name: `dropping_${Date.now()}.jpg`, type: 'image/jpeg' };
        setImageFile(fileData);
        setResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get the dropping image from',
      [
        { text: 'Camera',  onPress: takePhoto },
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'Cancel',  style: 'cancel' },
      ]
    );
  };

  // ── Upload & analyse ─────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!imageFile) {
      Alert.alert('No Image', 'Please select a dropping image first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadDropping(imageFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setResult(response);
        Alert.alert('Analysis Complete', response.message, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', response.error || 'Upload failed');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to upload and analyse dropping image'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetUpload = () => {
    setImageFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  // ── Result colour ────────────────────────────────────────────────────────
  const getResultColor = (classLabel) => {
    return DISEASE_INFO[classLabel]?.color || '#757575';
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Step 3: Disease Detection</Text>
        <Text style={styles.subtitle}>
          Upload a clear image of poultry dropping to detect the disease using AI analysis
        </Text>
      </View>

      {/* ── Image Picker Section ────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Dropping Image</Text>

        {imageFile && (
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: imageFile.uri || (imageFile instanceof File ? URL.createObjectURL(imageFile) : null) }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.pickButton, styles.cameraButton]}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Text style={styles.pickButtonText}>📷 Camera</Text>
        </TouchableOpacity>

        {imageFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoText}>Dropping image ready for analysis</Text>
          </View>
        )}
      </View>

      {/* ── Analyse Button ──────────────────────────────────────────────── */}
      {imageFile && !result && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.uploadButtonText}>
                Analysing... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>🔬 Analyse Dropping</Text>
          )}
        </TouchableOpacity>
      )}

      {/* ── Result Display ──────────────────────────────────────────────── */}
      {result && (
        <View>
          {/* Result summary box */}
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Detection Result</Text>

            <View
              style={[
                styles.resultBox,
                { borderColor: getResultColor(result.class_label), backgroundColor: getResultColor(result.class_label) + '15' },
              ]}
            >
              <Text style={styles.resultEmoji}>
                {DISEASE_INFO[result.class_label]?.emoji || '🔬'}
              </Text>
              <Text style={[styles.resultText, { color: getResultColor(result.class_label) }]}>
                {result.result}
              </Text>
              {result.confidence != null && (
                <Text style={styles.confidenceText}>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </Text>
              )}
            </View>

            <Text style={styles.resultMessage}>{result.message}</Text>

            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={resetUpload}
              >
                <Text style={styles.actionButtonText}>Analyse Another</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.backButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.actionButtonText}>Back to Image</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Detailed disease information */}
          <Text style={styles.detailHeader}>Detailed Information</Text>
          <DiseaseDetail classLabel={result.class_label} />
        </View>
      )}

      {/* ── Instructions ────────────────────────────────────────────────── */}
      {!result && (
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Take a clear photo of the poultry dropping{'\n'}
            2. Ensure good lighting and the dropping is clearly visible{'\n'}
            3. Avoid blurry or dark images{'\n'}
            4. Supported formats: JPEG, PNG{'\n'}
            5. The AI model will classify the dropping as:{'\n'}
            {'   '}• Coccidiosis Disease{'\n'}
            {'   '}• Newcastle Disease{'\n'}
            {'   '}• Salmonella Disease{'\n'}
            {'   '}• Healthy Poultry
          </Text>
        </View>
      )}

      {imagePredictionId && (
        <View style={styles.linkedInfo}>
          <Text style={styles.linkedInfoText}>
            📎 Linked to image analysis: {imagePredictionId.substring(0, 8)}...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 22 },

  // Upload section
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  previewImage: { width: '100%', height: '100%' },
  pickButton: { borderRadius: 8, padding: 15, alignItems: 'center' },
  cameraButton: { backgroundColor: '#FF5722' },
  galleryButton: { backgroundColor: '#2196F3' },
  pickButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fileInfo: { marginTop: 15, padding: 12, backgroundColor: '#E8F5E9', borderRadius: 8 },
  fileInfoText: { color: '#2E7D32', fontSize: 14, textAlign: 'center' },

  // Upload button
  uploadButton: {
    backgroundColor: '#7B1FA2',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonDisabled: { backgroundColor: '#CE93D8' },
  uploadingContainer: { flexDirection: 'row', alignItems: 'center' },
  uploadButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },

  // Result container
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  resultBox: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  resultEmoji:   { fontSize: 40, marginBottom: 8 },
  resultText:    { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  confidenceText:{ fontSize: 16, color: '#666', marginTop: 8 },
  resultMessage: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  buttonRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton:  { flex: 1, borderRadius: 8, padding: 15, alignItems: 'center', marginHorizontal: 5 },
  resetButton:   { backgroundColor: '#FF9800' },
  backButton:    { backgroundColor: '#757575' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Disease detail header
  detailHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 4,
  },

  // Section cards (inside DiseaseDetail)
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  bodyText: { fontSize: 14, color: '#555', lineHeight: 21 },

  // Bullet list
  bulletRow:  { flexDirection: 'row', marginBottom: 6 },
  bulletDot:  { fontSize: 14, color: '#666', marginRight: 8, marginTop: 1 },
  bulletText: { fontSize: 14, color: '#555', lineHeight: 20, flex: 1 },

  // Treatment items
  treatmentItem: { marginBottom: 12 },
  treatmentHeading: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 3 },
  treatmentBody:    { fontSize: 14, color: '#555', lineHeight: 20 },

  // Critical notes box
  criticalBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    marginTop: 14,
    backgroundColor: '#FFF8E1',
  },
  criticalTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },

  // Prevention steps
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 12,
    marginTop: 2,
  },
  stepBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  stepContent:  { flex: 1 },
  stepHeading:  { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 4 },
  stepBody:     { fontSize: 14, color: '#555', lineHeight: 20 },

  // Source link card
  sourceCard:   { alignItems: 'center' },
  sourceTitle:  { fontSize: 14, color: '#888', marginBottom: 6 },
  sourceLink:   { fontSize: 14, textDecorationLine: 'underline', textAlign: 'center' },

  // Healthy card
  healthyCard:  { alignItems: 'center', padding: 24 },
  healthyEmoji: { fontSize: 52, marginBottom: 12 },
  healthyTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  healthyBody:  { fontSize: 15, color: '#555', lineHeight: 22, textAlign: 'center' },

  // Instructions
  instructions: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  instructionsTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginBottom: 10 },
  instructionsText:  { fontSize: 14, color: '#4A148C', lineHeight: 22 },

  // Linked info
  linkedInfo: {
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  linkedInfoText: { fontSize: 12, color: '#6A1B9A', textAlign: 'center' },
});

export default DroppingUploadScreen;
