import { syncRegistrySeoCapabilities } from './seo-capabilities';

export const converterSlugs = ['unit', 'length', 'weight', 'temperature', 'speed'] as const;
export type ConverterSlug = typeof converterSlugs[number];
export type DedicatedConverterSlug = Exclude<ConverterSlug, 'unit'>;

type ConverterExample = {
  title: string;
  setup: string;
  result: string;
  explanation: string;
};

type ConverterFaq = {
  question: string;
  answer: string;
};

type ConverterLink = {
  slug: DedicatedConverterSlug;
  label: string;
  description: string;
};

export type ConverterContent = {
  slug: ConverterSlug;
  eyebrow: string;
  intro: string;
  valueLabel: string;
  defaultCategory: DedicatedConverterSlug;
  defaultValue: string;
  defaultFrom: string;
  defaultTo: string;
  seoTitle: string;
  seoDescription: string;
  purposeTitle: string;
  purpose: string[];
  formulaTitle: string;
  formulaIntro: string;
  formulas: string[];
  examples: ConverterExample[];
  guidanceTitle: string;
  guidance: string[];
  limitations: string[];
  faqs: ConverterFaq[];
  related: ConverterLink[];
};

const links: Record<DedicatedConverterSlug, ConverterLink> = {
  length: {
    slug: 'length',
    label: 'Convert lengths and distances',
    description: 'Move between metric and imperial units from millimeters through miles.',
  },
  weight: {
    slug: 'weight',
    label: 'Convert weight and mass units',
    description: 'Compare grams, kilograms, ounces, pounds, and stones.',
  },
  temperature: {
    slug: 'temperature',
    label: 'Convert temperature scales',
    description: 'Translate readings among Celsius, Fahrenheit, and Kelvin.',
  },
  speed: {
    slug: 'speed',
    label: 'Convert speeds',
    description: 'Compare km/h, mph, knots, and meters per second.',
  },
};

export const converterCalculatorContent: Record<ConverterSlug, ConverterContent> = {
  unit: {
    slug: 'unit',
    eyebrow: 'MULTI-CATEGORY CONVERTER',
    intro: 'Switch among ten measurement categories from one workspace: length, weight, temperature, speed, area, volume, liquid volume, energy, power, and fuel economy. Choose a category first, then select compatible source and destination units.',
    valueLabel: 'Value to convert',
    defaultCategory: 'length',
    defaultValue: '10',
    defaultFrom: 'meters',
    defaultTo: 'feet',
    seoTitle: 'Unit Converter for Everyday Measurements | FigureNest',
    seoDescription: 'Convert length, weight, temperature, speed, area, volume, liquid volume, energy, power, and fuel economy units in one workspace.',
    purposeTitle: 'One hub for everyday unit changes',
    purpose: [
      'Use this broad Unit Converter when you have a value and unit but need to decide which specialist conversion applies. The category control keeps incompatible dimensions separate: a length can become another length, but it cannot become a weight or temperature. That distinction prevents a common unit-conversion mistake.',
      'The hub covers ten measurement groups used in travel, shopping, weather, construction, cooking, vehicles, utilities, and technical specifications. Length, weight, temperature, and speed also have dedicated pages below with more focused guidance and examples.',
    ],
    formulaTitle: 'How the multi-category conversion works',
    formulaIntro: 'For most categories, FigureNest converts the source value to a shared base unit and then converts that base value to the destination unit. Temperature and fuel economy use scale-specific equations.',
    formulas: [
      'Factor conversion: destination value = source value × source factor ÷ destination factor.',
      'Length, weight, speed, area, volume, liquid volume, energy, and power each use an appropriate shared base unit.',
      'Temperature first converts the source scale to Celsius, then converts Celsius to the selected destination scale.',
      'Fuel economy accounts for reciprocal consumption units such as L/100 km as well as US MPG, imperial MPG, and km/L.',
      'Selecting the same source and destination unit returns the entered value, subject only to display formatting.',
    ],
    examples: [
      {
        title: 'Travel distance',
        setup: 'Convert 5 kilometers to miles.',
        result: '5 km = 3.11 miles',
        explanation: 'Five kilometers is divided by 1.609344, the number of kilometers in one international mile.',
      },
      {
        title: 'Luggage weight',
        setup: 'Convert 23 kilograms to pounds.',
        result: '23 kg = 50.71 pounds',
        explanation: 'This is useful when an airline lists a metric allowance but your luggage scale reads pounds.',
      },
      {
        title: 'Weather reading',
        setup: 'Convert 68°F to Celsius.',
        result: '68°F = 20°C',
        explanation: 'Subtract 32, then multiply by 5/9. Temperature is not a simple multiply-only conversion.',
      },
    ],
    guidanceTitle: 'Choose the right measurement category',
    guidance: [
      'Length is one-dimensional, area is squared, and volume is cubed. Liquid volume is for capacities such as litres and gallons. Energy describes an amount, while power describes the rate at which energy is used. Fuel economy compares distance-per-volume and volume-per-distance conventions.',
      'Keep the meaning and precision of the source measurement in mind. Converting a rounded label does not make it more accurate. A package marked 2 lb may have been rounded before conversion, so a long decimal in kilograms would imply false precision.',
    ],
    limitations: [
      'The hub does not convert pressure, currency, cooking measures such as teaspoons and cups, or data-storage units.',
      'Results are rounded for display, so repeated conversions may differ by a small final decimal.',
      'Weight labels are treated as mass conversions under standard gravity; the tool does not calculate force.',
      'Temperature inputs below absolute zero are rejected as physically impossible.',
    ],
    faqs: [
      {
        question: 'What categories can I convert in the Unit Converter?',
        answer: 'The hub converts length, weight, temperature, speed, area, volume, liquid volume, energy, power, and fuel economy. Choose a category first so only compatible measurements are compared.',
      },
      {
        question: 'Can I convert between different kinds of measurements?',
        answer: 'No. A unit conversion preserves the kind of quantity, so length converts only to length, area to area, energy to energy, power to power, and the same rule applies to every category.',
      },
      {
        question: 'Why does changing the category reset the units?',
        answer: 'Each category has a different valid unit list. The converter resets to a useful source and destination pair to prevent an old unit from being applied to an incompatible measurement.',
      },
      {
        question: 'How many decimal places does the result use?',
        answer: 'Results display up to two decimal places for quick everyday use. The underlying factors use more precision than the displayed result.',
      },
      {
        question: 'Should I use a dedicated converter instead?',
        answer: 'Use the dedicated length, weight, temperature, or speed converter when you want deeper guidance and examples for one of those categories. The hub is best for quick work across all ten.',
      },
    ],
    related: [links.length, links.weight, links.temperature, links.speed],
  },
  length: {
    slug: 'length',
    eyebrow: 'DISTANCE & DIMENSION CONVERTER',
    intro: 'Convert millimeters, centimeters, meters, inches, feet, yards, and miles for dimensions and distances. Use it for room measurements, product sizes, plans, travel distances, and metric–imperial comparisons.',
    valueLabel: 'Length or distance',
    defaultCategory: 'length',
    defaultValue: '10',
    defaultFrom: 'meters',
    defaultTo: 'feet',
    seoTitle: 'Length Converter — Metric & Imperial | FigureNest',
    seoDescription: 'Convert mm, cm, meters, inches, feet, yards, and miles with accurate metric and imperial factors, worked examples, and practical guidance.',
    purposeTitle: 'Convert dimensions without changing their meaning',
    purpose: [
      'Length describes a single dimension: how long, wide, high, deep, or far something is. This converter is designed for those one-dimensional measurements, from small millimeter product specifications to road distances measured in miles.',
      'Choose the unit attached to the original measurement rather than the unit you expect. For example, a room dimension written as 3.6 m should start in meters even if you need the answer in feet. Keeping the source unit explicit is the simplest way to avoid a factor-of-ten or factor-of-twelve error.',
    ],
    formulaTitle: 'Length conversion factors and formulas',
    formulaIntro: 'All conversions use the international meter as a shared base. Metric units scale by powers of ten, while imperial and US customary units use exact international definitions.',
    formulas: [
      '1 meter = 100 centimeters = 1,000 millimeters.',
      '1 inch = 25.4 millimeters exactly.',
      '1 foot = 12 inches = 0.3048 meters exactly.',
      '1 yard = 3 feet = 0.9144 meters exactly.',
      '1 international mile = 1,760 yards = 1.609344 kilometers exactly.',
    ],
    examples: [
      {
        title: 'Furniture dimension',
        setup: 'Convert a 180-centimeter desk length to inches.',
        result: '180 cm = 70.87 inches',
        explanation: 'Divide 180 by 2.54 because one inch contains exactly 2.54 centimeters.',
      },
      {
        title: 'Room measurement',
        setup: 'Convert a 4.2-meter wall to feet.',
        result: '4.2 m = 13.78 feet',
        explanation: 'Divide meters by 0.3048. For purchasing materials, keep extra precision until applying waste or pack-size rules.',
      },
      {
        title: 'Running distance',
        setup: 'Convert 10 kilometers to miles.',
        result: '10 km = 6.21 miles',
        explanation: 'A 10K route is about 6.21 international miles; course certification may use more precision than this display.',
      },
    ],
    guidanceTitle: 'When to use a length converter',
    guidance: [
      'Use length for individual sides or straight-line distance. If you are converting square feet to square meters, you need an area conversion because the linear factor must be squared. Cubic measurements similarly require a volume conversion, where the factor is cubed.',
      'Construction drawings and manufactured parts may require tighter tolerances than a two-decimal display. Keep the original specification and verify the required tolerance before cutting, machining, ordering, or certifying a dimension.',
    ],
    limitations: [
      'This page converts linear measurements, not square area or cubic volume.',
      'It uses the international foot, yard, and mile, not historical or survey variants.',
      'Displayed results are rounded to two decimal places and are not a tolerance specification.',
      'Map distance, curved paths, and scale drawings require additional context beyond unit conversion.',
    ],
    faqs: [
      {
        question: 'How many centimeters are in an inch?',
        answer: 'One international inch equals exactly 2.54 centimeters, or 25.4 millimeters.',
      },
      {
        question: 'How do I convert meters to feet?',
        answer: 'Divide the meter value by 0.3048, or multiply it by approximately 3.28084.',
      },
      {
        question: 'Can I use this for square feet to square meters?',
        answer: 'No. This converter is for linear length. Area conversions must square the linear factor, so they need a dedicated area conversion.',
      },
      {
        question: 'Why is a reverse conversion sometimes slightly different?',
        answer: 'The result is rounded for display. Re-entering that rounded number can lose some precision even though the underlying conversion factors are accurate.',
      },
      {
        question: 'Are nautical miles included?',
        answer: 'No. The miles option is the international statute mile used for land distance. Nautical miles are different and are associated with marine and aviation navigation.',
      },
    ],
    related: [links.weight, links.temperature, links.speed],
  },
  weight: {
    slug: 'weight',
    eyebrow: 'WEIGHT & MASS CONVERTER',
    intro: 'Convert grams, kilograms, ounces, pounds, and stones for food labels, shipping, luggage, body weight, and everyday metric–imperial comparisons.',
    valueLabel: 'Weight or mass',
    defaultCategory: 'weight',
    defaultValue: '10',
    defaultFrom: 'kilograms',
    defaultTo: 'pounds',
    seoTitle: 'Weight Converter — kg, lb, oz, g & Stone | FigureNest',
    seoDescription: 'Convert grams, kilograms, ounces, pounds, and stones using accurate factors, practical examples, and clear mass-conversion guidance.',
    purposeTitle: 'Compare scale readings and product weights',
    purpose: [
      'This converter handles the mass units commonly printed on packages and shown on household, shipping, luggage, kitchen, and body-weight scales. In everyday language these are called weight units, although kilograms and grams technically measure mass.',
      'Use the number exactly as shown with its source unit. Pay particular attention to ounces and fluid ounces: ounces here mean mass. A fluid ounce measures volume and cannot be converted to grams without knowing the substance and its density.',
    ],
    formulaTitle: 'Weight conversion factors',
    formulaIntro: 'The calculator uses grams as a shared base and the international avoirdupois definitions used for ordinary goods and body weight.',
    formulas: [
      '1 kilogram = 1,000 grams.',
      '1 international avoirdupois pound = 453.59237 grams exactly.',
      '1 avoirdupois ounce = 1/16 pound = 28.349523125 grams.',
      '1 stone = 14 pounds = 6.35029318 kilograms.',
      'Destination value = source value × source mass in grams ÷ destination mass in grams.',
    ],
    examples: [
      {
        title: 'Airline luggage',
        setup: 'Convert a 23-kilogram baggage allowance to pounds.',
        result: '23 kg = 50.71 pounds',
        explanation: 'Airlines enforce their published unit and scale reading, so treat the conversion as a guide rather than a reason to pack to the exact boundary.',
      },
      {
        title: 'Recipe ingredient',
        setup: 'Convert 8 ounces of flour by weight to grams.',
        result: '8 oz = 226.8 grams',
        explanation: 'This is a mass conversion. It does not apply to 8 US fluid ounces measured in a cup.',
      },
      {
        title: 'Body weight',
        setup: 'Convert 12 stone to pounds.',
        result: '12 st = 168 pounds',
        explanation: 'Multiply stones by 14. The pound result can then be converted to kilograms if needed.',
      },
    ],
    guidanceTitle: 'Mass, weight, and context',
    guidance: [
      'For normal Earth-based labels and scales, direct conversion between these units is appropriate. Scientific force calculations are different: weight force depends on local gravitational acceleration and is measured in newtons, not kilograms or pounds-mass.',
      'Shipping carriers may charge by dimensional weight rather than scale weight. This converter changes the unit of a measured mass only; it does not calculate billable weight, packaging allowances, or carrier rounding bands.',
    ],
    limitations: [
      'Fluid ounces are not included because they measure volume rather than mass.',
      'Troy ounces, used for precious metals, differ from the avoirdupois ounces used here.',
      'The converter does not calculate density, dimensional shipping weight, or gravitational force.',
      'Scale accuracy and product-label rounding limit the meaningful precision of the result.',
    ],
    faqs: [
      {
        question: 'How many pounds are in a kilogram?',
        answer: 'One kilogram is approximately 2.20462 international avoirdupois pounds.',
      },
      {
        question: 'Are ounces the same as fluid ounces?',
        answer: 'No. Ounces on this page measure mass. Fluid ounces measure volume, and converting them to grams requires the density of the ingredient or liquid.',
      },
      {
        question: 'How many pounds are in a stone?',
        answer: 'One stone equals exactly 14 international avoirdupois pounds.',
      },
      {
        question: 'Can I convert precious-metal ounces here?',
        answer: 'No. Gold and other precious metals commonly use troy ounces, which are heavier than the avoirdupois ounces used for ordinary goods.',
      },
      {
        question: 'Does this calculate shipping weight?',
        answer: 'It converts an existing scale weight between units. Carrier billable weight may instead use package dimensions, minimums, and carrier-specific rounding rules.',
      },
    ],
    related: [links.length, links.temperature, links.speed],
  },
  temperature: {
    slug: 'temperature',
    eyebrow: 'TEMPERATURE SCALE CONVERTER',
    intro: 'Convert temperatures among Celsius, Fahrenheit, and Kelvin for weather, cooking, science, equipment settings, and international specifications.',
    valueLabel: 'Temperature',
    defaultCategory: 'temperature',
    defaultValue: '20',
    defaultFrom: 'celsius',
    defaultTo: 'fahrenheit',
    seoTitle: 'Temperature Converter — °C, °F & Kelvin | FigureNest',
    seoDescription: 'Convert Celsius, Fahrenheit, and Kelvin with scale-specific formulas, worked examples, absolute-zero checks, and practical guidance.',
    purposeTitle: 'Translate scales with different zero points',
    purpose: [
      'Temperature conversion differs from most unit conversion because Celsius, Fahrenheit, and Kelvin do not share the same zero point. A temperature must be shifted as well as scaled. That is why doubling a Celsius reading does not double its Fahrenheit equivalent.',
      'Use this page for actual temperature readings such as weather, oven settings, refrigeration, laboratory conditions, and device specifications. Temperature intervals are a related but different idea: a change of 1°C equals a change of 1 K, while a change of 1°C equals a change of 1.8°F.',
    ],
    formulaTitle: 'Celsius, Fahrenheit, and Kelvin formulas',
    formulaIntro: 'FigureNest converts the source reading to Celsius as a common reference, then applies the destination scale equation.',
    formulas: [
      'Celsius to Fahrenheit: °F = (°C × 9/5) + 32.',
      'Fahrenheit to Celsius: °C = (°F − 32) × 5/9.',
      'Celsius to Kelvin: K = °C + 273.15.',
      'Kelvin to Celsius: °C = K − 273.15.',
      'Kelvin has no degree symbol; 0 K is absolute zero.',
    ],
    examples: [
      {
        title: 'Room temperature',
        setup: 'Convert 68°F to Celsius.',
        result: '68°F = 20°C',
        explanation: 'Subtract 32 from 68 and multiply the remainder by 5/9.',
      },
      {
        title: 'Oven setting',
        setup: 'Convert 180°C to Fahrenheit.',
        result: '180°C = 356°F',
        explanation: 'Multiply 180 by 9/5 and add 32. Real ovens may use rounded dial settings and cycle around the target.',
      },
      {
        title: 'Scientific temperature',
        setup: 'Convert 25°C to Kelvin.',
        result: '25°C = 298.15 K',
        explanation: 'Add 273.15. Celsius and Kelvin increments are the same size but start at different zero points.',
      },
    ],
    guidanceTitle: 'Read the result in context',
    guidance: [
      'Weather apps may round to a whole degree, while scientific measurements can require decimal precision and calibrated sensors. Converting a rounded source does not restore information that was not measured.',
      'Cooking conversions translate the stated temperature but cannot account for oven calibration, fan-assisted settings, rack position, cookware, or altitude. Follow safety guidance and check food doneness independently.',
    ],
    limitations: [
      'Values below absolute zero are physically impossible and are rejected.',
      'The calculator converts temperature readings, not heat energy or temperature intervals.',
      'Sensor accuracy, calibration, and source rounding are outside the calculation.',
      'Cooking equipment may require its own conventional rounded setting.',
      'A converted threshold should not be given more precision than its source. A weather observation reported to the nearest whole degree remains approximate after conversion, even when the formula produces decimal places.',
    ],
    faqs: [
      {
        question: 'What is the formula for Celsius to Fahrenheit?',
        answer: 'Multiply the Celsius temperature by 9/5, then add 32.',
      },
      {
        question: 'At what temperature are Celsius and Fahrenheit equal?',
        answer: 'The two scales show the same numerical value at −40: −40°C equals −40°F.',
      },
      {
        question: 'Why does Kelvin not use a degree symbol?',
        answer: 'Kelvin is an absolute thermodynamic scale. Its unit name and symbol are kelvin and K, without the word degree or a degree symbol.',
      },
      {
        question: 'What is absolute zero on each scale?',
        answer: 'Absolute zero is 0 K, −273.15°C, or −459.67°F.',
      },
      {
        question: 'Can I use the result as an exact oven setting?',
        answer: 'Use it as a temperature conversion, then choose the nearest available oven setting and account for fan-assisted guidance and the appliance’s calibration.',
      },
    ],
    related: [links.length, links.weight, links.speed],
  },
  speed: {
    slug: 'speed',
    eyebrow: 'TRAVEL & MOTION CONVERTER',
    intro: 'Convert kilometers per hour, miles per hour, knots, and meters per second for road travel, running, cycling, wind, marine use, aviation, and technical specifications.',
    valueLabel: 'Speed',
    defaultCategory: 'speed',
    defaultValue: '10',
    defaultFrom: 'kph',
    defaultTo: 'mph',
    seoTitle: 'Speed Converter — km/h, mph, Knots & m/s | FigureNest',
    seoDescription: 'Convert km/h, mph, knots, and meters per second with accurate factors, realistic examples, and guidance for travel, wind, and motion.',
    purposeTitle: 'Compare rates of distance over time',
    purpose: [
      'Speed combines a distance unit with a time unit. This page keeps the time basis explicit while translating common road, marine, aviation, weather, sports, and engineering readings. Use it when a speedometer, forecast, race plan, or specification uses a different convention from the one you know.',
      'A speed conversion does not change the motion itself; it only expresses the same rate in another unit. Average speed, instantaneous speed, ground speed, airspeed, and velocity can describe different real-world conditions even when they use the same units.',
    ],
    formulaTitle: 'Speed conversion factors',
    formulaIntro: 'The calculator uses kilometers per hour as a shared base. Each factor combines an exact distance relationship with the relevant hour-to-second relationship.',
    formulas: [
      '1 mile per hour = 1.609344 kilometers per hour exactly.',
      '1 meter per second = 3.6 kilometers per hour exactly.',
      '1 knot = 1 nautical mile per hour = 1.852 kilometers per hour exactly.',
      'Destination speed = source speed × source factor in km/h ÷ destination factor in km/h.',
    ],
    examples: [
      {
        title: 'Road speed',
        setup: 'Convert 100 km/h to mph.',
        result: '100 km/h = 62.14 mph',
        explanation: 'Divide by 1.609344. Posted limits still apply in the units shown on local signs.',
      },
      {
        title: 'Running pace reference',
        setup: 'Convert 5 meters per second to km/h.',
        result: '5 m/s = 18 km/h',
        explanation: 'Multiply by 3.6. This gives speed, not minutes-per-kilometer pace.',
      },
      {
        title: 'Marine speed',
        setup: 'Convert 20 knots to km/h.',
        result: '20 kn = 37.04 km/h',
        explanation: 'Multiply knots by 1.852, the exact number of kilometers in one nautical mile.',
      },
    ],
    guidanceTitle: 'Speed is not always pace or velocity',
    guidance: [
      'Runners often plan with pace, such as minutes per mile, which is the reciprocal of speed and is not provided here. Velocity also includes direction, while this converter handles the non-directional numerical speed only.',
      'For boats and aircraft, knots may describe speed through water or air, while GPS shows speed over ground. Wind, current, heading, and instrument method can produce different readings; unit conversion alone cannot reconcile them.',
    ],
    limitations: [
      'This page does not convert running pace or calculate journey time and distance.',
      'It does not distinguish indicated, true, air, water, or ground speed.',
      'Negative speed inputs are rejected because the tool does not represent direction.',
      'Displayed rounding may be unsuitable for calibration or safety-critical navigation.',
    ],
    faqs: [
      {
        question: 'How do I convert km/h to mph?',
        answer: 'Divide kilometers per hour by 1.609344. For a quick estimate, multiply by about 0.621371.',
      },
      {
        question: 'How many km/h is one meter per second?',
        answer: 'One meter per second equals exactly 3.6 kilometers per hour.',
      },
      {
        question: 'What is a knot?',
        answer: 'A knot is one nautical mile per hour. One knot equals exactly 1.852 km/h.',
      },
      {
        question: 'Can this convert running speed to pace?',
        answer: 'No. Pace is time per distance and requires a reciprocal calculation, such as minutes per kilometer or minutes per mile.',
      },
      {
        question: 'Does converting a speed account for wind or current?',
        answer: 'No. It expresses the same numerical rate in another unit. Wind, current, heading, and measurement method must be handled separately.',
      },
    ],
    related: [links.length, links.weight, links.temperature],
  },
};
syncRegistrySeoCapabilities(converterCalculatorContent);

export const isConverterCalculatorSlug = (value?: string): value is ConverterSlug =>
  converterSlugs.includes(value as ConverterSlug);