export type PriorityOneCurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZAR';
const formatCurrency = (value: number, currency: PriorityOneCurrencyCode) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency,
  maximumFractionDigits: 2,
}).format(value);

export type PriorityOneExpansionSlug =
  | 'bmr' | 'currency' | 'gpa' | 'grade' | 'marriage-tax' | 'gas-mileage' | 'tip'
  | 'boat-loan' | 'business-loan' | 'canadian-mortgage' | 'cash-back-or-low-interest'
  | 'discount' | 'estate-tax' | 'fha-loan' | 'home-equity-loan' | 'interest' | 'investment'
  | 'uk-mortgage' | 'personal-loan' | 'retirement' | 'sales-tax' | 'student-loan' | 'tax'
  | 'va-mortgage' | 'anorexic-bmi' | 'army-body-fat' | 'bmi' | 'body-fat' | 'calorie'
  | 'calories-burned' | 'due-date' | 'pace' | 'pregnancy' | 'pregnancy-conception'
  | 'pregnancy-weight-gain' | 'sleep';
export type ExpansionCategory = 'health' | 'education' | 'finance' | 'automotive' | 'converters';
export type PriorityOneField = { key: string; label: string; type?: 'number' | 'date' | 'time' | 'select'; value: string; min?: number; max?: number; step?: string; options?: readonly { label: string; value: string }[]; suffix?: string };
export type PriorityOneSourceLink = { label: string; href: string };
export type PriorityOneDefinition = { slug: PriorityOneExpansionSlug; name: string; description: string; seoDescription: string; category: ExpansionCategory; categorySlug: string; tags: readonly string[]; href: string; fields: readonly PriorityOneField[]; resultLabel: string; formula: string; safetyNotice: string; sourceLinks: readonly PriorityOneSourceLink[]; educationalSections: readonly { heading: string; body: string }[]; limitations: string; faqs: readonly { question: string; answer: string }[]; relatedRoutes: readonly string[] };
export type PriorityOneResult = { primary: string; summary: string; details: { label: string; value: string }[]; error?: string };

const opts = (items: string[]) => items.map(value => ({ value, label: value }));
const f = (key: string, label: string, value: string, suffix?: string): PriorityOneField => ({ key, label, value, suffix, min: 0, step: 'any' });
const moneyFields = [f('principal', 'Amount financed', '25000'), f('rate', 'Annual rate', '6.5', '%'), f('years', 'Term', '5', 'years')];
const specs: Array<[PriorityOneExpansionSlug, string, ExpansionCategory, string, string, PriorityOneField[]]> = [
 ['bmr','BMR Calculator','health','Estimate resting energy needs with Mifflin–St Jeor.','Mifflin–St Jeor equation',[f('weight','Weight (kg)','70'),f('height','Height (cm)','175'),f('age','Age','30'),{...f('sex','Sex','male'),type:'select',options:opts(['male','female'])}]],
 ['currency','Currency Converter','converters','Convert an amount using the exchange rate you enter.','converted amount = amount × entered rate',[f('amount','Amount','100'),f('rate','Exchange rate','0.92'),{...f('from','From currency','USD'),type:'select',options:opts(['USD','EUR','GBP','ZAR'])},{...f('to','To currency','EUR'),type:'select',options:opts(['USD','EUR','GBP','ZAR'])}]],
  ['gpa','GPA Calculator','education','Calculate a weighted GPA across up to three courses.','GPA = Σ(grade points × credits) ÷ Σ credits',[
    {...f('gradePoints1','Course 1 grade points (0–4)','3.7'),max:4},{...f('credits1','Course 1 credits','3'),min:0.5},
    {...f('gradePoints2','Course 2 grade points (0–4)','3.3'),max:4},{...f('credits2','Course 2 credits','4'),min:0.5},
    {...f('gradePoints3','Course 3 grade points (0–4)','4'),max:4},{...f('credits3','Course 3 credits','3'),min:0.5},
  ]],
 ['grade','Grade Calculator','education','Calculate a course percentage from total points earned and points possible.','percentage = earned ÷ possible × 100',[f('earned','Points earned','86'),f('possible','Points possible','100')]],
 ['marriage-tax','Marriage Tax Calculator','finance','Compare entered separate and joint tax liabilities.','marriage effect = joint liability − separate liabilities',[f('first','First separate liability','12000'),f('second','Second separate liability','8000'),f('joint','Joint liability','19000')]],
  ['gas-mileage','Gas Mileage Calculator','automotive','Estimate fuel mileage from trip distance and fuel used.','Mileage = distance ÷ fuel',[f('distance','Trip distance','300','miles'),f('fuel','Fuel used','12','gallons')]],
 ['tip','Tip Calculator','finance','Calculate gratuity and a split total.','tip = bill × rate',[f('bill','Bill','80'),f('rate','Tip rate','20','%'),f('people','People splitting','2')]],
 ['boat-loan','Boat Loan Calculator','finance','Estimate a fixed boat loan payment.','monthly amortization formula',moneyFields],
 ['business-loan','Business Loan Calculator','finance','Estimate a fixed business loan payment.','monthly amortization formula',moneyFields],
 ['canadian-mortgage','Canadian Mortgage Calculator','finance','Apply Canadian semi-annual nominal compounding.','monthly rate = (1 + nominal/2)^(2/12) − 1',moneyFields],
 ['cash-back-or-low-interest','Cash Back or Low Interest Calculator','finance','Compare cash back with interest cost.','cash-back cost versus amortized APR cost',[f('price','Purchase price','30000'),f('cashBack','Cash back','1500'),f('lowRate','Low APR','2','%'),f('standardRate','Standard APR','7','%'),f('years','Term','5','years')]],
 ['discount','Discount Calculator','finance','Calculate a sale price and savings.','sale price = original × (1 − discount)',[f('price','Original price','100'),f('rate','Discount','25','%')]],
 ['estate-tax','Estate Tax Calculator','finance','Plan an estimate after an entered exemption and rate.','taxable estate = max(0, estate − exemption)',[f('estate','Estate value','15000000'),f('exemption','Exemption','13610000'),f('rate','Marginal rate','40','%')]],
 ['fha-loan','FHA Loan Calculator','finance','Estimate FHA principal, upfront MIP, and payment.','base loan plus financed upfront MIP; amortization',[f('price','Home price','350000'),f('down','Down payment','12250'),f('rate','Interest rate','6.5','%'),f('years','Term','30','years'),f('annualMip','Annual MIP','0.55','%')]],
 ['home-equity-loan','Home Equity Loan Calculator','finance','Estimate a fixed home equity loan payment.','monthly amortization formula',moneyFields],
 ['interest','Interest Calculator','finance','Calculate simple interest on a fixed principal.','interest = principal × rate × years',moneyFields],
 ['investment','Investment Calculator','finance','Project compound investment growth.','FV = principal(1+r/12)^(12 years)',moneyFields],
 ['uk-mortgage','UK Mortgage Calculator','finance','Estimate a monthly repayment mortgage payment.','monthly repayment amortization formula',moneyFields],
 ['personal-loan','Personal Loan Calculator','finance','Estimate a fixed personal loan payment.','monthly amortization formula',moneyFields],
 ['retirement','Retirement Calculator','finance','Project a retirement balance with monthly contributions.','FV = principal growth + contribution annuity',[f('principal','Current savings','50000'),f('monthly','Monthly contribution','500'),f('rate','Annual return','6','%'),f('years','Years','25','years')]],
 ['sales-tax','Sales Tax Calculator','finance','Calculate tax and total purchase cost.','tax = price × rate',[f('price','Price before tax','100'),f('rate','Sales tax rate','8','%')]],
 ['student-loan','Student Loan Calculator','finance','Estimate a fixed student loan payment.','monthly amortization formula',moneyFields],
 ['tax','Tax Calculator','finance','Plan flat tax from an entered rate.','tax = taxable income × entered rate',[f('income','Taxable income','75000'),f('rate','Planning tax rate','22','%')]],
 ['va-mortgage','VA Mortgage Calculator','finance','Estimate VA funding fee and payment.','loan = price − down + funding fee; amortization',[f('price','Home price','350000'),f('down','Down payment','0'),f('rate','Interest rate','6.5','%'),f('years','Term','30','years'),f('fee','Funding fee','2.15','%')]],
 ['anorexic-bmi','BMI Screening Calculator','health','Calculate BMI and show a non-diagnostic low-BMI screen.','BMI = kg ÷ m²',[f('weight','Weight (kg)','50'),f('height','Height (cm)','170')]],
 ['army-body-fat','Army Body Fat Calculator','health','Estimate circumference body-fat screening.','US Army circumference method',[f('height','Height (in)','70'),f('neck','Neck (in)','15'),f('waist','Waist (in)','34'),f('hip','Hip (in)','38'),{...f('sex','Sex','male'),type:'select',options:opts(['male','female'])}]],
 ['bmi','BMI Calculator','health','Calculate body mass index from metric measures.','BMI = kg ÷ m²',[f('weight','Weight (kg)','70'),f('height','Height (cm)','175')]],
 ['body-fat','Body Fat Calculator','health','Estimate body fat with the BMI/age equation.','BF% = 1.20×BMI + 0.23×age − sex adjustment',[f('weight','Weight (kg)','70'),f('height','Height (cm)','175'),f('age','Age','30'),{...f('sex','Sex','male'),type:'select',options:opts(['male','female'])}]],
 ['calorie','Calorie Calculator','health','Estimate Mifflin–St Jeor needs with activity.','TDEE = BMR × activity factor',[f('weight','Weight (kg)','70'),f('height','Height (cm)','175'),f('age','Age','30'),{...f('sex','Sex','male'),type:'select',options:opts(['male','female'])},{...f('activity','Activity factor','1.55'),type:'select',options:opts(['1.2','1.375','1.55','1.725','1.9'])}]],
 ['calories-burned','Calories Burned Calculator','health','Estimate exercise energy from MET, weight, and duration.','kcal = MET × 3.5 × kg ÷ 200 × minutes',[f('met','Activity MET','6'),f('weight','Weight (kg)','70'),f('minutes','Minutes','45')]],
 ['due-date','Due Date Calculator','health','Estimate due date from last menstrual period.','LMP + 280 days',[{key:'date',label:'First day of last menstrual period',type:'date',value:'2025-01-01'}]],
 ['pace','Pace Calculator','health','Calculate pace per distance unit.','pace = time ÷ distance',[f('distance','Distance','5','km'),f('minutes','Time','30','minutes')]],
 ['pregnancy','Pregnancy Calculator','health','Estimate gestational age from LMP.','today − LMP',[{key:'date',label:'First day of last menstrual period',type:'date',value:'2025-01-01'}]],
 ['pregnancy-conception','Pregnancy Conception Calculator','health','Estimate conception and due dates from LMP.','conception ≈ LMP + 14 days',[{key:'date',label:'First day of last menstrual period',type:'date',value:'2025-01-01'}]],
 ['pregnancy-weight-gain','Pregnancy Weight Gain Calculator','health','Show IOM total gain range by prepregnancy BMI.','IOM BMI category range',[f('weight','Prepregnancy weight (kg)','65'),f('height','Height (cm)','165')]],
  ['sleep','Sleep Calculator','health','Plan wake times from the bedtime you enter using 90-minute sleep cycles.','wake time = bedtime + 90 minutes × cycles',[{key:'bedtime',label:'Bedtime',type:'time',value:'23:00'}]],
];
const seoDescriptions: Partial<Record<PriorityOneExpansionSlug, string>> = {
  bmr: 'Estimate basal metabolic rate with the Mifflin–St Jeor equation from age, sex, height, and weight for daily energy planning.',
  gpa: 'Calculate a weighted GPA from grade points and course credits across three courses, with total credits and quality points shown.',
  grade: 'Calculate a course grade percentage from points earned and points possible, with clear validation when the possible total is zero.',
  'marriage-tax': 'Compare separate and joint tax liabilities you enter to estimate a marriage tax bonus or penalty for planning scenarios.',
  'gas-mileage': 'Calculate gas mileage in miles per gallon from trip distance and fuel used, with a transparent distance-divided-by-fuel result.',
  tip: 'Calculate a tip, total bill, and amount per person from the bill, gratuity rate, and number of people sharing the check.',
  'boat-loan': 'Estimate a fixed boat loan payment, total repayment, and interest from the amount financed, annual rate, and loan term.',
  'business-loan': 'Estimate a fixed business loan payment, total repayment, and interest from principal, annual rate, and repayment term.',
  'canadian-mortgage': 'Estimate a Canadian mortgage payment using nominal interest compounded semi-annually, with total payment and interest details.',
  'cash-back-or-low-interest': 'Compare a cash-back offer with low-interest financing to see which option has the lower estimated total cost.',
  discount: 'Calculate a sale price and savings from an original price and discount percentage, with a clear pre-tax result.',
  'estate-tax': 'Estimate estate tax from the estate value, exemption, and marginal rate you enter for a transparent planning scenario.',
  'fha-loan': 'Estimate an FHA loan payment with financed upfront mortgage insurance and monthly MIP from the home price and loan terms.',
  'home-equity-loan': 'Estimate a fixed home equity loan payment, total repayment, and interest from the principal, rate, and term you enter.',
  interest: 'Calculate simple interest and ending balance from principal, annual interest rate, and time without compounding.',
  investment: 'Project compound investment growth from a starting balance, annual return, and time using monthly compounding.',
  'uk-mortgage': 'Estimate a UK repayment mortgage’s monthly principal and interest payment from the loan amount, annual rate, and term.',
  'personal-loan': 'Estimate a fixed personal loan payment, total repayment, and interest from the amount borrowed, APR, and term.',
  retirement: 'Project a retirement balance from current savings, monthly contributions, annual return, and years until retirement.',
  'sales-tax': 'Calculate sales tax and total purchase price from a pre-tax amount and the sales-tax rate you enter.',
  'student-loan': 'Estimate a fixed student loan payment, total repayment, and interest from the loan balance, annual rate, and term.',
  tax: 'Estimate tax and after-tax total from taxable income and a flat planning rate you enter; no tax brackets are assumed.',
  'va-mortgage': 'Estimate a VA mortgage payment and financed funding fee from home price, down payment, interest rate, term, and fee rate.',
  'anorexic-bmi': 'Calculate BMI and view a non-diagnostic low-BMI screening result with clear limits; this tool cannot diagnose an eating disorder.',
  'army-body-fat': 'Estimate circumference-based body-fat percentage with the U.S. Army method from height, neck, waist, hip, and sex inputs.',
  'body-fat': 'Estimate body-fat percentage from BMI, age, and sex using a population equation, with clear non-diagnostic limitations.',
  calorie: 'Estimate daily maintenance calories from Mifflin–St Jeor resting energy and an activity factor for general planning.',
  'calories-burned': 'Estimate calories burned during activity from MET value, body weight, and duration using a transparent exercise-energy formula.',
  'due-date': 'Estimate a pregnancy due date from the first day of the last menstrual period using the standard 280-day dating method.',
  pace: 'Calculate average pace per kilometre from distance and elapsed time, with validation for a nonzero distance.',
  pregnancy: 'Estimate gestational age in weeks from the first day of the last menstrual period, with clinical-dating limitations.',
  'pregnancy-weight-gain': 'View the IOM total pregnancy weight-gain range associated with prepregnancy BMI for a singleton pregnancy.',
  sleep: 'Plan possible wake-up times from your bedtime using four, five, or six 90-minute sleep cycles, with cycle durations shown.',
};
const seoDescriptionFor = (slug: PriorityOneExpansionSlug, description: string) =>
  seoDescriptions[slug] ?? `${description.replace(/[.!?]+$/, '')}. Review the stated inputs, formula, assumptions, and practical limits for this calculator.`;
const categorySlug = (c: ExpansionCategory) => c === 'converters' ? 'converters' : c;
const route = (slug: PriorityOneExpansionSlug, c: ExpansionCategory) => slug === 'currency' ? '/converters/currency' : `/calculators/${categorySlug(c)}/${slug}`;
const relatedRoutesFor = (slug: PriorityOneExpansionSlug, category: ExpansionCategory) => {
  if (category === 'converters') return ['/converters/unit', '/converters/length', '/converters/weight'];
  if (category === 'automotive') return ['/calculators/automotive/mileage', '/calculators/automotive/tire-size', '/converters/power'];
  if (category === 'education') {
    const peer = slug === 'gpa' ? '/calculators/education/grade' : '/calculators/education/gpa';
    return [peer, '/calculators/math/average', '/calculators/math/percentage-increase-decrease'];
  }
  const related = specs.filter(([candidate,, candidateCategory]) => candidateCategory === category && candidate !== slug).slice(0, 3).map(([candidate,, candidateCategory]) => route(candidate, candidateCategory));
  return related;
};
const useGuidance = (category: ExpansionCategory, name: string) => category === 'health'
  ? `Use the ${name} result as a planning estimate, not a diagnosis or treatment recommendation. Discuss symptoms, pregnancy care, or changes to diet, sleep, or activity with a qualified clinician.`
  : category === 'education'
    ? `Use the ${name} result to check your coursework, then compare it with your syllabus or school record because grading policies can differ.`
    : category === 'finance'
      ? `Use the ${name} result to compare planning scenarios, then verify rates, fees, taxes, and terms in the current official documents.`
      : `Use the ${name} result to check the measurements and assumptions you entered; real-world conditions and product specifications can vary.`;
const sourcesFor = (slug: PriorityOneExpansionSlug, category: ExpansionCategory): readonly PriorityOneSourceLink[] => {
  if (category === 'education') return [{ label: 'U.S. Department of Education — Student records and grades', href: 'https://www.ed.gov/laws-and-policy/education-policy' }];
  if (category === 'health') {
    if (slug === 'sleep') return [{ label: 'National Heart, Lung, and Blood Institute — Sleep deprivation and deficiency', href: 'https://www.nhlbi.nih.gov/health/sleep-deprivation' }];
    if (slug === 'due-date' || slug === 'pregnancy' || slug === 'pregnancy-conception' || slug === 'pregnancy-weight-gain') return [{ label: 'CDC — Pregnancy', href: 'https://www.cdc.gov/pregnancy/' }];
    if (slug === 'army-body-fat') return [{ label: 'U.S. Army — Body composition program', href: 'https://www.armyresilience.army.mil/ard/R2/Body-Composition-Program.html' }];
    return [{ label: 'CDC — About Adult BMI', href: 'https://www.cdc.gov/bmi/about/index.html' }];
  }
  if (category === 'finance') {
    if (slug === 'tax' || slug === 'marriage-tax' || slug === 'estate-tax' || slug === 'sales-tax') return [{ label: 'IRS — Tax information for individuals', href: 'https://www.irs.gov/individuals' }];
    if (slug === 'retirement') return [{ label: 'IRS — Retirement plans', href: 'https://www.irs.gov/retirement-plans' }];
    if (slug === 'fha-loan') return [{ label: 'U.S. Department of Housing and Urban Development — FHA loans', href: 'https://www.hud.gov/buying/loans' }];
    if (slug === 'va-mortgage') return [{ label: 'U.S. Department of Veterans Affairs — VA home loans', href: 'https://www.va.gov/housing-assistance/home-loans/' }];
    if (slug === 'canadian-mortgage') return [{ label: 'Financial Consumer Agency of Canada — Mortgages', href: 'https://www.canada.ca/en/financial-consumer-agency/services/mortgages.html' }];
    if (slug === 'uk-mortgage') return [{ label: 'Financial Conduct Authority — Mortgages', href: 'https://www.fca.org.uk/consumers/mortgages' }];
    if (slug === 'home-equity-loan') return [{ label: 'Consumer Financial Protection Bureau — Mortgages', href: 'https://www.consumerfinance.gov/owning-a-home/' }];
    if (['boat-loan', 'business-loan', 'cash-back-or-low-interest', 'personal-loan', 'student-loan', 'interest', 'investment'].includes(slug)) return [{ label: 'Consumer Financial Protection Bureau — Consumer loans', href: 'https://www.consumerfinance.gov/consumer-tools/' }];
    return [{ label: 'Consumer Financial Protection Bureau — Financial education', href: 'https://www.consumerfinance.gov/consumer-tools/educator-tools/' }];
  }
  return [];
};
const safetyNoticeFor = (slug: PriorityOneExpansionSlug, category: ExpansionCategory, name: string) => {
  if (category === 'health') return `This ${name} result is an estimate, not a diagnosis or treatment plan. Seek urgent care for concerning symptoms and discuss pregnancy, diet, sleep, or activity decisions with a qualified clinician.`;
  if (category === 'education') return `Your school’s syllabus and official record control. This ${name} calculation cannot apply course-specific weighting, repeats, exclusions, or institutional grading policies.`;
  if (category === 'finance') return `This ${name} result is for planning only. Verify current rates, fees, taxes, eligibility, and contract terms in official documents before borrowing, investing, filing, or signing.`;
  return `Check that your units and measurements match the situation before relying on this ${name} estimate.`;
};
const interpretationFor = (category: ExpansionCategory, name: string, description: string) => {
  if (category === 'health') return `${description} The ${name} result describes only the measurements and method shown; it is not a diagnosis or an individualized target.`;
  if (category === 'education') return `${description} The ${name} result reflects the entered points or grade values, not unentered course rules.`;
  if (category === 'finance') return `${description} The ${name} result is a scenario based on the entered amounts, rate, and term rather than a quote or eligibility decision.`;
  if (category === 'converters') return `${description} The entered exchange rate controls the conversion; changing the currency labels does not fetch a live market rate.`;
  return `${description} The result describes the entered trip distance and fuel use, not a vehicle's certified or future fuel economy.`;
};
const priorityContexts: Partial<Record<PriorityOneExpansionSlug, string>> = {
  'marriage-tax':'This comparison uses three liabilities already calculated on the same tax-year and currency basis: each person filing separately and the couple filing jointly. It does not calculate either return or capture filing-status eligibility, deductions, credits, phaseouts, state tax, or future-law changes.',
  'boat-loan':'A boat loan payment depends on the amount actually financed, the contractual annual rate, and the repayment term. Purchase tax, registration, insurance, marina costs, maintenance, a down payment, a balloon amount, lender fees, and secured-loan conditions remain separate decisions.',
  'business-loan':'This fixed-payment illustration treats the entered principal as fully advanced and repaid in equal monthly installments. Origination fees, variable rates, interest-only periods, balloon payments, collateral, guarantees, covenants, taxes, and the business cash-flow needed to service debt are outside the formula.',
  'canadian-mortgage':'This page converts a nominal annual mortgage rate compounded semi-annually into an equivalent monthly rate before calculating level payments. It does not model lender qualification, insured-mortgage premiums, property tax, renewal rates, payment frequency alternatives, prepayment privileges, or provincial closing costs.',
  'cash-back-or-low-interest':'The comparison places a manufacturer cash rebate against two fixed-rate financing scenarios using the same vehicle price and term. It assumes the rebate reduces the financed price only in the standard-rate option; taxes, fees, down payment, trade-in value, dealer discounts, and early payoff can change the choice.',
  'fha-loan':'The FHA scenario subtracts the entered down payment, finances a simplified upfront mortgage-insurance percentage, and adds an entered annual MIP rate to the monthly estimate. Eligibility, county loan limits, credit underwriting, property requirements, closing costs, taxes, insurance, and the official current MIP schedule require separate confirmation.',
  'home-equity-loan':'A home-equity loan is represented as one fixed principal-and-interest installment over the entered term. Available equity, combined loan-to-value limits, appraisal, closing costs, liens, rate type, tax treatment, lender approval, and the risk of securing debt against a home are not determined here.',
  'personal-loan':'This personal-loan estimate amortizes the amount borrowed with a constant annual rate and equal monthly payments. An advertised APR may include fees differently, and actual offers can depend on credit, income, term, origination deductions, optional products, late charges, and early-payment rules.',
  retirement:'The retirement projection grows current savings and end-of-month contributions at one constant nominal annual return. It does not predict markets or include inflation, fees, tax, contribution limits, employer matching, changing deposits, withdrawals, pension income, sequence risk, or the spending needed in retirement.',
  'anorexic-bmi':'This page calculates adult BMI and labels a low-BMI screening range without assessing eating behavior, weight history, symptoms, age-specific growth, pregnancy, muscularity, illness, medication, or mental health. BMI alone cannot diagnose anorexia nervosa or identify the cause or urgency of a low weight.',
  'army-body-fat':'The Army circumference equation combines height and measured neck, waist, and—where selected—hip circumference. Tape placement, tension, rounding rules, sex-specific equation choice, current service policy, measurement personnel, body shape, and official retesting procedures can materially change an administrative result.',
  'pregnancy-weight-gain':'This page maps prepregnancy BMI to broad Institute of Medicine total weight-gain ranges for a singleton pregnancy. Gestational week, multiple pregnancy, fetal growth, fluid changes, nausea, medical conditions, starting-weight accuracy, and the care team’s individualized plan are not represented by the range.',
  sleep:'The displayed wake times add exact 90-minute blocks to the bedtime entered. Real sleep cycles vary within and between people, and time needed to fall asleep, awakenings, sleep debt, age, shift work, illness, medication, alcohol, and sleep disorders can make a cycle-based clock suggestion unsuitable.',
  discount:'A discount starts with the listed price; it does not include sales tax, shipping, stacked coupons, minimum-spend rules, or retailer rounding.',
  'estate-tax':'Estate planning requires a complete inventory, valuation date, debts, deductions, marital transfers, state rules, and current federal law; this three-input scenario cannot supply those facts.',
  interest:'Simple interest leaves principal unchanged throughout the entered years. It differs from a loan balance that falls with payments and from an account that credits earned interest to principal.',
  investment:'This projection compounds one starting balance monthly at the entered annual return. It deliberately omits deposits, withdrawals, fees, taxes, inflation, sequence risk, and any assurance of future performance.',
  'sales-tax':'Sales-tax treatment can depend on destination, product taxability, exemptions, shipping, local surtaxes, and invoice rounding. Enter the rate for the actual transaction rather than treating this as a tax lookup.',
  'student-loan':'The payment is a fixed principal-and-interest illustration. Federal repayment plans, capitalization, forgiveness, deferment, subsidy rules, servicer timing, and private-loan terms can produce a different obligation.',
  tax:'This page multiplies taxable income by one entered planning rate. It does not model brackets, credits, deductions, filing status, payroll withholding, state tax, or a filing calculation.',
  tip:'The gratuity is calculated from the bill entered here and then divided among the entered people. Check whether service charges, tax, split checks, discounts, or individual orders change the amount you intend to tip.',
  'uk-mortgage':'The UK result is a simple monthly repayment illustration. Actual UK products can use lender-specific daily interest, introductory periods, fees, overpayment limits, affordability checks, and different payment dates.',
  'va-mortgage':'The VA illustration finances the entered funding-fee percentage. Eligibility, exemptions, residual-income underwriting, closing costs, lender fees, occupancy requirements, and the current funding-fee schedule need official confirmation.',
  'gas-mileage':'Trip mileage uses miles divided by gallons for one completed trip or refill interval. It does not estimate EPA ratings, route conditions, idling, fuel quality, vehicle maintenance, or future consumption.',
  bmr:'Mifflin–St Jeor estimates resting energy from age, sex, height, and weight. It cannot measure an individual metabolism, illness, medication effects, pregnancy needs, body composition, or a safe calorie target.',
  'body-fat':'The BMI-and-age equation is a population estimate, not a direct body-composition measurement. Hydration, muscularity, age, sex classification, ethnicity, and measurement method can make an individual result differ.',
  calorie:'Daily energy is estimated by multiplying Mifflin–St Jeor resting energy by the selected activity factor. It is not a meal plan and does not account for clinical conditions, pregnancy, medications, or changing training load.',
  'calories-burned':'MET arithmetic estimates activity energy from one MET value, body weight, and minutes. Intensity, fitness, terrain, temperature, device readings, and pauses can make actual energy expenditure different.',
  'due-date':'The 280-day estimate begins with the first day of the last menstrual period, not conception. Cycle length, uncertain dates, ultrasound findings, multiple pregnancy, and clinician assessment can change pregnancy dating.',
  pace:'Average pace divides total elapsed minutes by total distance. It does not describe split variability, pauses, hills, weather, injury risk, course measurement, or a recommended training intensity.',
  pregnancy:'Gestational age is counted from the first day of the last menstrual period, which usually predates conception. It is not confirmation of pregnancy, viability, fetal development, or an individual care plan.',
  gpa:'This weighted GPA multiplies each entered grade-point value by its credits and divides by total credits. It cannot apply a school’s repeated-course, pass/fail, honors, transfer, rounding, or cumulative-record policy.',
  grade:'The percentage is points earned divided by points possible. It cannot infer dropped assignments, category weights, curves, extra credit, late penalties, or the grading thresholds in a particular syllabus.',
  currency:'The conversion multiplies your amount by the rate you manually enter. Currency labels format the result only; no live quote, spread, bank fee, transfer charge, market timestamp, or settlement rule is retrieved.',
};
const detailedEducationFor = (slug: PriorityOneExpansionSlug, category: ExpansionCategory, name: string, formula: string, fields: readonly PriorityOneField[], description: string) => {
  const inputs = fields.map((field) => field.label.toLowerCase()).join(', ');
  const context = priorityContexts[slug] ?? '';
  const safety = category === 'health'
    ? ' This is general information, not a diagnosis, treatment target, or substitute for individual clinical care. Discuss symptoms, pregnancy dating, nutrition, exercise, or a concerning result with a qualified clinician.'
    : category === 'finance'
      ? ' This is for planning only, not a quote, tax return, eligibility decision, investment recommendation, or contract. Check current rates, fees, taxes, and official terms before acting.'
      : slug === 'currency'
        ? ' The selected labels and entered rate are formatting and manual assumptions only: this calculator does not retrieve a live foreign-exchange rate.'
        : '';
  return [
    { heading: 'Enter a consistent scenario', body: `Use ${name} with values from one clearly defined scenario. The visible inputs are ${inputs}. ${context} Check the unit, period, and meaning of each value before calculating; combining records from different dates can produce a precise-looking but unhelpful answer.` },
    { heading: 'Follow the method', body: `This page applies ${formula}. ${context} First identify what each entered value represents, convert a percentage to the form required by the displayed formula, and retain intermediate precision. Then make a rough mental check of direction and size. ${description} The worked result is transparent arithmetic rather than an unshown lookup.` },
    { heading: 'Use the result carefully', body: `Read the output as an answer to the narrow question described by the fields, not as a prediction of every real-world outcome. ${context} For ${name}, compare results only when the measurement basis, time period, currency denomination, or grading convention is the same.${safety}` },
    { heading: 'Assumptions and boundaries', body: `Before relying on ${name}, identify what its formula—${formula}—holds constant and what it does not observe. ${context} Its entries (${inputs}) define the full scope of this particular result. Do not turn a rounded display into more certainty than the entered data supports; use the official record or provider documentation where it controls.` },
    { heading: 'Common mistakes and next steps', body: `For ${name}, begin a review by comparing the displayed ${inputs} against the source record. ${context} Typical mistakes are entering a percent as a decimal or vice versa, using an amount from the wrong time period, rounding before the final step, and treating an estimate as an official determination. Record the inputs and result if you need to compare scenarios later.` },
  ];
};
export const priorityOneExpansionDefinitions: Record<PriorityOneExpansionSlug, PriorityOneDefinition> = Object.fromEntries(specs.map(([slug,name,category,description,formula,fields]) => [slug, { slug,name,description,seoDescription:seoDescriptionFor(slug,description),category,categorySlug: categorySlug(category),tags: [category, ...(slug === 'gas-mileage' ? ['Mileage', 'fuel economy', 'mpg'] : []), 'calculator'],href: route(slug,category),fields,resultLabel: `ESTIMATED ${name.toUpperCase()}`,formula,safetyNotice:safetyNoticeFor(slug,category,name),sourceLinks:sourcesFor(slug,category),educationalSections:[{heading:'What the result means',body:interpretationFor(category,name,description)},...(priorityContexts[slug] ? detailedEducationFor(slug,category,name,formula,fields,description) : [])],limitations:safetyNoticeFor(slug,category,name),faqs:[{question:`What does the ${name} calculate?`,answer:description},{question:`Which inputs does the ${name} use?`,answer:`It uses only the fields shown on this page: ${formula}.`},{question:`How should I use my ${name} result?`,answer:useGuidance(category,name)},{question:`Why might another ${name} result differ?`,answer:`Another ${name} may use a different method, input scope, or rounding convention than ${formula}.`}],relatedRoutes:relatedRoutesFor(slug,category)}])) as unknown as Record<PriorityOneExpansionSlug, PriorityOneDefinition>;
export const priorityOneExpansionSlugs = specs.map(x => x[0]) as readonly PriorityOneExpansionSlug[];
export const isPriorityOneExpansionSlug = (value: string): value is PriorityOneExpansionSlug => priorityOneExpansionSlugs.includes(value as PriorityOneExpansionSlug);
export const priorityOneUsefulWordCount = (definition: PriorityOneDefinition) => JSON.stringify(definition).replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean).length;
const bad = (error: string): PriorityOneResult => ({ primary:error,summary:error,details:[],error });
const payment = (p:number,r:number,y:number) => { const n=y*12, i=r/1200; return i ? p*i/(1-Math.pow(1+i,-n)) : p/n; };
const dateAdd = (raw:string, days:number) => { const d=new Date(`${raw}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+days); return d.toISOString().slice(0,10); };
export function calculatePriorityOneExpansion(slug: PriorityOneExpansionSlug, values: string[], currency: PriorityOneCurrencyCode = 'USD'): PriorityOneResult {
 const def=priorityOneExpansionDefinitions[slug]; if(values.length!==def.fields.length||values.some(v=>!v.trim())) return bad('Complete every field; blank values cannot be calculated.');
 const dateIndex=def.fields.findIndex(x=>x.type==='date'); if(dateIndex>=0 && Number.isNaN(Date.parse(values[dateIndex]))) return bad('Enter a valid calendar date.');
  const timeIndex=def.fields.findIndex(x=>x.type==='time'); if(timeIndex>=0&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(values[timeIndex])) return bad('Enter a bedtime from 00:00 through 23:59.');
  const n=values.map((v,i)=>def.fields[i].type==='select'||def.fields[i].type==='date'||def.fields[i].type==='time'?0:Number(v)); if(n.some((x,i)=>def.fields[i].type!=='select'&&def.fields[i].type!=='date'&&def.fields[i].type!=='time'&&(!Number.isFinite(x)||x<0))) return bad('Use finite, non-negative numbers in every numeric field.'); if(n.some(x=>x>1e12)) return bad('Use values no greater than one trillion.');
 const money=(x:number)=>formatCurrency(x,currency), simple=(x:number,label='Result'):PriorityOneResult=>({primary: `${x.toLocaleString('en-US',{maximumFractionDigits:2})}`,summary:'Calculated from the entered values.',details:[{label,value:`${x.toLocaleString('en-US',{maximumFractionDigits:2})}`}]});
 if(slug==='currency'){const x=n[0]*n[1];return {primary:`${x.toFixed(2)} ${values[3]}`,summary:`At your entered rate of ${n[1]} ${values[3]} per ${values[2]}.`,details:[{label:'Converted amount',value:`${x.toFixed(2)} ${values[3]}`}]};}
  if(slug==='gpa'){const grades=[n[0],n[2],n[4]],credits=[n[1],n[3],n[5]];if(grades.some(grade=>grade>4))return bad('Grade points must be between 0 and 4.');if(credits.some(credit=>credit<=0))return bad('Each course must have credits greater than zero.');const totalCredits=credits.reduce((sum,credit)=>sum+credit,0),qualityPoints=grades.reduce((sum,grade,index)=>sum+grade*credits[index],0),gpa=qualityPoints/totalCredits;return {primary:gpa.toFixed(2),summary:`Weighted GPA across ${totalCredits.toLocaleString('en-US')} credits.`,details:[{label:'Total quality points',value:qualityPoints.toFixed(2)},{label:'Total credits',value:totalCredits.toLocaleString('en-US')}]};}
  if(slug==='grade'){if(!n[1])return bad('Points possible must be greater than zero.');return {primary:(n[0]/n[1]*100).toLocaleString('en-US',{maximumFractionDigits:2}),summary:'Course percentage from points earned and points possible.',details:[{label:'Points earned',value:n[0].toLocaleString('en-US')},{label:'Points possible',value:n[1].toLocaleString('en-US')}]};}
 if(slug==='marriage-tax'){const effect=n[2]-n[0]-n[1];return {primary:money(Math.abs(effect)),summary:effect>0?'Estimated marriage penalty.':'Estimated marriage bonus or no difference.',details:[{label:'Joint minus separate',value:money(effect)}]};}
  if(slug==='gas-mileage'){if(!n[1])return bad('Fuel used must be greater than zero.');return {primary:`${(n[0]/n[1]).toLocaleString('en-US',{maximumFractionDigits:2})} mpg`,summary:'Estimated fuel mileage for the distance and fuel entered.',details:[{label:'Trip distance',value:`${n[0].toLocaleString('en-US')} miles`},{label:'Fuel used',value:`${n[1].toLocaleString('en-US')} gallons`}]};}
 if(slug==='tip'){if(!n[2])return bad('People splitting must be greater than zero.');const tip=n[0]*n[1]/100,total=n[0]+tip;return {primary:money(total/n[2]),summary:'Estimated amount per person.',details:[{label:'Tip',value:money(tip)},{label:'Total bill',value:money(total)}]};}
 if(['boat-loan','business-loan','home-equity-loan','personal-loan','student-loan','uk-mortgage','canadian-mortgage'].includes(slug)){if(slug==='home-equity-loan'){if(n[2]<=0)return bad('Loan term must be greater than zero.');const rawMonths=n[2]*12,months=Math.round(rawMonths);if(Math.abs(rawMonths-months)>1e-9)return bad('Loan term must resolve to a whole number of months.');}let r=n[1];if(slug==='canadian-mortgage')r=(Math.pow(1+r/200,2/12)-1)*1200;const m=payment(n[0],r,n[2]);if(!Number.isFinite(m))return bad('These loan terms do not produce a finite payment.');return {primary:money(m),summary:'Estimated monthly principal and interest.',details:[{label:'Total payments',value:money(m*n[2]*12)},{label:'Total interest',value:money(m*n[2]*12-n[0])}]};}
 if(slug==='interest'){const interest=n[0]*n[1]/100*n[2];return {primary:money(interest),summary:'Simple interest on unchanged principal.',details:[{label:'Ending amount',value:money(n[0]+interest)}]};}
 if(slug==='investment'){const end=n[0]*Math.pow(1+n[1]/1200,n[2]*12);if(!Number.isFinite(end))return bad('The entered investment scenario is too large to calculate reliably.');return {primary:money(end),summary:'Compound-growth projection.',details:[{label:'Growth',value:money(end-n[0])}]};}
 if(slug==='retirement'){const i=n[2]/1200,months=n[3]*12,end=n[0]*Math.pow(1+i,months)+n[1]*(i?(Math.pow(1+i,months)-1)/i:months);return {primary:money(end),summary:'Projected balance before inflation, tax, and fees.',details:[{label:'Contributions',value:money(n[0]+n[1]*months)}]};}
 if(slug==='cash-back-or-low-interest'){const low=payment(n[0],n[2],n[4])*n[4]*12,standard=payment(n[0]-n[1],n[3],n[4])*n[4]*12;return {primary:money(Math.abs(low-standard)),summary:low<standard?'Low APR costs less in this estimate.':'Cash back costs less in this estimate.',details:[{label:'Low APR total',value:money(low)},{label:'Cash-back total',value:money(standard)}]};}
 if(['discount','sales-tax','tax'].includes(slug)){const amount=n[0]*n[1]/100;const total=slug==='discount'?n[0]-amount:n[0]+amount;return {primary:money(total),summary:slug==='discount'?'Estimated sale price.':'Estimated total after tax.',details:[{label:slug==='discount'?'Savings':'Tax',value:money(amount)}]};}
 if(slug==='estate-tax'){const taxable=Math.max(0,n[0]-n[1]);return {primary:money(taxable*n[2]/100),summary:'Planning estimate using your entered exemption and rate.',details:[{label:'Taxable estate',value:money(taxable)}]};}
 if(slug==='fha-loan'){const base=n[0]-n[1];if(base<0)return bad('Down payment cannot exceed home price.');const loan=base*1.0175,m=payment(loan,n[2],n[3]);return {primary:money(m+loan*n[4]/1200),summary:'Estimated principal, interest, and monthly MIP.',details:[{label:'Financed upfront MIP',value:money(loan-base)}]};}
 if(slug==='va-mortgage'){const base=n[0]-n[1];if(base<0)return bad('Down payment cannot exceed home price.');const loan=base*(1+n[4]/100);return {primary:money(payment(loan,n[2],n[3])),summary:'Estimated principal and interest.',details:[{label:'Financed funding fee',value:money(loan-base)}]};}
 if(slug==='bmr'||slug==='calorie'){const [w,h,a,,activity]=n;const b=10*w+6.25*h-5*a+(values[3]==='male'?5:-161),v=slug==='calorie'?b*Number(values[4]):b;return {primary:`${Math.round(v)} kcal/day`,summary:slug==='calorie'?'Estimated maintenance energy, not a prescription.':'Estimated resting energy, not a diagnosis.',details:[{label:'BMR',value:`${Math.round(b)} kcal/day`}]};}
 if(['bmi','anorexic-bmi','body-fat','pregnancy-weight-gain'].includes(slug)){const bmi=n[0]/Math.pow(n[1]/100,2);if(slug==='body-fat')return simple(1.2*bmi+.23*n[2]-(values[3]==='male'?16.2:5.4),'Estimated body fat %');if(slug==='pregnancy-weight-gain'){const range=bmi<18.5?'12.5–18 kg':bmi<25?'11.5–16 kg':bmi<30?'7–11.5 kg':'5–9 kg';return {primary:range,summary:'IOM total singleton-pregnancy range; ask your care team for individual advice.',details:[{label:'Prepregnancy BMI',value:bmi.toFixed(1)}]};}return {primary:bmi.toFixed(1),summary:slug==='anorexic-bmi'?'BMI screen only; it cannot diagnose anorexia or any eating disorder.':'Body mass index estimate.',details:[{label:'Category',value:bmi<18.5?'Below standard adult range':bmi<25?'Standard adult range':'Above standard adult range'}]};}
 if(slug==='army-body-fat'){const male=values[4]==='male',bf=male?86.01*Math.log10(n[2]-n[1])-70.041*Math.log10(n[0])+36.76:163.205*Math.log10(n[2]+n[3]-n[1])-97.684*Math.log10(n[0])-78.387;if(!Number.isFinite(bf))return bad('Use circumference values that produce a valid measurement.');return simple(bf,'Estimated body fat %');}
 if(slug==='calories-burned')return {primary:`${Math.round(n[0]*3.5*n[1]/200*n[2])} kcal`,summary:'MET-based activity estimate.',details:[]};
 if(slug==='pace'){if(!n[0])return bad('Distance must be greater than zero.');return {primary:`${Math.floor(n[1]/n[0])}:${String(Math.round(n[1]/n[0]%1*60)).padStart(2,'0')} per ${values[0]?'km':'unit'}`,summary:'Average pace.',details:[]};}
 if(slug==='due-date'||slug==='pregnancy-conception'||slug==='pregnancy'){const lmp=values[0];if(slug==='pregnancy')return {primary:`${Math.max(0,Math.floor((Date.now()-Date.parse(`${lmp}T12:00:00Z`))/86400000/7))} weeks`,summary:'Estimated gestational age from LMP; clinical dating may differ.',details:[]};return {primary:dateAdd(lmp,slug==='due-date'?280:14),summary:slug==='due-date'?'Estimated due date from LMP.':'Estimated conception date from LMP.',details:slug==='pregnancy-conception'?[{label:'Estimated due date',value:dateAdd(lmp,280)}]:[]};}
  if(slug==='sleep'){const [hours,minutes]=values[0].split(':').map(Number),bedtime=hours*60+minutes;const wakeTime=(cycles:number)=>{const total=(bedtime+cycles*90)%(24*60);return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;};return {primary:wakeTime(5),summary:'Wake time after five 90-minute sleep cycles (7 hours 30 minutes).',details:[4,5,6].map(cycles=>({label:`${cycles} cycles (${cycles*1.5} hours)`,value:wakeTime(cycles)}))};}
 return bad('This calculator is not available.');
}
