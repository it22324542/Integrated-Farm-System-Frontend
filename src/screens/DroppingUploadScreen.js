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
  Easing,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadDropping } from '../services/poultryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────────
// PREVENTION STEP IMAGES
// Save the 5 provided images to assets/prevention-steps/ with these exact names:
//   step1.jpg  – person washing hands        (Step 1 – Hygiene)
//   step2.jpg  – colour-coded clothing room  (Step 2 – Colour System)
//   step3.jpg  – spraying disinfectant       (Step 3 – Clean & Disinfect)
//   step4.jpg  – chicks at drinking nipple   (Step 4 – Water)
//   step5.jpg  – person adding DryGard       (Step 5 – Dry Environment)
// ─────────────────────────────────────────────────────────────────────────────────
const STEP_IMAGES = [
  null,                                                                          // index 0 – unused
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DESIGN TOKENS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const COLORS = {
  bg:           '#071A0D',
  bgCard:       '#0D2818',
  bgCardLight:  '#152E1C',
  border:       '#1E4D2B',
  borderActive: '#16A34A',
  primary:      '#16A34A',
  primaryLight: '#4ADE80',
  primaryDark:  '#15803D',
  cyan:         '#86EFAC',
  cyanLight:    '#BBF7D0',
  success:      '#10B981',
  successLight: '#6EE7B7',
  danger:       '#EF4444',
  dangerLight:  '#FCA5A5',
  warning:      '#F59E0B',
  text:         '#FFFFFF',
  textMuted:    '#BBF7D0',
  textFaint:    '#6EE7B7',
  white:        '#FFFFFF',
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Disease information database
// Content sourced from msschippers.com with user-provided treatment summaries
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DISEASE_INFO = {
  // â”€â”€ Salmonella Disease â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      'Salmonella in meat is eliminated by cooking to an internal temperature of 165Â°F (74Â°C).',
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

  // â”€â”€ Newcastle Disease â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Coccidiosis Disease â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Healthy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  healthy: {
    name: 'Healthy Poultry',
    color: '#10B981',
    emoji: '\u2705',
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const openLink = (url) => {
  Linking.canOpenURL(url).then((supported) => { if (supported) Linking.openURL(url); });
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// REUSABLE ANIMATED PRESS BUTTON
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AnimatedPressable = ({ onPress, style, children, disabled }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      android_ripple={{ color: 'rgba(234, 88, 12, 0.25)', borderless: false }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ANIMATED CONFIDENCE BAR
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ConfidenceBar = ({ label, value, color }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: value,
      duration: 1000,
      delay: 300,
      easing: Easing.out(Easing.cubic),
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SCANNING LINE OVERLAY
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ScanOverlay = ({ imageHeight }) => {
  const scanY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanY, { toValue: imageHeight - 4, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scanY, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [imageHeight]);
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
    </View>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PULSING DOT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const PulsingDot = ({ color = COLORS.cyan, size = 10, delay = 0 }) => {
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: pulse, marginHorizontal: 3 }} />
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// BACKGROUND ORB
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const BackgroundOrb = ({ x, y, size, color, delay = 0 }) => {
  const scale   = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.06)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.2, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.12, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.8, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.06, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity, transform: [{ scale }] }}
    />
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// DISEASE DETAIL SUB-COMPONENTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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

// ─────────────────────────────────────────────────────────────────────────────────
// PREVENTION STEPS – alternating text / image card layout
// ─────────────────────────────────────────────────────────────────────────────────
const PS_GREEN       = '#1A5C2A';
const PS_GREEN_LIGHT = '#22703A';
const PS_LINK_COLOR  = '#4CAF50';

const PreventionStepCard = ({ step, heading, body, image }) => {
  const isOdd = step % 2 !== 0; // odd → text left / image right; even → image left / text right

  const TextPanel = () => (
    <View style={styles.psTextPanel}>
      {/* Step badge */}
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
        <View style={[styles.psStepImage, { backgroundColor: PS_GREEN }]} />
      )}
    </View>
  );

  // If no image is provided, fall back to the previous banner-style text-only card
  if (!image) {
    return (
      <View style={styles.psCard}>
        <LinearGradient
          colors={[PS_GREEN, PS_GREEN_LIGHT]}
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

const PreventionStepsSection = ({ preventionSteps, diseaseColor, sourceUrl }) => (
  <View style={styles.psSection}>
    {/* Header card */}
    <View style={styles.psSectionHeader}>
      <Text style={[styles.psSectionTitle, { color: diseaseColor || PS_LINK_COLOR }]}>
        {preventionSteps.title}
      </Text>
      {preventionSteps.subtitle ? (
        <Text style={styles.psSectionSubtitle}>{preventionSteps.subtitle}</Text>
      ) : null}
    </View>
    {/* Step cards */}
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Disease detail renderer
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <Text style={[styles.subHeading, { marginTop: 14 }]}>Key Treatment & Control Measures:</Text>
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
        sourceUrl={info.sourceUrl}
      />
    </View>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const DroppingUploadScreen = ({ navigation, route }) => {
  const { imagePredictionId } = route.params || {};

  const [imageFile, setImageFile]           = useState(null);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult]                 = useState(null);

  // â”€â”€ Animated values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const headerFade         = useRef(new Animated.Value(0)).current;
  const headerSlide        = useRef(new Animated.Value(30)).current;
  const cardFade           = useRef(new Animated.Value(0)).current;
  const cardSlide          = useRef(new Animated.Value(40)).current;
  const imagePreviewOpacity = useRef(new Animated.Value(0)).current;
  const imagePreviewScale  = useRef(new Animated.Value(0.88)).current;
  const resultFade         = useRef(new Animated.Value(0)).current;
  const resultSlide        = useRef(new Animated.Value(50)).current;
  const glowPulse          = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(1)).current;
  const loadingPulseRef    = useRef(null);

  // â”€â”€ Mount: header + card fade in â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 200);
  }, []);

  // â”€â”€ Image selected: zoom-in + fade â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (imageFile) {
      imagePreviewOpacity.setValue(0);
      imagePreviewScale.setValue(0.88);
      Animated.parallel([
        Animated.timing(imagePreviewOpacity, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(imagePreviewScale,   { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
      ]).start();
    }
  }, [imageFile]);

  // â”€â”€ Result: slide-up + glow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!result) return;
    resultFade.setValue(0);
    resultSlide.setValue(50);
    Animated.parallel([
      Animated.timing(resultFade,  { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(resultSlide, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 8 }),
    ]).start();
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [result]);

  // â”€â”€ Loading: text pulse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (uploading) {
      loadingPulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(loadingTextOpacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
          Animated.timing(loadingTextOpacity, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ])
      );
      loadingPulseRef.current.start();
    } else {
      loadingPulseRef.current?.stop();
      loadingTextOpacity.setValue(1);
    }
  }, [uploading]);

  // â”€â”€ Permissions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  // â”€â”€ Camera â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    } catch {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // â”€â”€ Upload & analyse â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    imagePreviewOpacity.setValue(0);
  };

  const getResultColor = (classLabel) => DISEASE_INFO[classLabel]?.color || COLORS.textMuted;
  const isHealthy = result?.class_label === 'healthy';
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });

  return (
    <View style={styles.rootContainer}>
      {/* â”€â”€ Dark gradient background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <LinearGradient
        colors={['#071A0D', '#0D2818', '#071A0D']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* â”€â”€ Ambient orbs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <BackgroundOrb x={SCREEN_WIDTH * 0.15} y={90}  size={220} color={COLORS.primary} delay={0} />
      <BackgroundOrb x={SCREEN_WIDTH * 0.88} y={210} size={180} color={COLORS.cyan}    delay={1500} />
      <BackgroundOrb x={SCREEN_WIDTH * 0.4}  y={560} size={160} color={COLORS.primary} delay={800} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <LinearGradient
            colors={['#0F3320', '#072612']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.stepBadgeRow}>
              <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.stepChip} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.stepChipText}>STEP 3</Text>
              </LinearGradient>
              <View style={styles.aiChip}>
                <Text style={styles.aiChipText}>{'\u26A1'} AI POWERED</Text>
              </View>
            </View>
            <Text style={styles.headerTitle}>Disease{'\n'}Detection</Text>
            <Text style={styles.headerSubtitle}>
              Capture a dropping image for instant AI-powered pathogen analysis
            </Text>
            {/* Decorative dot grid */}
            <View style={styles.dotGrid} pointerEvents="none">
              {[...Array(15)].map((_, i) => <View key={i} style={styles.dot} />)}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* â”€â”€ Upload Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Animated.View style={[styles.uploadCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.uploadCardHeader}>
            <Text style={styles.uploadCardTitle}>Dropping Sample</Text>
            {imageFile && (
              <TouchableOpacity onPress={resetUpload} style={styles.resetChip}>
                <Text style={styles.resetChipText}>{'\u2715'} Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {imageFile ? (
            /* â”€â”€ Preview â”€â”€ */
            <Animated.View style={[styles.imagePreviewWrapper, { opacity: imagePreviewOpacity, transform: [{ scale: imagePreviewScale }] }]}>
              <Image
                source={{ uri: imageFile.uri || (imageFile instanceof File ? URL.createObjectURL(imageFile) : null) }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              {uploading && <ScanOverlay imageHeight={240} />}
              {/* Corner brackets */}
              <View style={[styles.corner, styles.cTL]} />
              <View style={[styles.corner, styles.cTR]} />
              <View style={[styles.corner, styles.cBL]} />
              <View style={[styles.corner, styles.cBR]} />
            </Animated.View>
          ) : (
            /* â”€â”€ Drop zone â”€â”€ */
            <AnimatedPressable onPress={takePhoto} disabled={uploading} style={styles.uploadZone}>
              <LinearGradient
                colors={['rgba(22,163,74,0.08)', 'rgba(134,239,172,0.06)']}
                style={styles.uploadZoneInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.uploadIconRing}>
                  <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.uploadIconGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.uploadIcon}>{'\u{1F4F7}'}</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.uploadZoneTitle}>Tap to Capture</Text>
                <Text style={styles.uploadZoneSubtitle}>Take a clear photo of the dropping sample</Text>
                <View style={styles.uploadZoneTags}>
                  {['JPEG', 'PNG', 'High Quality'].map((t) => (
                    <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                  ))}
                </View>
              </LinearGradient>
            </AnimatedPressable>
          )}

          {imageFile && !uploading && (
            <View style={styles.fileReadyBadge}>
              <View style={styles.readyDot} />
              <Text style={styles.fileReadyText}>Image ready for AI analysis</Text>
            </View>
          )}
        </Animated.View>

        {/* â”€â”€ Loading State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {uploading && (
          <View style={styles.loadingCard}>
            <LinearGradient
              colors={['rgba(22,163,74,0.12)', 'rgba(134,239,172,0.08)']}
              style={styles.loadingGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.spinnerRing}>
                <LinearGradient colors={[COLORS.primary, COLORS.cyan, COLORS.primary]} style={styles.spinnerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.spinnerInner}>
                    <Text style={styles.spinnerPercent}>{uploadProgress}%</Text>
                  </View>
                </LinearGradient>
              </View>
              <Animated.Text style={[styles.loadingTitle, { opacity: loadingTextOpacity }]}>
                {'Analysing with AI Model\u2026'}
              </Animated.Text>
              <View style={styles.loadingDots}>
                <PulsingDot color={COLORS.primary} delay={0} />
                <PulsingDot color={COLORS.cyan}    delay={200} />
                <PulsingDot color={COLORS.primary} delay={400} />
              </View>
              <Text style={styles.loadingSubtitle}>Scanning pathogen patterns in dropping sample</Text>
              <View style={styles.loadingBarTrack}>
                <View style={[styles.loadingBarFill, { width: `${uploadProgress}%` }]} />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* â”€â”€ Analyse Button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {imageFile && !result && !uploading && (
          <AnimatedPressable onPress={handleUpload} style={styles.analyseButton}>
            <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.analyseButtonInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.analyseButtonText}>{'\u{1F52C}'}  Run AI Analysis</Text>
            </LinearGradient>
          </AnimatedPressable>
        )}

        {/* â”€â”€ Result Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {result && (
          <Animated.View style={[styles.resultCard, { opacity: resultFade, transform: [{ translateY: resultSlide }] }]}>
            {/* Glow */}
            <Animated.View
              pointerEvents="none"
              style={[styles.resultGlow, { backgroundColor: isHealthy ? COLORS.success : COLORS.danger, opacity: glowOpacity }]}
            />
            {/* Result header */}
            <LinearGradient
              colors={isHealthy
                ? ['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.04)']
                : ['rgba(239,68,68,0.15)',  'rgba(239,68,68,0.04)']}
              style={styles.resultHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.resultEmoji}>{DISEASE_INFO[result.class_label]?.emoji || '\u{1F52C}'}</Text>
              <Text style={[styles.resultName, { color: getResultColor(result.class_label) }]}>{result.result}</Text>
              <View style={[styles.resultPill, { backgroundColor: getResultColor(result.class_label) + '22', borderColor: getResultColor(result.class_label) }]}>
                <Text style={[styles.resultPillText, { color: getResultColor(result.class_label) }]}>Detection Complete</Text>
              </View>
            </LinearGradient>

            {/* Confidence */}
            {result.confidence != null && (
              <View style={styles.confidenceSection}>
                <Text style={styles.confidenceSectionTitle}>AI Confidence Score</Text>
                <ConfidenceBar label="Prediction Confidence" value={result.confidence} color={getResultColor(result.class_label)} />
              </View>
            )}

            <Text style={styles.resultMessage}>{result.message}</Text>

            {/* Actions */}
            <View style={styles.actionRow}>
              <AnimatedPressable onPress={resetUpload} style={[styles.actionBtn, styles.actionBtnReset]}>
                <Text style={styles.actionBtnText}>{'\u21BA'}  New Scan</Text>
              </AnimatedPressable>
              <AnimatedPressable onPress={() => navigation.goBack()} style={[styles.actionBtn, styles.actionBtnBack]}>
                <Text style={styles.actionBtnText}>{'\u2190'} Back</Text>
              </AnimatedPressable>
            </View>
          </Animated.View>
        )}

        {/* â”€â”€ Detailed Disease Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {result && (
          <View>
            <Text style={styles.detailHeader}>Detailed Report</Text>
            <DiseaseDetail classLabel={result.class_label} />
          </View>
        )}

        {/* â”€â”€ Instructions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {!result && !uploading && (
          <Animated.View style={[styles.instructionsCard, { opacity: cardFade }]}>
            <LinearGradient
              colors={['rgba(22,163,74,0.1)', 'rgba(134,239,172,0.06)']}
              style={styles.instructionsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.instructionsTitle}>{'\u{1F4CB}'}  How to get the best results</Text>
              {[
                'Take a clear, well-lit photo of the poultry dropping',
                'Ensure the dropping is fully visible in frame',
                'Avoid blurry or dark images for accurate detection',
                'Supported formats: JPEG, PNG',
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <LinearGradient colors={[COLORS.primary, COLORS.cyan]} style={styles.tipBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={styles.tipBadgeText}>{i + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
              <View style={styles.diseaseChips}>
                <Text style={styles.diseaseChipsLabel}>Detectable Conditions:</Text>
                <View style={styles.chipRow}>
                  {[
                    { label: 'Coccidiosis', color: '#A855F7' },
                    { label: 'Newcastle',   color: '#F59E0B' },
                    { label: 'Salmonella',  color: '#EF4444' },
                    { label: 'Healthy',     color: '#10B981' },
                  ].map((d) => (
                    <View key={d.label} style={[styles.diseaseChip, { borderColor: d.color }]}>
                      <View style={[styles.diseaseDot, { backgroundColor: d.color }]} />
                      <Text style={[styles.diseaseChipText, { color: d.color }]}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// STYLES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  // Header
  header: { marginBottom: 20 },
  headerGradient: {
    borderRadius: 24, padding: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(22,163,74,0.3)',
  },
  stepBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  stepChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  stepChipText: { color: COLORS.white, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  aiChip: {
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.cyan, backgroundColor: 'rgba(134,239,172,0.1)',
  },
  aiChipText: { color: COLORS.cyan, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  headerTitle: {
    fontSize: 38, fontWeight: '900', color: COLORS.white,
    lineHeight: 42, marginBottom: 10, letterSpacing: -0.5,
  },
  headerSubtitle: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20, maxWidth: '80%' },
  dotGrid: { position: 'absolute', right: 16, top: 16, flexDirection: 'row', flexWrap: 'wrap', width: 60, gap: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(167,139,250,0.3)' },

  // Upload card
  uploadCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  uploadCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  uploadCardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  resetChip: {
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  resetChipText: { color: COLORS.danger, fontSize: 12, fontWeight: '600' },

  // Upload zone
  uploadZone: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  uploadZoneInner: {
    borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(22,163,74,0.4)',
    borderStyle: 'dashed', padding: 32, alignItems: 'center',
  },
  uploadIconRing: {
    width: 72, height: 72, borderRadius: 36, overflow: 'hidden', marginBottom: 16,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 8,
  },
  uploadIconGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  uploadIcon: { fontSize: 30 },
  uploadZoneTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  uploadZoneSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },
  uploadZoneTags: { flexDirection: 'row', gap: 8 },
  tag: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
    backgroundColor: 'rgba(22,163,74,0.12)', borderWidth: 1, borderColor: 'rgba(22,163,74,0.25)',
  },
  tagText: { fontSize: 11, color: COLORS.primaryLight, fontWeight: '600' },

  // Image preview
  imagePreviewWrapper: {
    width: '100%', height: 240, borderRadius: 16, overflow: 'hidden', marginBottom: 14,
    backgroundColor: '#091C0F', borderWidth: 1, borderColor: 'rgba(22,163,74,0.4)',
  },
  previewImage: { width: '100%', height: '100%' },

  // Corner brackets
  corner: { position: 'absolute', width: 20, height: 20, borderColor: COLORS.cyan },
  cTL: { top: 8, left: 8, borderTopWidth: 2.5, borderLeftWidth: 2.5,   borderTopLeftRadius: 4 },
  cTR: { top: 8, right: 8, borderTopWidth: 2.5, borderRightWidth: 2.5,  borderTopRightRadius: 4 },
  cBL: { bottom: 8, left: 8, borderBottomWidth: 2.5, borderLeftWidth: 2.5,  borderBottomLeftRadius: 4 },
  cBR: { bottom: 8, right: 8, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 4 },

  // Scan line
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 3,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 8, elevation: 4, opacity: 0.85,
  },

  // Camera button
  cameraButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  cameraButtonInner: { paddingVertical: 15, alignItems: 'center', borderRadius: 14 },
  cameraButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3 },

  // File ready
  fileReadyBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 8 },
  readyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  fileReadyText: { fontSize: 13, color: COLORS.success, fontWeight: '600' },

  // Loading
  loadingCard: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(22,163,74,0.3)',
  },
  loadingGradient: { padding: 28, alignItems: 'center' },
  spinnerRing: {
    width: 90, height: 90, borderRadius: 45, overflow: 'hidden', marginBottom: 20,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 10,
  },
  spinnerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  spinnerInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  spinnerPercent: { fontSize: 18, fontWeight: '900', color: COLORS.primaryLight },
  loadingTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  loadingDots: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  loadingSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  loadingBarTrack: { width: '100%', height: 4, borderRadius: 2, backgroundColor: 'rgba(22,163,74,0.15)', overflow: 'hidden' },
  loadingBarFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.primary },

  // Analyse button
  analyseButton: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  analyseButtonInner: { paddingVertical: 18, alignItems: 'center', borderRadius: 16 },
  analyseButtonText: { fontSize: 18, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },

  // Result card
  resultCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 24, overflow: 'hidden', marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  resultGlow: {
    position: 'absolute', top: -30, left: '50%', marginLeft: -80,
    width: 160, height: 80, borderRadius: 80, zIndex: 0,
  },
  resultHeader: { padding: 28, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  resultEmoji: { fontSize: 52, marginBottom: 10 },
  resultName: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 12, letterSpacing: -0.3 },
  resultPill: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, borderWidth: 1 },
  resultPillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  confidenceSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  confidenceSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  barContainer: { marginBottom: 10 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, color: COLORS.textMuted },
  barValue: { fontSize: 13, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  resultMessage: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, padding: 20, paddingBottom: 0 },
  actionRow: { flexDirection: 'row', padding: 20, gap: 12 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  actionBtnReset: { backgroundColor: 'rgba(22,163,74,0.15)', borderWidth: 1, borderColor: 'rgba(22,163,74,0.4)' },
  actionBtnBack: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: COLORS.border },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  // Detail header
  detailHeader: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 14, marginTop: 4, letterSpacing: -0.3 },

  // Section cards (disease detail)
  sectionCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeading: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  subHeading: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  bodyText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bulletDot: { fontSize: 14, color: COLORS.primaryLight, marginRight: 8, marginTop: 1 },
  bulletText: { fontSize: 14, color: COLORS.textMuted, lineHeight: 21, flex: 1 },
  treatmentItem: { marginBottom: 12 },
  treatmentHeading: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  treatmentBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  criticalBox: { borderWidth: 1.5, borderRadius: 10, padding: 14, marginTop: 14, backgroundColor: 'rgba(239,68,68,0.06)' },
  criticalTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  stepItem: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  stepBadge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  stepBadgeText: { color: COLORS.white, fontWeight: '900', fontSize: 13 },
  stepContent: { flex: 1 },
  stepHeading: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  stepBody: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

  // Prevention Steps – alternating text/image card layout
  psSection: { marginBottom: 4 },
  psSectionHeader: {
    backgroundColor: '#0D1A09',
    borderRadius: 16,
    padding: 24,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A4A1F',
  },
  psSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  psSectionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Card container
  psCard: {
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A4A1F',
    backgroundColor: '#0D1A09',
  },
  // Row layout for alternating image/text
  psCardRow: {
    flexDirection: 'row',
    minHeight: 220,
  },
  // Text panel (55% width)
  psTextPanel: {
    flex: 55,
    padding: 16,
    justifyContent: 'center',
  },
  // Image panel (45% width)
  psImagePanel: {
    flex: 45,
    overflow: 'hidden',
  },
  psStepImage: {
    width: '100%',
    height: '100%',
    minHeight: 220,
  },
  // Step badge inside text panel
  psStepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A5C2A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  psStepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // Text-only fallback (no image)
  psBanner: {
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  psBannerLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  psContent: {
    padding: 18,
  },
  psHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  psBody: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 21,
  },
  psLinkRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  psLinkText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  sourceCard: { alignItems: 'center' },
  sourceTitle: { fontSize: 12, color: COLORS.textFaint, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  sourceLink: { fontSize: 13, textDecorationLine: 'underline', textAlign: 'center' },
  healthyCard: { alignItems: 'center', padding: 24 },
  healthyEmoji: { fontSize: 52, marginBottom: 12 },
  healthyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.success, marginBottom: 10 },
  healthyBody: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, textAlign: 'center' },

  // Instructions
  instructionsCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(22,163,74,0.2)' },
  instructionsGradient: { padding: 20 },
  instructionsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tipBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1, flexShrink: 0 },
  tipBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  tipText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, flex: 1 },
  diseaseChips: { marginTop: 16 },
  diseaseChipsLabel: { fontSize: 12, color: COLORS.textFaint, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diseaseChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)', gap: 6 },
  diseaseDot: { width: 7, height: 7, borderRadius: 3.5 },
  diseaseChipText: { fontSize: 12, fontWeight: '600' },

  // Linked info
  linkedInfo: {
    borderRadius: 12, padding: 14, backgroundColor: 'rgba(22,163,74,0.08)',
    borderWidth: 1, borderColor: 'rgba(22,163,74,0.2)', marginBottom: 10,
  },
  linkedInfoText: { fontSize: 12, color: COLORS.primaryLight, textAlign: 'center', fontWeight: '600' },
});

export default DroppingUploadScreen;
