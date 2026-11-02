export const KARNATAKA_DISTRICTS_AND_CITIES = [
  'bagalkote', 'bagalkot', 'ballari', 'bellary', 'belagavi', 'belgaum', 'bengaluru', 'bangalore',
  'bengaluru rural', 'bengaluru urban', 'bidar', 'chamarajanagara', 'chamarajanagar', 'chikkaballapura',
  'chikkamagaluru', 'chikmagalur', 'chitradurga', 'dakshina kannada', 'davanagere', 'dharwad',
  'gadag', 'hassan', 'haveri', 'kalaburagi', 'gulbarga', 'kodagu', 'coorg', 'kolar', 'koppal',
  'mandya', 'mysuru', 'mysore', 'raichur', 'ramanagara', 'shivamogga', 'shimoga', 'tumakuru',
  'tumkur', 'udupi', 'uttara kannada', 'vijayanagara', 'yadgir', 'mangaluru', 'mangalore',
  'hubballi', 'hubli', 'hosapete', 'hospet', 'bhadravati', 'tiptur', 'sirsi', 'karwar',
  'gokarna', 'dandeli', 'madikeri', 'nanjangud', 'puttur', 'bantwal', 'karkala', 'kundapura',
  'kundapur', 'kumta', 'bhatkal', 'sindhanur', 'gangavathi', 'chintamani', 'ranibennur'
];

export interface LocationEvaluationResult {
  isServiceable: boolean;
  regionStatus: 'Serviceable' | 'Outside Service Area';
  message: string;
  matchedRegion?: string;
}

export function evaluateLocationServiceability(
  location: string | undefined,
  supportedRegions: string[] = ['Karnataka']
): LocationEvaluationResult {
  if (!location || location.trim() === '') {
    return {
      isServiceable: false,
      regionStatus: 'Outside Service Area',
      message: 'Location is required. Please specify your city/state in Karnataka.',
    };
  }

  const raw = location.trim().toLowerCase();

  // 1. Check if any explicitly configured supported region matches the location
  for (const reg of supportedRegions) {
    const cleanReg = reg.trim().toLowerCase();
    if (cleanReg && (raw === cleanReg || raw.includes(cleanReg) || cleanReg.includes(raw))) {
      return {
        isServiceable: true,
        regionStatus: 'Serviceable',
        message: `Location '${location.trim()}' is within supported service area (${reg}).`,
        matchedRegion: reg,
      };
    }
  }

  // 2. If 'Karnataka' is configured (default state), accept any location within Karnataka
  const isKarnatakaSupported = supportedRegions.some(r => r.toLowerCase().includes('karnataka'));
  if (isKarnatakaSupported) {
    // If input explicitly mentions Karnataka or state code KA (e.g. "Mysuru, Karnataka", "Anytown, Karnataka")
    if (/\bkarnataka\b/i.test(raw) || /\bka\b/i.test(raw)) {
      return {
        isServiceable: true,
        regionStatus: 'Serviceable',
        message: `Location '${location.trim()}' is verified within Karnataka service territory.`,
        matchedRegion: 'Karnataka',
      };
    }

    // Check if input contains any recognized Karnataka district or municipality
    const matched = KARNATAKA_DISTRICTS_AND_CITIES.find(city => {
      const regex = new RegExp(`\\b${city}\\b`, 'i');
      return regex.test(raw);
    });

    if (matched) {
      return {
        isServiceable: true,
        regionStatus: 'Serviceable',
        message: `Location '${location.trim()}' is a recognized municipality in Karnataka.`,
        matchedRegion: 'Karnataka',
      };
    }
  }

  // Outside supported state/regions (e.g. Noida, Delhi, Hyderabad, Chennai, Uttar Pradesh)
  return {
    isServiceable: false,
    regionStatus: 'Outside Service Area',
    message: 'Sorry, our service is currently available only in Karnataka.',
  };
}
