// Bootstrap-like utility styles for React Native
export const bs = {
  // Container & Layout
  container: {
    width: '100%',
    paddingHorizontal: 15,
    marginHorizontal: 'auto',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  col: {
    flex: 1,
  },
  
  // Display
  dFlex: {
    display: 'flex',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexRow: {
    flexDirection: 'row',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  justifyContentBetween: {
    justifyContent: 'space-between',
  },
  
  // Spacing (mb = margin bottom, mt = margin top, etc.)
  m0: { margin: 0 },
  m1: { margin: 4 },
  m2: { margin: 8 },
  m3: { margin: 16 },
  m4: { margin: 24 },
  m5: { margin: 48 },
  
  mt0: { marginTop: 0 },
  mt1: { marginTop: 4 },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 16 },
  mt4: { marginTop: 24 },
  mt5: { marginTop: 48 },
  
  mb0: { marginBottom: 0 },
  mb1: { marginBottom: 4 },
  mb2: { marginBottom: 8 },
  mb3: { marginBottom: 16 },
  mb4: { marginBottom: 24 },
  mb5: { marginBottom: 48 },
  
  p0: { padding: 0 },
  p1: { padding: 4 },
  p2: { padding: 8 },
  p3: { padding: 16 },
  p4: { padding: 24 },
  p5: { padding: 48 },
  
  pt3: { paddingTop: 16 },
  pt4: { paddingTop: 24 },
  pt5: { paddingTop: 48 },
  
  pb3: { paddingBottom: 16 },
  pb4: { paddingBottom: 24 },
  pb5: { paddingBottom: 48 },
  
  px3: { paddingHorizontal: 16 },
  px4: { paddingHorizontal: 24 },
  px5: { paddingHorizontal: 48 },
  
  py3: { paddingVertical: 16 },
  py4: { paddingVertical: 24 },
  py5: { paddingVertical: 48 },
  
  // Text
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  
  // Font sizes
  fs1: { fontSize: 40 }, // h1
  fs2: { fontSize: 32 }, // h2
  fs3: { fontSize: 28 }, // h3
  fs4: { fontSize: 24 }, // h4
  fs5: { fontSize: 20 }, // h5
  fs6: { fontSize: 16 }, // h6
  
  // Font weights
  fwBold: {
    fontWeight: 'bold',
  },
  fwNormal: {
    fontWeight: 'normal',
  },
  fw700: {
    fontWeight: '700',
  },
  fw600: {
    fontWeight: '600',
  },
  
  // Colors - Text
  textPrimary: {
    color: '#0d6efd',
  },
  textSecondary: {
    color: '#6c757d',
  },
  textSuccess: {
    color: '#198754',
  },
  textDanger: {
    color: '#dc3545',
  },
  textWarning: {
    color: '#ffc107',
  },
  textInfo: {
    color: '#0dcaf0',
  },
  textLight: {
    color: '#f8f9fa',
  },
  textDark: {
    color: '#212529',
  },
  textMuted: {
    color: '#6c757d',
  },
  textWhite: {
    color: '#ffffff',
  },
  
  // Background colors
  bgPrimary: {
    backgroundColor: '#0d6efd',
  },
  bgSecondary: {
    backgroundColor: '#6c757d',
  },
  bgSuccess: {
    backgroundColor: '#198754',
  },
  bgDanger: {
    backgroundColor: '#dc3545',
  },
  bgWarning: {
    backgroundColor: '#ffc107',
  },
  bgInfo: {
    backgroundColor: '#0dcaf0',
  },
  bgLight: {
    backgroundColor: '#f8f9fa',
  },
  bgDark: {
    backgroundColor: '#212529',
  },
  bgWhite: {
    backgroundColor: '#ffffff',
  },
  
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBody: {
    padding: 20,
  },
  
  // Buttons
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    fontSize: 18,
  },
  btnSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#0d6efd',
  },
  btnSuccess: {
    backgroundColor: '#198754',
  },
  btnDanger: {
    backgroundColor: '#dc3545',
  },
  btnWarning: {
    backgroundColor: '#ffc107',
  },
  btnInfo: {
    backgroundColor: '#0dcaf0',
  },
  btnLight: {
    backgroundColor: '#f8f9fa',
  },
  btnDark: {
    backgroundColor: '#212529',
  },
  
  // Forms
  formControl: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212529',
  },
  formControlLg: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  
  // Borders
  border: {
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  borderPrimary: {
    borderColor: '#0d6efd',
  },
  borderSuccess: {
    borderColor: '#198754',
  },
  border0: {
    borderWidth: 0,
  },
  rounded: {
    borderRadius: 8,
  },
  roundedCircle: {
    borderRadius: 9999,
  },
  rounded3: {
    borderRadius: 12,
  },
  rounded4: {
    borderRadius: 16,
  },
  
  // Shadow
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  
  // Width/Height
  w100: {
    width: '100%',
  },
  h100: {
    height: '100%',
  },
  minVh100: {
    minHeight: '100%',
  },
  
  // Position
  positionRelative: {
    position: 'relative',
  },
  positionAbsolute: {
    position: 'absolute',
  },
};

// Helper function to combine styles
export const combine = (...styles) => {
  return Object.assign({}, ...styles);
};
