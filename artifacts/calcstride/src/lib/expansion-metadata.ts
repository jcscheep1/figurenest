import type { Tool } from '@workspace/api-client-react';

export type CatalogEntry = Omit<Tool, 'featured' | 'lastUpdated' | 'tags'> & {
  readonly tags: readonly string[];
};
export type RouteEntry<S extends string = string> = Readonly<{ slug: S; href: string }>;

export const priorityOneCatalog = [
  {
    "slug": "bmr",
    "name": "BMR Calculator",
    "description": "Estimate resting energy needs with Mifflin–St Jeor.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/bmr"
  },
  {
    "slug": "currency",
    "name": "Currency Converter",
    "description": "Convert an amount using the exchange rate you enter.",
    "category": "Converters",
    "categorySlug": "converters",
    "tags": [
      "converters",
      "calculator"
    ],
    "href": "/converters/currency"
  },
  {
    "slug": "gpa",
    "name": "GPA Calculator",
    "description": "Calculate a weighted GPA across up to three courses.",
    "category": "Education",
    "categorySlug": "education",
    "tags": [
      "education",
      "calculator"
    ],
    "href": "/calculators/education/gpa"
  },
  {
    "slug": "grade",
    "name": "Grade Calculator",
    "description": "Calculate a course percentage from total points earned and points possible.",
    "category": "Education",
    "categorySlug": "education",
    "tags": [
      "education",
      "calculator"
    ],
    "href": "/calculators/education/grade"
  },
  {
    "slug": "marriage-tax",
    "name": "Marriage Tax Calculator",
    "description": "Compare entered separate and joint tax liabilities.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/marriage-tax"
  },
  {
    "slug": "gas-mileage",
    "name": "Gas Mileage Calculator",
    "description": "Estimate fuel mileage from trip distance and fuel used.",
    "category": "Automotive & EV",
    "categorySlug": "automotive",
    "tags": [
      "automotive",
      "Mileage",
      "fuel economy",
      "mpg",
      "calculator"
    ],
    "href": "/calculators/automotive/gas-mileage"
  },
  {
    "slug": "tip",
    "name": "Tip Calculator",
    "description": "Calculate gratuity and a split total.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/tip"
  },
  {
    "slug": "boat-loan",
    "name": "Boat Loan Calculator",
    "description": "Estimate a fixed boat loan payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/boat-loan"
  },
  {
    "slug": "business-loan",
    "name": "Business Loan Calculator",
    "description": "Estimate a fixed business loan payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/business-loan"
  },
  {
    "slug": "canadian-mortgage",
    "name": "Canadian Mortgage Calculator",
    "description": "Apply Canadian semi-annual nominal compounding.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/canadian-mortgage"
  },
  {
    "slug": "cash-back-or-low-interest",
    "name": "Cash Back or Low Interest Calculator",
    "description": "Compare cash back with interest cost.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/cash-back-or-low-interest"
  },
  {
    "slug": "discount",
    "name": "Discount Calculator",
    "description": "Calculate a sale price and savings.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/discount"
  },
  {
    "slug": "estate-tax",
    "name": "Estate Tax Calculator",
    "description": "Plan an estimate after an entered exemption and rate.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/estate-tax"
  },
  {
    "slug": "fha-loan",
    "name": "FHA Loan Calculator",
    "description": "Estimate FHA principal, upfront MIP, and payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/fha-loan"
  },
  {
    "slug": "home-equity-loan",
    "name": "Home Equity Loan Calculator",
    "description": "Estimate a fixed home equity loan payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/home-equity-loan"
  },
  {
    "slug": "interest",
    "name": "Interest Calculator",
    "description": "Calculate simple interest on a fixed principal.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/interest"
  },
  {
    "slug": "investment",
    "name": "Investment Calculator",
    "description": "Project compound investment growth.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/investment"
  },
  {
    "slug": "uk-mortgage",
    "name": "UK Mortgage Calculator",
    "description": "Estimate a monthly repayment mortgage payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/uk-mortgage"
  },
  {
    "slug": "personal-loan",
    "name": "Personal Loan Calculator",
    "description": "Estimate a fixed personal loan payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/personal-loan"
  },
  {
    "slug": "retirement",
    "name": "Retirement Calculator",
    "description": "Project a retirement balance with monthly contributions.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/retirement"
  },
  {
    "slug": "sales-tax",
    "name": "Sales Tax Calculator",
    "description": "Calculate tax and total purchase cost.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/sales-tax"
  },
  {
    "slug": "student-loan",
    "name": "Student Loan Calculator",
    "description": "Estimate a fixed student loan payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/student-loan"
  },
  {
    "slug": "tax",
    "name": "Tax Calculator",
    "description": "Plan flat tax from an entered rate.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/tax"
  },
  {
    "slug": "va-mortgage",
    "name": "VA Mortgage Calculator",
    "description": "Estimate VA funding fee and payment.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "finance",
      "calculator"
    ],
    "href": "/calculators/finance/va-mortgage"
  },
  {
    "slug": "anorexic-bmi",
    "name": "BMI Screening Calculator",
    "description": "Calculate BMI and show a non-diagnostic low-BMI screen.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/anorexic-bmi"
  },
  {
    "slug": "army-body-fat",
    "name": "Army Body Fat Calculator",
    "description": "Estimate circumference body-fat screening.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/army-body-fat"
  },
  {
    "slug": "bmi",
    "name": "BMI Calculator",
    "description": "Calculate body mass index from metric measures.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/bmi"
  },
  {
    "slug": "body-fat",
    "name": "Body Fat Calculator",
    "description": "Estimate body fat with the BMI/age equation.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/body-fat"
  },
  {
    "slug": "calorie",
    "name": "Calorie Calculator",
    "description": "Estimate Mifflin–St Jeor needs with activity.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/calorie"
  },
  {
    "slug": "calories-burned",
    "name": "Calories Burned Calculator",
    "description": "Estimate exercise energy from MET, weight, and duration.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/calories-burned"
  },
  {
    "slug": "due-date",
    "name": "Due Date Calculator",
    "description": "Estimate due date from last menstrual period.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/due-date"
  },
  {
    "slug": "pace",
    "name": "Pace Calculator",
    "description": "Calculate pace per distance unit.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/pace"
  },
  {
    "slug": "pregnancy",
    "name": "Pregnancy Calculator",
    "description": "Estimate gestational age from LMP.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/pregnancy"
  },
  {
    "slug": "pregnancy-conception",
    "name": "Pregnancy Conception Calculator",
    "description": "Estimate conception and due dates from LMP.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/pregnancy-conception"
  },
  {
    "slug": "pregnancy-weight-gain",
    "name": "Pregnancy Weight Gain Calculator",
    "description": "Show IOM total gain range by prepregnancy BMI.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/pregnancy-weight-gain"
  },
  {
    "slug": "sleep",
    "name": "Sleep Calculator",
    "description": "Plan wake times from the bedtime you enter using 90-minute sleep cycles.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "health",
      "calculator"
    ],
    "href": "/calculators/health/sleep"
  }
] as const satisfies readonly CatalogEntry[];

export const phaseTwoCatalog = [
  {
    "slug": "btu",
    "name": "BTU Calculator",
    "description": "Estimate a room’s planning cooling or heating load from area and an entered climate factor.",
    "category": "Home & Construction",
    "categorySlug": "construction",
    "tags": [
      "btu calculator",
      "construction",
      "calculator",
      "btu",
      "heating load",
      "cooling load",
      "air conditioner size"
    ],
    "href": "/calculators/construction/btu"
  },
  {
    "slug": "average",
    "name": "Average Calculator",
    "description": "Find the arithmetic mean of three entered values.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "average calculator",
      "math",
      "calculator",
      "average",
      "mean calculator",
      "arithmetic mean"
    ],
    "href": "/calculators/math/average"
  },
  {
    "slug": "average-return",
    "name": "Average Return Calculator",
    "description": "Compare the arithmetic average and compounded annual return across three periods.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "average return calculator",
      "finance",
      "calculator",
      "average return",
      "mean return",
      "annual return",
      "compound annual growth"
    ],
    "href": "/calculators/finance/average-return"
  },
  {
    "slug": "fraction",
    "name": "Fraction Calculator",
    "description": "Add, subtract, multiply, or divide two fractions and reduce the answer.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "fraction calculator",
      "math",
      "calculator",
      "fraction",
      "fractions",
      "fraction math"
    ],
    "href": "/calculators/math/fraction"
  },
  {
    "slug": "percent-error",
    "name": "Percent Error Calculator",
    "description": "Measure the size of an experimental difference relative to an accepted value.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "percent error calculator",
      "math",
      "calculator",
      "percent error",
      "percentage error",
      "relative error"
    ],
    "href": "/calculators/math/percent-error"
  },
  {
    "slug": "percent-off",
    "name": "Percent Off Calculator",
    "description": "Calculate sale price and savings from an original price and discount rate.",
    "category": "Money & Finance",
    "categorySlug": "finance",
    "tags": [
      "percent off calculator",
      "finance",
      "calculator",
      "percent off",
      "discount calculator",
      "sale price"
    ],
    "href": "/calculators/finance/percent-off"
  },
  {
    "slug": "scientific",
    "name": "Scientific Calculator",
    "description": "Perform a selected basic operation with finite real numbers.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "scientific calculator",
      "math",
      "calculator",
      "scientific",
      "trigonometry",
      "square root",
      "logarithm"
    ],
    "href": "/calculators/math/scientific"
  },
  {
    "slug": "scientific-notation",
    "name": "Scientific Notation Calculator",
    "description": "Write a coefficient and power of ten as a standard decimal value.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "scientific notation calculator",
      "math",
      "calculator",
      "scientific notation",
      "standard form",
      "powers of ten"
    ],
    "href": "/calculators/math/scientific-notation"
  },
  {
    "slug": "time-duration",
    "name": "Time Duration Calculator",
    "description": "Find elapsed clock time between two local date-and-time entries.",
    "category": "Date & Time",
    "categorySlug": "date-time",
    "tags": [
      "time duration calculator",
      "date-time",
      "calculator",
      "time duration",
      "elapsed time",
      "hours between times"
    ],
    "href": "/calculators/date-time/time-duration"
  },
  {
    "slug": "voltage-drop",
    "name": "Voltage Drop Calculator",
    "description": "Estimate conductor voltage loss using current, one-way length, resistance, and circuit type.",
    "category": "Electrical",
    "categorySlug": "electrical",
    "tags": [
      "voltage drop calculator",
      "electrical",
      "calculator",
      "voltage drop",
      "wire voltage loss",
      "electrical drop"
    ],
    "href": "/calculators/electrical/voltage-drop"
  },
  {
    "slug": "day-of-week",
    "name": "Day of the Week Calculator",
    "description": "Identify the weekday for a valid Gregorian calendar date.",
    "category": "Date & Time",
    "categorySlug": "date-time",
    "tags": [
      "day of the week calculator",
      "date-time",
      "calculator",
      "day of week",
      "weekday calculator",
      "what day was"
    ],
    "href": "/calculators/date-time/day-of-week"
  },
  {
    "slug": "hours",
    "name": "Hours Calculator",
    "description": "Calculate paid elapsed hours between two clock times after an unpaid break.",
    "category": "Date & Time",
    "categorySlug": "date-time",
    "tags": [
      "hours calculator",
      "date-time",
      "calculator",
      "hours",
      "hours worked",
      "clock hours"
    ],
    "href": "/calculators/date-time/hours"
  },
  {
    "slug": "time",
    "name": "Time Calculator",
    "description": "Add hours and minutes to a starting local clock time.",
    "category": "Date & Time",
    "categorySlug": "date-time",
    "tags": [
      "time calculator",
      "date-time",
      "calculator",
      "time",
      "add time",
      "time arithmetic"
    ],
    "href": "/calculators/date-time/time"
  },
  {
    "slug": "time-card",
    "name": "Time Card Calculator",
    "description": "Calculate a shift’s paid hours and gross pay from an hourly rate.",
    "category": "Date & Time",
    "categorySlug": "date-time",
    "tags": [
      "time card calculator",
      "date-time",
      "calculator",
      "time card",
      "timesheet calculator",
      "shift pay"
    ],
    "href": "/calculators/date-time/time-card"
  },
  {
    "slug": "time-zone",
    "name": "Time Zone Calculator",
    "description": "Convert a wall-clock date and time between selected IANA time zones.",
    "category": "Date & Time",
    "categorySlug": "date-time",
    "tags": [
      "time zone calculator",
      "date-time",
      "calculator",
      "time zone",
      "timezone converter",
      "world time converter"
    ],
    "href": "/calculators/date-time/time-zone"
  }
] as const satisfies readonly CatalogEntry[];

export const phaseThreeACatalog = [
  {
    "slug": "bandwidth",
    "name": "Bandwidth Calculator",
    "description": "Calculate the ideal transfer rate required to move a file in a specified time.",
    "category": "Technology",
    "categorySlug": "technology",
    "tags": [
      "bandwidth calculator",
      "data transfer rate",
      "Mbps",
      "file transfer time"
    ],
    "href": "/calculators/technology/bandwidth"
  },
  {
    "slug": "base64",
    "name": "Base64 Encode / Decode Tool",
    "description": "Encode Unicode text as Base64 or decode valid Base64 back to UTF-8 locally.",
    "category": "Technology",
    "categorySlug": "technology",
    "tags": [
      "base64 encoder",
      "base64 decoder",
      "UTF-8",
      "developer tool"
    ],
    "href": "/calculators/technology/base64"
  },
  {
    "slug": "electricity",
    "name": "Electricity Calculator",
    "description": "Estimate appliance energy use and variable electricity cost from power and operating time.",
    "category": "Electrical",
    "categorySlug": "electrical",
    "tags": [
      "electricity calculator",
      "energy cost",
      "kWh calculator",
      "appliance power"
    ],
    "href": "/calculators/electrical/electricity"
  },
  {
    "slug": "ip-subnet",
    "name": "IP Subnet Calculator",
    "description": "Validate an IPv4 or IPv6 address and calculate its CIDR network boundary and scope.",
    "category": "Technology",
    "categorySlug": "technology",
    "tags": [
      "IP subnet calculator",
      "CIDR calculator",
      "IPv4 subnet",
      "IPv6 prefix"
    ],
    "href": "/calculators/technology/ip-subnet"
  },
  {
    "slug": "ohms-law",
    "name": "Ohm’s Law Calculator",
    "description": "Solve voltage, current, resistance, or electrical power from two known values.",
    "category": "Electrical",
    "categorySlug": "electrical",
    "tags": [
      "ohms law calculator",
      "voltage current resistance",
      "V I R",
      "electrical power"
    ],
    "href": "/calculators/electrical/ohms-law"
  },
  {
    "slug": "password-generator",
    "name": "Password Generator",
    "description": "Generate a strong random password locally with browser cryptographic randomness.",
    "category": "Technology",
    "categorySlug": "technology",
    "tags": [
      "password generator",
      "secure random password",
      "cryptographic randomness",
      "password security"
    ],
    "href": "/calculators/technology/password-generator"
  },
  {
    "slug": "resistor",
    "name": "Resistor Calculator",
    "description": "Calculate equivalent resistance for series or parallel resistor networks.",
    "category": "Electrical",
    "categorySlug": "electrical",
    "tags": [
      "resistor calculator",
      "series resistance",
      "parallel resistance",
      "equivalent resistance"
    ],
    "href": "/calculators/electrical/resistor"
  },
  {
    "slug": "url-encode-decode",
    "name": "URL Encode / Decode Tool",
    "description": "Percent-encode or decode one Unicode URL component locally in the browser.",
    "category": "Technology",
    "categorySlug": "technology",
    "tags": [
      "URL encoder",
      "URL decoder",
      "percent encoding",
      "URI component"
    ],
    "href": "/calculators/technology/url-encode-decode"
  },
  {
    "slug": "density",
    "name": "Density Calculator",
    "description": "Calculate material density from mass and volume with explicit SI unit conversion.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "density calculator",
      "mass divided by volume",
      "kg per cubic metre",
      "g per cm3"
    ],
    "href": "/calculators/science-engineering/density"
  },
  {
    "slug": "dew-point",
    "name": "Dew Point Calculator",
    "description": "Estimate dew point from air temperature and relative humidity with the Magnus formula.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "dew point calculator",
      "relative humidity",
      "Magnus formula",
      "weather calculation"
    ],
    "href": "/calculators/science-engineering/dew-point"
  },
  {
    "slug": "horsepower",
    "name": "Horsepower Calculator",
    "description": "Calculate mechanical engine horsepower from torque and RPM, with kilowatt output.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "horsepower calculator",
      "engine horsepower calculator",
      "torque RPM horsepower",
      "mechanical power"
    ],
    "href": "/calculators/science-engineering/horsepower"
  },
  {
    "slug": "heat-index",
    "name": "Heat Index Calculator",
    "description": "Estimate NOAA heat index from air temperature and relative humidity.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "heat index calculator",
      "feels like temperature",
      "relative humidity",
      "NOAA heat index"
    ],
    "href": "/calculators/science-engineering/heat-index"
  },
  {
    "slug": "mass",
    "name": "Mass Calculator",
    "description": "Calculate material mass from density and volume with SI and imperial outputs.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "mass calculator",
      "density times volume",
      "material mass",
      "kg calculator"
    ],
    "href": "/calculators/science-engineering/mass"
  },
  {
    "slug": "molarity",
    "name": "Molarity Calculator",
    "description": "Calculate solution molarity from amount of solute and final solution volume.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "molarity calculator",
      "moles per litre",
      "solution concentration",
      "mol per L"
    ],
    "href": "/calculators/science-engineering/molarity"
  },
  {
    "slug": "speed-calculator",
    "name": "Speed Calculator",
    "description": "Calculate average speed from distance and elapsed time, then compare common speed units.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "speed calculator",
      "distance divided by time",
      "average speed",
      "travel speed"
    ],
    "href": "/calculators/science-engineering/speed-calculator"
  },
  {
    "slug": "wind-chill",
    "name": "Wind Chill Calculator",
    "description": "Estimate NOAA/NWS wind chill from cold air temperature and wind speed.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "wind chill calculator",
      "feels like cold",
      "NWS wind chill",
      "weather calculator"
    ],
    "href": "/calculators/science-engineering/wind-chill"
  }
] as const satisfies readonly CatalogEntry[];

export const phaseThreeBCatalog = [
  {
    "slug": "binary",
    "name": "Binary Calculator",
    "description": "Convert integers between decimal and binary with explicit unsigned and signed two’s-complement modes.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "binary calculator",
      "binary to decimal",
      "decimal to binary",
      "base 2",
      "two complement"
    ],
    "href": "/calculators/math/binary"
  },
  {
    "slug": "circle",
    "name": "Circle Calculator",
    "description": "Calculate a circle’s radius, diameter, circumference, and area from any one known measurement.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "circle calculator",
      "circumference calculator",
      "circle area",
      "diameter calculator",
      "geometry"
    ],
    "href": "/calculators/math/circle"
  },
  {
    "slug": "greatest-common-factor",
    "name": "Greatest Common Factor / Common Factors Calculator",
    "description": "Find the GCF, GCD, or HCF of several integers and optionally list every factor common to them.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "greatest common factor",
      "GCF calculator",
      "GCD calculator",
      "HCF calculator",
      "common factor calculator"
    ],
    "href": "/calculators/math/greatest-common-factor"
  },
  {
    "slug": "confidence-interval",
    "name": "Confidence Interval Calculator",
    "description": "Estimate a normal-approximation confidence interval for a sample mean with clear assumptions and margin of error.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "confidence interval calculator",
      "margin of error",
      "statistics calculator",
      "95 confidence interval",
      "sample mean"
    ],
    "href": "/calculators/math/confidence-interval"
  },
  {
    "slug": "exponent",
    "name": "Exponent Calculator",
    "description": "Calculate a base raised to an exponent with exact-looking integer output and readable scientific notation when needed.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "exponent calculator",
      "power calculator",
      "indices calculator",
      "exponential arithmetic"
    ],
    "href": "/calculators/math/exponent"
  },
  {
    "slug": "prime-factorization",
    "name": "Prime Factorization / Factor Calculator",
    "description": "Find the prime factorization and positive factors of an integer with one clear multi-mode factor tool.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "prime factorization calculator",
      "factor calculator",
      "prime factors",
      "factors of a number",
      "integer factors"
    ],
    "href": "/calculators/math/prime-factorization"
  },
  {
    "slug": "half-life",
    "name": "Half-Life Calculator",
    "description": "Calculate remaining amount after elapsed half-lives or solve backward for the time to reach a chosen amount.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "half life calculator",
      "exponential decay",
      "decay calculator",
      "inverse half life"
    ],
    "href": "/calculators/math/half-life"
  },
  {
    "slug": "hex",
    "name": "Hex Calculator",
    "description": "Convert integers between decimal and hexadecimal with explicit unsigned and signed fixed-width modes.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "hex calculator",
      "hexadecimal calculator",
      "hex to decimal",
      "decimal to hex",
      "base 16"
    ],
    "href": "/calculators/math/hex"
  },
  {
    "slug": "least-common-multiple",
    "name": "Least Common Multiple Calculator",
    "description": "Find the smallest positive multiple shared by a list of whole numbers using exact integer arithmetic.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "least common multiple calculator",
      "LCM calculator",
      "common multiple",
      "lowest common multiple"
    ],
    "href": "/calculators/math/least-common-multiple"
  },
  {
    "slug": "log",
    "name": "Log Calculator",
    "description": "Calculate a real logarithm for a positive value using base 10, natural log, or a custom valid base.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "log calculator",
      "logarithm calculator",
      "natural log",
      "ln calculator",
      "common log"
    ],
    "href": "/calculators/math/log"
  },
  {
    "slug": "long-division",
    "name": "Long Division Calculator",
    "description": "Divide whole integers with quotient, remainder, decimal expansion, and repeating-cycle detection.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "long division calculator",
      "quotient remainder",
      "division calculator",
      "repeating decimal"
    ],
    "href": "/calculators/math/long-division"
  },
  {
    "slug": "matrix",
    "name": "Matrix Calculator",
    "description": "Add, subtract, multiply, find determinants, or invert small matrices with dimension and singularity checks.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "matrix calculator",
      "matrix multiplication",
      "matrix inverse",
      "determinant calculator",
      "linear algebra"
    ],
    "href": "/calculators/math/matrix"
  },
  {
    "slug": "mean-median-mode-range",
    "name": "Mean, Median, Mode & Range Calculator",
    "description": "Calculate four descriptive statistics from a list of numbers and explain what each summary means.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "mean median mode range calculator",
      "statistics calculator",
      "average median",
      "mode range"
    ],
    "href": "/calculators/math/mean-median-mode-range"
  },
  {
    "slug": "number-sequence",
    "name": "Number Sequence Calculator",
    "description": "Generate arithmetic, geometric, or Fibonacci sequence terms from a transparent selected rule.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "number sequence calculator",
      "arithmetic sequence",
      "geometric sequence",
      "Fibonacci sequence"
    ],
    "href": "/calculators/math/number-sequence"
  },
  {
    "slug": "permutation-combination",
    "name": "Permutation & Combination Calculator",
    "description": "Calculate nPr when order matters or nCr when it does not, using exact integer arithmetic.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "permutation calculator",
      "combination calculator",
      "nPr",
      "nCr",
      "combinatorics"
    ],
    "href": "/calculators/math/permutation-combination"
  },
  {
    "slug": "probability",
    "name": "Probability Calculator",
    "description": "Calculate simple, complementary, or independent-event probability with explicit sample-space assumptions.",
    "category": "Math",
    "categorySlug": "math",
    "tags": [
      "probability calculator",
      "chance calculator",
      "complement probability",
      "independent events",
      "statistics"
    ],
    "href": "/calculators/math/probability"
  }
] as const satisfies readonly CatalogEntry[];

export const phaseThreeCCatalog = [
  {
    "slug": "bac",
    "name": "BAC Estimate Calculator",
    "description": "Estimate blood alcohol concentration with a transparent Widmark-style model and uncompromising driving-safety guidance.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "BAC calculator",
      "blood alcohol concentration",
      "alcohol estimate",
      "standard drinks",
      "Widmark equation"
    ],
    "href": "/calculators/health/bac"
  },
  {
    "slug": "body-surface-area",
    "name": "Body Surface Area Calculator",
    "description": "Estimate body surface area from height and weight using the Mosteller equation, with clinical-use limitations stated clearly.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "body surface area calculator",
      "BSA calculator",
      "Mosteller formula",
      "square meters"
    ],
    "href": "/calculators/health/body-surface-area"
  },
  {
    "slug": "bmi",
    "name": "Adult BMI & Reference Weight Range Calculator",
    "description": "Calculate adult BMI and a height-based BMI reference range while keeping screening limitations and respectful language visible.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "BMI calculator",
      "healthy weight calculator",
      "overweight calculator",
      "adult weight range",
      "body mass index"
    ],
    "href": "/calculators/health/bmi"
  },
  {
    "slug": "gfr",
    "name": "eGFR Calculator",
    "description": "Estimate adult kidney filtration with the race-free 2021 CKD-EPI creatinine equation and explicit clinical limitations.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "GFR calculator",
      "eGFR calculator",
      "kidney function estimate",
      "CKD-EPI 2021",
      "creatinine"
    ],
    "href": "/calculators/health/gfr"
  },
  {
    "slug": "ideal-weight",
    "name": "Height-Based Weight Formula Calculator",
    "description": "Compare four historical height-based weight formulas without presenting any single result as a required or ideal body weight.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "ideal weight calculator",
      "healthy weight estimate",
      "Devine formula",
      "Hamwi formula",
      "height based weight"
    ],
    "href": "/calculators/health/ideal-weight"
  },
  {
    "slug": "lean-body-mass",
    "name": "Lean Body Mass Calculator",
    "description": "Estimate adult lean body mass with the Boer equation and show the implied percentage without treating it as a measured composition test.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "lean body mass calculator",
      "LBM calculator",
      "Boer equation",
      "fat free mass estimate"
    ],
    "href": "/calculators/health/lean-body-mass"
  },
  {
    "slug": "macro",
    "name": "Macronutrient, Carbohydrate & Protein Calculator",
    "description": "Convert a daily calorie estimate into carbohydrate, protein, and fat grams while showing adult reference ranges and pregnancy exclusions.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "macro calculator",
      "carbohydrate intake calculator",
      "protein intake calculator",
      "macronutrient calculator",
      "carbs protein fat"
    ],
    "href": "/calculators/health/macro"
  },
  {
    "slug": "molecular-weight",
    "name": "Molecular Weight Calculator",
    "description": "Calculate relative molecular mass and molar mass from a chemical formula, including nested parentheses and common element symbols.",
    "category": "Science & Engineering",
    "categorySlug": "science-engineering",
    "tags": [
      "molecular weight calculator",
      "molar mass calculator",
      "chemical formula mass",
      "chemistry calculator"
    ],
    "href": "/calculators/science-engineering/molecular-weight"
  },
  {
    "slug": "pregnancy-conception",
    "name": "Ovulation, Period & Conception Date Estimator",
    "description": "Estimate a next period, ovulation day, fertile window, and likely conception timing from a regular-cycle assumption.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "conception calculator",
      "ovulation calculator",
      "period calculator",
      "fertile window",
      "menstrual cycle estimate"
    ],
    "href": "/calculators/health/pregnancy-conception"
  },
  {
    "slug": "target-heart-rate",
    "name": "Target Heart Rate Calculator",
    "description": "Estimate age-based moderate and vigorous exercise heart-rate zones using the American Heart Association’s simple method.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "target heart rate calculator",
      "exercise heart rate zone",
      "maximum heart rate",
      "cardio zone"
    ],
    "href": "/calculators/health/target-heart-rate"
  },
  {
    "slug": "tdee",
    "name": "TDEE Calculator",
    "description": "Estimate adult resting energy with Mifflin–St Jeor and multiply it by a clearly labeled activity factor.",
    "category": "Health",
    "categorySlug": "health",
    "tags": [
      "TDEE calculator",
      "total daily energy expenditure",
      "maintenance calories",
      "Mifflin St Jeor",
      "calorie needs"
    ],
    "href": "/calculators/health/tdee"
  }
] as const satisfies readonly CatalogEntry[];

export const phaseThreeCNewSlugs = ["bac","body-surface-area","gfr","ideal-weight","lean-body-mass","macro","molecular-weight","target-heart-rate","tdee"] as const;
export const phaseThreeCExpandedSlugs = ["bmi","pregnancy-conception"] as const;

const routes = <T extends readonly CatalogEntry[]>(entries: T) => entries.map(({ slug, href }) => ({ slug, href })) as ReadonlyArray<RouteEntry<T[number]['slug']>>;
export const priorityOneRoutes = routes(priorityOneCatalog).filter(({ slug }) => !(phaseThreeCExpandedSlugs as readonly string[]).includes(slug));
export const phaseTwoRoutes = routes(phaseTwoCatalog);
export const phaseThreeARoutes = routes(phaseThreeACatalog);
export const phaseThreeBRoutes = routes(phaseThreeBCatalog);
export const phaseThreeCRoutes = routes(phaseThreeCCatalog);
