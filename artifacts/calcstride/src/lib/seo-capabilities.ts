export type CalculatorSeoCapability = {
  seoTitle: string;
  seoDescription: string;
  visibleNote: string;
};

const moneyNote = 'Choose EUR, USD, GBP, or ZAR for display. Switching denomination changes formatting only; it is not live foreign-exchange conversion.';
const businessMoneyNote = 'Set prices in EUR, USD, GBP, or ZAR for the comparison. The selector changes denomination and formatting only, not the entered value or an exchange rate.';
const payMoneyNote = 'Pay can be shown in EUR, USD, GBP, or ZAR. This is a denomination and formatting choice, not an exchange-rate conversion.';
const automotiveMoneyNote = 'Enter the price in EUR, USD, GBP, or ZAR. Currency changes the label and formatting only; it does not fetch live FX rates.';
const constructionMoneyNote = 'Set material prices in EUR, USD, GBP, or ZAR. The choice formats the same entered price; it does not convert it with exchange rates.';

export const calculatorSeoCapabilities: Record<string, CalculatorSeoCapability> = {
  electricity: {
    seoTitle: 'Electricity Cost Calculator — kWh & Price | FigureNest',
    seoDescription: 'Estimate appliance kWh and energy cost with EUR, USD, GBP, or ZAR formatting from power, daily use, days, and price; currency is not live FX.',
    visibleNote: 'Enter power in W or kW and price per kWh in EUR, USD, GBP, or ZAR. Currency changes formatting only; it is not live foreign-exchange conversion.',
  },
  'ohms-law': {
    seoTitle: 'Ohm’s Law Calculator — Voltage, Current & Resistance',
    seoDescription: 'Solve voltage, current, resistance, or power from two known electrical values using V = I × R and P = V × I, with explicit zero checks.',
    visibleNote: 'Enter values in volts, amperes, ohms, or watts as named by the selected operation; convert milli- and kilo-prefixes before calculation.',
  },
  density: {
    seoTitle: 'Density Calculator — Mass ÷ Volume | FigureNest',
    seoDescription: 'Calculate density from mass and volume in kg, g, m³, litres, or cm³, with normalized kg/m³ and g/cm³ results and explicit unit conversion.',
    visibleNote: 'Mass is normalized to kilograms and volume to cubic metres; the result also shows grams per cubic centimetre for comparison.',
  },
  'dew-point': {
    seoTitle: 'Dew Point Calculator — Temperature & Humidity',
    seoDescription: 'Estimate dew point in Celsius and Fahrenheit from air temperature and relative humidity using the Magnus approximation and validated ranges.',
    visibleNote: 'Choose Celsius or Fahrenheit for air temperature and enter relative humidity above 0% through 100%; the formula normalizes temperature to Celsius.',
  },
  horsepower: {
    seoTitle: 'Horsepower Calculator — Torque & RPM | FigureNest',
    seoDescription: 'Calculate mechanical engine horsepower and kilowatts from torque in lb-ft or N·m and rotational speed in RPM, with transparent conversion factors.',
    visibleNote: 'Torque is normalized from lb-ft or N·m to pound-feet before calculating mechanical horsepower; kilowatts are shown as a derived comparison.',
  },
  'heat-index': {
    seoTitle: 'Heat Index Calculator — NOAA Formula | FigureNest',
    seoDescription: 'Estimate NOAA heat index in Fahrenheit and Celsius from air temperature and relative humidity within the Rothfusz regression range.',
    visibleNote: 'Choose Celsius or Fahrenheit and enter relative humidity; the NOAA regression is evaluated in °F and applies from 80 °F and 40% humidity.',
  },
  mass: {
    seoTitle: 'Mass Calculator — Density × Volume | FigureNest',
    seoDescription: 'Calculate material mass in kilograms, grams, and pounds from density in kg/m³ and volume in m³, litres, or cm³ with explicit conversion.',
    visibleNote: 'Density uses kg/m³ and volume is normalized from cubic metres, litres, or cubic centimetres before mass is shown in kg, g, and lb.',
  },
  molarity: {
    seoTitle: 'Molarity Calculator — Moles per Litre | FigureNest',
    seoDescription: 'Calculate molarity in mol/L from moles or millimoles of solute and final solution volume in litres or millilitres, with validated units.',
    visibleNote: 'Amount is normalized to moles and final solution volume to litres; this tool does not derive moles from mass or molar mass.',
  },
  'speed-calculator': {
    seoTitle: 'Speed Calculator — Distance ÷ Time | FigureNest',
    seoDescription: 'Calculate average speed from distance and elapsed time in metric or imperial units, with results in km/h, mph, and metres per second.',
    visibleNote: 'Distance is normalized from km, miles, or metres and elapsed time from hours, minutes, or seconds before average speed is calculated.',
  },
  'wind-chill': {
    seoTitle: 'Wind Chill Calculator — NOAA/NWS Formula',
    seoDescription: 'Estimate NOAA/NWS wind chill in Fahrenheit and Celsius from cold air temperature and wind speed in mph or km/h within official limits.',
    visibleNote: 'Choose °F or °C and mph or km/h; the official formula is evaluated in °F and mph at 50 °F or colder with wind above 3 mph.',
  },
  btu: {
    seoTitle: 'BTU Calculator — Heating and Cooling | FigureNest',
    seoDescription: 'Estimate room capacity in BTU/h from floor area in square feet and a chosen BTU-per-square-foot planning factor, with sizing limitations.',
    visibleNote: 'Enter floor area in square feet and a BTU/h-per-square-foot factor; the output is thermal capacity in BTU/h, not electricity use or energy consumed.',
  },
  'voltage-drop': {
    seoTitle: 'Voltage Drop Calculator | FigureNest',
    seoDescription: 'Estimate voltage drop in volts from amperes, one-way conductor length in feet, resistance per 1,000 feet, and single- or three-phase configuration.',
    visibleNote: 'Enter current in amperes, one-way length in feet, and conductor resistance in ohms per 1,000 feet; verify wire data and code requirements before design use.',
  },
  'percent-off': {
    seoTitle: 'Percent Off Calculator | FigureNest',
    seoDescription: 'Calculate sale price and savings with EUR, USD, GBP, or ZAR formatting from an original price and discount percent; currency is not live FX conversion.',
    visibleNote: moneyNote,
  },
  'time-card': {
    seoTitle: 'Time Card Calculator — Hours & Gross Pay | FigureNest',
    seoDescription: 'Calculate paid shift hours and gross pay with EUR, USD, GBP, or ZAR formatting after an unpaid break; currency is not live FX conversion.',
    visibleNote: payMoneyNote,
  },
  percentage: {
    seoTitle: 'Percentage Calculator — Find Any Percent | FigureNest',
    seoDescription: 'Calculate any percentage of a number instantly, with a clear formula and result breakdown for discounts, tips, taxes, budgets, and everyday comparisons.',
    visibleNote: 'Enter a percentage and a value to find the proportional amount; for increases, decreases, or reverse percentages, use the Percentage Change Calculator.',
  },
  loan: {
    seoTitle: 'Loan Payment Calculator | FigureNest',
    seoDescription: 'Calculate loan payments, interest, and repayment in EUR, USD, GBP, or ZAR formatting. Compare fixed-rate amounts and terms; currency is not live FX conversion.',
    visibleNote: moneyNote,
  },
  mortgage: {
    seoTitle: 'Mortgage Payment Calculator | FigureNest',
    seoDescription: 'Estimate mortgage payments with tax and insurance in EUR, USD, GBP, or ZAR formatting. Compare terms and down payments; currency is not live FX conversion.',
    visibleNote: moneyNote,
  },
  'auto-loan': {
    seoTitle: 'Auto Loan Calculator — Payment & Total Cost | FigureNest',
    seoDescription: 'Estimate an auto loan payment in EUR, USD, GBP, or ZAR formatting, including price, down payment, trade-in, tax, fees, rate, and term; no live FX.',
    visibleNote: moneyNote,
  },
  'interest-rate': {
    seoTitle: 'Interest Rate Calculator — Estimate Loan Rate | FigureNest',
    seoDescription: 'Estimate the loan rate implied by principal, monthly payment, and term with amounts formatted in EUR, USD, GBP, or ZAR; currency is not live FX.',
    visibleNote: moneyNote,
  },
  'mortgage-amortization': {
    seoTitle: 'Mortgage Amortization Calculator | FigureNest',
    seoDescription: 'Calculate a mortgage payment and balance snapshot with EUR, USD, GBP, or ZAR formatting. See principal and interest; currency is not live FX.',
    visibleNote: moneyNote,
  },
  'mortgage-payoff': {
    seoTitle: 'Mortgage Payoff Calculator — Extra Payment | FigureNest',
    seoDescription: 'Estimate payoff time and interest savings from extra mortgage payments in EUR, USD, GBP, or ZAR formatting; currency selection is not live FX.',
    visibleNote: moneyNote,
  },
  'simple-interest': {
    seoTitle: 'Simple Interest Calculator — Formula Guide | FigureNest',
    seoDescription: 'Calculate simple interest and ending amount with EUR, USD, GBP, or ZAR formatting using principal, annual rate, and time; currency is not live FX.',
    visibleNote: moneyNote,
  },
  'compound-interest': {
    seoTitle: 'Compound Interest Calculator | FigureNest',
    seoDescription: 'Project compound growth with EUR, USD, GBP, or ZAR formatting for balances and contributions. Compare rates and time; currency is not live FX conversion.',
    visibleNote: moneyNote,
  },
  savings: {
    seoTitle: 'Savings Calculator — Monthly Growth | FigureNest',
    seoDescription: 'Project savings growth with EUR, USD, GBP, or ZAR formatting for deposits and balances. Compare contributions and time; currency is not live FX conversion.',
    visibleNote: moneyNote,
  },
  roi: {
    seoTitle: 'ROI Calculator — Return on Investment | FigureNest',
    seoDescription: 'Calculate ROI, gain, or loss with EUR, USD, GBP, or ZAR formatting for the same investment figures. Currency selection is not live FX conversion.',
    visibleNote: businessMoneyNote,
  },
  'profit-margin': {
    seoTitle: 'Profit Margin Calculator — Gross Margin | FigureNest',
    seoDescription: 'Calculate gross margin, profit, and markup with EUR, USD, GBP, or ZAR formatting. Compare cost and price; currency selection is not live FX conversion.',
    visibleNote: businessMoneyNote,
  },
  markup: {
    seoTitle: 'Markup Calculator — Cost to Selling Price | FigureNest',
    seoDescription: 'Calculate markup and selling price with EUR, USD, GBP, or ZAR formatting. Compare cost-based pricing; currency selection is not live FX conversion.',
    visibleNote: businessMoneyNote,
  },
  'break-even': {
    seoTitle: 'Break-Even Calculator — Units & Revenue | FigureNest',
    seoDescription: 'Calculate break-even units and revenue with EUR, USD, GBP, or ZAR formatting for costs and prices. Currency selection is not live FX conversion.',
    visibleNote: businessMoneyNote,
  },
  roas: { seoTitle: 'ROAS Calculator — Return on Ad Spend | FigureNest', seoDescription: 'Calculate ROAS with EUR, USD, GBP, or ZAR formatting from ad spend and attributed revenue; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },
  cpc: { seoTitle: 'CPC Calculator — Cost Per Click | FigureNest', seoDescription: 'Calculate CPC with EUR, USD, GBP, or ZAR formatting from advertising spend and clicks; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },
  cpm: { seoTitle: 'CPM Calculator — Cost Per 1,000 Impressions | FigureNest', seoDescription: 'Calculate CPM with EUR, USD, GBP, or ZAR formatting from advertising spend and impressions; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },
  'customer-acquisition-cost': { seoTitle: 'Customer Acquisition Cost Calculator — CAC | FigureNest', seoDescription: 'Calculate CAC with EUR, USD, GBP, or ZAR formatting from acquisition spend and new customers; currency selection is not live FX conversion.', visibleNote: businessMoneyNote },
  vat: {
    seoTitle: 'VAT Calculator — Add or Remove Tax | FigureNest',
    seoDescription: 'Add or remove VAT with EUR, USD, GBP, or ZAR formatting and a rate you choose. Currency selection changes display only; it is not live FX conversion.',
    visibleNote: moneyNote,
  },
  salary: {
    seoTitle: 'Salary Converter — Annual to Hourly Pay | FigureNest',
    seoDescription: 'Convert annual salary to monthly, weekly, and hourly pay with EUR, USD, GBP, or ZAR formatting. Currency selection is not live FX conversion.',
    visibleNote: payMoneyNote,
  },
  overtime: {
    seoTitle: 'Overtime Pay Calculator — Time and a Half | FigureNest',
    seoDescription: 'Calculate gross overtime pay with EUR, USD, GBP, or ZAR formatting for hourly rates. Compare multipliers; currency selection is not live FX conversion.',
    visibleNote: payMoneyNote,
  },
  'fuel-cost': {
    seoTitle: 'Fuel Cost Calculator — Trip Gas Cost | FigureNest',
    seoDescription: 'Estimate trip fuel cost using miles or kilometres, MPG or L/100 km, and litres or gallons. Format prices in EUR, USD, GBP, or ZAR; no live FX.',
    visibleNote: automotiveMoneyNote,
  },
  'fuel-economy': {
    seoTitle: 'Fuel Economy Converter — MPG & L/100 km | FigureNest',
    seoDescription: 'Convert US MPG, imperial MPG, L/100 km, and km/L with reciprocal fuel-economy formulas and practical examples for road comparisons.',
    visibleNote: 'Compare US MPG, imperial MPG, L/100 km, and km/L without changing the underlying efficiency; check the gallon standard before comparing ratings.',
  },
  'ev-charging-cost': {
    seoTitle: 'EV Charging Cost Calculator — kWh Price | FigureNest',
    seoDescription: 'Estimate EV charging cost with Wh, kWh, or MJ energy and EUR, USD, GBP, or ZAR price formatting. Currency selection is not live FX conversion.',
    visibleNote: automotiveMoneyNote,
  },
  'ev-charging-time': {
    seoTitle: 'EV Charging Time Calculator — kWh & kW | FigureNest',
    seoDescription: 'Estimate EV charging time using Wh, kWh, or MJ energy and W, kW, or MW charger power, with ideal hours, minutes, and clear unit guidance.',
    visibleNote: 'Compare Wh, kWh, or MJ of energy with W, kW, or MW of charger power; energy and power are different quantities.',
  },
  area: {
    seoTitle: 'Area Calculator — m² and ft² | FigureNest',
    seoDescription: 'Calculate rectangular area with dimensions in mm, cm, m, km, inches, feet, yards, or miles and output in square metric or imperial units.',
    visibleNote: 'Choose a linear dimension unit from mm, cm, m, km, inches, feet, yards, or miles, then select a square output such as m² or ft².',
  },
  volume: {
    seoTitle: 'Volume Calculator — m³ and ft³ | FigureNest',
    seoDescription: 'Calculate rectangular volume with dimensions in mm, cm, m, km, inches, feet, yards, or miles and output in cubic metric or imperial units.',
    visibleNote: 'Choose a linear dimension unit from mm, cm, m, km, inches, feet, yards, or miles, then select a cubic output such as m³ or ft³.',
  },
  unit: {
    seoTitle: 'Unit Converter for Everyday Measurements | FigureNest',
    seoDescription: 'Convert length, weight, temperature, speed, area, volume, liquid, energy, power, and fuel economy units in one measurement workspace.',
    visibleNote: 'Choose among ten compatible categories, including area, volume, liquid volume, energy, power, and fuel economy as well as the four everyday basics.',
  },
  length: {
    seoTitle: 'Length Converter — Metric & Imperial | FigureNest',
    seoDescription: 'Convert mm, cm, metres, kilometres, inches, feet, yards, and miles with accurate metric and imperial length factors and examples.',
    visibleNote: 'Convert linear measurements from mm, cm, metres, or kilometres to inches, feet, yards, or miles without treating area or volume as linear.',
  },
  weight: {
    seoTitle: 'Weight Converter — kg, lb, oz, g & Stone | FigureNest',
    seoDescription: 'Convert grams, kilograms, tonnes, ounces, pounds, US tons, and stones with accurate mass factors and practical metric-imperial guidance.',
    visibleNote: 'Compare grams, kilograms, tonnes, ounces, pounds, US tons, and stones; ounces here mean mass, not fluid volume.',
  },
  temperature: {
    seoTitle: 'Temperature Converter — °C, °F & Kelvin | FigureNest',
    seoDescription: 'Convert Celsius, Fahrenheit, and Kelvin with scale-specific formulas, absolute-zero checks, worked examples, and practical guidance.',
    visibleNote: 'Translate Celsius, Fahrenheit, and Kelvin readings; the scale formulas account for different zero points rather than using one multiplier.',
  },
  speed: {
    seoTitle: 'Speed Converter — km/h, mph, Knots & m/s | FigureNest',
    seoDescription: 'Convert km/h, mph, knots, and m/s for road travel, marine, aviation, sport, wind, and technical speed comparisons with clear unit factors.',
    visibleNote: 'Compare km/h, mph, knots, and m/s; knots are nautical miles per hour, while pace and direction need different calculations.',
  },
  power: {
    seoTitle: 'Power Converter — HP, kW, W & MW | FigureNest',
    seoDescription: 'Convert watts, kilowatts, megawatts, and horsepower for engine, motor, and equipment power comparisons with accurate factors.',
    visibleNote: 'Convert W, kW, MW, and horsepower for power ratings; this is a rate of energy transfer, not an energy total such as kWh.',
  },
  'dpi-ppi': {
    seoTitle: 'DPI / PPI Calculator — Print Resolution | FigureNest',
    seoDescription: 'Calculate DPI or PPI from pixel width and print width in inches or centimetres, with a clear resolution formula and examples.',
    visibleNote: 'Enter print width in inches or centimetres; DPI/PPI describes pixel density and does not change the image’s pixel dimensions.',
  },
  'pixels-to-cm': {
    seoTitle: 'Pixels to cm / inches — Print Size | FigureNest',
    seoDescription: 'Convert pixel dimensions to print size in centimetres or inches using a chosen PPI resolution for practical print planning.',
    visibleNote: 'Choose centimetres or inches for the physical print size; the result depends on the PPI you enter and does not resize the source pixels.',
  },
  'image-scaling': {
    seoTitle: 'Image Scaling Calculator — Keep Aspect Ratio | FigureNest',
    seoDescription: 'Resize image dimensions while preserving the original aspect ratio. Enter the current pixel width and height plus a new width to calculate the scaled height.',
    visibleNote: 'Enter pixel dimensions and a target width to preserve the original aspect ratio; this calculates dimensions but does not resize or upload an image.',
  },
  concrete: {
    seoTitle: 'Concrete Calculator — Ready-Mix Volume | FigureNest',
    seoDescription: 'Estimate ready-mix concrete in cubic yards or cubic metres from length, width, depth, and waste with practical ordering guidance.',
    visibleNote: 'Use feet and inches or metres and centimetres for dimensions; the order result is shown in cubic yards or cubic metres.',
  },
  'concrete-slab': {
    seoTitle: 'Concrete Slab Volume Calculator | FigureNest',
    seoDescription: 'Calculate patio, floor, or foundation slab volume in cubic yards or cubic metres from metric or imperial dimensions and waste.',
    visibleNote: 'Enter slab dimensions in feet/inches or metres/centimetres and compare the resulting cubic-yard or cubic-metre order volume.',
  },
  'concrete-bag': {
    seoTitle: 'Concrete Bag Calculator — Premix Bags | FigureNest',
    seoDescription: 'Calculate whole premix concrete bags from metric or imperial pour dimensions, bag yield, and waste allowance for practical material ordering.',
    visibleNote: 'Keep dimensions and bag yield in the same metric or imperial system; bag yield may be litres or cubic feet depending on the product label.',
  },
  'concrete-footing': {
    seoTitle: 'Concrete Footing Calculator — Run Volume | FigureNest',
    seoDescription: 'Estimate concrete for rectangular footing runs in cubic yards or cubic metres from metric or imperial dimensions, count, and waste.',
    visibleNote: 'Use feet/inches or metres/centimetres for footing runs and review the cubic-yard or cubic-metre volume with the engineered plan.',
  },
  'concrete-cost': {
    seoTitle: 'Concrete Cost Calculator — Ready-Mix Budget | FigureNest',
    seoDescription: 'Estimate ready-mix cost from metric or imperial pour dimensions, cubic-yard or cubic-metre pricing, and waste. Currency is not live FX.',
    visibleNote: constructionMoneyNote,
  },
  'cubic-yard': {
    seoTitle: 'Cubic Yard Calculator — Volume Conversion | FigureNest',
    seoDescription: 'Calculate rectangular project volume in cubic yards from feet or metric dimensions for concrete, soil, gravel, mulch, or fill.',
    visibleNote: 'Use feet and inches or metric dimensions to estimate cubic yards; material density and supplier weight conversions need separate inputs.',
  },
  'square-footage': {
    seoTitle: 'Square Footage Calculator — Area & Waste | FigureNest',
    seoDescription: 'Calculate floor, wall, patio, or garden area in ft² or m² from metric or imperial dimensions with a material waste allowance.',
    visibleNote: 'Enter dimensions in feet or metres and compare square feet with square metres before adding a material allowance.',
  },
  paint: {
    seoTitle: 'Paint Calculator — Litres & Gallons | FigureNest',
    seoDescription: 'Estimate paint in litres or US gallons from room dimensions, openings, coats, and coverage in m²/L or ft²/gal for practical room planning.',
    visibleNote: 'Compare litres with US gallons and coverage in m²/L or ft²/gal; use the product label for the surface-specific rate.',
  },
  tile: {
    seoTitle: 'Tile Calculator — Quantity & Waste | FigureNest',
    seoDescription: 'Calculate tile quantities from metric or imperial surface and tile dimensions, with cutting waste for floors, walls, and backsplashes.',
    visibleNote: 'Use feet/inches or metres/centimetres consistently for the surface and tile size, then add realistic cutting waste.',
  },
  flooring: {
    seoTitle: 'Flooring Calculator — Area & Waste | FigureNest',
    seoDescription: 'Estimate flooring area in ft² or m² for one or more rooms using metric or imperial dimensions and an installation allowance.',
    visibleNote: 'Enter room dimensions in feet or metres and compare the ft² or m² purchase area before converting it to product boxes.',
  },
  gravel: {
    seoTitle: 'Gravel Calculator — Volume, Weight & Cost | FigureNest',
    seoDescription: 'Estimate gravel volume, mass, and cost using cubic yards or metres, tons or tonnes, and EUR, USD, GBP, or ZAR formatting; no live FX.',
    visibleNote: constructionMoneyNote,
  },
  mulch: {
    seoTitle: 'Mulch Calculator — Cubic Yards & Bags | FigureNest',
    seoDescription: 'Calculate mulch volume and bags from metric or imperial bed dimensions, depth, bag size, and a settling allowance for garden project planning.',
    visibleNote: 'Use feet/inches or metres/centimetres for beds and compare cubic yards with cubic metres or bag litres before ordering.',
  },
  'roof-pitch': {
    seoTitle: 'Roof Pitch Calculator — Rise, Run & Angle | FigureNest',
    seoDescription: 'Calculate roof pitch, angle, and slope multiplier from rise and run in inches, centimetres, or other matching length units.',
    visibleNote: 'Rise and run can use inches or centimetres; keep both in the same unit because the pitch ratio is dimensionless.',
  },
  'roofing-material': {
    seoTitle: 'Roofing Material Calculator — Squares | FigureNest',
    seoDescription: 'Estimate sloped roof area, roofing squares, and shingle bundles from metric or imperial plan dimensions, pitch, and waste.',
    visibleNote: 'Measure plan dimensions in feet or metres and pitch rise/run in matching inches or centimetres before estimating square-foot or square-metre area.',
  },
  stair: {
    seoTitle: 'Stair Calculator — Riser, Tread & Run | FigureNest',
    seoDescription: 'Estimate riser count, riser height, tread count, and stair run from floor-to-floor rise in inches or centimetres for an initial stair layout.',
    visibleNote: 'Use inches or centimetres consistently for rise, riser height, and tread depth; verify the final layout against local code.',
  },
  'board-foot': {
    seoTitle: 'Board Foot Calculator — Lumber Volume | FigureNest',
    seoDescription: 'Calculate lumber volume in board feet and cubic metres from board thickness, width, length, and quantity in metric or imperial units.',
    visibleNote: 'Board-foot inputs use inches and feet, while the comparison volume is cubic metres; keep the timber dimensions tied to the same boards.',
  },
  'deck-material': {
    seoTitle: 'Deck Material Calculator — Boards & Area | FigureNest',
    seoDescription: 'Estimate deck board quantity and coverage from metric or imperial deck dimensions, board width, spacing, and waste for early material planning.',
    visibleNote: 'Use feet/inches or metres/centimetres for the deck and board dimensions; area and board counts are separate planning quantities.',
  },
  'fence-material': {
    seoTitle: 'Fence Material Calculator — Posts & Pickets | FigureNest',
    seoDescription: 'Estimate fence posts, pickets, rails, and sections from a metric or imperial fence layout, spacing, and gate count for material planning.',
    visibleNote: 'Plan fence lengths and spacing in feet/inches or metres/centimetres; the tool estimates counts, not structural post sizing.',
  },
  drywall: {
    seoTitle: 'Drywall Calculator — Sheets & Wall Area | FigureNest',
    seoDescription: 'Estimate drywall sheets and wall or ceiling area from metric or imperial room dimensions with a cutting-waste allowance.',
    visibleNote: 'Use feet/inches or metres/centimetres for room dimensions and compare the resulting square-foot or square-metre area with sheet coverage.',
  },
  brick: {
    seoTitle: 'Brick Calculator — Wall Quantity & Waste | FigureNest',
    seoDescription: 'Estimate bricks for a wall from metric or imperial dimensions, brick face size, mortar joint, openings, and waste for material planning.',
    visibleNote: 'Keep wall, brick, and mortar dimensions in feet/inches or metres/centimetres; openings and waste affect the final brick count.',
  },
};

export const getCalculatorSeoCapability = (slug: string) => calculatorSeoCapabilities[slug];

export const syncRegistrySeoCapabilities = <T extends { slug: string; seoTitle: string; seoDescription: string }>(
  registry: Record<string, T>,
) => {
  for (const item of Object.values(registry)) {
    const capability = getCalculatorSeoCapability(item.slug);
    if (capability) {
      item.seoTitle = capability.seoTitle;
      item.seoDescription = capability.seoDescription;
    }
  }
};