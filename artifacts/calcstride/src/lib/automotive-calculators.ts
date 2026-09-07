import { coreFields, type CoreField } from './core-calculators';
import { syncRegistrySeoCapabilities } from './seo-capabilities';

export const automotiveCalculatorSlugs = ['fuel-cost', 'fuel-economy', 'ev-charging-cost', 'ev-charging-time'] as const;
export type AutomotiveCalculatorSlug = typeof automotiveCalculatorSlugs[number];

type AutomotiveExample = {
  title: string;
  inputs: string;
  working: string;
  result: string;
  interpretation: string;
};

type AutomotiveLink = {
  slug: string;
  label: string;
  context: string;
};

export type AutomotiveCalculatorContent = {
  slug: AutomotiveCalculatorSlug;
  title: string;
  titleLines: readonly [string, string];
  description: string;
  seoTitle: string;
  seoDescription: string;
  fields: readonly CoreField[];
  converter?: { value: string; from: string; to: string };
  resultLabel: string;
  resultSummary: string;
  updatedNote: string;
  purposeTitle: string;
  purpose: string[];
  distinction: string;
  formula: string;
  formulaExplanation: string;
  examples: AutomotiveExample[];
  interpretation: string[];
  assumptions: string[];
  commonMistakes: string[];
  edgeCases: { title: string; explanation: string }[];
  limitations: string;
  faqs: { question: string; answer: string }[];
  relatedTools: AutomotiveLink[];
};

const fuelCost: AutomotiveCalculatorContent = {
  slug: 'fuel-cost',
  title: 'Fuel Cost Calculator',
  titleLines: ['Trip Fuel Cost', 'Calculator'],
  description: 'Estimate trip fuel use and spending with selectable miles or kilometres, MPG or L/100 km, litres or gallons, and price denomination.',
  seoTitle: 'Fuel Cost Calculator — Trip Gas Cost | FigureNest',
  seoDescription: 'Estimate trip fuel use and gas cost from miles, US MPG, and price per gallon. See cost per mile, formulas, examples, and planning limitations.',
  fields: coreFields['fuel-cost'],
  resultLabel: 'ESTIMATED TRIP FUEL COST',
  resultSummary: 'This estimate applies one average efficiency figure and one fuel-unit price to the full trip distance.',
  updatedNote: 'MILES OR KM · MPG OR L/100 KM · LITRES OR GALLONS',
  purposeTitle: 'Use fuel cost to budget a specific trip',
  purpose: [
    'Use this calculator when you know how far you expect to drive, your vehicle’s average fuel economy, and the expected price per litre or gallon. It estimates fuel consumed, total fuel spend, and fuel cost per mile or kilometre.',
    'It is a trip-cost tool rather than only an efficiency converter. Select US MPG, imperial MPG, L/100 km, or km/L directly; use Fuel Economy when you only need to translate a rating.',
  ],
  distinction: 'Fuel Cost combines distance, efficiency, liquid volume, and fuel price to estimate trip spending. Fuel Economy only converts efficiency units. EV Charging Cost prices electrical energy added to a battery, while EV Charging Time estimates ideal duration from energy and charger power.',
  formula: 'Trip cost = converted fuel used × price per selected liquid unit',
  formulaExplanation: 'The selected distance and efficiency are normalized to one consistent fuel-use rate. The tool then expresses consumption in litres, US gallons, or imperial gallons and multiplies by the entered price for that unit.',
  examples: [
    { title: 'Highway trip', inputs: '320 miles, 28 MPG, and $3.65 per gallon', working: '320 ÷ 28 = 11.43 gallons; 11.43 × $3.65', result: '$41.71 fuel cost and about $0.13 per mile', interpretation: 'This is a fuel-only estimate; tolls, parking, lodging, and vehicle wear are separate.' },
    { title: 'Efficient commuter', inputs: '150 miles, 42 MPG, and $3.40 per gallon', working: '150 ÷ 42 = 3.57 gallons; 3.57 × $3.40', result: '$12.14 fuel cost and about $0.08 per mile', interpretation: 'Higher MPG lowers gallons and cost when distance and fuel price stay fixed.' },
  ],
  interpretation: [
    'Treat the result as a planning estimate. Actual MPG can fall with congestion, cold starts, roof loads, towing, steep grades, high speed, or aggressive acceleration.',
    'For a round trip, enter the complete round-trip distance. For comparing vehicles, keep distance and fuel price fixed and change only the efficiency rating.',
  ],
  assumptions: [
    'Distance, efficiency, liquid volume, and price use the units and denomination selected above the inputs.',
    'Average fuel economy and fuel price remain constant for the full trip.',
    'The trip starts and ends without adding detours, idling, or separate fuel-consuming use.',
    'The estimate covers fuel only, not other vehicle or travel costs.',
  ],
  commonMistakes: [
    'Selecting US MPG when the source rating uses an imperial gallon, or selecting MPG when the source is L/100 km.',
    'Entering one-way distance when budgeting a round trip.',
    'Using a best-case highway rating for mixed or city driving.',
    'Entering total fill-up price instead of price for one selected litre or gallon.',
  ],
  edgeCases: [
    { title: 'Zero distance', explanation: 'No trip fuel is modeled, so gallons and fuel cost are zero.' },
    { title: 'Zero MPG', explanation: 'Fuel use would require division by zero, so the calculator returns an error.' },
    { title: 'Zero fuel price', explanation: 'Gallons are still estimated, but the calculated monetary cost is zero.' },
  ],
  limitations: 'This calculator does not predict live pump prices, currency exchange rates, route elevation, traffic, weather, idling, towing, seasonal fuel blends, or vehicle-specific efficiency. It does not include tolls, maintenance, depreciation, or plug-in charging.',
  faqs: [
    { question: 'How do I calculate fuel cost for a trip?', answer: 'Convert distance and efficiency to a consistent basis, calculate fuel used, then multiply by the price per selected litre or gallon.' },
    { question: 'Should I enter one-way or round-trip distance?', answer: 'Enter the total distance you want to budget. Add both directions when planning a round trip.' },
    { question: 'Can I use L/100 km in this calculator?', answer: 'Yes. Select L/100 km for efficiency and kilometres for distance; the tool also supports US MPG, imperial MPG, and km/L.' },
    { question: 'Why can actual fuel cost be different?', answer: 'Actual MPG and pump prices vary with traffic, speed, weather, terrain, vehicle load, driving style, and where you refuel.' },
    { question: 'Does this include tolls or vehicle wear?', answer: 'No. The result covers estimated fuel only.' },
  ],
  relatedTools: [
    { slug: 'fuel-economy', label: 'Convert an efficiency rating before estimating cost', context: 'Change among US MPG, imperial MPG, L/100 km, and km/L without changing the route or trip.' },
    { slug: 'ev-charging-cost', label: 'Compare fuel spend with EV charging energy cost', context: 'Estimate the electricity cost of adding a chosen percentage to an EV battery.' },
    { slug: 'speed', label: 'Convert road speeds between mph and km/h', context: 'Use the Speed Converter when route information uses a different speed unit.' },
  ],
};

const fuelEconomy: AutomotiveCalculatorContent = {
  slug: 'fuel-economy',
  title: 'Fuel Economy Converter',
  titleLines: ['Fuel Economy', 'Converter'],
  description: 'Convert vehicle efficiency among US MPG, imperial MPG, litres per 100 kilometres, and kilometres per litre.',
  seoTitle: 'Fuel Economy Converter — MPG & L/100 km | FigureNest',
  seoDescription: 'Convert fuel economy among US MPG, L/100 km, and km/L with reciprocal formulas, examples, interpretation, and zero-value safeguards.',
  fields: [],
  converter: { value: '25', from: 'mpg', to: 'l100km' },
  resultLabel: 'CONVERTED FUEL ECONOMY',
  resultSummary: 'MPG rises as fuel use improves, while L/100 km falls, so these conversions are reciprocal rather than linear.',
  updatedNote: 'US MPG · IMPERIAL MPG · L/100 KM · KM/L',
  purposeTitle: 'Use fuel economy to compare efficiency units',
  purpose: [
    'Use this converter when vehicle ratings, trip reports, or markets express fuel efficiency in different systems. It translates the same efficiency among US MPG, imperial MPG, L/100 km, and km/L.',
    'This tool does not estimate trip fuel or spending. After conversion, use Fuel Cost to apply the selected efficiency rating to a trip distance and fuel-unit price.',
  ],
  distinction: 'Fuel Economy converts how efficiency is expressed and has no trip distance or price input. Fuel Cost estimates gasoline spending. EV Charging Cost estimates electricity expense, and EV Charging Time estimates ideal charging duration.',
  formula: 'L/100 km = 235.214583 ÷ US MPG; imperial MPG = US MPG × 1.2009499255',
  formulaExplanation: 'MPG and L/100 km move in opposite directions, so those conversions are reciprocal. US and imperial MPG also differ because a US gallon is 3.785411784 litres and an imperial gallon is 4.54609 litres.',
  examples: [
    { title: 'US rating to metric consumption', inputs: '25 US MPG', working: '235.214583 ÷ 25', result: '9.41 L/100 km', interpretation: 'A lower L/100 km result indicates less fuel consumed over the same 100 km.' },
    { title: 'Metric rating to US MPG', inputs: '7.5 L/100 km', working: '235.214583 ÷ 7.5', result: '31.36 US MPG', interpretation: 'This is a US-gallon result; imperial MPG would be numerically higher.' },
    { title: 'Kilometers per liter', inputs: '20 km/L', working: '100 ÷ 20', result: '5 L/100 km', interpretation: 'Both values describe the same consumption rate in different metric conventions.' },
  ],
  interpretation: [
    'Higher US MPG, imperial MPG, and km/L mean better efficiency. Lower L/100 km means better efficiency. Compare vehicles only after confirming the gallon standard and test cycle.',
    'Display rounding can make an immediate reverse conversion differ slightly in the final decimal. The underlying reciprocal constants retain more precision than the displayed value.',
  ],
  assumptions: [
    'The selected MPG option determines whether the gallon is US or imperial.',
    'The input represents an average efficiency rate rather than one instantaneous reading.',
    'Conversions describe equivalent units and do not adjust for different laboratory test cycles.',
    'Displayed results round to two decimal places where needed.',
  ],
  commonMistakes: [
    'Assuming a higher L/100 km number means better efficiency.',
    'Mixing US MPG with imperial MPG.',
    'Treating MPG-to-L/100 km as a fixed multiplication instead of a reciprocal conversion.',
    'Using a converted rating as a prediction of real-world trip fuel consumption.',
  ],
  edgeCases: [
    { title: 'A zero value', explanation: 'Reciprocal fuel-economy conversion is undefined at zero, so the calculator returns an error.' },
    { title: 'Same source and destination', explanation: 'The value is returned unchanged apart from display formatting.' },
    { title: 'Very small positive inputs', explanation: 'They imply extremely high consumption in reciprocal units and are limited to keep output meaningful.' },
  ],
  limitations: 'The converter does not compare regulatory test cycles, predict real-world efficiency, or account for driving conditions and vehicle load. It converts mathematical unit equivalents only; manufacturer ratings from different regions may not be directly comparable.',
  faqs: [
    { question: 'How do I convert US MPG to L/100 km?', answer: 'Divide 235.214583 by US MPG. For example, 25 US MPG is about 9.41 L/100 km.' },
    { question: 'Is lower L/100 km better?', answer: 'Yes. L/100 km measures fuel consumed for a fixed distance, so a lower number means less fuel use.' },
    { question: 'Is US MPG the same as imperial MPG?', answer: 'No. An imperial gallon is larger, so the same vehicle produces a higher imperial MPG number. Select the correct MPG standard before converting.' },
    { question: 'Why can’t fuel economy be zero?', answer: 'These conversions use reciprocal division. A zero efficiency input would require division by zero and has no finite converted value.' },
    { question: 'Does converting a rating predict actual fuel use?', answer: 'No. It preserves the unit-equivalent rate; real fuel use depends on route, weather, load, traffic, and driving style.' },
  ],
  relatedTools: [
    { slug: 'fuel-cost', label: 'Apply an efficiency rating to a trip and fuel price', context: 'Estimate litres or gallons, total fuel cost, and cost per mile or kilometre.' },
    { slug: 'speed', label: 'Translate mph and km/h for road comparisons', context: 'Convert speed units when comparing specifications or routes across markets.' },
    { slug: 'ev-charging-cost', label: 'Estimate electricity cost for an EV charge', context: 'Use battery energy and electricity price instead of liquid-fuel efficiency.' },
  ],
};

const evChargingCost: AutomotiveCalculatorContent = {
  slug: 'ev-charging-cost',
  title: 'EV Charging Cost Calculator',
  titleLines: ['EV Charging Cost', 'Calculator'],
  description: 'Estimate battery energy added and electricity cost from EV battery capacity, charge percentage, and price per kilowatt-hour.',
  seoTitle: 'EV Charging Cost Calculator — kWh Price | FigureNest',
  seoDescription: 'Estimate EV charging cost from battery capacity, percentage added, and electricity price per kWh. See energy added, formulas, and examples.',
  fields: coreFields['ev-charging-cost'],
  resultLabel: 'ESTIMATED CHARGING ENERGY COST',
  resultSummary: 'This is battery energy multiplied by the electricity price entered; real wall energy can be higher because charging has losses.',
  updatedNote: 'BATTERY KWH · CHARGE ADDED · ENERGY PRICE',
  purposeTitle: 'Use charging cost to price energy added to a battery',
  purpose: [
    'Use this calculator to estimate the electricity value of charging an EV by a chosen percentage of its usable battery capacity. It reports estimated battery energy added, charging cost, and the modeled cost of a full battery.',
    'It is an energy-cost estimate rather than a charging-time or driving-range forecast. Use EV Charging Time when you know the required kWh and charger power.',
  ],
  distinction: 'EV Charging Cost multiplies battery energy by an electricity rate. EV Charging Time divides energy by charger power. Fuel Cost applies gasoline efficiency to a trip, while Fuel Economy only converts efficiency units.',
  formula: 'Charging cost = Battery capacity × (Charge added ÷ 100) × Electricity price per kWh',
  formulaExplanation: 'Battery capacity multiplied by the percentage added gives battery energy in kWh. Multiplying that energy by the entered electricity rate gives the idealized energy cost. A full-charge equivalent is capacity multiplied by price per kWh.',
  examples: [
    { title: 'Home overnight charge', inputs: '75 kWh battery, 80% added, and $0.32/kWh', working: '75 × 0.80 = 60 kWh; 60 × $0.32', result: '$19.20 estimated energy cost', interpretation: 'A full 75 kWh at the same rate would cost $24 before charging losses.' },
    { title: 'Smaller top-up', inputs: '60 kWh battery, 25% added, and $0.18/kWh', working: '60 × 0.25 = 15 kWh; 15 × $0.18', result: '$2.70 estimated energy cost', interpretation: 'This models energy stored in the battery, not every kWh drawn from the wall.' },
  ],
  interpretation: [
    'Compare rates on the same basis. Public charging prices may include session, parking, time, membership, or tax charges beyond an energy-only $/kWh rate.',
    'Charging losses commonly make grid energy greater than battery energy added. This calculator intentionally preserves the existing ideal battery-energy model and states that limitation rather than guessing an efficiency.',
  ],
  assumptions: [
    'Battery capacity is usable kWh and the percentage represents capacity added, not the ending state of charge.',
    'The electricity rate remains constant for the session.',
    'The estimate values energy stored in the battery and assumes no charging loss.',
    'The rate uses the selected energy unit and EUR, USD, GBP, or ZAR display denomination.',
  ],
  commonMistakes: [
    'Entering ending charge percentage instead of the percentage actually added.',
    'Entering a subunit rate such as cents or pence as a major-unit rate—for example entering 32 instead of 0.32.',
    'Assuming battery capacity always equals energy drawn from the wall.',
    'Ignoring public-network session, parking, time, or membership fees.',
  ],
  edgeCases: [
    { title: 'A 0% top-up', explanation: 'No battery energy is added, so the estimated energy cost is zero.' },
    { title: 'More than 100%', explanation: 'A single charge cannot add more than one full battery capacity, so the calculator returns an error.' },
    { title: 'A zero electricity price', explanation: 'Energy added is still shown while the modeled energy cost is zero.' },
  ],
  limitations: 'The estimate excludes charging losses, battery thermal management, auxiliary loads, tapering, taxes, demand charges, idle fees, parking, subscriptions, and time-of-use changes during a session. Actual billed grid energy and network pricing can therefore be higher.',
  faqs: [
    { question: 'How is EV charging cost calculated?', answer: 'Multiply battery capacity by the percentage added, then multiply the resulting kWh by the electricity price per kWh.' },
    { question: 'Does this include charging losses?', answer: 'No. It prices ideal battery energy added. Real energy drawn from the wall is often higher.' },
    { question: 'What does charge added mean?', answer: 'It is the percentage-point increase relative to full usable battery capacity, such as adding 60% by charging from 20% to 80%.' },
    { question: 'Should I enter cents, pence, or the major currency unit?', answer: 'Enter the major unit shown by the selected denomination. For example, a rate of 32 cents per kWh should be entered as 0.32.' },
    { question: 'Are public charging fees included?', answer: 'Only if they are already represented in the per-kWh rate. Session, parking, idle, time, tax, or membership charges are not added separately.' },
  ],
  relatedTools: [
    { slug: 'ev-charging-time', label: 'Estimate ideal time for the same energy amount', context: 'Divide required battery energy by charger power to estimate hours.' },
    { slug: 'fuel-cost', label: 'Compare with liquid-fuel trip spending', context: 'Estimate litres or gallons and fuel cost for a selected distance and efficiency unit.' },
    { slug: 'power', label: 'Convert vehicle power between kW and horsepower', context: 'Use the Power Converter for motor or engine ratings, not charger energy cost.' },
  ],
};

const evChargingTime: AutomotiveCalculatorContent = {
  slug: 'ev-charging-time',
  title: 'EV Charging Time Calculator',
  titleLines: ['EV Charging Time', 'Calculator'],
  description: 'Estimate ideal EV charging duration by dividing battery energy needed in kilowatt-hours by charger power in kilowatts.',
  seoTitle: 'EV Charging Time Calculator — kWh & kW | FigureNest',
  seoDescription: 'Estimate ideal EV charging time from energy needed in kWh and charger power in kW. See hours, minutes, formulas, examples, and real-world limits.',
  fields: coreFields['ev-charging-time'],
  resultLabel: 'IDEAL CHARGING TIME',
  resultSummary: 'This ideal energy ÷ power result assumes constant full rated power; real charging usually takes longer.',
  updatedNote: 'ENERGY NEEDED ÷ CHARGER POWER',
  purposeTitle: 'Use charging time to compare energy with power',
  purpose: [
    'Use this calculator when you know how many kilowatt-hours the battery needs and the sustained charging power available. It estimates ideal hours and minutes at constant power.',
    'Energy and power are different: kWh measures an amount of energy, while kW measures the rate of delivery. Use EV Charging Cost when the question is price rather than duration.',
  ],
  distinction: 'EV Charging Time divides required kWh by charging kW. EV Charging Cost multiplies energy by a price per kWh. Fuel Cost prices gasoline for a trip, and Fuel Economy converts efficiency ratings.',
  formula: 'Ideal charging time (hours) = Energy needed (kWh) ÷ Charger power (kW)',
  formulaExplanation: 'A kilowatt is one kilowatt-hour delivered per hour, so dividing energy by power gives hours. The calculator also translates the decimal duration into approximate hours and minutes. It assumes the vehicle accepts the entered power continuously.',
  examples: [
    { title: 'Home wallbox', inputs: '52 kWh needed and an 11 kW charger', working: '52 ÷ 11', result: '4.73 hours, or about 4 hours 44 minutes', interpretation: 'Actual time may be longer because the car may draw less than 11 kW or use energy for battery conditioning.' },
    { title: 'DC fast-charge segment', inputs: '45 kWh needed at an average 100 kW', working: '45 ÷ 100', result: '0.45 hours, or about 27 minutes', interpretation: 'Use realistic average power, not only the charger’s peak label, because charging power tapers.' },
  ],
  interpretation: [
    'The entered power should be the lower practical limit among charger output, vehicle acceptance rate, electrical supply, and session conditions.',
    'Fast-charging power is rarely constant. For a better planning estimate, use an observed average kW across the intended state-of-charge window.',
  ],
  assumptions: [
    'Energy needed is battery energy in kWh and charging power is sustained kW.',
    'Power remains constant from start to finish.',
    'The vehicle can accept the full entered charger power.',
    'No charging loss, tapering, thermal conditioning, or shared-site power reduction is included.',
  ],
  commonMistakes: [
    'Dividing full battery capacity when only a partial top-up is needed.',
    'Using the charger’s peak rating when the vehicle accepts less power.',
    'Confusing kW power with kWh energy.',
    'Treating the ideal result as a guaranteed departure time without a buffer.',
  ],
  edgeCases: [
    { title: 'Zero energy needed', explanation: 'No charging time is required, so the ideal duration is zero.' },
    { title: 'Zero charger power', explanation: 'Time would require division by zero, so the calculator returns an error.' },
    { title: 'Very high advertised power', explanation: 'The result is only meaningful if the vehicle and site can sustain that rate.' },
  ],
  limitations: 'This ideal estimate excludes charging taper, battery temperature, conversion losses, battery management, auxiliary use, charger sharing, voltage/current limits, session startup, and interruptions. Use vehicle or charging-network estimates for a specific real session.',
  faqs: [
    { question: 'How do I calculate EV charging time?', answer: 'Divide the battery energy needed in kWh by the sustained charging power in kW.' },
    { question: 'Why is real charging slower than the calculation?', answer: 'Vehicles may limit power, charging tapers as the battery fills, and some energy is lost or used for thermal management.' },
    { question: 'What is the difference between kW and kWh?', answer: 'kW is a rate of power delivery. kWh is an amount of energy. Time in hours equals kWh divided by kW.' },
    { question: 'Should I use peak or average charger power?', answer: 'Use realistic average power over the charging window. Peak power may occur only briefly.' },
    { question: 'How do I find energy needed for a partial charge?', answer: 'Multiply usable battery capacity by the percentage of capacity being added. The EV Charging Cost Calculator performs that energy step and prices it.' },
  ],
  relatedTools: [
    { slug: 'ev-charging-cost', label: 'Price the battery energy needed', context: 'Estimate kWh added and electricity cost from battery capacity and charge percentage.' },
    { slug: 'power', label: 'Convert power ratings between kW and horsepower', context: 'Translate motor or engine output; remember charging energy still uses kWh.' },
    { slug: 'fuel-cost', label: 'Compare with gasoline trip fuel cost', context: 'Estimate gallons and fuel spending for a conventional-vehicle trip.' },
  ],
};

export const automotiveCalculatorContent: Record<AutomotiveCalculatorSlug, AutomotiveCalculatorContent> = {
  'fuel-cost': fuelCost,
  'fuel-economy': fuelEconomy,
  'ev-charging-cost': evChargingCost,
  'ev-charging-time': evChargingTime,
};
syncRegistrySeoCapabilities(automotiveCalculatorContent);

export const isAutomotiveCalculatorSlug = (slug: string): slug is AutomotiveCalculatorSlug =>
  slug in automotiveCalculatorContent;