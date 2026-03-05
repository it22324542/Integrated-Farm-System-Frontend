import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Linking,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadDropping } from '../services/poultryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------------
// PREVENTION STEP IMAGES
// Save the 5 provided images to assets/prevention-steps/ with these exact names:
//   step1.jpg  � person washing hands        (Step 1 � Hygiene)
//   step2.jpg  � colour-coded clothing room  (Step 2 � Colour System)
//   step3.jpg  � spraying disinfectant       (Step 3 � Clean & Disinfect)
//   step4.jpg  � chicks at drinking nipple   (Step 4 � Water)
//   step5.jpg  � person adding DryGard       (Step 5 � Dry Environment)
// ---------------------------------------------------------------------------------
const STEP_IMAGES = [
  null,                                                                          // index 0 � unused
  require('../../assets/prevention-steps/Coccidiosisstep1.png'),                 // Step 1
  require('../../assets/prevention-steps/Coccidiosisstep2.png'),                 // Step 2
  require('../../assets/prevention-steps/Coccidiosisstep3.png'),                 // Step 3
  require('../../assets/prevention-steps/Coccidiosisstep4.png'),                 // Step 4
  require('../../assets/prevention-steps/Coccidiosisstep5.png'),                 // Step 5
];
const SALMONELLA_IMAGES = [
  null,
  require('../../assets/prevention-steps/Salmonellastep1.png'),
  require('../../assets/prevention-steps/Salmonellastep2.png'),
  require('../../assets/prevention-steps/Salmonellastep3.png'),
  require('../../assets/prevention-steps/Salmonellastep4.png'),
  require('../../assets/prevention-steps/Salmonellastep5.png'),
];
const NEWCASTLE_IMAGES = [
  null,
  require('../../assets/prevention-steps/Newcastlestep1.png'),
  require('../../assets/prevention-steps/Newcastlestep2.png'),
  require('../../assets/prevention-steps/Newcastlestep3.png'),
  require('../../assets/prevention-steps/Newcastlestep4.png'),
  require('../../assets/prevention-steps/Newcastlestep5.png'),
];

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────────
// Disease information database
// Content sourced from msschippers.com with user-provided treatment summaries
// ─────────────────────────────────────────────────────────────────────────────
const DISEASE_INFO = {
  // ── Salmonella Disease ────────────────────────────────────────────────────
  salmo: {
    name: 'Salmonella Disease',
    color: '#EF4444',
    emoji: '\u{1F9A0}',
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
        'Contaminated Feed and Water � the most common transmission route.',
        'Infected Equipment � tools, cages, or clothing that have been contaminated.',
        'Rodents and Insects � rats, mice, lesser mealworm, and red mites can act as vectors.',
        'Visitors � contaminated clothing, footwear, or equipment.',
        'Transport Vehicles � animal transport and feed providers can spread bacteria farm-to-farm.',
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
      subtitle:
        'To protect your chickens from Salmonellosis, it\u2019s very important that we find and remove any dangers. ' +
        'Now, let\u2019s talk about five ways to keep Salmonellosis away.',
      steps: [
        {
          step: 1,
          heading: 'Start with Proper Personal Hygiene',
          body:
            'Each person that enters the farm needs to thoroughly shower and wash to reduce pathogen pressure on ' +
            'the animals and prevent the introduction of disease. Ensure thorough shoe disinfection with MS MegaDes ' +
            'Kiemkill to minimize the risk of contamination.',
          image: SALMONELLA_IMAGES[1],
        },
        {
          step: 2,
          heading: 'Set-up a Colour System',
          body:
            'The use of dedicated colours for tools, equipment, and clothing in each location helps prevent ' +
            'contamination of Salmonellosis. If it is detected in one barn, it cannot be transmitted, simplifying ' +
            'the containment process.',
          image: SALMONELLA_IMAGES[2],
        },
        {
          step: 3,
          heading: 'Clean and Disinfect the Poultry Barn',
          body:
            'A strict cleaning and disinfecting protocol for the living environment and all vehicles, tools and ' +
            'equipment that enter the farm. A strict protocol helps to prevent the introduction and spread of Salmonellosis.',
          image: SALMONELLA_IMAGES[3],
        },
        {
          step: 4,
          heading: 'Water & Nutrition',
          body:
            'Prevent the spread of Salmonella through the drinking water system by cleaning and disinfecting water ' +
            'lines with products like DI-O-Clean. Clean drinking water helps reduce pathogen levels. Additionally, ' +
            'organic acids such as MS Goldfeed Health, Prestige, or Welfare can lower Salmonella pressure.',
          image: SALMONELLA_IMAGES[4],
        },
        {
          step: 5,
          heading: 'Create a Dry Living Environment',
          body:
            'Bacteria need moisture to thrive. Maintaining a dry living environment helps to control the spread ' +
            'of bacteria and reduces pathogen pressure on the animals.',
          image: SALMONELLA_IMAGES[5],
        },
      ],
    },
    sourceUrl: 'https://www.msschippers.com/en-EU/advice/the-5-steps-to-prevent-salmonellosis-in-poultry',
  },

  // ── Newcastle Disease ─────────────────────────────────────────────────────
  ncd: {
    name: 'Newcastle Disease',
    color: '#F59E0B',
    emoji: '\u{1F414}',
    treatmentSummary:
      'There is no direct cure or treatment for Newcastle disease (ND) in poultry, as it is caused by a virus. ' +
      'Management focuses on prevention via vaccination (e.g., I-2 vaccine) and strict biosecurity, as infected, ' +
      'unvaccinated birds often die. Supportive care includes antibiotics for secondary infections, vitamins, and ' +
      'culling infected birds to stop transmission.',
    treatmentDetails: [
      {
        heading: 'Vaccination (Best Prevention)',
        body:
          'Use vaccines like the I-2 Newcastle vaccine, which is thermostable, every 3�4 months.',
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
      subtitle:
        'To protect your chickens from Newcastle Disease, it\u2019s critical to implement strong biosecurity and ' +
        'vaccination protocols across your entire flock and farm.',
      steps: [
        {
          step: 1,
          heading: 'Avoid Outbreaks Through Hygiene',
          body:
            'Each person entering the farm needs to thoroughly shower and wash. The NDV can be carried from one ' +
            'premises to another on contaminated shoes, clothing of service crews, visitors, and their vehicles.',
          image: NEWCASTLE_IMAGES[1],
        },
        {
          step: 2,
          heading: 'Prevent Cross-Contamination',
          body:
            'Equip each poultry barn with distinct boots, tools, and clothing. If Newcastle disease is found in ' +
            'one barn, it can be contained and prevented from spreading.',
          image: NEWCASTLE_IMAGES[2],
        },
        {
          step: 3,
          heading: 'Clean and Disinfect Your Poultry Farm Effectively',
          body:
            'A strict cleaning and disinfecting protocol for the living environment and all vehicles, tools, and ' +
            'equipment that enter the farm helps prevent the introduction and spread of disease.',
          image: NEWCASTLE_IMAGES[3],
        },
        {
          step: 4,
          heading: 'Reduce Pathogen Pressure Through Clean Water',
          body:
            'Clean and disinfect the water lines to prevent spreading disease through the drinking water system. ' +
            'Clean, high-quality drinking water reduces pathogen pressure on the animals.',
          image: NEWCASTLE_IMAGES[4],
        },
        {
          step: 5,
          heading: 'Create a Dry Living Environment',
          body:
            'The NDV virus needs moisture to survive. Creating and maintaining a dry environment can be a final ' +
            'barrier for indirect transmission of the disease.',
          image: NEWCASTLE_IMAGES[5],
        },
      ],
    },
    sourceUrl:
      'https://www.msschippers.com/en-EU/advice/the-5-steps-to-prevent-newcastle-disease-in-chickens',
  },

  // ── Coccidiosis Disease ───────────────────────────────────────────────────
  cocci: {
    name: 'Coccidiosis Disease',
    color: '#F97316',
    emoji: '\u{1F9A0}',
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
      'Maintain dry litter � Coccidia thrives in wet, warm conditions.',
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
      subtitle:
        'To protect your chickens from Coccidiosis, it\u2019s very important that we find and remove any dangers. ' +
        'Now, let\u2019s talk about five ways to keep Coccidiosis away.',
      steps: [
        {
          step: 1,
          heading: 'Guard Your Flock: Hygiene Is Key',
          body:
            'Experts strongly recommend strict hygiene protocols. Every person entering the poultry farm must ' +
            'shower and wash thoroughly. Implementing a strict hygiene protocol is crucial for preventing any ' +
            'potential issues.',
          image: STEP_IMAGES[1],
        },
        {
          step: 2,
          heading: 'Prevent Cross-Contamination with a Colour System',
          body:
            'Dedicated colours for tools, equipment, and clothing for each location can help prevent cross-' +
            'contamination of oocysts between farms, locations, or barns.',
          image: STEP_IMAGES[2],
        },
        {
          step: 3,
          heading: 'Cleaning & Disinfecting',
          body:
            'A strict cleaning and disinfecting (C&D) protocol for all vehicles, tools, and equipment that enter ' +
            'the farm helps prevent the introduction of new Eimeria parasite types.',
          image: STEP_IMAGES[3],
        },
        {
          step: 4,
          heading: 'Ensure Safe Drinking Water',
          body:
            'Clean and disinfect the water lines to prevent the spread of oocysts through the drinking water ' +
            'system. Water quality has a direct link to the health status of livestock.',
          image: STEP_IMAGES[4],
        },
        {
          step: 5,
          heading: 'Lower pH with Organic Acids',
          body:
            'Decreasing the pH level in the intestines can be beneficial in reducing the count of Eimeria ' +
            'parasites in the intestinal tract. Organic acids are commonly used to support gastrointestinal health.',
          image: STEP_IMAGES[5],
        },
      ],
    },
    sourceUrl:
      'https://www.msschippers.com/en-EU/advice/the-5-steps-to-prevent-coccidiosis-in-chickens',
  },

  // ── Healthy ───────────────────────────────────────────────────────────────
  healthy: {
    name: 'Healthy Poultry',
    color: '#10B981',
    emoji: '\u2705',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const openLink = (url) => {
  Linking.canOpenURL(url).then((supported) => { if (supported) Linking.openURL(url); });
};

// -- Animated confidence bar ----------------------------------------------------
const ConfidenceBar = ({ label, value, color }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: value,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [value]);
  const widthInterp = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.barContainer}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barValue, { color }]}>{(value * 100).toFixed(1)}%</Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: widthInterp, backgroundColor: color }]} />
      </View>
    </View>
  );
};

// -- Disease detail sub-components ---------------------------------------------
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
        <Text style={styles.bulletDot}>{'\u2022'}</Text>
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

// -- Prevention step card (alternating image/text layout) ----------------------
const PreventionStepCard = ({ step, heading, body, image }) => {
  const isOdd = step % 2 !== 0;

  const TextPanel = () => (
    <View style={styles.psTextPanel}>
      <View style={styles.psStepBadge}>
        <Text style={styles.psStepBadgeText}>Step {step}</Text>
      </View>
      <Text style={styles.psHeading}>{heading}</Text>
      <Text style={styles.psBody}>{body}</Text>
    </View>
  );

  const ImagePanel = () => (
    <View style={styles.psImagePanel}>
      {image ? (
        <Image source={image} style={styles.psStepImage} resizeMode="cover" />
      ) : (
        <View style={[styles.psStepImage, { backgroundColor: '#d4f5de' }]} />
      )}
    </View>
  );

  if (!image) {
    return (
      <View style={styles.psCard}>
        <LinearGradient
          colors={['#1a5c2a', '#2d8c45']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.psBanner}
        >
          <Text style={styles.psBannerLabel}>Step {step}</Text>
        </LinearGradient>
        <View style={styles.psContent}>
          <Text style={styles.psHeading}>{heading}</Text>
          <Text style={styles.psBody}>{body}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.psCard}>
      <View style={styles.psCardRow}>
        {isOdd ? <TextPanel /> : <ImagePanel />}
        {isOdd ? <ImagePanel /> : <TextPanel />}
      </View>
    </View>
  );
};

const PreventionStepsSection = ({ preventionSteps, diseaseColor }) => (
  <View style={styles.psSection}>
    <View style={styles.psSectionHeader}>
      <Text style={[styles.psSectionTitle, { color: diseaseColor || '#2d8c45' }]}>
        {preventionSteps.title}
      </Text>
      {preventionSteps.subtitle ? (
        <Text style={styles.psSectionSubtitle}>{preventionSteps.subtitle}</Text>
      ) : null}
    </View>
    {preventionSteps.steps.map((s) => (
      <PreventionStepCard
        key={s.step}
        step={s.step}
        heading={s.heading}
        body={s.body}
        image={s.image}
      />
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE ANIMATED PRESS BUTTON
// ═══════════════════════════════════════════════════════════════════════════════
// -- Disease detail renderer ----------------------------------------------------
const DiseaseDetail = ({ classLabel }) => {
  const info = DISEASE_INFO[classLabel];
  if (!info) return null;

  if (classLabel === 'healthy') {
    return (
      <SectionCard style={styles.healthyCard}>
        <Text style={styles.healthyEmoji}>{'\u2705'}</Text>
        <Text style={styles.healthyTitle}>Healthy Poultry</Text>
        <Text style={styles.healthyBody}>
          No disease indicators were detected in the dropping image. Your poultry appears to be
          healthy. Continue to maintain good biosecurity, hygiene practices, clean water, and
          balanced nutrition to keep your flock in top condition.
        </Text>
      </SectionCard>
    );
  }

  return (
    <View>
      <SectionCard>
        <SectionHeading text="Treatment Overview" color={info.color} />
        <Text style={styles.bodyText}>{info.treatmentSummary}</Text>
        <Text style={[styles.subHeading, { marginTop: 14 }]}>Key Treatment &amp; Control Measures:</Text>
        {info.treatmentDetails.map((item, idx) => (
          <TreatmentItem key={idx} heading={item.heading} body={item.body} />
        ))}
        {info.criticalNotes?.length > 0 && (
          <View style={[styles.criticalBox, { borderColor: info.color }]}>
            <Text style={[styles.criticalTitle, { color: info.color }]}>Critical Considerations:</Text>
            <BulletList items={info.criticalNotes} />
          </View>
        )}
      </SectionCard>
      <SectionCard>
        <SectionHeading text={info.causes.title} color={info.color} />
        <Text style={styles.bodyText}>{info.causes.body}</Text>
      </SectionCard>
      <SectionCard>
        <SectionHeading text={info.spread.title} color={info.color} />
        <BulletList items={info.spread.points} />
      </SectionCard>
      <SectionCard>
        <SectionHeading text={info.symptoms.title} color={info.color} />
        <BulletList items={info.symptoms.points} />
      </SectionCard>
      <PreventionStepsSection
        preventionSteps={info.preventionSteps}
        diseaseColor={info.color}
      />
    </View>
  );
};

// -- Main Screen ---------------------------------------------------------------
const DroppingUploadScreen = ({ navigation, route }) => {
  const { imagePredictionId } = route.params || {};

  const [imageFile, setImageFile]           = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult]                 = useState(null);

  // Toast state
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Animation refs (same pattern as Steps 1 & 2)
  const chickenAnim     = useRef(new Animated.Value(0)).current;
  const shimmerAnim     = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const stepDotAnim     = useRef(new Animated.Value(1)).current;
  const waveBarAnims    = useRef(
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

  // -- Idle animations ------------------------------------------------------
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

  // -- Waveform + bouncing dots while uploading -----------------------------
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

  // -- Result entrance + confidence bar ------------------------------------
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

  // -- Toast helper ---------------------------------------------------------
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

  // -- Permissions ----------------------------------------------------------
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  // -- Camera ---------------------------------------------------------------
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
        showToast('✓ Photo captured');
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // -- Upload & analyse -----------------------------------------------------
  const handleUpload = async () => {
    if (!imageFile) { Alert.alert('No Image', 'Please capture a dropping image first'); return; }
    setUploading(true);
    setUploadProgress(0);
    try {
      const response = await uploadDropping(imageFile, (progress) => setUploadProgress(progress));
      if (response.success) {
        setResult(response);
        Alert.alert('Analysis Complete', response.message, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', response.error || 'Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to analyse dropping image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setImageFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  const goBackToImage = () => navigation.goBack();

  const getResultColor = (classLabel) => DISEASE_INFO[classLabel]?.color || '#2d8c45';

  const confidencePercent =
    result ? (result.confidence != null ? result.confidence * 100 : 100) : 0;

  // -- Render ---------------------------------------------------------------
  return (
    <View style={styles.root}>

      {/* -- Sticky Header ----------------------------------------------- */}
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

        {/* -- Progress Steps Bar ---------------------------------------- */}
        <View style={styles.progressBar}>
          <View style={[styles.stepPill, styles.stepPillDone]}>
            <Text style={[styles.stepPillText, styles.stepPillTextDone]}>✓ 1 Sound</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepPill, styles.stepPillDone]}>
            <Text style={[styles.stepPillText, styles.stepPillTextDone]}>✓ 2 Image</Text>
          </View>
          <View style={styles.stepConnector} />
          <View style={[styles.stepPill, styles.stepPillActive]}>
            <Text style={[styles.stepPillText, styles.stepPillTextActive]}>3 Disease</Text>
          </View>
        </View>

        {/* -- Step Header ----------------------------------------------- */}
        <View style={styles.stepHeader}>
          <View style={styles.stepTagRow}>
            <Animated.View style={[styles.stepDot, { transform: [{ scale: stepDotAnim }] }]} />
            <Text style={styles.stepTag}>Step 3 of 3</Text>
          </View>
          <Text style={styles.stepTitle}>Disease Detection</Text>
          <Text style={styles.stepSubtitle}>
            Capture a dropping image for AI-powered pathogen analysis
          </Text>
        </View>

        {/* -- Upload Card ---------------------------------------------- */}
        <View style={styles.card}>
          <View style={styles.cardTopAccent} />
          <Text style={styles.cardTitle}>🔬 Capture Dropping Sample</Text>

          {imageFile && (
            <View style={styles.imagePreview}>
              <Image
                source={{
                  uri: imageFile.uri ||
                    (typeof File !== 'undefined' && imageFile instanceof File
                      ? URL.createObjectURL(imageFile)
                      : null),
                }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.pickerBtn, styles.cameraBtn]}
            onPress={takePhoto}
            disabled={uploading}
            activeOpacity={0.82}
          >
            <Text style={styles.pickerBtnText}>
              📷 {imageFile ? 'Retake Photo' : 'Camera'}
            </Text>
          </TouchableOpacity>

          {imageFile && (
            <View style={styles.fileInfoRow}>
              <View style={styles.fileCheckBadge}>
                <Text style={styles.fileCheckBadgeText}>✓</Text>
              </View>
              <Text style={styles.fileInfoText}>Image ready for analysis</Text>
            </View>
          )}
        </View>

        {/* -- Analyze Button with shimmer ------------------------------- */}
        {imageFile && !uploading && !result && (
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
              <Text style={styles.analyzeBtnText}>🔬  Analyze Dropping</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* -- Waveform Loading State ------------------------------------ */}
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
            <Text style={styles.loadingText}>Scanning pathogen patterns...</Text>
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

        {/* -- Result Card ----------------------------------------------- */}
        {result && (
          <Animated.View
            style={[
              styles.resultCard,
              { borderColor: getResultColor(result.class_label) },
              { transform: [{ scale: resultScaleAnim }], opacity: resultOpacity },
            ]}
          >
            <Text style={[styles.resultLabel, { color: getResultColor(result.class_label) }]}>
              {DISEASE_INFO[result.class_label]?.emoji || '❓'} {result.result}
            </Text>

            <View style={styles.confBarTrack}>
              <Animated.View
                style={[
                  styles.confBarFill,
                  { backgroundColor: getResultColor(result.class_label) },
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

            <Text style={styles.resultMessage}>{result.message}</Text>

            <View style={styles.resultBtns}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetUpload} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>↺ Analyze Another</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={goBackToImage} activeOpacity={0.8}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* -- Detailed Disease Info -------------------------------------- */}
        {result && (
          <View>
            <Text style={styles.detailHeader}>Detailed Report</Text>
            <DiseaseDetail classLabel={result.class_label} />
          </View>
        )}

        {/* -- Instructions (before result) ------------------------------- */}
        {!result && !uploading && (
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>💡 Instructions</Text>
            {[
              'Take a clear, well-lit photo of the poultry dropping',
              'Ensure the dropping is fully visible in frame',
              'Avoid blurry or dark images for accurate detection',
              'Supported formats: JPEG, PNG',
              'The AI will identify Coccidiosis, Newcastle, Salmonella, or Healthy',
            ].map((item, i) => (
              <View key={i} style={styles.instructionItem}>
                <View style={styles.instrNumBadge}>
                  <Text style={styles.instrNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* -- Toast --------------------------------------------------------- */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </Animated.View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  // -- Root -----------------------------------------------------------------
  root: { flex: 1, backgroundColor: '#f7fdf9' },

  // -- Header ---------------------------------------------------------------
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  headerChicken: { fontSize: 32, marginRight: 10 },
  headerCenter:  { flex: 1 },
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
  aiBadgeText: { color: '#ffffff', fontSize: 11, fontFamily: 'Nunito-Bold', fontWeight: '700' },

  // -- Scroll ---------------------------------------------------------------
  scroll:        { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 48 },

  // -- Progress Bar ---------------------------------------------------------
  progressBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, marginTop: 4 },
  stepPill: {
    flex: 1,
    backgroundColor: '#e0ede3',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  stepPillDone:   { backgroundColor: '#a5d6b0' },
  stepPillActive: { backgroundColor: '#2d8c45' },
  stepPillText: {
    fontSize: 10,
    color: '#6a8a70',
    fontFamily: 'Nunito-Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  stepPillTextDone:   { color: '#1a5c2a' },
  stepPillTextActive: { color: '#ffffff' },
  stepConnector: { height: 2, width: 10, backgroundColor: '#c5dec8' },

  // -- Step Header ----------------------------------------------------------
  stepHeader:  { marginBottom: 20 },
  stepTagRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
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
  stepSubtitle: { fontSize: 14, color: '#7a9a80', fontFamily: 'Nunito-Bold', lineHeight: 20 },

  // -- Upload Card ----------------------------------------------------------
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
    top: 0, left: 0, right: 0,
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
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#e8f5e9',
  },
  previewImage: { width: '100%', height: '100%' },
  pickerBtn:  { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cameraBtn:  { backgroundColor: '#F97316' },
  pickerBtnText: { color: '#ffffff', fontFamily: 'Nunito-Bold', fontWeight: '700', fontSize: 15 },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginTop: 14,
    padding: 12,
  },
  fileCheckBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#2d8c45',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  fileCheckBadgeText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  fileInfoText: {
    color: '#2d8c45', fontSize: 13, flex: 1,
    fontFamily: 'Nunito-Bold', fontWeight: '700',
  },

  // -- Analyze Button --------------------------------------------------------
  analyzeWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 18 },
  analyzeBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
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

  // -- Loading / Waveform ----------------------------------------------------
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
  waveBar:    { width: 8, height: 50, backgroundColor: '#3dba5c', borderRadius: 4 },
  loadingText: {
    fontSize: 15, color: '#1a5c2a',
    fontFamily: 'Nunito-Bold', fontWeight: '700', marginBottom: 12,
  },
  bounceDots: { flexDirection: 'row', gap: 6 },
  bounceDot:  { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#3dba5c' },

  // -- Result Card -----------------------------------------------------------
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
    fontSize: 28,
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
  confBarFill: { height: '100%', borderRadius: 5 },
  confLabel: {
    fontSize: 13, color: '#777777', textAlign: 'right', marginBottom: 14,
    fontFamily: 'Nunito-Bold', fontWeight: '700',
  },
  resultMessage: {
    fontSize: 14, color: '#555555', textAlign: 'center',
    lineHeight: 22, marginBottom: 16,
    fontFamily: 'Nunito-Bold', fontWeight: '600',
  },
  resultBtns: { flexDirection: 'row', gap: 10 },
  resetBtn: {
    flex: 1, backgroundColor: '#FF9800',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  resetBtnText: { color: '#ffffff', fontFamily: 'Nunito-Bold', fontWeight: '700', fontSize: 14 },
  backBtn: {
    flex: 1, backgroundColor: '#757575',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center',
  },
  backBtnText: { color: '#ffffff', fontFamily: 'Nunito-Bold', fontWeight: '700', fontSize: 14 },

  // -- Detail Header ---------------------------------------------------------
  detailHeader: {
    fontSize: 20, fontWeight: '800', color: '#1a5c2a',
    marginBottom: 14, marginTop: 4, letterSpacing: -0.3,
  },

  // -- Section Cards (disease detail) ----------------------------------------
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: '#d4f5de',
    shadowColor: '#1a5c2a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: '#1a5c2a', marginBottom: 12 },
  subHeading:     { fontSize: 14, fontWeight: '600', color: '#2d8c45', marginBottom: 8 },
  bodyText:       { fontSize: 14, color: '#444444', lineHeight: 22 },
  bulletRow:      { flexDirection: 'row', marginBottom: 6 },
  bulletDot:      { fontSize: 14, color: '#3dba5c', marginRight: 8, marginTop: 1 },
  bulletText:     { fontSize: 14, color: '#444444', lineHeight: 21, flex: 1 },
  treatmentItem:    { marginBottom: 12 },
  treatmentHeading: { fontSize: 13, fontWeight: '700', color: '#1a5c2a', marginBottom: 3 },
  treatmentBody:    { fontSize: 13, color: '#555555', lineHeight: 20 },
  criticalBox: {
    borderWidth: 1.5, borderRadius: 10, padding: 14,
    marginTop: 14, backgroundColor: 'rgba(239,68,68,0.04)',
  },
  criticalTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },

  // -- Healthy Card ----------------------------------------------------------
  healthyCard:  { alignItems: 'center', padding: 24 },
  healthyEmoji: { fontSize: 52, marginBottom: 12 },
  healthyTitle: { fontSize: 22, fontWeight: '800', color: '#2d8c45', marginBottom: 10 },
  healthyBody:  { fontSize: 14, color: '#555555', lineHeight: 22, textAlign: 'center' },

  // -- Confidence Bar --------------------------------------------------------
  barContainer: { marginBottom: 10 },
  barLabelRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel:     { fontSize: 13, color: '#555555' },
  barValue:     { fontSize: 13, fontWeight: '700' },
  barTrack:     { height: 8, borderRadius: 4, backgroundColor: '#e8f5e9', overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 4 },

  // -- Prevention Steps ------------------------------------------------------
  psSection: { marginBottom: 4 },
  psSectionHeader: {
    backgroundColor: '#f0faf2',
    borderRadius: 16, padding: 20, marginBottom: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#c8e6c9',
  },
  psSectionTitle: {
    fontSize: 18, fontWeight: '800', textAlign: 'center',
    lineHeight: 26, marginBottom: 8, letterSpacing: -0.3,
  },
  psSectionSubtitle: { fontSize: 13, color: '#555555', textAlign: 'center', lineHeight: 20 },
  psCard: {
    borderRadius: 14, marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#c8e6c9', backgroundColor: '#ffffff',
  },
  psCardRow:    { flexDirection: 'row', minHeight: 220 },
  psTextPanel:  { flex: 55, padding: 16, justifyContent: 'center' },
  psImagePanel: { flex: 45, overflow: 'hidden' },
  psStepImage:  { width: '100%', height: '100%', minHeight: 220 },
  psStepBadge: {
    alignSelf: 'flex-start', backgroundColor: '#2d8c45',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, marginBottom: 10,
  },
  psStepBadgeText: {
    color: '#ffffff', fontWeight: '800', fontSize: 12,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  psBanner:     { paddingHorizontal: 18, paddingVertical: 9 },
  psBannerLabel: {
    color: '#ffffff', fontWeight: '800', fontSize: 13,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  psContent: { padding: 18 },
  psHeading: { fontSize: 15, fontWeight: '700', color: '#1a5c2a', marginBottom: 8 },
  psBody:    { fontSize: 13, color: '#444444', lineHeight: 21 },

  // -- Instructions ----------------------------------------------------------
  instructionsBox: {
    backgroundColor: '#fff8e1',
    borderRadius: 16, borderWidth: 1.5, borderColor: '#ffca28',
    padding: 18, marginTop: 4,
  },
  instructionsTitle: {
    fontFamily: 'Nunito-ExtraBold', fontSize: 15, fontWeight: '800',
    color: '#e65100', marginBottom: 14,
  },
  instructionItem:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  instrNumBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#ff6d00',
    alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1,
  },
  instrNumText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  instructionText: {
    flex: 1, fontSize: 13.5, color: '#bf360c', lineHeight: 20,
    fontFamily: 'Nunito-Bold', fontWeight: '600',
  },

  // -- Toast -----------------------------------------------------------------
  toast: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    backgroundColor: '#1a5c2a', borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  toastText: { color: '#ffffff', fontFamily: 'Nunito-Bold', fontWeight: '700', fontSize: 14 },
});

export default DroppingUploadScreen;
