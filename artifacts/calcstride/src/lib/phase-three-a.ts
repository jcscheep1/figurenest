export type PhaseThreeASlug =
  | 'bandwidth' | 'base64' | 'electricity' | 'ip-subnet' | 'ohms-law'
  | 'password-generator' | 'resistor' | 'url-encode-decode' | 'density'
  | 'dew-point' | 'horsepower' | 'heat-index' | 'mass' | 'molarity'
  | 'speed-calculator' | 'wind-chill';

export type PhaseThreeAField = {
  key: string;
  label: string;
  value: string;
  type: 'number' | 'select' | 'text' | 'textarea';
  min?: number;
  max?: number;
  step?: string;
  options?: readonly { value: string; label: string }[];
};

export type PhaseThreeAResult = {
  primary: string;
  summary: string;
  details: readonly { label: string; value: string }[];
  error?: string;
};

export type PhaseThreeADefinition = {
  slug: PhaseThreeASlug;
  name: string;
  description: string;
  category: 'Technology' | 'Electrical' | 'Science & Engineering';
  categorySlug: 'technology' | 'electrical' | 'science-engineering';
  href: string;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  tags: readonly string[];
  fields: readonly PhaseThreeAField[];
  resultLabel: string;
  formula: string;
  variables: string;
  workedExample: string;
  interpretation: string;
  edgeCases: string;
  limitations: string;
  sourceLinks: readonly { label: string; href: string }[];
  educationalSections: readonly { heading: string; body: string }[];
  faqs: readonly { question: string; answer: string }[];
  relatedRoutes: readonly string[];
  localProcessingNote?: string;
};

const n = (key: string, label: string, value: string, min = 0, max = 1e12): PhaseThreeAField => ({
  key, label, value, type: 'number', min, max, step: 'any',
});
const text = (key: string, label: string, value: string, type: 'text' | 'textarea' = 'text'): PhaseThreeAField => ({
  key, label, value, type,
});
const select = (key: string, label: string, value: string, options: readonly [string, string][]): PhaseThreeAField => ({
  key, label, value, type: 'select', options: options.map(([optionValue, optionLabel]) => ({ value: optionValue, label: optionLabel })),
});
export const phaseThreeAMetadataSentence = (description: string, calculation: string): string => {
  const text = `${description.replace(/[.!?]+$/, '')}; ${calculation.replace(/[.!?]+$/, '')}.`;
  return text.length <= 160 ? text : `${description.replace(/[.!?]+$/, '')}.`;
};

const seoDescriptions: Partial<Record<PhaseThreeASlug, string>> = {
  bandwidth: 'Calculate the ideal bandwidth needed to transfer a file in a chosen time, with decimal and binary file-size units and Mbps output.',
  base64: 'Encode Unicode text to Base64 or decode valid Base64 to UTF-8 securely in your browser, with no data transmitted or stored.',
  electricity: 'Estimate appliance energy use and electricity cost from power, daily operating time, number of days, and your price per kilowatt-hour.',
  'ip-subnet': 'Calculate IPv4 or IPv6 CIDR network boundaries, address scope, and IPv4 broadcast details with strict address validation.',
  'password-generator': 'Generate a secure random password locally with your chosen length and character classes, using browser cryptographic randomness.',
  resistor: 'Calculate equivalent resistance for series or parallel resistor networks from a list of positive resistance values in ohms.',
  'url-encode-decode': 'Encode or decode a Unicode URL component with UTF-8 percent escapes locally in your browser, with malformed input validation.',
};

type ContentFact = {
  example: string;
  meaning: string;
  units: string;
  edge: string;
  limit: string;
  check: string;
};

const contentFacts: Record<PhaseThreeASlug, ContentFact> = {
  bandwidth: {
    example: 'A 1 GB decimal file transferred in 100 seconds requires 80 megabits per second because 1 GB is 8,000 megabits.',
    meaning: 'The result is the ideal average link rate needed to move the entered payload within the entered time.',
    units: 'Decimal MB and GB use powers of 1,000; binary MiB and GiB use powers of 1,024. Network rates are conventionally stated in bits per second.',
    edge: 'Transfer time must be greater than zero, and protocol overhead, retransmission, encryption, and competing traffic are not part of the payload calculation.',
    limit: 'A real connection should be provisioned above the ideal rate because advertised throughput and application payload throughput are rarely identical.',
    check: 'Convert the file size to bytes, multiply by eight for bits, divide by seconds, then divide by one million for Mbps.',
  },
  base64: {
    example: 'Encoding the UTF-8 text “FigureNest” produces RmlndXJlTmVzdA== and decoding that value restores the original text.',
    meaning: 'Base64 represents binary bytes with a restricted text alphabet; it does not hide, encrypt, or authenticate the data.',
    units: 'Text is converted to UTF-8 bytes before encoding. Four Base64 characters normally represent three input bytes, with equals signs used as padding.',
    edge: 'Malformed alphabet characters, invalid padding, or decoded bytes that are not valid UTF-8 produce an explicit error.',
    limit: 'Base64 expands data by roughly one third and must not be treated as protection for passwords, personal data, tokens, or secrets.',
    check: 'For decoding, validate the alphabet and padding first, reconstruct each 24-bit group, then decode the resulting bytes as UTF-8.',
  },
  electricity: {
    example: 'A 1.5 kW appliance used for 4 hours per day over 30 days consumes 180 kWh; at 0.20 per kWh the energy charge is 36.',
    meaning: 'The result estimates electrical energy use and its variable energy charge from power, operating time, days, and unit price.',
    units: 'Watts are converted to kilowatts before multiplying by hours. A kilowatt-hour is energy, while a kilowatt is instantaneous power.',
    edge: 'Power, hours, days, and price must be finite and nonnegative; hours per day cannot exceed 24 and the day count must be a whole number.',
    limit: 'Bills may also include fixed charges, taxes, time-of-use rates, demand charges, tiering, power factor, and appliance duty cycles.',
    check: 'Convert watts to kilowatts when necessary, multiply kW by hours per day and days, then multiply kWh by the entered price.',
  },
  'ip-subnet': {
    example: 'IPv4 address 192.168.1.42 with prefix 24 has network 192.168.1.0, broadcast 192.168.1.255, and 256 total addresses.',
    meaning: 'The result applies a CIDR prefix mask to an IPv4 or IPv6 address and reports the canonical network boundary and address scope.',
    units: 'An IPv4 prefix ranges from 0 to 32 bits; an IPv6 prefix ranges from 0 to 128 bits. CIDR is bit-based and has no decimal unit.',
    edge: 'Every IPv4 octet must be decimal 0–255. IPv6 accepts valid compressed hexadecimal notation but rejects multiple double-colon contractions and zone identifiers.',
    limit: 'The calculator describes address mathematics only; routing policy, delegated prefixes, DHCP reservations, firewall behavior, and provider assignments are external.',
    check: 'Parse the address into an unsigned integer, keep the prefix bits with a bit mask, clear host bits, and format the network in its original address family.',
  },
  'ohms-law': {
    example: 'A 12 volt source across 6 ohms produces 2 amperes; the corresponding power is 24 watts.',
    meaning: 'Ohm’s law relates voltage, current, and resistance, while electrical power provides a useful fourth derived quantity.',
    units: 'Use volts, amperes, ohms, and watts. Prefixes such as milliamperes or kilo-ohms must be converted before entering a value.',
    edge: 'A divisor cannot be zero, all entered magnitudes must be nonnegative, and a calculated result must remain finite.',
    limit: 'Real components can be nonlinear, temperature-dependent, reactive, pulsed, or outside their ratings; this calculator models a resistive DC relationship.',
    check: 'Choose the unknown, enter the two required known values, and verify the rearranged relation: V = I×R, I = V÷R, R = V÷I, or P = V×I.',
  },
  'password-generator': {
    example: 'A 20-character password selected from upper case, lower case, digits, and symbols has a 91-character candidate alphabet and includes each chosen class.',
    meaning: 'The generator creates a new random password locally from the selected character classes using the browser cryptographic random-number generator.',
    units: 'Length is counted in characters. The displayed entropy estimate is length multiplied by log base two of the available alphabet size.',
    edge: 'Length must be 8–128 characters, at least one class must be enabled, and length cannot be smaller than the number of selected classes.',
    limit: 'A generated password is only one part of account security; use a password manager, unique credentials, multifactor authentication, and the service’s recovery controls.',
    check: 'Each selected class contributes at least one character; remaining positions use the combined alphabet and a cryptographically secure shuffle removes placement bias.',
  },
  resistor: {
    example: 'Resistors of 100 Ω and 220 Ω total 320 Ω in series and approximately 68.75 Ω in parallel.',
    meaning: 'The result combines a list of positive resistance values using either the series sum or the reciprocal parallel formula.',
    units: 'All entered values are ohms. Convert kilo-ohms by multiplying by 1,000 and megaohms by multiplying by 1,000,000 before entry.',
    edge: 'Every list item must be a finite positive number; empty items, zero-ohm branches, negative values, and more than 100 components are rejected.',
    limit: 'Nominal resistance does not model component tolerance, temperature coefficient, frequency-dependent impedance, power rating, or wiring resistance.',
    check: 'For series, add every resistance. For parallel, add each reciprocal and invert the total; the parallel result must be below the smallest branch.',
  },
  'url-encode-decode': {
    example: 'Encoding “report name & total” as a URI component produces report%20name%20%26%20total and decoding restores the original characters.',
    meaning: 'Percent encoding makes reserved or unsafe text representable inside one URL component; it is not encryption and does not validate a complete URL.',
    units: 'The tool uses JavaScript URI-component rules and UTF-8 percent escapes. Spaces become %20 rather than the form-encoding plus sign.',
    edge: 'Malformed percent escapes or invalid encoded sequences produce an explicit decoding error instead of returning altered text.',
    limit: 'Encode individual query values or path segments, not an entire URL when separators such as colon, slash, question mark, and ampersand must retain structure.',
    check: 'Compare the output character by character and confirm that decoding the encoded component round-trips to the exact original Unicode text.',
  },
  density: {
    example: 'A mass of 2 kilograms occupying 0.001 cubic metre has a density of 2,000 kg/m³, equivalent to 2 g/cm³.',
    meaning: 'Density is mass divided by volume and describes how much mass is contained in a unit of three-dimensional space.',
    units: 'Mass can be entered in kilograms or grams and volume in cubic metres, litres, or cubic centimetres; calculations normalize to SI units.',
    edge: 'Mass must be nonnegative, volume must be greater than zero, and converted values must remain finite.',
    limit: 'Material density varies with composition, temperature, pressure, moisture, porosity, and measurement method; mixtures may not be uniform.',
    check: 'Convert mass to kilograms, convert volume to cubic metres, divide mass by volume, and use 1,000 kg/m³ = 1 g/cm³ as a cross-check.',
  },
  'dew-point': {
    example: 'At 20 °C and 50% relative humidity, the Magnus approximation gives a dew point of about 9.3 °C.',
    meaning: 'Dew point is the temperature at which air with the entered moisture content would become saturated under the approximation.',
    units: 'Temperature may be entered in Celsius or Fahrenheit and is normalized to Celsius; relative humidity is a percentage from above zero through 100.',
    edge: 'Relative humidity at zero is outside the logarithmic formula, humidity above 100% is invalid, and extreme temperatures outside normal meteorological use are rejected.',
    limit: 'The Magnus approximation is practical for common near-surface conditions but is not a substitute for calibrated observations or specialist psychrometric calculations.',
    check: 'Convert to Celsius, compute gamma from temperature and the natural logarithm of relative humidity, then solve the Magnus relation for dew point.',
  },
  horsepower: {
    example: 'An engine producing 300 lb-ft of torque at 5,252 rpm produces approximately 300 mechanical horsepower.',
    meaning: 'The calculator derives mechanical horsepower from rotational torque and engine speed, covering both Engine Horsepower and Horsepower Calculator intent.',
    units: 'Torque may be entered as pound-feet or newton-metres and is normalized to pound-feet; output includes mechanical hp and kilowatts.',
    edge: 'Torque and RPM must be finite and nonnegative; RPM may be zero, which correctly produces zero power.',
    limit: 'Calculated crankshaft power does not include drivetrain loss, test correction standards, transient behavior, torque-curve variation, or measurement uncertainty.',
    check: 'Convert N·m to lb-ft when needed, multiply torque by RPM, divide by 5,252, and convert hp to kW using 0.7456998716 kW per hp.',
  },
  'heat-index': {
    example: 'At 90 °F and 70% relative humidity, the NOAA Rothfusz regression gives a heat index of approximately 105.9 °F.',
    meaning: 'Heat index estimates how hot shaded conditions feel when air temperature and relative humidity are considered together.',
    units: 'Temperature may be entered in Celsius or Fahrenheit but the NOAA regression operates in Fahrenheit; relative humidity is a percentage.',
    edge: 'For temperatures of at least 80 °F, NOAA first screens conditions with a simpler Steadman approximation; when that heat-index estimate reaches 80 °F, the Rothfusz regression and its low- or high-humidity adjustments apply. Relative humidity may range from 0% through 100%.',
    limit: 'Direct sun, wind, clothing, exertion, age, health, hydration, and local warnings can change risk substantially; use official alerts for safety decisions.',
    check: 'Normalize temperature to Fahrenheit, apply the Rothfusz polynomial and NOAA humidity adjustments, then convert the result back for a Celsius display.',
  },
  mass: {
    example: 'A material with density 800 kg/m³ occupying 0.25 m³ has a mass of 200 kg, approximately 440.925 pounds.',
    meaning: 'Mass equals density multiplied by volume and provides a focused material-quantity calculation rather than a unit-only conversion.',
    units: 'Density is entered in kg/m³. Volume may be cubic metres, litres, or cubic centimetres and is converted to cubic metres.',
    edge: 'Density and volume must be finite and nonnegative; a zero volume correctly produces zero mass.',
    limit: 'Use a representative bulk or material density: voids, moisture, compaction, temperature, and mixed composition can make a catalogue value inaccurate.',
    check: 'Convert volume to m³, multiply by kg/m³, then convert kilograms to grams and pounds as independent output checks.',
  },
  molarity: {
    example: '0.5 mole of solute in 2 litres of final solution has a molarity of 0.25 mol/L.',
    meaning: 'Molarity is amount of substance in moles divided by final solution volume in litres.',
    units: 'Amount may be entered in moles or millimoles and volume in litres or millilitres; both are normalized before division.',
    edge: 'Amount must be nonnegative, final solution volume must be greater than zero, and all values must remain finite.',
    limit: 'This does not calculate moles from mass or molar mass, account for reaction stoichiometry, activity, dissociation, temperature expansion, or preparation uncertainty.',
    check: 'Convert millimoles to moles and millilitres to litres, divide moles by final litres, and verify that mmol/mL gives the same numerical molarity.',
  },
  'speed-calculator': {
    example: 'Travelling 100 kilometres in 2 hours gives 50 km/h, approximately 31.069 mph or 13.889 m/s.',
    meaning: 'Average speed is total distance divided by elapsed time; it differs from a converter that starts with an already-known speed.',
    units: 'Distance may be kilometres, miles, or metres and time may be hours, minutes, or seconds; values are normalized before division.',
    edge: 'Distance must be nonnegative and elapsed time must be greater than zero. The calculation cannot infer stops, direction, acceleration, or instantaneous speed.',
    limit: 'Average speed may hide substantial variation during a journey and should not be used to infer safe travel speeds or legal compliance.',
    check: 'Convert distance to kilometres and time to hours, divide to obtain km/h, then convert to mph and m/s for independent comparison.',
  },
  'wind-chill': {
    example: 'At 0 °F with wind at 15 mph, the NOAA/NWS formula gives a wind chill near −19.4 °F.',
    meaning: 'Wind chill estimates the equivalent cooling effect on exposed skin from low air temperature and wind.',
    units: 'Temperature may be entered in Fahrenheit or Celsius and wind in mph or km/h; the official US formula is evaluated with °F and mph.',
    edge: 'The formula applies at 50 °F or colder and wind above 3 mph; warmer or calmer inputs receive an applicability error.',
    limit: 'Sun, shelter, wet clothing, exposure duration, activity, individual health, and local warnings are not represented; frostbite risk requires official guidance.',
    check: 'Normalize to °F and mph, apply the wind-speed exponent 0.16 in the NWS equation, and convert the apparent temperature back to Celsius.',
  },
};

type Spec = Omit<PhaseThreeADefinition, 'href' | 'seoTitle' | 'seoDescription' | 'h1' | 'resultLabel' | 'workedExample' | 'interpretation' | 'edgeCases' | 'limitations' | 'educationalSections' | 'faqs'> & ContentFact;

const specs: Record<PhaseThreeASlug, Spec> = {
  bandwidth: {
    slug: 'bandwidth', name: 'Bandwidth Calculator', description: 'Calculate the ideal transfer rate required to move a file in a specified time.', category: 'Technology', categorySlug: 'technology',
    tags: ['bandwidth calculator', 'data transfer rate', 'Mbps', 'file transfer time'], fields: [n('size', 'File size', '1'), select('sizeUnit', 'File-size unit', 'GB', [['MB','MB (decimal)'],['GB','GB (decimal)'],['MiB','MiB (binary)'],['GiB','GiB (binary)']]), n('seconds', 'Transfer time (seconds)', '100', Number.MIN_VALUE)],
    formula: 'bandwidth (Mbps) = file bytes × 8 ÷ seconds ÷ 1,000,000', variables: 'File size is converted to bytes; time is elapsed seconds; the output is decimal megabits per second.', sourceLinks: [{ label: 'FCC Broadband Speed Guide', href: 'https://www.fcc.gov/consumers/guides/broadband-speed-guide' }], relatedRoutes: ['/calculators/technology/ip-subnet','/converters/speed','/calculators/date-time/time-duration'],
    ...contentFacts.bandwidth,
  },
  base64: {
    slug: 'base64', name: 'Base64 Encode / Decode Tool', description: 'Encode Unicode text as Base64 or decode valid Base64 back to UTF-8 locally.', category: 'Technology', categorySlug: 'technology',
    tags: ['base64 encoder', 'base64 decoder', 'UTF-8', 'developer tool'], fields: [select('operation','Operation','encode',[['encode','Encode text'],['decode','Decode Base64']]), text('input','Text to process','FigureNest','textarea')],
    formula: 'Base64 maps each 24 input bits to four 6-bit alphabet indexes', variables: 'Input text is represented as UTF-8 bytes; Base64 output uses A–Z, a–z, 0–9, plus, slash, and optional equals padding.', sourceLinks: [{ label: 'MDN Base64 glossary', href: 'https://developer.mozilla.org/en-US/docs/Glossary/Base64' }], relatedRoutes: ['/calculators/technology/url-encode-decode','/calculators/technology/password-generator','/calculators/technology/ip-subnet'],
    localProcessingNote: 'Encoding and decoding happen in this browser. Encoding is not encryption, and FigureNest does not send or store the entered value.', ...contentFacts.base64,
  },
  electricity: {
    slug: 'electricity', name: 'Electricity Calculator', description: 'Estimate appliance energy use and variable electricity cost from power and operating time.', category: 'Electrical', categorySlug: 'electrical',
    tags: ['electricity calculator', 'energy cost', 'kWh calculator', 'appliance power'], fields: [n('power','Appliance power','1500'),select('powerUnit','Power unit','W',[['W','watts (W)'],['kW','kilowatts (kW)']]),n('hours','Hours used per day','4',0,24),n('days','Number of days','30',1,366),n('price','Price per kWh','0.20')],
    formula: 'energy (kWh) = power (kW) × hours/day × days; cost = energy × price/kWh', variables: 'Power is the appliance rating, operating time is hours per day, days is a whole-number period, and price is the chosen currency per kWh.', sourceLinks: [{ label: 'US EIA Electricity Explained', href: 'https://www.eia.gov/energyexplained/electricity/' }], relatedRoutes: ['/calculators/electrical/ohms-law','/calculators/electrical/voltage-drop','/calculators/automotive/ev-charging-cost'],
    ...contentFacts.electricity,
  },
  'ip-subnet': {
    slug: 'ip-subnet', name: 'IP Subnet Calculator', description: 'Validate an IPv4 or IPv6 address and calculate its CIDR network boundary and scope.', category: 'Technology', categorySlug: 'technology',
    tags: ['IP subnet calculator', 'CIDR calculator', 'IPv4 subnet', 'IPv6 prefix'], fields: [select('family','Address family','ipv4',[['ipv4','IPv4'],['ipv6','IPv6']]),text('address','IP address','192.168.1.42'),n('prefix','CIDR prefix length','24',0,128)],
    formula: 'network = address bitwise-AND prefix mask', variables: 'The address is parsed as 32 bits for IPv4 or 128 bits for IPv6; prefix length retains the leading network bits.', sourceLinks: [{ label: 'ARIN IPv6 Addressing Plan', href: 'https://www.arin.net/resources/guide/ipv6/' }], relatedRoutes: ['/calculators/technology/bandwidth','/calculators/technology/url-encode-decode','/calculators/technology/password-generator'],
    localProcessingNote: 'Address parsing happens locally. No entered address is transmitted or stored.', ...contentFacts['ip-subnet'],
  },
  'ohms-law': {
    slug: 'ohms-law', name: 'Ohm’s Law Calculator', description: 'Solve voltage, current, resistance, or electrical power from two known values.', category: 'Electrical', categorySlug: 'electrical',
    tags: ['ohms law calculator', 'voltage current resistance', 'V I R', 'electrical power'], fields: [select('solve','Calculate','voltage',[['voltage','Voltage from current and resistance'],['current','Current from voltage and resistance'],['resistance','Resistance from voltage and current'],['power','Power from voltage and current']]),n('first','First known value','2'),n('second','Second known value','6')],
    formula: 'V = I × R; I = V ÷ R; R = V ÷ I; P = V × I', variables: 'Field labels below follow the selected operation; values use volts, amperes, ohms, and watts without automatic metric prefixes.', sourceLinks: [{ label: 'NIST SI unit of electric current', href: 'https://www.nist.gov/pml/owm/si-units-electric-current' }], relatedRoutes: ['/calculators/electrical/resistor','/calculators/electrical/voltage-drop','/calculators/electrical/electricity'],
    ...contentFacts['ohms-law'],
  },
  'password-generator': {
    slug: 'password-generator', name: 'Password Generator', description: 'Generate a strong random password locally with browser cryptographic randomness.', category: 'Technology', categorySlug: 'technology',
    tags: ['password generator', 'secure random password', 'cryptographic randomness', 'password security'], fields: [n('length','Password length','20',8,128),select('lower','Include lowercase','yes',[['yes','Yes'],['no','No']]),select('upper','Include uppercase','yes',[['yes','Yes'],['no','No']]),select('digits','Include digits','yes',[['yes','Yes'],['no','No']]),select('symbols','Include symbols','yes',[['yes','Yes'],['no','No']])],
    formula: 'characters = unbiased cryptographic random indexes into the selected alphabets', variables: 'Length is 8–128 characters; enabled character classes define the candidate alphabet and each selected class is represented.', sourceLinks: [{ label: 'NIST Digital Identity Guidelines: Authentication', href: 'https://pages.nist.gov/800-63-4/sp800-63b.html' }], relatedRoutes: ['/calculators/technology/base64','/calculators/technology/url-encode-decode','/calculators/technology/ip-subnet'],
    localProcessingNote: 'Passwords are generated with crypto.getRandomValues in this browser. They are never transmitted, logged, or stored by FigureNest.', ...contentFacts['password-generator'],
  },
  resistor: {
    slug: 'resistor', name: 'Resistor Calculator', description: 'Calculate equivalent resistance for series or parallel resistor networks.', category: 'Electrical', categorySlug: 'electrical',
    tags: ['resistor calculator', 'series resistance', 'parallel resistance', 'equivalent resistance'], fields: [select('mode','Connection','series',[['series','Series'],['parallel','Parallel']]),text('values','Resistance values in ohms','100, 220','textarea')],
    formula: 'series: Rₜ = ΣR; parallel: Rₜ = 1 ÷ Σ(1/R)', variables: 'Enter 1–100 positive resistance values in ohms, separated by commas, spaces, or line breaks.', sourceLinks: [{ label: 'NIST SI derived unit: ohm', href: 'https://www.nist.gov/pml/owm/si-units-electric-current' }], relatedRoutes: ['/calculators/electrical/ohms-law','/calculators/electrical/voltage-drop','/converters/power'],
    ...contentFacts.resistor,
  },
  'url-encode-decode': {
    slug: 'url-encode-decode', name: 'URL Encode / Decode Tool', description: 'Percent-encode or decode one Unicode URL component locally in the browser.', category: 'Technology', categorySlug: 'technology',
    tags: ['URL encoder', 'URL decoder', 'percent encoding', 'URI component'], fields: [select('operation','Operation','encode',[['encode','Encode component'],['decode','Decode component']]),text('input','URL component text','report name & total','textarea')],
    formula: 'encodeURIComponent maps UTF-8 bytes for reserved characters to percent escapes', variables: 'The input is one URL component, not an entire URL; decoding reverses valid percent-encoded sequences.', sourceLinks: [{ label: 'MDN encodeURIComponent reference', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent' }], relatedRoutes: ['/calculators/technology/base64','/calculators/technology/ip-subnet','/calculators/technology/password-generator'],
    localProcessingNote: 'Encoding and decoding happen locally. Encoding is not encryption, and FigureNest does not send or store the entered value.', ...contentFacts['url-encode-decode'],
  },
  density: {
    slug: 'density', name: 'Density Calculator', description: 'Calculate material density from mass and volume with explicit SI unit conversion.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['density calculator', 'mass divided by volume', 'kg per cubic metre', 'g per cm3'], fields: [n('mass','Mass','2'),select('massUnit','Mass unit','kg',[['kg','kilograms (kg)'],['g','grams (g)']]),n('volume','Volume','0.001',Number.MIN_VALUE),select('volumeUnit','Volume unit','m3',[['m3','cubic metres (m³)'],['L','litres (L)'],['cm3','cubic centimetres (cm³)']])],
    formula: 'density = mass ÷ volume', variables: 'Mass is normalized to kilograms and volume to cubic metres; results are shown in kg/m³ and g/cm³.', sourceLinks: [{ label: 'NIST SI units guidance', href: 'https://www.nist.gov/pml/owm/si-units' }], relatedRoutes: ['/calculators/science-engineering/mass','/calculators/science-engineering/molarity','/calculators/math/volume'],
    ...contentFacts.density,
  },
  'dew-point': {
    slug: 'dew-point', name: 'Dew Point Calculator', description: 'Estimate dew point from air temperature and relative humidity with the Magnus formula.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['dew point calculator', 'relative humidity', 'Magnus formula', 'weather calculation'], fields: [n('temperature','Air temperature','20',-100,80),select('unit','Temperature unit','C',[['C','Celsius (°C)'],['F','Fahrenheit (°F)']]),n('humidity','Relative humidity (%)','50',Number.MIN_VALUE,100)],
    formula: 'γ = ln(RH/100) + aT/(b+T); dew point = bγ/(a−γ)', variables: 'T is Celsius, RH is relative humidity, a = 17.625, and b = 243.04 °C for this Magnus approximation.', sourceLinks: [{ label: 'NOAA National Weather Service humidity guidance', href: 'https://www.weather.gov/arx/why_dewpoint_vs_humidity' }], relatedRoutes: ['/calculators/science-engineering/heat-index','/calculators/science-engineering/wind-chill','/converters/temperature'],
    ...contentFacts['dew-point'],
  },
  horsepower: {
    slug: 'horsepower', name: 'Horsepower Calculator', description: 'Calculate mechanical engine horsepower from torque and RPM, with kilowatt output.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['horsepower calculator', 'engine horsepower calculator', 'torque RPM horsepower', 'mechanical power'], fields: [n('torque','Torque','300'),select('torqueUnit','Torque unit','lbft',[['lbft','pound-feet (lb-ft)'],['Nm','newton-metres (N·m)']]),n('rpm','Engine speed (RPM)','5252')],
    formula: 'mechanical hp = torque (lb-ft) × RPM ÷ 5,252', variables: 'Torque is normalized to pound-feet; rotational speed is revolutions per minute; output also converts hp to kilowatts.', sourceLinks: [{ label: 'NIST Guide for SI unit conversions', href: 'https://www.nist.gov/pml/special-publication-811' }], relatedRoutes: ['/converters/power','/calculators/science-engineering/speed-calculator','/calculators/automotive/ev-charging-time'],
    ...contentFacts.horsepower,
  },
  'heat-index': {
    slug: 'heat-index', name: 'Heat Index Calculator', description: 'Estimate NOAA heat index from air temperature and relative humidity.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['heat index calculator', 'feels like temperature', 'relative humidity', 'NOAA heat index'], fields: [n('temperature','Air temperature','90',-100,150),select('unit','Temperature unit','F',[['F','Fahrenheit (°F)'],['C','Celsius (°C)']]),n('humidity','Relative humidity (%)','70',0,100)],
    formula: 'NOAA Rothfusz regression using temperature °F and relative humidity %', variables: 'T is air temperature in Fahrenheit and R is relative humidity percentage; low- and high-humidity adjustments apply in NOAA ranges.', sourceLinks: [{ label: 'NOAA/NWS Heat Index', href: 'https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml' }], relatedRoutes: ['/calculators/science-engineering/dew-point','/calculators/science-engineering/wind-chill','/converters/temperature'],
    ...contentFacts['heat-index'],
  },
  mass: {
    slug: 'mass', name: 'Mass Calculator', description: 'Calculate material mass from density and volume with SI and imperial outputs.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['mass calculator', 'density times volume', 'material mass', 'kg calculator'], fields: [n('density','Density (kg/m³)','800'),n('volume','Volume','0.25'),select('volumeUnit','Volume unit','m3',[['m3','cubic metres (m³)'],['L','litres (L)'],['cm3','cubic centimetres (cm³)']])],
    formula: 'mass = density × volume', variables: 'Density is kg/m³ and volume is normalized to m³; results include kilograms, grams, and pounds.', sourceLinks: [{ label: 'NIST SI base unit of mass', href: 'https://www.nist.gov/pml/owm/si-units-mass' }], relatedRoutes: ['/calculators/science-engineering/density','/calculators/science-engineering/molarity','/converters/weight'],
    ...contentFacts.mass,
  },
  molarity: {
    slug: 'molarity', name: 'Molarity Calculator', description: 'Calculate solution molarity from amount of solute and final solution volume.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['molarity calculator', 'moles per litre', 'solution concentration', 'mol per L'], fields: [n('amount','Amount of solute','0.5'),select('amountUnit','Amount unit','mol',[['mol','moles (mol)'],['mmol','millimoles (mmol)']]),n('volume','Final solution volume','2',Number.MIN_VALUE),select('volumeUnit','Volume unit','L',[['L','litres (L)'],['mL','millilitres (mL)']])],
    formula: 'molarity (mol/L) = amount of solute (mol) ÷ solution volume (L)', variables: 'Amount is normalized to moles and final solution volume to litres before division.', sourceLinks: [{ label: 'IUPAC Gold Book: amount concentration', href: 'https://goldbook.iupac.org/terms/view/A00295' }], relatedRoutes: ['/calculators/science-engineering/mass','/calculators/science-engineering/density','/calculators/math/scientific'],
    ...contentFacts.molarity,
  },
  'speed-calculator': {
    slug: 'speed-calculator', name: 'Speed Calculator', description: 'Calculate average speed from distance and elapsed time, then compare common speed units.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['speed calculator', 'distance divided by time', 'average speed', 'travel speed'], fields: [n('distance','Distance','100'),select('distanceUnit','Distance unit','km',[['km','kilometres (km)'],['mi','miles (mi)'],['m','metres (m)']]),n('time','Elapsed time','2',Number.MIN_VALUE),select('timeUnit','Time unit','h',[['h','hours'],['min','minutes'],['s','seconds']])],
    formula: 'average speed = total distance ÷ elapsed time', variables: 'Distance is normalized to kilometres and elapsed time to hours; output includes km/h, mph, and m/s.', sourceLinks: [{ label: 'NIST SI unit of speed guidance', href: 'https://www.nist.gov/pml/owm/si-units-velocity' }], relatedRoutes: ['/converters/speed','/calculators/science-engineering/horsepower','/calculators/date-time/time-duration'],
    ...contentFacts['speed-calculator'],
  },
  'wind-chill': {
    slug: 'wind-chill', name: 'Wind Chill Calculator', description: 'Estimate NOAA/NWS wind chill from cold air temperature and wind speed.', category: 'Science & Engineering', categorySlug: 'science-engineering',
    tags: ['wind chill calculator', 'feels like cold', 'NWS wind chill', 'weather calculator'], fields: [n('temperature','Air temperature','0',-150,100),select('temperatureUnit','Temperature unit','F',[['F','Fahrenheit (°F)'],['C','Celsius (°C)']]),n('wind','Wind speed','15',Number.MIN_VALUE),select('windUnit','Wind-speed unit','mph',[['mph','miles per hour (mph)'],['kmh','kilometres per hour (km/h)']])],
    formula: 'wind chill °F = 35.74 + 0.6215T − 35.75V^0.16 + 0.4275TV^0.16', variables: 'T is Fahrenheit and V is miles per hour; output is also converted to Celsius.', sourceLinks: [{ label: 'NOAA/NWS Wind Chill Chart', href: 'https://www.weather.gov/safety/cold-wind-chill-chart' }], relatedRoutes: ['/calculators/science-engineering/heat-index','/calculators/science-engineering/dew-point','/converters/temperature'],
    ...contentFacts['wind-chill'],
  },
};

const buildSections = (spec: Spec): PhaseThreeADefinition['educationalSections'] => {
  const facts = contentFacts[spec.slug];
  return [
    {
      heading: 'Formula, variables, and method',
      body: `${spec.formula}. ${spec.variables} ${facts.meaning} Start by identifying what each entered number represents and whether it is a measured value, a specification, or an assumption. Convert units before combining quantities, preserve full precision through intermediate steps, and round only the displayed result. ${facts.check} This sequence makes the output reproducible and helps expose a misplaced unit or decimal point before it affects a decision.`,
    },
    {
      heading: 'Worked example and independent check',
      body: `${facts.example} To check the example independently, write the formula first, substitute the values with their units, and complete one operation at a time. Compare the order of magnitude with a familiar reference rather than accepting a formatted result automatically. ${facts.check} If a second method or inverse calculation is available, use it to recover an original input. Small differences from hand calculation should come only from displayed rounding, not from a different definition.`,
    },
    {
      heading: 'Units and result interpretation',
      body: `${facts.units} ${facts.meaning} A unit is part of the quantity, not a label added after the arithmetic. Keep decimal and binary prefixes, temperature scales, elapsed-time units, and electrical prefixes explicit. When comparing two scenarios, change one assumption at a time and retain the same unit convention. The result describes only the relationship named by this calculator; it does not automatically establish capacity, safety, compatibility, quality, or compliance.`,
    },
    {
      heading: 'Validation and boundary cases',
      body: `${facts.edge} Blank values, malformed text, non-finite numbers, impossible ranges, zero divisors, and unsupported combinations receive an explicit message rather than a silent fallback. Boundary values are checked before the formula runs. If an input comes from a specification sheet, weather report, network plan, or measurement instrument, confirm its definition and precision. A syntactically valid value can still be unsuitable for the real situation, so inspect the assumptions alongside the result.`,
    },
    {
      heading: 'Assumptions, privacy, and practical limits',
      body: `${facts.limit} ${spec.localProcessingNote ?? 'All entered values are processed in the browser and are not sent to a calculation service.'} Use the result as a transparent estimate or transformation, keep the source values with any saved result, and consult the linked authoritative material for definitions and applicability. For safety-critical, health-adjacent, security, network, chemical, or electrical work, verify the result with current standards, official warnings, qualified professionals, and appropriate test equipment.`,
    },
  ];
};

export const phaseThreeADefinitions = Object.fromEntries(
  (Object.keys(specs) as PhaseThreeASlug[]).map((slug) => {
    const spec = specs[slug];
    const facts = contentFacts[slug];
    const href = `/calculators/${spec.categorySlug}/${slug}`;
    const definition: PhaseThreeADefinition = {
      ...spec,
      href,
      h1: spec.name,
      resultLabel: `${spec.name.toUpperCase()} RESULT`,
      seoTitle: `${spec.name} | FigureNest`,
      seoDescription: seoDescriptions[slug] ?? phaseThreeAMetadataSentence(spec.description, spec.formula),
      workedExample: facts.example,
      interpretation: facts.meaning,
      edgeCases: facts.edge,
      limitations: facts.limit,
      educationalSections: buildSections(spec),
      faqs: [
        { question: `What does the ${spec.name} do?`, answer: spec.description },
        { question: 'How can I check the result?', answer: facts.check },
        { question: 'Which units and assumptions matter?', answer: `${facts.units} ${facts.limit}` },
        { question: 'Are the entered values sent or stored?', answer: spec.localProcessingNote ?? 'No. The calculation runs locally in your browser and FigureNest does not send or store calculator inputs.' },
      ],
    };
    return [slug, definition];
  }),
) as Record<PhaseThreeASlug, PhaseThreeADefinition>;

export const phaseThreeASlugs = Object.keys(phaseThreeADefinitions) as PhaseThreeASlug[];
export const phaseThreeAUsefulWordCount = (definition: PhaseThreeADefinition) => [
  definition.description, definition.formula, definition.variables, definition.workedExample,
  definition.interpretation, definition.edgeCases, definition.limitations,
  ...definition.educationalSections.map((section) => `${section.heading} ${section.body}`),
  ...definition.faqs.flatMap((faq) => [faq.question, faq.answer]),
].join(' ').trim().split(/\s+/).filter(Boolean).length;

const bad = (message: string): PhaseThreeAResult => ({ primary: message, summary: message, details: [], error: message });
const finite = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= 1e15 ? parsed : null;
};
const format = (value: number, digits = 4) => value.toLocaleString('en-US', { maximumFractionDigits: digits });
const result = (primary: string, summary: string, details: PhaseThreeAResult['details'] = []): PhaseThreeAResult => ({ primary, summary, details });
const toCelsius = (value: number, unit: string) => unit === 'F' ? (value - 32) * 5 / 9 : value;
const toFahrenheit = (value: number, unit: string) => unit === 'C' ? value * 9 / 5 + 32 : value;
const volumeToM3 = (value: number, unit: string) => unit === 'L' ? value / 1000 : unit === 'cm3' ? value / 1e6 : value;

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function encodeBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = bytes[index + 1];
    const c = bytes[index + 2];
    const combined = (a << 16) | ((b ?? 0) << 8) | (c ?? 0);
    output += base64Alphabet[(combined >> 18) & 63];
    output += base64Alphabet[(combined >> 12) & 63];
    output += b === undefined ? '=' : base64Alphabet[(combined >> 6) & 63];
    output += c === undefined ? '=' : base64Alphabet[combined & 63];
  }
  return output;
}

export function decodeBase64Utf8(input: string): string {
  const normalized = input.replace(/\s+/g, '');
  if (!normalized || normalized.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error('Enter valid padded Base64 text.');
  }
  const bytes: number[] = [];
  for (let index = 0; index < normalized.length; index += 4) {
    const chunk = normalized.slice(index, index + 4);
    const values = [...chunk].map((character) => character === '=' ? 0 : base64Alphabet.indexOf(character));
    const combined = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];
    bytes.push((combined >> 16) & 255);
    if (chunk[2] !== '=') bytes.push((combined >> 8) & 255);
    if (chunk[3] !== '=') bytes.push(combined & 255);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
}

function parseIPv4(value: string): bigint | null {
  const parts = value.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^(?:0|[1-9]\d{0,2})$/.test(part) || Number(part) > 255)) return null;
  return parts.reduce((total, part) => (total << 8n) | BigInt(Number(part)), 0n);
}
const formatIPv4 = (value: bigint) => [24n, 16n, 8n, 0n].map((shift) => Number((value >> shift) & 255n)).join('.');

function parseIPv6(value: string): bigint | null {
  if (!value || value.includes('%') || value.includes('.') || (value.match(/::/g)?.length ?? 0) > 1) return null;
  const compressed = value.includes('::');
  const [leftRaw, rightRaw = ''] = value.split('::');
  const left = leftRaw ? leftRaw.split(':') : [];
  const right = rightRaw ? rightRaw.split(':') : [];
  if ((!compressed && left.length !== 8) || (compressed && left.length + right.length >= 8)) return null;
  const groups = [...left, ...Array(compressed ? 8 - left.length - right.length : 0).fill('0'), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-fA-F]{1,4}$/.test(group))) return null;
  return groups.reduce((total, group) => (total << 16n) | BigInt(`0x${group}`), 0n);
}

function formatIPv6(value: bigint): string {
  const groups = Array.from({ length: 8 }, (_, index) => Number((value >> BigInt((7 - index) * 16)) & 65535n).toString(16));
  let bestStart = -1;
  let bestLength = 0;
  for (let start = 0; start < groups.length;) {
    if (groups[start] !== '0') { start += 1; continue; }
    let end = start;
    while (end < groups.length && groups[end] === '0') end += 1;
    if (end - start > bestLength && end - start >= 2) { bestStart = start; bestLength = end - start; }
    start = end;
  }
  if (bestStart < 0) return groups.join(':');
  const left = groups.slice(0, bestStart).join(':');
  const right = groups.slice(bestStart + bestLength).join(':');
  return `${left}::${right}`;
}

function ipScope(family: string, value: bigint): string {
  if (family === 'ipv4') {
    const first = Number((value >> 24n) & 255n);
    const second = Number((value >> 16n) & 255n);
    if (first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)) return 'Private-use';
    if (first === 127) return 'Loopback';
    if (first === 169 && second === 254) return 'Link-local';
    if (first >= 224 && first <= 239) return 'Multicast';
    if (value === 0n) return 'Unspecified';
    if (value === 0xffffffffn) return 'Limited broadcast';
    return 'Public or special-purpose; verify current registry allocation';
  }
  if (value === 0n) return 'Unspecified';
  if (value === 1n) return 'Loopback';
  if ((value >> 120n) === 0xffn) return 'Multicast';
  if ((value >> 118n) === 0x3fan) return 'Link-local';
  if ((value >> 121n) === 0x7en) return 'Unique-local';
  if ((value >> 96n) === 0x20010db8n) return 'Documentation';
  if ((value >> 125n) === 1n) return 'Global unicast';
  return 'Special-purpose or reserved; verify current registry allocation';
}

export function calculatePhaseThreeA(slug: PhaseThreeASlug, values: readonly string[], currency = 'USD'): PhaseThreeAResult {
  const definition = phaseThreeADefinitions[slug];
  if (slug === 'password-generator') return bad('Choose options, then generate a password.');
  if (values.length !== definition.fields.length || values.some((value) => !value.trim())) return bad('Complete every field before calculating.');
  const numberAt = (index: number) => finite(values[index]);
  try {
    if (slug === 'bandwidth') {
      const size = numberAt(0);
      const seconds = numberAt(2);
      if (size === null || seconds === null || size < 0 || seconds <= 0) return bad('Use a nonnegative file size and transfer time greater than zero.');
      const factors: Record<string, number> = { MB: 1e6, GB: 1e9, MiB: 1048576, GiB: 1073741824 };
      const mbps = size * factors[values[1]] * 8 / seconds / 1e6;
      return result(`${format(mbps)} Mbps`, 'Ideal average payload transfer rate.', [{ label: 'Megabytes per second', value: format(mbps / 8) }, { label: 'Gigabits per second', value: format(mbps / 1000) }]);
    }
    if (slug === 'base64') {
      const output = values[0] === 'encode' ? encodeBase64Utf8(values[1]) : decodeBase64Utf8(values[1]);
      return result(output, values[0] === 'encode' ? 'UTF-8 text encoded as Base64; this is not encryption.' : 'Base64 decoded as valid UTF-8 text.');
    }
    if (slug === 'electricity') {
      const power = numberAt(0), hours = numberAt(2), days = numberAt(3), price = numberAt(4);
      if ([power, hours, days, price].some((value) => value === null) || power! < 0 || hours! < 0 || hours! > 24 || !Number.isInteger(days) || days! < 1 || days! > 366 || price! < 0) return bad('Use nonnegative values, 0–24 hours per day, and a whole day count from 1–366.');
      const kwh = (values[1] === 'W' ? power! / 1000 : power!) * hours! * days!;
      const cost = new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(kwh * price!);
      return result(`${format(kwh)} kWh`, 'Estimated energy use for the entered period.', [{ label: `Energy charge (${currency})`, value: cost }, { label: 'Average daily energy', value: `${format(kwh / days!)} kWh` }]);
    }
    if (slug === 'ip-subnet') {
      const family = values[0];
      const prefix = numberAt(2);
      const bits = family === 'ipv4' ? 32 : 128;
      if (!Number.isInteger(prefix) || prefix! < 0 || prefix! > bits) return bad(`Prefix must be a whole number from 0 to ${bits}.`);
      const address = family === 'ipv4' ? parseIPv4(values[1]) : parseIPv6(values[1]);
      if (address === null) return bad(`Enter a valid ${family === 'ipv4' ? 'IPv4' : 'IPv6'} address.`);
      const hostBits = BigInt(bits - prefix!);
      const all = (1n << BigInt(bits)) - 1n;
      const hostMask = hostBits === 0n ? 0n : (1n << hostBits) - 1n;
      const network = address & (all ^ hostMask);
      const formatAddress = family === 'ipv4' ? formatIPv4 : formatIPv6;
      const details = family === 'ipv4'
        ? [{ label: 'Broadcast address', value: formatIPv4(network | hostMask) }, { label: 'Total addresses', value: (1n << hostBits).toString() }, { label: 'Usable hosts', value: prefix! <= 30 ? ((1n << hostBits) - 2n).toString() : prefix === 31 ? '2 (point-to-point convention)' : '1' }]
        : [{ label: 'Last address', value: formatIPv6(network | hostMask) }, { label: 'Address count', value: `2^${bits - prefix!}` }];
      return result(`${formatAddress(network)}/${prefix}`, `${family.toUpperCase()} CIDR network boundary.`, [...details, { label: 'Address scope', value: ipScope(family, address) }]);
    }
    if (slug === 'ohms-law') {
      const first = numberAt(1), second = numberAt(2);
      if (first === null || second === null || first < 0 || second < 0) return bad('Use finite nonnegative known values.');
      const mode = values[0];
      if ((mode === 'current' || mode === 'resistance') && second === 0) return bad('The divisor must be greater than zero.');
      const value = mode === 'voltage' ? first * second : mode === 'current' ? first / second : mode === 'resistance' ? first / second : first * second;
      const units: Record<string, string> = { voltage: 'V', current: 'A', resistance: 'Ω', power: 'W' };
      return result(`${format(value)} ${units[mode]}`, `Calculated ${mode} from the selected Ohm’s law relationship.`);
    }
    if (slug === 'resistor') {
      const resistorValues = values[1].split(/[\s,;]+/).filter(Boolean).map(Number);
      if (!resistorValues.length || resistorValues.length > 100 || resistorValues.some((value) => !Number.isFinite(value) || value <= 0 || value > 1e12)) return bad('Enter 1–100 positive resistance values in ohms.');
      const equivalent = values[0] === 'series' ? resistorValues.reduce((sum, value) => sum + value, 0) : 1 / resistorValues.reduce((sum, value) => sum + 1 / value, 0);
      return result(`${format(equivalent)} Ω`, `Equivalent resistance for ${resistorValues.length} ${values[0]} components.`, [{ label: 'Component count', value: String(resistorValues.length) }]);
    }
    if (slug === 'url-encode-decode') {
      const output = values[0] === 'encode' ? encodeURIComponent(values[1]) : decodeURIComponent(values[1]);
      return result(output, values[0] === 'encode' ? 'URL component percent-encoded; this is not encryption.' : 'Percent-encoded URL component decoded.');
    }
    if (slug === 'density') {
      const mass = numberAt(0), volume = numberAt(2);
      if (mass === null || volume === null || mass < 0 || volume <= 0) return bad('Use a nonnegative mass and a volume greater than zero.');
      const kg = values[1] === 'g' ? mass / 1000 : mass;
      const density = kg / volumeToM3(volume, values[3]);
      return result(`${format(density)} kg/m³`, 'Mass per unit volume.', [{ label: 'Grams per cubic centimetre', value: `${format(density / 1000)} g/cm³` }]);
    }
    if (slug === 'dew-point') {
      const temperature = numberAt(0), humidity = numberAt(2);
      if (temperature === null || humidity === null || humidity <= 0 || humidity > 100) return bad('Use a valid temperature and relative humidity above 0% through 100%.');
      const c = toCelsius(temperature, values[1]);
      if (c < -100 || c > 80) return bad('Temperature must be within the supported meteorological range of −100 to 80 °C.');
      const gamma = Math.log(humidity / 100) + 17.625 * c / (243.04 + c);
      const dew = 243.04 * gamma / (17.625 - gamma);
      return result(`${format(dew, 2)} °C`, 'Magnus-approximation dew point.', [{ label: 'Dew point Fahrenheit', value: `${format(dew * 9 / 5 + 32, 2)} °F` }]);
    }
    if (slug === 'horsepower') {
      const torque = numberAt(0), rpm = numberAt(2);
      if (torque === null || rpm === null || torque < 0 || rpm < 0) return bad('Use finite nonnegative torque and RPM.');
      const poundFeet = values[1] === 'Nm' ? torque * 0.7375621493 : torque;
      const hp = poundFeet * rpm / 5252;
      return result(`${format(hp)} hp`, 'Calculated mechanical engine horsepower.', [{ label: 'Kilowatts', value: `${format(hp * 0.7456998716)} kW` }, { label: 'Torque used', value: `${format(poundFeet)} lb-ft` }]);
    }
    if (slug === 'heat-index') {
      const temperature = numberAt(0), humidity = numberAt(2);
      if (temperature === null || humidity === null || humidity < 0 || humidity > 100) return bad('Use a valid temperature and relative humidity from 0% to 100%.');
      const t = toFahrenheit(temperature, values[1]);
      if (t < 80) return bad('Use an air temperature of at least 80 °F for this heat-index estimate.');
      const simple = 0.5 * (t + 61 + (t - 68) * 1.2 + humidity * 0.094);
      let heat = (simple + t) / 2;
      let method = 'NOAA Steadman-approximation heat index.';
      if (heat >= 80) {
        heat = -42.379 + 2.04901523*t + 10.14333127*humidity - 0.22475541*t*humidity - 0.00683783*t*t - 0.05481717*humidity*humidity + 0.00122874*t*t*humidity + 0.00085282*t*humidity*humidity - 0.00000199*t*t*humidity*humidity;
        if (humidity < 13 && t >= 80 && t <= 112) heat -= ((13-humidity)/4)*Math.sqrt((17-Math.abs(t-95))/17);
        if (humidity > 85 && t >= 80 && t <= 87) heat += ((humidity-85)/10)*((87-t)/5);
        method = 'NOAA Rothfusz-regression heat index.';
      }
      return result(`${format(heat, 1)} °F`, method, [{ label: 'Heat index Celsius', value: `${format((heat - 32) * 5 / 9, 1)} °C` }]);
    }
    if (slug === 'mass') {
      const density = numberAt(0), volume = numberAt(1);
      if (density === null || volume === null || density < 0 || volume < 0) return bad('Use finite nonnegative density and volume.');
      const kg = density * volumeToM3(volume, values[2]);
      return result(`${format(kg)} kg`, 'Material mass from density and volume.', [{ label: 'Grams', value: `${format(kg * 1000)} g` }, { label: 'Pounds', value: `${format(kg * 2.2046226218)} lb` }]);
    }
    if (slug === 'molarity') {
      const amount = numberAt(0), volume = numberAt(2);
      if (amount === null || volume === null || amount < 0 || volume <= 0) return bad('Use a nonnegative amount and final solution volume greater than zero.');
      const moles = values[1] === 'mmol' ? amount / 1000 : amount;
      const litres = values[3] === 'mL' ? volume / 1000 : volume;
      return result(`${format(moles / litres)} mol/L`, 'Amount concentration of the final solution.', [{ label: 'Millimoles per litre', value: `${format(moles / litres * 1000)} mmol/L` }]);
    }
    if (slug === 'speed-calculator') {
      const distance = numberAt(0), time = numberAt(2);
      if (distance === null || time === null || distance < 0 || time <= 0) return bad('Use a nonnegative distance and elapsed time greater than zero.');
      const km = values[1] === 'mi' ? distance * 1.609344 : values[1] === 'm' ? distance / 1000 : distance;
      const hours = values[3] === 'min' ? time / 60 : values[3] === 's' ? time / 3600 : time;
      const kph = km / hours;
      return result(`${format(kph)} km/h`, 'Average speed from distance and elapsed time.', [{ label: 'Miles per hour', value: `${format(kph / 1.609344)} mph` }, { label: 'Metres per second', value: `${format(kph / 3.6)} m/s` }]);
    }
    if (slug === 'wind-chill') {
      const temperature = numberAt(0), wind = numberAt(2);
      if (temperature === null || wind === null || wind <= 0) return bad('Use a valid temperature and wind speed greater than zero.');
      const f = toFahrenheit(temperature, values[1]);
      const mph = values[3] === 'kmh' ? wind / 1.609344 : wind;
      if (f > 50 || mph <= 3) return bad('The NWS formula applies at 50 °F or colder and wind above 3 mph.');
      const chill = 35.74 + 0.6215*f - 35.75*Math.pow(mph,0.16) + 0.4275*f*Math.pow(mph,0.16);
      return result(`${format(chill, 1)} °F`, 'NOAA/NWS wind-chill temperature.', [{ label: 'Wind chill Celsius', value: `${format((chill - 32) * 5 / 9, 1)} °C` }]);
    }
  } catch (error) {
    return bad(error instanceof Error ? error.message : 'The entered values could not be processed.');
  }
  return bad('This calculation is unavailable.');
}

export type PasswordOptions = { length: number; lower: boolean; upper: boolean; digits: boolean; symbols: boolean };
type RandomBytes = (length: number) => Uint8Array;
const passwordPools = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
} as const;

export function generateSecurePassword(options: PasswordOptions, randomBytes?: RandomBytes): PhaseThreeAResult {
  const entries = (Object.keys(passwordPools) as (keyof typeof passwordPools)[]).filter((key) => options[key]);
  if (!Number.isInteger(options.length) || options.length < 8 || options.length > 128) return bad('Password length must be a whole number from 8 to 128.');
  if (!entries.length) return bad('Select at least one character class.');
  if (options.length < entries.length) return bad('Length must allow at least one character from every selected class.');
  const source = randomBytes ?? ((length: number) => {
    if (!globalThis.crypto?.getRandomValues) throw new Error('Secure browser randomness is unavailable.');
    return globalThis.crypto.getRandomValues(new Uint8Array(length));
  });
  const secureIndex = (maximum: number) => {
    const limit = Math.floor(256 / maximum) * maximum;
    for (;;) {
      const value = source(1)[0];
      if (value < limit) return value % maximum;
    }
  };
  const alphabet = entries.map((key) => passwordPools[key]).join('');
  const characters = entries.map((key) => {
    const pool = passwordPools[key];
    return pool[secureIndex(pool.length)];
  });
  while (characters.length < options.length) characters.push(alphabet[secureIndex(alphabet.length)]);
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swap = secureIndex(index + 1);
    [characters[index], characters[swap]] = [characters[swap], characters[index]];
  }
  const password = characters.join('');
  return result(password, 'Generated locally with cryptographically secure browser randomness.', [
    { label: 'Length', value: String(options.length) },
    { label: 'Candidate alphabet', value: `${alphabet.length} characters` },
    { label: 'Maximum entropy estimate', value: `${format(options.length * Math.log2(alphabet.length), 1)} bits` },
  ]);
}