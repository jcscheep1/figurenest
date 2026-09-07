import { syncRegistrySeoCapabilities } from './seo-capabilities';

export type WorkDateCalculatorSlug = 'age' | 'working-days' | 'salary' | 'overtime';

export type WorkDateExample = {
  title: string;
  inputs: string;
  result: string;
  interpretation: string;
};

export type WorkDateCalculatorContent = {
  slug: WorkDateCalculatorSlug;
  categorySlug: 'date-time' | 'salary-work';
  categoryName: 'Date & Time' | 'Salary & Work';
  title: string;
  titleLines: readonly [string, string];
  description: string;
  seoTitle: string;
  seoDescription: string;
  resultLabel: string;
  resultSummary: string;
  methodLabel: string;
  whenUseful: string;
  usefulFor: readonly string[];
  formula: string;
  formulaExplanation: string;
  instructions: readonly string[];
  examples: readonly WorkDateExample[];
  assumptions: readonly string[];
  commonMistakes: readonly string[];
  edgeCases: readonly { title: string; explanation: string }[];
  limitations: string;
  faqs: readonly { question: string; answer: string }[];
  relatedTools: readonly { slug: string; linkLabel: string; context: string }[];
};

const age: WorkDateCalculatorContent = {
  slug: 'age',
  categorySlug: 'date-time',
  categoryName: 'Date & Time',
  title: 'Age Calculator',
  titleLines: ['Exact Age', 'Calculator'],
  description: 'Calculate age on a chosen date in completed calendar years, months, and days.',
  seoTitle: 'Age Calculator — Years, Months & Days | FigureNest',
  seoDescription: 'Calculate exact age in completed years, months, and days between a birth date and any as-of date, including leap-day and month-end examples.',
  resultLabel: 'EXACT CALENDAR AGE',
  resultSummary: 'The result shows completed calendar years and months, then the remaining days.',
  methodLabel: 'CALENDAR-DATE ARITHMETIC',
  whenUseful: 'Use this calculator when a date-based age is more useful than a rough year count. It answers “How old on this date?” for forms, eligibility checks, milestones, records, and historical comparisons.',
  usefulFor: ['Checking age on a past or future date.', 'Confirming completed years for an age threshold.', 'Measuring the calendar gap from a birth date without assuming every year has 365 days.'],
  formula: 'Age = completed calendar years + completed calendar months + remaining calendar days',
  formulaExplanation: 'The calculator compares the year, month, and day parts. If the as-of day falls before the birth day, it borrows the length of the preceding calendar month; if the month remainder is negative, it borrows one calendar year. This avoids dividing elapsed days by 365.',
  instructions: ['Enter the date of birth or starting date.', 'Choose the date on which age should be measured.', 'Read the completed years, months, and remaining days.', 'For a duration between events rather than a person’s age, use the Date Duration Calculator.'],
  examples: [
    { title: 'Leap-day birthday', inputs: 'Born February 29, 2000; measured February 29, 2024', result: '24 years, 0 months, 0 days', interpretation: 'The 2024 leap day is the exact twenty-fourth calendar anniversary.' },
    { title: 'Before the annual birthday', inputs: 'Born November 20, 1985; measured March 5, 2026', result: '40 years, 3 months, 13 days', interpretation: 'The November 2026 birthday has not occurred, so only 40 complete years count.' },
    { title: 'Month-end interval', inputs: 'January 31, 2024 to February 29, 2024', result: '0 years, 0 months, 29 days', interpretation: 'Calendar month lengths matter; this interval is reported as the 29 elapsed calendar days.' },
  ],
  assumptions: ['Both entries are valid Gregorian calendar dates.', 'The birth/start date must be on or before the as-of date.', 'Dates are treated as whole calendar dates without times or time zones.', 'Years and months mean completed calendar units, not average day lengths.'],
  commonMistakes: ['Using today when a form asks for age on a specific eligibility date.', 'Subtracting birth year from current year without checking whether the birthday has occurred.', 'Treating age as elapsed days divided by 365.', 'Entering month and day in the wrong order when copying dates from another format.'],
  edgeCases: [
    { title: 'Same date', explanation: 'The result is 0 years, 0 months, and 0 days.' },
    { title: 'February 29 birth date', explanation: 'The calculation uses actual calendar dates; legal birthday treatment in non-leap years can depend on jurisdiction.' },
    { title: 'As-of date before birth', explanation: 'The calculator rejects the range instead of presenting a negative age.' },
    { title: 'Month-end dates', explanation: 'Different month lengths can make a duration appear as days rather than a complete calendar month.' },
  ],
  limitations: 'This is calendar arithmetic, not legal or medical advice. It does not determine jurisdiction-specific “age of majority” rules, leap-day legal birthdays, gestational age, or age at a particular hour. Historical dates are interpreted with the modern Gregorian calendar.',
  faqs: [
    { question: 'How does the calculator determine exact age?', answer: 'It counts completed calendar years, then completed months, then remaining days between the entered birth date and as-of date.' },
    { question: 'Why not divide the number of days by 365?', answer: 'Calendar years vary because of leap years, and months have different lengths. Dividing by 365 does not reliably produce completed calendar years, months, and days.' },
    { question: 'Can I calculate age on a past or future date?', answer: 'Yes. Change the as-of date to the date relevant to the form, event, eligibility rule, or milestone you are checking.' },
    { question: 'How are February 29 birthdays handled?', answer: 'The calculation uses the dates as entered and recognizes February 29 in leap years. Legal recognition in non-leap years can vary, so consult the applicable rule when the exact legal birthday matters.' },
    { question: 'What happens if both dates are the same?', answer: 'The result is zero years, zero months, and zero days.' },
    { question: 'Can the as-of date be before the birth date?', answer: 'No. A date before the birth date is rejected because it would not represent a valid age.' },
    { question: 'Does time of day affect the result?', answer: 'No. The calculator compares whole dates and does not use birth time, current time, or time-zone offsets.' },
  ],
  relatedTools: [
    { slug: 'date-difference', linkLabel: 'Measure the duration between any two dates', context: 'Use Date Duration for event intervals, reversed dates, inclusive counting, and total weeks or days.' },
    { slug: 'working-days', linkLabel: 'Count weekdays inside a date range', context: 'Switch from calendar age to an inclusive Monday-through-Friday count.' },
    { slug: 'percentage-increase-decrease', linkLabel: 'Compare age-based values as a percentage', context: 'Calculate a percentage increase or decrease when comparing measurements over time.' },
  ],
};

const workingDays: WorkDateCalculatorContent = {
  slug: 'working-days',
  categorySlug: 'date-time',
  categoryName: 'Date & Time',
  title: 'Working Days Calculator',
  titleLines: ['Working Days', 'Calculator'],
  description: 'Count Monday-through-Friday weekdays in a date range, including both endpoints when they are weekdays.',
  seoTitle: 'Working Days Calculator — Count Weekdays | FigureNest',
  seoDescription: 'Count Monday-to-Friday working days between two dates with inclusive endpoints. Understand weekends, reversed ranges, assumptions, and limitations.',
  resultLabel: 'WEEKDAYS IN RANGE',
  resultSummary: 'The count includes both entered dates when they fall Monday through Friday and excludes Saturdays and Sundays.',
  methodLabel: 'INCLUSIVE WEEKDAY COUNT',
  whenUseful: 'Use this calculator for a quick weekday count when “working days” means Monday through Friday and public holidays are not being removed. It is useful for planning schedules, delivery windows, review periods, and rough staffing estimates.',
  usefulFor: ['Counting weekdays in a project or notice period.', 'Checking the number of Monday-to-Friday dates in a reporting window.', 'Comparing a calendar duration with a simple workweek duration.'],
  formula: 'Working days = count of dates from start through end whose weekday is Monday, Tuesday, Wednesday, Thursday, or Friday',
  formulaExplanation: 'The calculator walks the inclusive calendar range and counts each weekday. If dates are entered in reverse order, it counts the same range from the earlier date to the later date. It does not subtract holidays.',
  instructions: ['Enter the first date in the range.', 'Enter the second date; either chronological order is accepted.', 'Read the inclusive weekday count.', 'Check a holiday calendar separately when the result affects payroll, contracts, or official deadlines.'],
  examples: [
    { title: 'Two full workweeks', inputs: 'Monday, August 3 through Friday, August 14, 2026', result: '10 weekdays', interpretation: 'Both weekday endpoints count, while the intervening Saturday and Sunday do not.' },
    { title: 'Weekend-only range', inputs: 'Saturday, August 8 through Sunday, August 9, 2026', result: '0 weekdays', interpretation: 'Neither date falls Monday through Friday.' },
    { title: 'A full calendar month', inputs: 'September 1 through September 30, 2026', result: '22 weekdays', interpretation: 'The count reflects the weekday pattern in that specific month, before subtracting any holidays.' },
  ],
  assumptions: ['A standard workweek runs Monday through Friday.', 'Both endpoints are included when they are weekdays.', 'Saturday and Sunday are the only excluded days.', 'Dates are whole calendar dates without work shifts or time zones.'],
  commonMistakes: ['Assuming public holidays are automatically excluded.', 'Expecting an exclusive count that omits the start or end date.', 'Using the result for a nonstandard schedule such as Tuesday through Saturday.', 'Treating working days as 24-hour periods instead of calendar weekdays.'],
  edgeCases: [
    { title: 'Reversed dates', explanation: 'Entering the later date first produces the same count for the same calendar range.' },
    { title: 'Same weekday date', explanation: 'A one-date range on Monday through Friday counts as one weekday.' },
    { title: 'Same weekend date', explanation: 'A one-date range on Saturday or Sunday counts as zero weekdays.' },
    { title: 'Holiday-heavy periods', explanation: 'The result may be higher than actual business days because holidays are not removed.' },
  ],
  limitations: 'The result is a weekday count, not a jurisdiction-aware business-day calendar. It excludes no national, regional, religious, company, bank, or market holidays and does not support custom weekends, partial workdays, shifts, or cutoff times.',
  faqs: [
    { question: 'Are the start and end dates included?', answer: 'Yes. Each endpoint counts when it falls Monday through Friday.' },
    { question: 'Does the calculator exclude public holidays?', answer: 'No. It excludes only Saturdays and Sundays. Subtract applicable holidays separately.' },
    { question: 'What happens if I enter the dates in reverse order?', answer: 'The calculator uses the earlier and later dates, so the weekday count is the same in either order.' },
    { question: 'Does a single weekday count as one working day?', answer: 'Yes. Because the range is inclusive, a Monday-to-the-same-Monday range counts as one weekday.' },
    { question: 'Can I use a Saturday-to-Sunday workweek?', answer: 'No. This calculator uses the standard Monday-through-Friday definition and cannot customize working weekdays.' },
    { question: 'Is this suitable for legal or contractual deadlines?', answer: 'Use it only as a preliminary count. Official deadlines may apply jurisdiction-specific holidays, service rules, and exclusive counting conventions.' },
    { question: 'Why can this differ from a payroll system?', answer: 'Payroll systems may use scheduled shifts, paid holidays, leave, partial days, and company calendars that this simple weekday count does not include.' },
  ],
  relatedTools: [
    { slug: 'date-difference', linkLabel: 'Compare the full calendar duration', context: 'See years, months, weeks, total days, and optional inclusive counting for the same dates.' },
    { slug: 'age', linkLabel: 'Calculate age on a specific date', context: 'Measure completed years, months, and days from a birth date.' },
    { slug: 'salary', linkLabel: 'Convert annual pay into weekly and hourly figures', context: 'Use a work schedule to compare salary across common pay periods.' },
  ],
};

const salary: WorkDateCalculatorContent = {
  slug: 'salary',
  categorySlug: 'salary-work',
  categoryName: 'Salary & Work',
  title: 'Salary Converter',
  titleLines: ['Salary', 'Converter'],
  description: 'Convert annual gross salary into comparable monthly, weekly, and hourly pay using your working schedule.',
  seoTitle: 'Salary Converter — Annual to Hourly Pay | FigureNest',
  seoDescription: 'Convert annual salary to monthly, weekly, and hourly gross pay using hours worked per week and paid weeks per year, with formulas and examples.',
  resultLabel: 'ESTIMATED HOURLY PAY',
  resultSummary: 'This gross-pay equivalent divides annual salary by the entered paid hours and weeks.',
  methodLabel: 'GROSS PAY CONVERSION',
  whenUseful: 'Use this converter to compare salaried roles with hourly work, evaluate reduced schedules, or translate annual compensation into familiar pay periods. Hours and paid weeks make the hourly comparison specific to your schedule.',
  usefulFor: ['Comparing an annual salary with an hourly offer.', 'Estimating gross monthly and weekly equivalents for budgeting.', 'Seeing how unpaid weeks or different weekly hours affect effective hourly pay.'],
  formula: 'Hourly pay = annual salary ÷ (hours per week × paid weeks per year)',
  formulaExplanation: 'Monthly pay is annual salary ÷ 12. Weekly pay is annual salary ÷ paid weeks per year. Hourly pay divides weekly pay by hours per week. These are gross equivalents before taxes and deductions.',
  instructions: ['Enter the annual gross salary.', 'Enter the typical paid hours worked each week.', 'Enter the number of paid weeks represented by the annual salary.', 'Compare the hourly result with the monthly and weekly breakdown; use Overtime separately for extra-hour premiums.'],
  examples: [
    { title: 'Standard full-time schedule', inputs: '$60,000 annually; 40 hours weekly; 52 paid weeks', result: '$28.85 hourly; $5,000 monthly; $1,153.85 weekly', interpretation: 'The hourly equivalent assumes all 2,080 scheduled annual hours are represented by the salary.' },
    { title: 'Fewer paid weeks', inputs: '$75,000 annually; 37.5 hours weekly; 50 paid weeks', result: '$40 hourly; $6,250 monthly; $1,500 weekly', interpretation: 'Using 50 paid weeks produces a schedule-specific hourly equivalent rather than assuming 52 weeks.' },
    { title: 'Part-time salaried role', inputs: '$52,000 annually; 20 hours weekly; 52 paid weeks', result: '$50 hourly; $4,333.33 monthly; $1,000 weekly', interpretation: 'The same annual salary spread across fewer scheduled hours has a higher hourly equivalent.' },
  ],
  assumptions: ['Annual salary is gross pay before tax and deductions.', 'The entered weekly hours and paid weeks represent the full salary period.', 'Monthly pay uses twelve equal calendar-month equivalents.', 'Bonuses, commissions, equity, and employer benefits are excluded.'],
  commonMistakes: ['Entering take-home pay instead of gross annual salary.', 'Assuming 52 paid weeks when unpaid leave or seasonal gaps apply.', 'Comparing base salary alone with an offer that has substantial variable compensation.', 'Treating the hourly equivalent as an overtime entitlement or payroll rate.'],
  edgeCases: [
    { title: 'Part-time schedules', explanation: 'Enter the actual weekly hours; the hourly equivalent can be high even when annual salary is moderate.' },
    { title: 'Unpaid weeks', explanation: 'Reduce paid weeks when the annual figure covers fewer than 52 compensated weeks.' },
    { title: 'Zero hours or weeks', explanation: 'The calculator rejects either because hourly and weekly equivalents would be undefined.' },
    { title: 'Irregular schedules', explanation: 'Use average scheduled hours only as an estimate when hours vary substantially.' },
  ],
  limitations: 'This is a gross-pay conversion, not a paycheck or total-compensation calculator. It excludes income tax, payroll deductions, benefits, bonuses, commissions, equity, overtime, unpaid breaks, and local pay-period conventions.',
  faqs: [
    { question: 'How do I convert annual salary to hourly pay?', answer: 'Divide annual salary by paid weeks per year, then divide by hours worked per week. For 40 hours and 52 weeks, that is annual salary divided by 2,080.' },
    { question: 'Why does the calculator ask for paid weeks?', answer: 'Not every role represents 52 paid weeks. Seasonal work, unpaid leave, or contract gaps change the hours across which annual pay should be compared.' },
    { question: 'Is monthly salary simply annual salary divided by 12?', answer: 'Yes for this comparison. Actual payroll deposits can vary with pay frequency, deductions, and calendar timing.' },
    { question: 'Does the result show take-home pay?', answer: 'No. All figures are gross equivalents before taxes, insurance, retirement contributions, and other deductions.' },
    { question: 'Are bonuses and benefits included?', answer: 'No. Add predictable cash bonuses to annual pay only if that comparison is appropriate, and evaluate benefits separately.' },
    { question: 'Can I use this for a part-time salary?', answer: 'Yes. Enter the actual weekly hours and paid weeks represented by the annual salary.' },
    { question: 'Is the hourly equivalent my overtime rate?', answer: 'Not necessarily. Overtime eligibility and the legally defined regular rate depend on employment rules and included compensation.' },
  ],
  relatedTools: [
    { slug: 'overtime', linkLabel: 'Calculate overtime pay for extra hours', context: 'Apply an hourly base rate, overtime hours, and premium multiplier.' },
    { slug: 'working-days', linkLabel: 'Count weekdays in a work period', context: 'Estimate the Monday-through-Friday dates in a schedule or reporting range.' },
    { slug: 'percentage-increase-decrease', linkLabel: 'Measure a salary increase or decrease', context: 'Compare an old salary with a new offer as a percentage change.' },
  ],
};

const overtime: WorkDateCalculatorContent = {
  slug: 'overtime',
  categorySlug: 'salary-work',
  categoryName: 'Salary & Work',
  title: 'Overtime Calculator',
  titleLines: ['Overtime Pay', 'Calculator'],
  description: 'Estimate gross overtime earnings from a base hourly rate, overtime hours, and pay multiplier.',
  seoTitle: 'Overtime Pay Calculator — Time and a Half | FigureNest',
  seoDescription: 'Calculate gross overtime pay from hourly rate, overtime hours, and a multiplier such as 1.5× or 2×, with formulas and realistic examples.',
  resultLabel: 'ESTIMATED OVERTIME PAY',
  resultSummary: 'This is the gross premium-rate pay for the entered overtime hours, before taxes or deductions.',
  methodLabel: 'HOURLY PREMIUM PAY',
  whenUseful: 'Use this calculator when you already know the base hourly rate, number of overtime hours, and applicable multiplier. It estimates the overtime portion of gross pay for that set of hours.',
  usefulFor: ['Checking time-and-a-half or double-time earnings.', 'Estimating the overtime portion of a weekly paycheck.', 'Comparing the value of extra hours at different premium multipliers.'],
  formula: 'Overtime pay = base hourly rate × overtime hours × overtime multiplier',
  formulaExplanation: 'A 1.5× multiplier means each overtime hour pays 150% of the base hourly rate; 2× means double time. The result covers only the entered overtime hours and does not add regular wages.',
  instructions: ['Enter the base hourly rate used for overtime.', 'Enter only the hours paid at the overtime multiplier.', 'Enter the applicable multiplier, such as 1.5 for time and a half.', 'Add the result to regular gross pay only when building a complete pay-period estimate.'],
  examples: [
    { title: 'Time and a half', inputs: '$24 hourly; 8 overtime hours; 1.5× multiplier', result: '$288 overtime pay', interpretation: 'The premium rate is $36 per hour, applied to eight extra hours.' },
    { title: 'Double-time shift', inputs: '$32.50 hourly; 6 overtime hours; 2× multiplier', result: '$390 overtime pay', interpretation: 'Each double-time hour pays $65 before taxes and deductions.' },
    { title: 'Busy weekly period', inputs: '$18 hourly; 12 overtime hours; 1.5× multiplier', result: '$324 overtime pay', interpretation: 'This is the overtime portion only; regular-hour earnings would be added separately.' },
  ],
  assumptions: ['All entered overtime hours use the same base rate and multiplier.', 'The base hourly rate is the rate legally or contractually used for the premium calculation.', 'The result is gross pay before withholding and deductions.', 'Regular wages are not included in the headline result.'],
  commonMistakes: ['Entering total weekly hours instead of overtime hours only.', 'Adding only the premium half when the goal is total pay for overtime hours.', 'Assuming every extra hour legally qualifies for overtime.', 'Using a salary-derived hourly figure without checking the legally defined regular rate.'],
  edgeCases: [
    { title: 'A 1× multiplier', explanation: 'The result equals ordinary hourly pay for the entered hours and contains no overtime premium.' },
    { title: 'No overtime hours', explanation: 'The overtime portion is zero even when a base rate and multiplier are entered.' },
    { title: 'Multiple overtime tiers', explanation: 'Calculate each group separately when some hours pay 1.5× and others pay 2×.' },
    { title: 'Salaried employees', explanation: 'Eligibility and regular-rate calculations vary; the Salary Converter is only a comparison tool, not a legal overtime determination.' },
  ],
  limitations: 'This calculator does not determine overtime eligibility or the correct legal regular rate. Laws, contracts, union agreements, daily-versus-weekly thresholds, bonuses, shift differentials, double-time rules, and tax withholding can change actual pay.',
  faqs: [
    { question: 'How is overtime pay calculated?', answer: 'Multiply the base hourly rate by overtime hours and the applicable multiplier. At $20 per hour and 1.5×, each overtime hour pays $30.' },
    { question: 'What does time and a half mean?', answer: 'Time and a half is a 1.5× multiplier: 100% of the base rate plus a 50% premium.' },
    { question: 'Does the result include regular pay?', answer: 'No. It calculates only pay for the entered overtime hours. Add regular gross wages separately for a full pay-period estimate.' },
    { question: 'Should I enter total hours or only overtime hours?', answer: 'Enter only the hours paid at the overtime multiplier.' },
    { question: 'Can I calculate double time?', answer: 'Yes. Enter 2 as the multiplier. If a pay period includes multiple rates, calculate each overtime group separately.' },
    { question: 'Are taxes deducted from the result?', answer: 'No. The result is gross overtime pay before withholding, benefits, and other deductions.' },
    { question: 'Does working extra hours always qualify for overtime?', answer: 'No. Eligibility, thresholds, exemptions, and the regular rate depend on applicable law and employment terms.' },
  ],
  relatedTools: [
    { slug: 'salary', linkLabel: 'Convert annual salary to an hourly equivalent', context: 'Compare annual, monthly, weekly, and hourly gross pay before estimating extra hours.' },
    { slug: 'working-days', linkLabel: 'Count weekdays in a work period', context: 'Check the standard Monday-through-Friday dates in a schedule range.' },
    { slug: 'percentage-increase-decrease', linkLabel: 'Measure a pay-rate change', context: 'Calculate the percentage difference between an old and new wage.' },
  ],
};

export const workDateCalculatorContent: Record<WorkDateCalculatorSlug, WorkDateCalculatorContent> = {
  age,
  'working-days': workingDays,
  salary,
  overtime,
};
syncRegistrySeoCapabilities(workDateCalculatorContent);

export const isWorkDateCalculatorSlug = (slug: string): slug is WorkDateCalculatorSlug => slug in workDateCalculatorContent;