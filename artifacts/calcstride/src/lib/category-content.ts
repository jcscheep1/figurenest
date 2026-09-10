export type CategoryFaq = {
  question: string;
  answer: string;
};

export type CategoryGuide = {
  href: string;
  label: string;
  description: string;
};

export type CategoryContent = {
  introduction: string[];
  questionsAnswered: string[];
  toolDescriptions: { slug: string; description: string }[];
  choosingTools: string[];
  unitCurrencyGuidance: string[];
  relatedGuides: CategoryGuide[];
  faqs: CategoryFaq[];
};

export const categoryContent: Record<
  'finance' | 'salary-work' | 'business' | 'electrical' | 'technology' | 'science-engineering' | 'automotive' | 'math' | 'converters' | 'date-time' | 'printing-design' | 'health' | 'education',
  CategoryContent
> = {
  finance: {
    introduction: [
      'Money decisions become easier to compare when the assumptions are visible. These calculators turn a rate, balance, term, contribution, or tax percentage into a clear estimate, so you can test one input at a time instead of relying on a headline monthly number.',
      'Use a result as a planning view rather than an offer, approval, tax calculation, or investment forecast. Rates can change, contracts have their own timing rules, and taxes, fees, insurance, and account terms may sit outside a simplified calculation.',
    ],
    questionsAnswered: [
      'What share of a price is a tax or discount, and what was the original price before VAT?',
      'How do loan amount, interest rate, and repayment term change a scheduled payment and total interest?',
      'How might a starting balance and regular deposits grow under a stated compounding assumption?',
      'Is a proposed return meaningful relative to the money put into an investment or project?',
    ],
    toolDescriptions: [
      { slug: 'percentage', description: 'Find a percentage of a value, or use the result to check a discount, commission, tip, allocation, or rate-based amount.' },
      { slug: 'compound-interest', description: 'Model a starting balance, recurring contributions, a chosen rate, and compounding frequency to explore long-term growth assumptions.' },
      { slug: 'loan', description: 'Estimate level repayments, scheduled interest, and total paid for a general fixed-rate installment loan using the inputs you choose.' },
      { slug: 'mortgage', description: 'Explore a home-loan payment with loan amount, down payment, rate, term, property taxes, and insurance entered separately.' },
      { slug: 'auto-loan', description: 'Estimate the amount financed, monthly payment, and total interest after vehicle price, credits, tax, fees, rate, and term.' },
      { slug: 'interest-rate', description: 'Estimate the nominal annual rate implied by a loan principal, fixed monthly payment, and number of payments.' },
      { slug: 'mortgage-amortization', description: 'Inspect how a fixed mortgage payment divides into principal and interest at a selected point in its schedule.' },
      { slug: 'mortgage-payoff', description: 'Compare modeled payoff time and remaining interest with and without recurring extra principal payments.' },
      { slug: 'simple-interest', description: 'Calculate interest on an unchanged principal using the educational I = P × r × t formula.' },
      { slug: 'savings', description: 'Project how regular saving deposits and an assumed interest rate could build toward a future balance over time.' },
      { slug: 'vat', description: 'Add VAT to a net price or remove a selected VAT rate from a gross price without guessing which amount is the tax.' },
    ],
    choosingTools: [
      'Choose Percentage Calculator when the relationship itself is the question: a portion of a total, a percentage represented by two figures, or a percentage change. Choose VAT Calculator when the task specifically starts with a price and a VAT rate.',
      'Choose Loan Calculator for a general installment balance. Mortgage Calculator is the more useful starting point for a home purchase because it lets you consider down payment, taxes, and insurance alongside principal and interest.',
      'Savings Calculator emphasizes recurring deposits; Compound Interest Calculator is useful when comparing how compounding and contributions affect a balance. In either case, enter a rate you can identify and test more than one scenario rather than treating an illustration as a promise.',
    ],
    unitCurrencyGuidance: [
      'Enter every money amount in the same currency denomination: for example, all dollars, all euros, or all pounds. These tools calculate arithmetic and do not convert one currency into another.',
      'Currency symbols and decimal formatting only label and display amounts; they do not provide live foreign-exchange rates, market quotes, lender rates, tax advice, or product pricing. Confirm the rate, fee treatment, and rounding conventions with the relevant provider.',
    ],
    relatedGuides: [
      { href: '/articles/mortgage-payment-basics', label: 'Mortgage payment basics', description: 'Separate principal and interest from taxes, insurance, and other ownership costs.' },
      { href: '/articles/loan-payment-calculations', label: 'How loan payment calculations work', description: 'See the fixed-payment formula and the assumptions behind an amortized estimate.' },
      { href: '/articles/compound-interest-guide', label: 'Compound interest explained', description: 'Learn how compounding, time, and contributions shape a projection.' },
    ],
    faqs: [
      { question: 'Does a loan result include lender fees?', answer: 'Not unless you include them in the amount financed or account for them separately. Review the lender disclosure for the actual terms.' },
      { question: 'Is a compound-interest result guaranteed?', answer: 'No. It is a projection based on the rate, timing, and contributions you entered.' },
      { question: 'Can I use different currencies in one calculation?', answer: 'No. Keep every amount in one denomination; the calculators do not use live FX conversion.' },
      { question: 'Why is a mortgage payment larger than principal and interest?', answer: 'Taxes, insurance, mortgage insurance, and other housing costs may be added to the monthly budget.' },
    ],
  },
  'salary-work': {
    introduction: [
      'Pay is easier to discuss when annual salary, monthly pay, weekly pay, hourly rate, and overtime are expressed on a comparable basis. This category helps turn a stated work schedule and rate into a transparent estimate you can check against an offer, timesheet, or budget.',
      'The calculations describe gross pay from the inputs supplied. They do not determine employee classification, overtime eligibility, withholding, benefits, local rules, holiday treatment, or the terms of an employment agreement.',
      'Before comparing roles, write down whether each figure is base pay, guaranteed pay, or a possible amount. Note paid breaks, unpaid leave, seasonal weeks, payroll frequency, and whether overtime is expected or merely available. A higher annual figure can be hard to compare fairly when one schedule includes materially more paid hours. Keeping the assumptions beside the result also makes a later conversation with payroll or a prospective employer more specific.',
      'Use the same pay period when comparing two scenarios. If one figure is paid weekly and another monthly, convert both from the same annual or hourly basis, then consider the cash-flow timing separately. A conversion can explain the arithmetic, but only the written offer or payslip establishes what is actually paid.',
    ],
    questionsAnswered: [
      'What hourly figure corresponds to an annual salary under a chosen number of hours and weeks?',
      'How can monthly, weekly, daily, and annual gross-pay figures be compared without mixing pay periods?',
      'What is the estimated extra pay for a stated number of overtime hours and multiplier?',
      'Which assumptions should be checked before using gross pay to plan take-home income?',
    ],
    toolDescriptions: [
      { slug: 'salary', description: 'Convert a gross annual salary among monthly, weekly, daily, and hourly equivalents using the work schedule you enter.' },
      { slug: 'overtime', description: 'Estimate additional gross pay from an hourly base rate, overtime hours, and selected overtime multiplier.' },
    ],
    choosingTools: [
      'Use Salary Converter to compare compensation quoted in different periods, such as an annual offer and an hourly role. Set weeks worked and hours per week deliberately: a 37.5-hour schedule and unpaid weeks produce a different comparable hourly figure than a 40-hour, 52-week assumption.',
      'Use Overtime Calculator after identifying the ordinary hourly rate and the overtime rate applicable to those hours. It is most useful for a single pay-period estimate; combine it with the salary result only after ensuring both figures use the same gross-pay scope.',
      'Keep salary, bonuses, commissions, shift differentials, allowances, benefits, and reimbursed expenses separate unless the quoted number explicitly includes them. That makes it easier to explain why an estimate differs from a payslip.',
    ],
    unitCurrencyGuidance: [
      'Use one currency denomination for all pay inputs and results. Currency selection and number formatting are for display only; this category does not obtain live FX rates or convert compensation between currencies.',
      'Enter rates consistently, usually per hour for overtime and per year for salary. Gross pay is before deductions, so do not treat the displayed currency amount as a take-home-pay estimate without separately considering taxes, withholding, and deductions.',
    ],
    relatedGuides: [
      { href: '/articles/salary-and-overtime-basics', label: 'Salary and overtime basics', description: 'Understand gross-pay comparisons, schedules, overtime assumptions, and jurisdictional limits.' },
    ],
    faqs: [
      { question: 'Is the salary conversion take-home pay?', answer: 'No. It converts gross pay; taxes, insurance, retirement contributions, and other deductions are separate.' },
      { question: 'Which hours should I enter for salary conversion?', answer: 'Use the actual paid hours and paid weeks assumed by the offer or your normal schedule.' },
      { question: 'Does overtime apply to every worker?', answer: 'No. Eligibility and rates depend on the agreement and applicable rules; confirm them with the employer or relevant authority.' },
      { question: 'Can I combine a bonus with salary?', answer: 'You can compare it separately, but a one-time or variable bonus should not be assumed to be regular base pay.' },
    ],
  },
  business: {
    introduction: [
      'A price can look profitable and still fail to cover overhead, returns, discounts, or the cost of capital. These business calculators make the underlying relationship explicit, helping you compare a selling price, cost, target margin, sales volume, or investment result before acting.',
      'They are planning tools, not bookkeeping systems. Use current records for costs and sales, define the period being compared, and keep tax, financing, inventory, and accounting treatment clear rather than assuming one percentage answers every question.',
      'Build scenarios from inputs that can be explained to another person. Separate direct variable costs from recurring fixed costs, decide whether discounts and refunds reduce sales price, and identify whether labour belongs in the unit cost or overhead. Then test a conservative sales volume alongside the expected one. That approach reveals which assumption moves the result most and prevents a precise-looking percentage from hiding an incomplete cost base.',
    ],
    questionsAnswered: [
      'What are gross profit, margin, and markup for a given cost and selling price?',
      'What selling price follows from a target markup, and why is that not the same as a target margin?',
      'How many units or how much revenue are needed to cover fixed costs at a stated contribution per sale?',
      'How does gain compare with original investment cost when calculating a simple ROI?',
    ],
    toolDescriptions: [
      { slug: 'roi', description: 'Compare a gain or return with the original cost to express a simple return on investment percentage.' },
      { slug: 'profit-margin', description: 'Calculate gross profit, profit margin, and markup from the cost and selling price of an item or sale.' },
      { slug: 'markup', description: 'Set or check a selling price by applying a target markup percentage to a stated cost.' },
      { slug: 'break-even', description: 'Estimate the sales volume and revenue needed to cover fixed costs using the price and variable-cost assumptions entered.' },
      { slug: 'roas', description: 'Compare attributed advertising revenue with ad spend as a revenue-efficiency multiple and percentage.' },
      { slug: 'conversion-rate', description: 'Measure completed conversions as a percentage of a consistently defined opportunity count.' },
      { slug: 'cpc', description: 'Calculate average advertising spend per recorded click for a consistent campaign scope.' },
      { slug: 'cpm', description: 'Standardize advertising spend as cost per one thousand delivered impressions.' },
      { slug: 'customer-acquisition-cost', description: 'Average a defined acquisition-cost pool across the corresponding new customers.' },
    ],
    choosingTools: [
      'Use Profit Margin Calculator when you already know both cost and selling price and want to inspect the relationship. Use Markup Calculator when cost is known and you are setting a price from a markup target.',
      'Margin divides profit by selling price; markup divides profit by cost. The two percentages are therefore not interchangeable, even though both describe the same sale. State the denominator whenever you share a pricing target.',
      'Use Break-Even Calculator for a volume question with fixed and variable costs. Use ROI Calculator for a return-versus-cost question. Neither tool replaces a forecast that includes timing, cash flow, tax, financing, or uncertainty.',
    ],
    unitCurrencyGuidance: [
      'Enter price, cost, fixed cost, and return figures in the same currency and period. Currency symbols and formatting identify a denomination only; they do not provide live FX conversion, sales-tax treatment, or market prices.',
      'Match units as well as currency. If fixed costs are monthly, use monthly expected sales; if a variable cost is per unit, use a per-unit selling price. A clean denominator is more valuable than extra decimal places.',
    ],
    relatedGuides: [
      { href: '/articles/business-pricing-profit-basics', label: 'Business pricing and profit basics', description: 'Learn the distinct denominators behind markup, margin, break-even, and ROI.' },
    ],
    faqs: [
      { question: 'Is markup the same as margin?', answer: 'No. Markup uses cost as its denominator, while margin uses selling price.' },
      { question: 'Does break-even mean a business is profitable?', answer: 'It means the modeled revenue covers the modeled costs. Profit begins above that point under the same assumptions.' },
      { question: 'Should VAT be included in price inputs?', answer: 'Use a consistent basis. For operating profit analysis, businesses often compare net sales and net costs separately from VAT.' },
      { question: 'Does ROI include the time value of money?', answer: 'A simple ROI percentage does not. Consider timing and cash flows separately for longer projects.' },
    ],
  },
  automotive: {
    introduction: [
      'Trip energy costs depend on distance, efficiency, energy price, weather, driving conditions, and vehicle use. These calculators help organize those inputs for a comparable estimate, whether the vehicle uses liquid fuel, electricity, or an engine power specification.',
      'Results are planning estimates. Actual consumption, charging losses, station prices, battery condition, route elevation, traffic, payload, and driving style can materially change what happens on the road.',
      'For a useful comparison, record where an efficiency figure came from and use the same route distance for each scenario. A dashboard average, laboratory rating, winter trip, towing journey, and highway drive may all be valid measurements, but they should not be treated as identical. For EV journeys, distinguish home and public charging prices and include the practical charging window rather than assuming the advertised maximum power is available throughout.',
      'Revisit estimates after a real trip or charging session. Replacing a broad assumption with your own recorded distance, energy use, and receipt price makes later budgets more useful. Keep recurring expenses such as maintenance, insurance, parking, tolls, and depreciation outside an energy-cost result unless you are deliberately building a broader ownership budget.',
    ],
    questionsAnswered: [
      'How much might fuel for a trip cost at a stated distance, efficiency, and pump price?',
      'How do MPG, litres per 100 kilometres, and kilometres per litre describe fuel economy?',
      'What could an EV charging session cost from battery capacity, charge change, and electricity price?',
      'How long might charging take at a chosen power level, and how do horsepower and kilowatts compare?',
    ],
    toolDescriptions: [
      { slug: 'fuel-cost', description: 'Estimate trip fuel use and cost from route distance, fuel economy, and a price per fuel unit.' },
      { slug: 'fuel-economy', description: 'Convert efficiency figures among MPG, L/100 km, and km/L without changing the underlying consumption relationship.' },
      { slug: 'ev-charging-cost', description: 'Estimate energy needed and charging cost from battery capacity, state-of-charge change, electricity price, and loss assumptions.' },
      { slug: 'ev-charging-time', description: 'Estimate charging duration from usable battery capacity, charge range, and charging power.' },
      { slug: 'power', description: 'Convert engine or motor output between horsepower and kilowatts for like-for-like specification comparisons.' },
    ],
    choosingTools: [
      'Use Fuel Cost Calculator for a trip budget and Fuel Economy Converter when the vehicle specification is reported in a different efficiency convention. Convert first, then keep the converted figure and price unit aligned.',
      'Use EV Charging Cost Calculator for the energy-price question and EV Charging Time Calculator for the power-and-duration question. A session can be inexpensive yet slow, or fast yet priced differently, so they answer separate planning questions.',
      'Power HP / kW Converter compares rated output, not energy use or charging speed. Do not infer fuel economy, range, or cost from a horsepower conversion alone.',
    ],
    unitCurrencyGuidance: [
      'Match distance, fuel volume, and efficiency units: miles work naturally with MPG, while kilometres pair with L/100 km or km/L. For charging, enter electricity price in the same energy unit used by the tariff.',
      'Currency fields represent denomination and formatting only. They do not retrieve live fuel prices, electricity tariffs, exchange rates, taxes, station fees, or time-of-use pricing; enter those figures yourself and label the assumptions.',
    ],
    relatedGuides: [
      { href: '/articles/ev-charging-and-fuel-costs', label: 'EV charging and fuel costs', description: 'Compare energy prices, efficiency, range assumptions, and trip-cost inputs.' },
    ],
    faqs: [
      { question: 'Why does my real fuel cost differ?', answer: 'Traffic, speed, weather, route, load, and pump price can all differ from the inputs used in the estimate.' },
      { question: 'Does charging time include tapering?', answer: 'It is an estimate based on the stated power. Vehicles commonly slow charging near a high state of charge.' },
      { question: 'Are charging losses included?', answer: 'Include an appropriate loss assumption when estimating wall energy; the battery’s stored energy alone can understate it.' },
      { question: 'Does kW equal kWh?', answer: 'No. kW measures power; kWh measures energy over time.' },
    ],
  },
  math: {
    introduction: [
      'Everyday math is more reliable when the shape, unit, and comparison are named before calculation. This category covers percentage relationships and rectangular geometry, with focused tools that show the quantities needed for a quick check or a practical estimate.',
      'A correct formula can still answer the wrong question if measurements are mixed or dimensions are missing. Measure carefully, keep a common unit, and use a project-specific calculator when waste, thickness, cost, or a non-rectangular shape matters.',
      'Write down the known value, the unknown value, and the baseline before entering numbers. That small step clarifies whether a percentage is a share, a rate of change, or a difference between peers. For geometry, sketch the rectangle and label each side. If a measurement was rounded in the field, the calculated result is also approximate, so avoid reporting more precision than the original measurement supports.',
      'Check the result with an order-of-magnitude estimate. A room that is roughly four by five metres should be near twenty square metres, not two hundred. A box with a very small height should have a correspondingly small volume. This quick reasonableness check often catches a misplaced decimal, an inverted percentage, or a dimension entered in the wrong unit.',
    ],
    questionsAnswered: [
      'What percentage is one value of another, and what is the amount after a percentage increase or decrease?',
      'How is percentage difference different from percentage change, and how can a change be reversed?',
      'What is the area of a rectangle from length and width?',
      'What is the volume of a rectangular space from length, width, and height?',
    ],
    toolDescriptions: [
      { slug: 'percentage-increase-decrease', description: 'Calculate percentage increases, decreases, differences, and reverse changes from a pair of values or a selected rate.' },
      { slug: 'area', description: 'Find rectangular area by multiplying length by width, with a result expressed in square units.' },
      { slug: 'volume', description: 'Find rectangular volume by multiplying length, width, and height, with a result expressed in cubic units.' },
      { slug: 'big-number', description: 'Perform exact signed-integer arithmetic on values far beyond ordinary floating-point safe-integer precision.' },
      { slug: 'distance', description: 'Find straight-line Euclidean distance between two points from their x and y coordinates.' },
    ],
    choosingTools: [
      'Use Percentage Change Calculator when two values are being compared over time or before and after an adjustment. Use its percentage-difference option when neither value should be treated as the starting baseline.',
      'Use Area Calculator for a flat rectangle such as a simple room, plot, or panel. Use Volume Calculator only when a third dimension is relevant, such as a box, tank, or rectangular space.',
      'For irregular shapes, divide the shape into measured rectangles only when that approximation is suitable. For construction material quantities, use a dedicated project tool instead, because coverage, thickness, waste, and product packaging change the practical answer.',
    ],
    unitCurrencyGuidance: [
      'Use the same linear unit for every dimension before calculating. Length times width produces square units, while length times width times height produces cubic units; do not label a volume result as an area.',
      'Math results do not require currency. If you use an area or percentage result in a separate cost calculation, apply one currency denomination consistently there; formatting does not include live FX conversion or price data.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Why is a 20% decrease not reversed by a 20% increase?', answer: 'The second percentage uses the reduced value as its base, so the two percentage amounts differ.' },
      { question: 'Can I mix feet and inches?', answer: 'Convert them to one linear unit first, then calculate.' },
      { question: 'What unit is area measured in?', answer: 'Area is measured in square units, such as square metres or square feet.' },
      { question: 'What unit is volume measured in?', answer: 'Volume is measured in cubic units, such as cubic metres or cubic feet.' },
    ],
  },
  converters: {
    introduction: [
      'Conversion is a change of expression, not a change in the physical quantity. These tools make common measurement systems easier to compare for travel, cooking, weather, specifications, shipping, and everyday planning without requiring a manual factor lookup.',
      'Start by identifying what is being measured: length, mass, temperature, speed, or a general unit category. Then keep the original value and source unit visible, especially when rounding a result for an order, label, recipe, or technical record.',
      'Read unit symbols in context. A lower-case m usually means metres, while mph means miles per hour, and a temperature value must retain its scale. When a source states an approximate quantity, preserve that uncertainty rather than converting it into a falsely exact result. For product compatibility, aviation, medicine, engineering, or regulated work, compare the converted number against the original specification and the required standard before relying on it.',
      'Use a conversion as a documented intermediate step, not as a substitute for a source measurement. Save the original value and unit with the result so another person can retrace the calculation. This is especially helpful where a supplier label, route sign, recipe, or device setting uses a different system from the one expected by your audience.',
    ],
    questionsAnswered: [
      'How can a measurement be translated between common metric and imperial units?',
      'Which converter should be used for distance, weight, temperature, or speed?',
      'Why does temperature conversion require an offset rather than simple multiplication?',
      'How should rounded converted values be used when accuracy affects a purchase or specification?',
    ],
    toolDescriptions: [
      { slug: 'unit', description: 'Use a multi-category hub to switch among common length, weight, temperature, and speed units in one place.' },
      { slug: 'length', description: 'Convert linear dimensions and distances across metric and imperial length units.' },
      { slug: 'weight', description: 'Compare grams, kilograms, ounces, pounds, and stones for everyday mass and scale readings.' },
      { slug: 'temperature', description: 'Translate Celsius, Fahrenheit, and Kelvin readings for weather, cooking, and scientific contexts.' },
      { slug: 'speed', description: 'Convert km/h, mph, knots, and metres per second for road, marine, sport, wind, and technical use.' },
    ],
    choosingTools: [
      'Use Unit Converter when you need to move among several kinds of measures in one session. Choose a dedicated Length, Weight, Temperature, or Speed Converter when the task is focused and you want the relevant units immediately available.',
      'Length measures distance; Weight Converter presents everyday mass units; Speed compares distance per time. They are not interchangeable even when a number happens to look similar. Confirm the unit abbreviation before copying a result.',
      'Temperature is special because Celsius and Fahrenheit scales use different zero points as well as different step sizes. Do not apply a length or weight conversion factor to temperature.',
    ],
    unitCurrencyGuidance: [
      'Enter the source value exactly as measured, select its actual unit, and round the converted result only as far as the task permits. For precision work, retain more digits until the final instruction or specification calls for rounding.',
      'These are measurement converters, not currency converters. They contain no currency denomination formatting, live FX rates, exchange fees, fuel prices, tariffs, or purchasing data.',
    ],
    relatedGuides: [
      { href: '/articles/unit-conversion-basics', label: 'Unit conversion basics', description: 'Review factors, dimensional units, temperature offsets, rounding, and common mistakes.' },
    ],
    faqs: [
      { question: 'Is weight the same as mass?', answer: 'Everyday labels often use the terms loosely. The converter presents common mass-style units; technical contexts may require a more precise distinction.' },
      { question: 'Why is 0°C not 0°F?', answer: 'The Celsius and Fahrenheit scales start at different reference points.' },
      { question: 'Should I round before converting?', answer: 'Usually no. Convert the measured value first and round the final result for the required precision.' },
      { question: 'Can this convert currencies?', answer: 'No. It converts measurement units only and has no live foreign-exchange data.' },
    ],
  },
  'date-time': {
    introduction: [
      'Dates answer several different questions: someone’s age on a reference date, the calendar duration between events, or the number of working weekdays in a planning window. These tools keep those questions separate so a simple day count is not mistaken for a calendar anniversary calculation.',
      'Date results depend on the entered dates and the definition of a working day. They are useful for organizing a schedule, but contracts, leave policies, local holidays, payroll rules, and legal deadlines may use rules beyond a general calendar estimate.',
      'For project planning, record the event dates, the calendar duration, and the working-day count as separate notes. That avoids promising a completion date based on weekdays when approvals, delivery dates, staff availability, or holidays have not been considered. For personal dates, select the intended reference date rather than assuming today is relevant. A result can be arithmetically correct and still use a different convention than the organization receiving it.',
      'Dates near month ends deserve an extra check because February and 30-day months do not align neatly with a fixed day count. If an action has a formal deadline, retain the notice or agreement that defines the counting rule and ask the responsible organization to clarify ambiguity. The calculator helps frame the timeline; it does not interpret legal language or replace official confirmation.',
    ],
    questionsAnswered: [
      'What is an exact age in years, months, and days as of a selected date?',
      'How long is the calendar duration between two dates in years, months, weeks, and days?',
      'How many weekdays occur between dates when weekends are excluded?',
      'When should a calendar duration be used instead of a working-day count?',
    ],
    toolDescriptions: [
      { slug: 'age', description: 'Calculate age from a birth date to a chosen reference date in calendar years, months, and days.' },
      { slug: 'date-difference', description: 'Calculate the calendar duration between two dates and present it in years, months, weeks, and days.' },
      { slug: 'working-days', description: 'Count weekdays in a date range while excluding weekends for a simple work-planning estimate.' },
    ],
    choosingTools: [
      'Choose Age Calculator when a birth date and as-of date are central. Choose Date Duration Calculator when comparing two project, travel, billing, or event dates without treating either date as a birthday.',
      'Choose Working Days Calculator when the task concerns weekdays rather than elapsed calendar time. It excludes weekends, but it should not be assumed to know a workplace schedule, public holidays, closures, or region-specific observances.',
      'Check which dates are inclusive in the context where you will use the answer. A booking, invoice, statutory deadline, or employment policy can define start and end dates differently from a general planning calculation.',
    ],
    unitCurrencyGuidance: [
      'Date tools use calendar fields rather than physical units or currency. Enter dates carefully in the displayed format and verify the selected year, especially around leap years, month ends, and birthdays.',
      'No currency, denomination formatting, live FX data, pricing, time-zone service, or holiday calendar is supplied. If a result informs a paid deadline or payroll period, verify the governing policy separately.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Does Working Days Calculator remove public holidays?', answer: 'It excludes weekends. Check holidays and workplace closures separately.' },
      { question: 'Why can months not be treated as a fixed number of days?', answer: 'Calendar months have different lengths, so calendar duration and day count answer different questions.' },
      { question: 'Can I use Age Calculator for a future date?', answer: 'Yes, if you choose that reference date, but confirm whether your situation uses a specific legal or policy definition.' },
      { question: 'Does this calculate time zones?', answer: 'No. The tools compare dates, not times of day or time-zone transitions.' },
    ],
  },
  'printing-design': {
    introduction: [
      'A digital image has pixel dimensions, while a printed piece has physical dimensions and a resolution target. These calculators connect those ideas so you can evaluate whether an image will fit a layout, what print size a file supports, and how to resize without unintentionally changing its proportions.',
      'A numerical result does not guarantee print quality. Printer method, viewing distance, paper, sharpening, color management, crop choice, and the quality of the original image all influence the final output.',
      'Keep the original file intact while exploring output sizes. A layout may require bleed, a safe margin, a crop, or a different orientation, each of which changes the usable pixel area. Ask the printer for its preferred final dimensions, resolution, file format, and color profile before delivery. A calculator can expose a size-resolution trade-off, while a proof or test print remains the practical way to inspect sharpness, color, and trimming.',
      'View a sample at the intended physical size whenever possible. Images used for a small card can tolerate a different pixel density and viewing distance than a gallery poster. Do not judge final print detail solely from a zoomed screen preview, because display scaling and screen pixel density differ from the output process. Keep a copy of any approved production file with its dimensions noted.',
    ],
    questionsAnswered: [
      'What print resolution results from a pixel width and a physical print width?',
      'How many centimetres or inches does an image represent at a chosen resolution?',
      'What dimensions preserve an image’s aspect ratio when one side is resized?',
      'Why can a file with many pixels still be unsuitable for a particular print?',
    ],
    toolDescriptions: [
      { slug: 'dpi-ppi', description: 'Calculate print resolution from pixel width and physical print width to check the relationship between file detail and output size.' },
      { slug: 'pixels-to-cm', description: 'Convert pixel dimensions into print-ready centimetre or inch dimensions using a chosen resolution.' },
      { slug: 'image-scaling', description: 'Resize an image from one dimension while preserving aspect ratio, helping avoid distortion.' },
    ],
    choosingTools: [
      'Use DPI / PPI Calculator when the pixel size and intended physical width are known and you need to check resulting resolution. Use Pixels to cm / inches when the pixel dimensions and a resolution target are known and you need to plan physical size.',
      'Use Image Scaling Calculator when the layout calls for a new width or height but the image must retain its original proportions. It preserves aspect ratio; it does not add genuine image detail or choose an appropriate crop.',
      'Treat DPI and PPI terminology carefully. Pixel density describes the image relationship; a printer’s dot process can involve additional device behavior. Confirm the file and delivery specification requested by the printer or platform.',
    ],
    unitCurrencyGuidance: [
      'Keep physical dimensions in one unit for a calculation, such as inches or centimetres, and use the intended pixels-per-inch setting consistently. Pixels are counts, while centimetres and inches are physical lengths.',
      'These tools do not calculate print price. Currency denomination or formatting, live FX rates, supplier quotes, paper costs, postage, and taxes are outside their scope; request those figures from the print provider.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Will upscaling create new detail?', answer: 'No. It can create a larger pixel file, but it cannot restore detail absent from the original image.' },
      { question: 'Does Image Scaling crop my image?', answer: 'No. It preserves the aspect ratio; cropping is a separate layout choice.' },
      { question: 'Are DPI and PPI always interchangeable?', answer: 'They are often used informally together, but PPI describes image pixels and printer dots can be device-specific.' },
      { question: 'Can the calculator quote a print job?', answer: 'No. It calculates dimensions and resolution, not supplier prices or currency conversions.' },
    ],
  },
  electrical: {
    introduction: [
      'Electrical calculations are useful for checking a stated design assumption: the relationship between voltage, current, resistance, power, conductor length, or appliance use. They do not establish that an installation is safe, compliant, correctly protected, or suitable for a particular building.',
      'Start with the equipment nameplate, circuit documentation, and the actual supply and conductor details. Keep AC and DC assumptions clear, and do not use a calculated value to select breakers, wire size, protective devices, or make changes to live equipment. When work involves fixed wiring, service equipment, unfamiliar faults, heat, damage, or a shock risk, use a qualified electrician and the rules that apply locally.',
    ],
    questionsAnswered: [
      'What voltage, current, resistance, or power follows from two known values under Ohm’s law?',
      'How do resistors combine in a series or parallel network?',
      'How much energy might an appliance use over a stated operating time, and what is the entered variable-rate cost?',
      'What conductor voltage loss follows from the entered current, length, resistance, and circuit type?',
    ],
    toolDescriptions: [
      { slug: 'electricity', description: 'Estimate appliance energy use from rated power and operating time, then apply an electricity price you enter; standing charges, demand charges, and changing tariffs are separate.' },
      { slug: 'ohms-law', description: 'Solve one of voltage, current, resistance, or power from two known electrical quantities using the idealized Ohm’s-law relationships.' },
      { slug: 'resistor', description: 'Calculate equivalent resistance for ideal resistors arranged in series or parallel.' },
      { slug: 'voltage-drop', description: 'Estimate conductor voltage loss from entered current, one-way length, resistance, and single- or three-phase circuit assumptions.' },
      { slug: 'cable-fuse-size', description: 'Estimate design current, cable cross-section, protective-device rating, and voltage drop for common low-voltage circuits, with metric or imperial cable-length input.' },
    ],
    choosingTools: [
      'Use Ohm’s Law Calculator for a basic relationship between known circuit quantities. Use Resistor Calculator when the question is specifically the equivalent resistance of a resistor network.',
      'Use Electricity Calculator for energy and an entered unit price, not for circuit design. Use Voltage Drop Calculator to explore a stated conductor scenario; its result is not a conductor-sizing or code-compliance determination.',
      'Check whether every input describes the same operating condition. Nameplate ratings, measured values, starting current, power factor, temperature, conductor material, connections, and load type can make a real circuit differ from a simple model.',
    ],
    unitCurrencyGuidance: [
      'Keep units explicit: volts (V), amperes (A), ohms (Ω), watts (W), kilowatts (kW), watt-hours (Wh), and kilowatt-hours (kWh) are different quantities. kW is power; kWh is energy accumulated over time.',
      'For an energy-cost estimate, enter the tariff in the same energy unit as the calculation and one currency denomination. The tool does not retrieve utility prices or account for taxes, tiered rates, fixed charges, or time-of-use billing.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Can these calculators tell me whether wiring is safe?', answer: 'No. A numeric estimate cannot inspect an installation or apply all local code, protection, environmental, and fault conditions.' },
      { question: 'Is kW the same as kWh?', answer: 'No. kW measures power at an instant; kWh measures energy used over time.' },
      { question: 'Does voltage drop select wire size?', answer: 'No. It estimates loss from the values entered. Conductor selection also requires applicable rules and installation details.' },
      { question: 'Should I measure a live circuit to fill in a calculator?', answer: 'Only if you are trained, authorized, and using appropriate procedures and equipment. Do not create an exposure merely to obtain an estimate.' },
    ],
  },
  technology: {
    introduction: [
      'Technology tools help make a technical transformation visible: a transfer-rate requirement, an IP network boundary, an encoded text component, or a newly generated password. They are designed for checking and planning, not for replacing system documentation, access controls, or production testing.',
      'Preserve the source value and context when using a result. A bandwidth target may not match usable throughput; an address calculation does not assign or route an address; and encoded text is not encrypted. Review a change in the environment where it will be used before deploying it.',
    ],
    questionsAnswered: [
      'What average transfer rate is needed to move a stated file size within a chosen time?',
      'What network and prefix scope follows from a valid IPv4 or IPv6 address with CIDR notation?',
      'How can Unicode text be Base64-encoded or a URL component percent-encoded locally?',
      'How can a locally generated random password be made suitable for a particular service?',
    ],
    toolDescriptions: [
      { slug: 'bandwidth', description: 'Calculate the average data rate needed to transfer a chosen file size within an entered duration.' },
      { slug: 'base64', description: 'Encode Unicode text as Base64 or decode valid Base64 to UTF-8 in the browser; Base64 is an encoding, not protection.' },
      { slug: 'ip-subnet', description: 'Validate an IPv4 or IPv6 address and calculate its CIDR network boundary and scope.' },
      { slug: 'password-generator', description: 'Generate a random password locally using browser cryptographic randomness, with character choices you control.' },
      { slug: 'url-encode-decode', description: 'Percent-encode or decode one Unicode URL component locally without treating the result as a complete URL validator.' },
    ],
    choosingTools: [
      'Use Bandwidth Calculator for a planning average. Compare its result with measured throughput and allow for protocol overhead, contention, latency, and service limits.',
      'Use IP Subnet Calculator to inspect valid CIDR notation and boundaries. It does not verify that an address is available, correctly routed, or permitted by a provider.',
      'Use Base64 for data representation and URL Encode / Decode for a URL component. Neither tool encrypts content. Use Password Generator for a new credential, then store it in a trusted password manager and meet the service’s requirements.',
    ],
    unitCurrencyGuidance: [
      'Distinguish bits from bytes and bits per second from bytes per second; an eight-fold difference matters in transfer estimates. Keep duration units and decimal or binary file-size conventions consistent with the source.',
      'These tools do not use currency or live network data. Inputs are processed locally where stated, but do not paste secrets, access tokens, private keys, or sensitive production data into a browser tool unless you understand the risk.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Is Base64 encryption?', answer: 'No. Base64 is reversible encoding and does not keep content secret.' },
      { question: 'Does a bandwidth result guarantee transfer time?', answer: 'No. It is an average requirement based on the inputs; real transfers have overhead and changing network conditions.' },
      { question: 'Can a subnet result configure my network?', answer: 'No. It calculates an address boundary; configuration, routing, and allocation still need to be checked.' },
      { question: 'Should I share a generated password?', answer: 'Treat it as a secret. Store it securely and use a unique password for each account.' },
    ],
  },
  'science-engineering': {
    introduction: [
      'Science and engineering calculations turn stated measurements into a transparent estimate: density from mass and volume, concentration from amount and solution volume, motion from distance and time, or weather indices from reported conditions. The result is only as applicable as the measurement method and model assumptions.',
      'Use calibrated or appropriately recorded inputs, preserve units, and keep enough significant figures until the final result. Environmental indices describe conditions, not personal safety or medical status; laboratory and mechanical work can introduce hazards beyond an equation. Follow the relevant procedure, safety data, equipment limits, and professional supervision.',
    ],
    questionsAnswered: [
      'How are density, mass, and volume related, and which units must agree?',
      'What molarity follows from moles of solute and final solution volume?',
      'What average speed or mechanical horsepower follows from the entered measurements?',
      'How do temperature, humidity, and wind speed affect dew point, heat index, and wind chill estimates?',
    ],
    toolDescriptions: [
      { slug: 'density', description: 'Calculate material density from mass and volume with explicit SI conversion.' },
      { slug: 'dew-point', description: 'Estimate dew point from air temperature and relative humidity using the Magnus formula.' },
      { slug: 'horsepower', description: 'Calculate mechanical horsepower from torque and RPM, with a kilowatt output.' },
      { slug: 'heat-index', description: 'Estimate the NOAA heat index from air temperature and relative humidity within the model’s applicable conditions.' },
      { slug: 'mass', description: 'Calculate material mass from density and volume, with SI and imperial outputs.' },
      { slug: 'molarity', description: 'Calculate solution molarity from amount of solute and final solution volume.' },
      { slug: 'molecular-weight', description: 'Calculate relative molecular mass and molar mass from a chemical formula, including nested parentheses and common element symbols.' },
      { slug: 'speed-calculator', description: 'Calculate average speed from distance and elapsed time, then compare common speed units.' },
      { slug: 'wind-chill', description: 'Estimate NOAA/NWS wind chill from cold air temperature and wind speed within its stated range.' },
    ],
    choosingTools: [
      'Use Density Calculator when mass and volume are known; use Mass Calculator when density and volume are known. Both require a material and measurement basis that makes physical sense.',
      'Use Molarity Calculator for a prepared solution’s final volume, not simply the solvent volume. Use Speed Calculator for average travel or motion over an interval, not instantaneous speed.',
      'Weather-index tools help describe reported conditions. Check their valid ranges and official forecasts or warnings; they cannot assess heat illness, cold injury, surface conditions, or a person’s exposure.',
    ],
    unitCurrencyGuidance: [
      'Convert to compatible units before calculation: density is mass per volume, molarity is moles per litre, and speed is distance per time. Label temperatures by scale and torque, RPM, and power by their stated units.',
      'No currency conversion, weather feed, laboratory calibration, or equipment certification is supplied. Record the source, time, and precision of measurements when a result is used in a technical record.',
    ],
    relatedGuides: [
      { href: '/articles/unit-conversion-basics', label: 'Unit conversion basics', description: 'Review dimensional units, factors, rounding, and ways to keep a calculation traceable.' },
    ],
    faqs: [
      { question: 'Are weather-index results safety advice?', answer: 'No. They estimate an index from entered conditions. Follow official alerts and seek prompt help for concerning symptoms or exposure.' },
      { question: 'Can I mix grams and litres without converting?', answer: 'Only where the formula and units support it. Convert quantities deliberately and retain the resulting unit.' },
      { question: 'Is calculated speed instantaneous speed?', answer: 'No. Distance divided by elapsed time gives average speed for that interval.' },
      { question: 'Does molarity use solvent volume?', answer: 'Molarity uses the final volume of the solution, not just the starting solvent volume.' },
    ],
  },
  health: {
    introduction: [
      'Health calculators can organize measurements and show the arithmetic behind screening, nutrition, activity, pregnancy, and timing estimates. They cannot diagnose a condition, assess symptoms, prescribe intake or exercise, establish pregnancy dating, or replace individualized care.',
      'Use recent measurements taken in the way the tool requests and treat a result as one data point. Age, medication, disability, training history, pregnancy, medical conditions, measurement error, and personal goals can change what a number means. Seek urgent care for urgent symptoms; discuss a concerning result or a planned change to food, activity, alcohol, or pregnancy care with a qualified clinician.',
    ],
    questionsAnswered: [
      'How do BMI, body-fat estimates, body surface area, lean mass, and ideal-weight formulas describe entered measurements?',
      'What energy, macronutrient, pace, heart-rate, or sleep-cycle estimate follows from the stated assumptions?',
      'How do last-menstrual-period calculations produce gestational-age, conception, or due-date estimates?',
      'Why do BAC and kidney-function estimates need careful interpretation rather than self-management?',
    ],
    toolDescriptions: [
      { slug: 'bmi', description: 'Calculate body mass index from height and weight; BMI is a screening measure, not a diagnosis.' },
      { slug: 'anorexic-bmi', description: 'Calculate BMI and show a non-diagnostic low-BMI screen; it cannot assess an eating disorder or overall health.' },
      { slug: 'army-body-fat', description: 'Estimate circumference body-fat screening using the stated US Army method and measurement inputs.' },
      { slug: 'bmr', description: 'Estimate resting energy needs with the Mifflin–St Jeor equation.' },
      { slug: 'body-fat', description: 'Estimate body-fat percentage from the tool’s stated BMI, age, and sex equation.' },
      { slug: 'body-surface-area', description: 'Estimate body surface area from height and weight using the Mosteller equation; clinical use requires professional context.' },
      { slug: 'calorie', description: 'Estimate energy needs with Mifflin–St Jeor and an entered activity factor, not a prescribed calorie target.' },
      { slug: 'calories-burned', description: 'Estimate exercise energy from MET, body weight, and duration.' },
      { slug: 'due-date', description: 'Estimate a due date from the first day of the last menstrual period; clinical dating may differ.' },
      { slug: 'pace', description: 'Calculate pace from distance and elapsed time for training or event planning.' },
      { slug: 'pregnancy-weight-gain', description: 'Show a general total-gain range from prepregnancy BMI; individual care guidance can differ.' },
      { slug: 'bac', description: 'Estimate blood alcohol concentration from entered assumptions; never use it to decide whether to drive or operate equipment.' },
      { slug: 'gfr', description: 'Estimate kidney filtration from the equation inputs; clinicians interpret it with tests, history, and trends.' },
      { slug: 'ideal-weight', description: 'Compare historical height-based weight formulas without presenting any one result as a required body weight.' },
      { slug: 'lean-body-mass', description: 'Estimate adult lean body mass with the Boer equation; it is not a measured body-composition test.' },
      { slug: 'macro', description: 'Split an entered calorie target across chosen carbohydrate, protein, and fat shares.' },
      { slug: 'pregnancy', description: 'Estimate gestational age from the first day of the last menstrual period; clinical dating may differ.' },
      { slug: 'pregnancy-conception', description: 'Estimate next period, ovulation, fertile-window, and conception timing from a regular-cycle assumption.' },
      { slug: 'sleep', description: 'Plan a wake time around 90-minute sleep cycles; real sleep needs and cycle timing vary.' },
      { slug: 'target-heart-rate', description: 'Estimate a heart-rate training zone from age and selected intensity.' },
      { slug: 'tdee', description: 'Estimate total daily energy expenditure from the stated formula and activity assumptions.' },
    ],
    choosingTools: [
      'Choose a body-composition or energy tool for the question it actually asks. BMI, body-fat equations, ideal-weight formulas, and calorie estimates use different inputs and should not be treated as interchangeable measures of health.',
      'Use pace and target-heart-rate tools for conservative activity planning, not to override symptoms, a clinician’s restrictions, or device alerts. Stop and seek care for warning symptoms such as chest pain, fainting, severe shortness of breath, or signs of heat illness.',
      'Pregnancy tools estimate dates from the entered menstrual information. Use the dates from your maternity team when available. BAC is never a fitness-to-drive test: do not drive after drinking or rely on a calculator to make that choice.',
    ],
    unitCurrencyGuidance: [
      'Enter height, weight, distance, time, and energy in the unit requested, and convert once rather than mixing systems. Calories are dietary kilocalories in common food labeling; they are not a currency or a measure of nutrient quality.',
      'Health tools do not access records, laboratory results, medications, wearable data, local emergency services, or live clinical guidance. Protect personal information and use a clinician or emergency service for care decisions.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Is a health calculator result a diagnosis?', answer: 'No. It is an estimate or screening value from limited inputs and needs clinical context.' },
      { question: 'Can a BAC estimate tell me I am safe to drive?', answer: 'No. Do not use any estimate to decide to drive, operate machinery, or take safety-sensitive risks after drinking.' },
      { question: 'Why might a due-date estimate differ from my clinician’s date?', answer: 'Cycle timing, ultrasound dating, and clinical information can change the estimated date.' },
      { question: 'Should I change diet or exercise from one result?', answer: 'Discuss meaningful changes, medical conditions, pregnancy, symptoms, or concerning results with a qualified clinician.' },
    ],
  },
  education: {
    introduction: [
      'Education calculators make point-total percentages and GPA arithmetic easier to check by showing how earned points, possible points, grade points, and credits combine. They are useful for planning and conversations with an instructor or adviser, but the syllabus, transcript policy, and institution’s official calculation control the recorded result.',
      'Before entering numbers, identify the grading scale, whether a score is a percentage or grade point, and which work is included. Repeats, withdrawals, pass/fail courses, incomplete grades, rounding, transfer credit, dropped assignments, and category rules can change an official outcome.',
      'Save the inputs with the date and course policy used. That makes it easier to explain a difference later if an instructor, gradebook, or transcript applies another weighting or rounding rule.',
    ],
    questionsAnswered: [
      'What course percentage follows from points earned divided by points possible?',
      'How do grade points and course credits combine into a GPA estimate?',
      'Which grading-policy details should be checked before treating a calculated result as official?',
      'How can a current estimate help plan the score needed on remaining work?',
    ],
    toolDescriptions: [
      { slug: 'grade', description: 'Calculate a course percentage by dividing total points earned by total points possible.' },
      { slug: 'gpa', description: 'Calculate a weighted GPA estimate from entered course grade points and credits on the scale you select.' },
    ],
    choosingTools: [
      'Use Grade Calculator when you have the course totals for points earned and points possible. Add included assignment points before entering them; this tool does not apply separate assessment weights.',
      'Use GPA Calculator for course-level grade points weighted by credits. A raw percentage should not be entered as a grade point unless the institution explicitly maps it that way.',
      'Use an estimate to ask a specific question, such as what a remaining assessment could change. Confirm consequential decisions about progression, funding, graduation, or eligibility with the official record or academic office.',
    ],
    unitCurrencyGuidance: [
      'Grades are not physical units or currency. Keep earned points, possible points, percentages, grade points, and credits distinct; they have different denominators and cannot be combined without the school’s conversion rule.',
      'The calculators do not retrieve a school’s gradebook, transcript, catalog, deadlines, or policy. Retain the syllabus and official scale alongside the inputs, particularly when rules change by course or term.',
    ],
    relatedGuides: [],
    faqs: [
      { question: 'Is a calculated GPA official?', answer: 'No. The institution’s transcript rules, scale, and rounding determine the official GPA.' },
      { question: 'Why does my course percentage differ from one assignment score?', answer: 'The calculator uses all included points earned and possible, so one assignment may not represent the course total.' },
      { question: 'Can I use percentage scores as GPA points?', answer: 'Not unless your institution provides that conversion. Percentage and grade-point scales are different.' },
      { question: 'Do repeated courses count twice?', answer: 'Policies differ. Check the institution’s repeat, withdrawal, and replacement rules.' },
    ],
  },
};