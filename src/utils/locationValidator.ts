/**
 * Location validation and regional serviceability engine for LeadPilot AI.
 * Supported service state: Karnataka.
 * Accept valid customer locations from anywhere within Karnataka (Mysuru, Bengaluru, Mangaluru, etc.).
 * If location is outside Karnataka (and unlisted in custom supported regions), display:
 * "Sorry, our service is currently available only in Karnataka."
 */

export const KARNATAKA_DISTRICTS_AND_CITIES: string[] = [
  'karnataka',
  'bengaluru', 'bangalore',
  'mysuru', 'mysore',
  'mangaluru', 'mangalore', 'dakshina kannada', 'south canara',
  'hubballi', 'hubli', 'dharwad',
  'belagavi', 'belgaum',
  'kalaburagi', 'gulbarga',
  'ballari', 'bellary',
  'davanagere', 'davangere',
  'shivamogga', 'shimoga', 'bhadravati', 'sagar',
  'tumakuru', 'tumkur', 'tiptur', 'sira',
  'udupi', 'manipal', 'kundapura', 'karkala',
  'bidar', 'basavakalyan', 'bhalki', 'humnabad',
  'raichur', 'sindhanur', 'manvi',
  'koppal', 'gangavathi', 'kushtagi',
  'gadag', 'gadag-betageri', 'nargund',
  'haveri', 'ranebennur', 'byadgi',
  'karwar', 'uttara kannada', 'north canara', 'ankola', 'kumta', 'honnavar', 'bhatkal', 'sirsi', 'dandeli', 'gokarna',
  'bagalkote', 'bagalkot', 'jamkhandi', 'mudhol', 'badami', 'ilkal',
  'chitradurga', 'challakere', 'hiriyur',
  'chikkamagaluru', 'chikmagalur', 'kadur', 'tarikere', 'mudigere', 'sringeri',
  'hassan', 'sakleshpur', 'belur', 'arsikere', 'channarayapatna',
  'mandya', 'maddur', 'srirangapatna', 'pandavapura', 'malavalli',
  'kodagu', 'coorg', 'madikeri', 'kushalnagar', 'virajpet', 'somwarpet',
  'chamarajanagar', 'chamarajnagar', 'kollegal', 'gundlupet',
  'ramanagara', 'ramanagar', 'kanakapura', 'channapatna', 'magadi',
  'chikkaballapura', 'chikkaballapur', 'gauribidanur', 'bagepalli',
  'kolar', 'kolar gold fields', 'kgf', 'bangarapet', 'mulbagal', 'srinivaspur',
  'yadgir', 'shorapur', 'shahpur',
  'vijayapura', 'bijapur', 'indi', 'muddebihal', 'sindgi',
  'vijayanagara', 'hospet', 'hampi', 'sandur', 'harapanahalli',
  'puttur', 'bantwal', 'sullia', 'belthangady',
  'nelamangala', 'doddaballapura', 'doddaballapur', 'hoskote', 'anekal', 'devanahalli',
  'nanjangud', 'hunsur', 'piriyapatna', 'k.r. nagar', 'kr nagar', 'h.d. kote', 'hd kote',
  'whitefield', 'electronic city', 'koramangala', 'indiranagar', 'marathahalli', 'yelahanka', 'jayanagar', 'rajajinagar', 'malleshwaram', 'hsr', 'btm', 'bellandur'
];

export interface LocationValidationResult {
  isValid: boolean;
  isServiceable: boolean;
  error?: string;
  message: string;
}

export function checkLocationEligibility(
  location: string | undefined,
  supportedRegions: string[] = ['Karnataka']
): LocationValidationResult {
  if (!location || location.trim() === '') {
    return {
      isValid: false,
      isServiceable: false,
      error: 'Location is required.',
      message: 'Location is required.'
    };
  }

  const raw = location.trim();
  const lower = raw.toLowerCase();

  // 1. Check if location explicitly mentions Karnataka or state code KA (word-boundary)
  const hasKarnatakaKeyword =
    lower.includes('karnataka') ||
    /(?:^|[\s,.\-(/])ka(?:$|[\s,.\-)/])/i.test(raw);

  // 2. Check if location matches any known Karnataka district or city/town
  const hasKarnatakaCity = KARNATAKA_DISTRICTS_AND_CITIES.some((city) => lower.includes(city));

  // 3. Check if location matches any custom supported regions added via configuration
  const matchesCustomRegion = (supportedRegions || []).some((reg) => {
    const regLower = reg.trim().toLowerCase();
    if (!regLower) return false;
    return lower.includes(regLower) || regLower.includes(lower);
  });

  const isServiceable = hasKarnatakaKeyword || hasKarnatakaCity || matchesCustomRegion;

  if (isServiceable) {
    return {
      isValid: true,
      isServiceable: true,
      message: `Location '${raw}' is within active service boundaries (Karnataka).`
    };
  }

  return {
    isValid: true,
    isServiceable: false,
    message: 'Sorry, our service is currently available only in Karnataka.'
  };
}

export function isCityServiceable(
  city: string | undefined,
  supportedCities: string[] = ['Karnataka']
): boolean {
  return checkLocationEligibility(city, supportedCities).isServiceable;
}
