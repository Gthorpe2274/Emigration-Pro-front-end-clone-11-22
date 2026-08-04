
import React from 'react';
import { UserInput, Concern } from './types';

// Icons for sections
const EducationIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);

const HealthcareIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9h18" />
    </svg>
);

const FinanceIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const SituationIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const VisaIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      {/* Fixed typo in strokeLinejoin below */}
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM9 16h6" />
    </svg>
);

const TransportIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const CultureIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.254.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SeniorIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const SecurityIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const EcoIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const InternetIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0113.132 0M3.172 6.414a15 15 0 0117.656 0" />
  </svg>
);

const TimelineIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const financeSchema = {
    type: 'OBJECT',
    properties: {
        currencyName: { type: 'STRING' },
        currencyCode: { type: 'STRING' },
        budgetItems: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    category: { type: 'STRING' },
                    item: { type: 'STRING' },
                    initialSetupCost: { type: 'STRING' },
                    monthlyOngoingCost: { type: 'STRING' },
                    sixMonthTotal: { type: 'STRING' },
                    notes: { type: 'STRING' },
                },
                required: ['category', 'item', 'initialSetupCost', 'monthlyOngoingCost', 'sixMonthTotal', 'notes']
            }
        },
        assumptionsAndExchangeRate: { type: 'STRING' },
        customerBudgetComparison: { type: 'STRING' },
        estimatedMonthlyTotal: { type: 'STRING' },
        estimatedSixMonthTotal: { type: 'STRING' },
        estimatedAnnualTotal: { type: 'STRING' },
        recommendedEmergencyFund: { type: 'STRING' },
        importDuties: { type: 'STRING' },
        taxOptimizationStrategies: { type: 'STRING' }
    },
    required: [
      'currencyName', 'currencyCode', 'budgetItems', 'assumptionsAndExchangeRate',
      'customerBudgetComparison', 'estimatedMonthlyTotal', 'estimatedSixMonthTotal',
      'estimatedAnnualTotal', 'recommendedEmergencyFund', 'importDuties',
      'taxOptimizationStrategies'
    ]
};

export const CONCERNS: Concern[] = [
  {
    id: 'visa',
    title: 'Steps to Take to Leave America',
    description: 'US departure obligations, residency pathways, customs, and physical relocation.',
    Icon: VisaIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: Departing the United States for ${input.destinationCity}, ${input.destinationCountry}.
      CUSTOMER CONTEXT: Age ${input.age}; occupation ${input.profession}.
      TASK: Generate a practical, chronological departure and destination-entry dossier. Clearly separate US departure obligations from ${input.destinationCountry} immigration requirements.
      INCLUDE:
      1. US Federal and State Departure: IRS filing and foreign-account reporting considerations, state tax-residency termination, Social Security/Medicare implications, voter registration, DMV, insurance, mail, banking, credit, and document retention. Distinguish relocation from formal US citizenship renunciation and do not imply that renunciation is required.
      2. Residency Pathways: Step-by-step eligibility, documents, fees, processing times, work rights, renewal rules, and official application channels for the most relevant visas for a ${input.profession} age ${input.age}.
      3. Customs & Duties: Personal effects, duty-free exemptions, inventories, timing windows, prohibited items, pets, medications, and required certificates.
      4. Vehicle and Household-Goods Relocation: Import eligibility, emissions and safety standards, taxes, registration, shipping, insurance, and when selling before departure is more practical.
      5. Arrival Compliance: Local registration, tax number, banking, healthcare enrollment, driver licensing, and deadlines after arrival in ${input.destinationCity}.
      6. Long-Term Status: Permanent residency, naturalization, dual-citizenship considerations, and continuous-residence rules.
      Use current official government sources and flag matters requiring a licensed immigration or tax professional.
      FORMATTING: Professional headers and checklist formatting.
    `,
  },
  {
    id: 'situation',
    title: 'Job Market Analysis',
    description: 'Hiring demand, work authorization, compensation, credentials, and employment strategy.',
    Icon: SituationIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Produce a current, evidence-based job market and employment-entry analysis for a ${input.profession} at age ${input.age}.
      INCLUDE: 
      1. Current demand, hiring outlook, major employers, growth sectors, and city-specific opportunities relevant to this occupation.
      2. Realistic entry, median, senior, and top-decile gross salary ranges in local currency, plus estimated take-home pay and mandatory benefits.
      3. Work authorization restrictions by relevant visa type, employee versus contractor rules, probation norms, working hours, leave, termination protections, and employment taxes.
      4. Credential recognition, licensing, local-language expectations, skills gaps, and practical retraining or certification routes.
      5. Best local job boards, recruiters, professional associations, networking channels, and a destination-appropriate application strategy.
      6. Remote-work and self-employment rules, including whether foreign-employer work is permitted under likely residency routes.
      7. Current economic, automation, discrimination, and age-related hiring risks, with mitigation strategies.
      8. A focused 90-day job-search action plan. Do not duplicate the master relocation timeline.
      If the occupation indicates retirement or non-employment, adapt this section to lawful part-time work, consulting, volunteering, and income-producing options instead of inventing a conventional career path.
    `,
  },
  {
    id: 'relocation_timeline',
    title: 'Master Relocation Timeline & Guide',
    description: 'A step-by-step chronological roadmap from visa acquisition to final move-in.',
    Icon: TimelineIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Create a definitive, chronological Step-by-Step Relocation Master Guide.
      
      TIMELINE STRUCTURE:
      1. Phase 1: Preparation & Visa (Months 12-6 before move) - Identify the most likely visa for this profile, current official processing estimates, eligibility gates, document dependencies, apostille/translation steps, document-expiration risks, fees, and official application links.
      2. Phase 2: Logistics & Housing (Months 6-2 before move) - Housing search, deposits and guarantors, shipping, pets, schools when applicable, healthcare continuity, insurance, banking preparation, tax planning, and tasks that must wait for visa approval.
      3. Phase 3: The Transition (Last 60 days) - Final visa checks, travel booking, sale or storage of assets, contract termination, mail, prescriptions, medical and school records, funds access, customs inventory, and arrival accommodation.
      4. Phase 4: Arrival & Integration (Month 1-3 post-move) - Immigration registration, tax ID, banking, housing, utilities, phone/internet, healthcare, driver licensing, school enrollment when applicable, employment steps, and every applicable statutory deadline.
      5. Dependencies & Critical Path - Show which tasks block later steps, responsible party, target date, documents needed, estimated cost, and completion evidence.
      6. Contingency Plans - Provide fallback actions for visa delays, rejected documents, housing failure, shipping delays, medical interruption, or insufficient funds.
      
      PERSONALIZATION: Adapt the plan to age ${input.age}, occupation ${input.profession}, budget USD ${input.monthlyBudget}, ${input.familyProfile.childrenCount} relocating children, and the stated location and climate preferences. Do not include family or employment tasks that are inapplicable without labeling them optional.
      FORMATTING: Use a chronological checklist with target timing, dependencies, official links, estimated costs, and "Critical Milestone" callouts for each phase.
    `,
  },
  {
    id: 'healthcare',
    title: 'Comprehensive Healthcare Mapping',
    description: 'Hospitals, emergency response, and pharmaceutical ecosystem.',
    Icon: HealthcareIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Generate an exhaustive healthcare strategy report for a ${input.age}-year-old whose occupation/status is ${input.profession}.
      FORMATTING: Narrative headers and bullet points only.
      INCLUDE: 
      1. Neighborhood-specific hospital rankings within ${input.destinationCity}.
      2. Comprehensive breakdown of Public vs Private systems.
      3. Pharmaceutical costs for common prescriptions.
      4. Emergency infrastructure and primary contact protocols.
      5. Public and private insurance eligibility, enrollment waiting periods, age-banded premiums, deductibles, exclusions, pre-existing-condition rules, and coverage for a new foreign resident.
      6. Dental, vision, mental health, maternity when relevant, rehabilitation, specialist, disability-access, home-care, geriatric, and long-term-care availability and costs.
      7. Vaccination requirements, medical-record and prescription transfer, controlled-medication rules, and continuity-of-care actions before departure.
      8. Named English-speaking or internationally accredited providers where verifiable, realistic appointment and elective-care waiting times, and how referrals work.
      9. A monthly healthcare budget compared with the customer's USD ${input.monthlyBudget} budget, including insurance and representative out-of-pocket scenarios.
      Do not call a provider "best" or assign a ranking unless a named, current methodology supports it. Otherwise provide a comparison based on verifiable services, accreditation, location, and emergency capability.
    `,
  },
  {
    id: 'finance',
    title: 'Cost of Living',
    description: 'Transition budgets, local pricing, and fiscal optimizations.',
    Icon: FinanceIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Create an itemized monthly, 6-month, and annual relocation budget for a ${input.profession} with a ${input.lifestyle} lifestyle and a stated monthly budget of USD ${input.monthlyBudget}.
      
      INCLUDE: Neighborhood-specific rent ranges, deposits, guarantor or insurance requirements, agent fees, furnishings, utilities, internet, mobile service, groceries, dining, transport, healthcare and insurance, education/childcare when applicable, taxes, banking, currency conversion, leisure, visas, shipping, and one-time setup costs.
      CALCULATIONS: State the exchange-rate value and date used, show assumptions, avoid double-counting setup costs, calculate monthly/6-month/annual totals, recommend an emergency fund, and explicitly state whether the customer's budget is sufficient, tight, or insufficient with the largest variance drivers.
      IMPORTANT: Provide realistic city-specific prices in ${input.destinationCountry}. When only national data exists, label it as national and explain the limitation.
    `,
    responseSchema: financeSchema,
  },
  {
    id: 'political_stability',
    title: 'Political Stability & Security',
    description: 'Analysis of political strife, civil security, and local governance.',
    Icon: SecurityIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCountry} and ${input.destinationCity}.
      TASK: Generate a comprehensive analysis on political stability and civil safety.
      INCLUDE:
      1. Current political landscape: Recent strife, elections, or civil unrest risks.
      2. Crime statistics and neighborhood-level safety ratings in ${input.destinationCity}.
      3. Quality of local governance and rule of law for foreign residents.
      4. Emergency security protocols and embassy support availability.
      5. Dated violent-crime, property-crime, hate-crime, corruption, protest, and civil-unrest indicators from official or methodologically transparent sources; distinguish national, regional, and city data.
      6. Neighborhood-specific risk patterns, common tourist/expat scams, digital and financial fraud, transport and late-night risks, discrimination concerns, and practical mitigation for this customer's age and profile.
      7. Police, ambulance, fire, coast guard where relevant, US embassy/consulate, crisis hotlines, emergency alert systems, and a household communications/evacuation plan.
      Do not invent neighborhood scores or present anecdotal claims as statistics. State the reporting period, methodology limitations, under-reporting risks, and source for every quantitative comparison.
      FORMATTING: Professional narrative with clear headers.
    `,
  },
  {
    id: 'environmental_health',
    title: 'Environmental & Water Quality',
    description: 'Tap water potability, air quality, and environmental hazards.',
    Icon: EcoIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Detailed environmental health assessment.
      INCLUDE:
      1. Tap water analysis: Is it potable? Heavy metal/microbial risks and filtration recommendations.
      2. Air Quality Index (AQI) benchmarks: Seasonal fluctuations and pollution sources in ${input.destinationCity}.
      3. Natural disaster profiles: Risks of earthquakes, flooding, or heatwaves.
      4. Waste management and urban green space access.
      5. Seasonal temperature, humidity, rainfall, mold, allergens, wildfire smoke, storms, drought, coastal or seismic exposure, and compatibility with the customer's ${input.climatePreference} climate preference.
      6. Neighborhood-level flood, landslide, heat-island, industrial-pollution, and evacuation risks using official maps where available.
      7. Building-level mitigation: filtration, dehumidification, cooling/heating, backup water, pest control, insurance implications, and questions to ask a landlord or inspector.
      8. A seasonal preparedness calendar and a clear distinction between current measured conditions, historical risk, and future climate projections.
      FORMATTING: High-readability narrative headers.
    `,
  },
  {
    id: 'digital_infrastructure',
    title: 'Digital Connectivity & Internet',
    description: 'High-speed internet reliability, 5G availability, and top ISPs.',
    Icon: InternetIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Comprehensive digital infrastructure report.
      INCLUDE:
      1. Home internet: Availability of Fiber Optic, typical speeds (Mbps), and monthly costs.
      2. Mobile connectivity: 5G/4G coverage maps and best-performing local carriers.
      3. Reliability report: Frequency of outages and customer service response times for major ISPs.
      4. Remote work friendliness: Quality of co-working spaces and public Wi-Fi safety.
      5. Neighborhood-level fiber availability, installation lead times, contract duration, deposits, equipment and activation fees, data caps, cancellation rules, and documents required from a foreign resident.
      6. Independent speed-test evidence alongside provider-advertised speeds, latency and upload performance, outage history, and realistic backup options such as dual-SIM, hotspot, or secondary ISP.
      7. Internet censorship, blocked services, lawful VPN use, surveillance/privacy considerations, cybersecurity and public-Wi-Fi precautions, and remote-employer security requirements.
      8. Named coworking options with current pricing and opening hours where verifiable. Do not claim coverage at a specific address without provider or regulator evidence.
      FORMATTING: Detailed lists and narrative analysis.
    `,
  },
  {
    id: 'utility_resilience',
    title: 'Infrastructure & Power Reliability',
    description: 'Power grid stability, road quality, and sanitation systems.',
    Icon: TransportIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Critical urban infrastructure analysis.
      INCLUDE:
      1. Power Grid Reliability: Analysis of "load shedding" or frequent outages. Advice on backup power/UPS systems.
      2. Road & Pavement Quality: Walkability and vehicle wear-and-tear expectations.
      3. Sanitation & Sewage: Quality of urban waste disposal and drainage systems.
      4. Future Infrastructure: Major upcoming projects that will impact life in ${input.destinationCity}.
      5. Electricity voltage/frequency, plug standards, outage duration and seasonality, surge risk, building generators, solar/battery feasibility, and a sized backup recommendation for essential devices.
      6. Water-supply interruption frequency, pressure, storage tanks, hot-water systems, gas availability, utility billing, connection deposits, foreign-resident documentation, and service restoration procedures.
      7. Waste and recycling collection reliability, drainage and sewage overflow risk, elevator/building resilience, emergency shelters, and household continuity supplies for 72 hours and seven days.
      8. Separate confirmed funded projects from proposals, give expected completion dates, and explain likely neighborhood impacts without duplicating the mobility or environmental sections.
      FORMATTING: Narrative white-paper style.
    `,
  },
  {
    id: 'transportation',
    title: 'Mobility & Urban Connectivity',
    description: 'Public transit, vehicle ownership, and walkability.',
    Icon: TransportIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Exhaustive transportation white-paper.
      INCLUDE:
      1. Public transit analysis (Metro, Rail, Bus) and monthly pass costs.
      2. Guide to vehicle ownership: Import taxes, registration, and fuel benchmarks.
      3. Walkability scores for top 5 residential neighborhoods.
      4. Typical commute times and service hours, late-night availability and safety, airport/rail-terminal access, intercity connections, taxi and rideshare availability, pricing, and common scams.
      5. Driver-license conversion or testing, insurance, parking, tolls, inspections, traffic restrictions, and the realistic total monthly cost of ownership versus transit.
      6. Accessibility for older adults, children, wheelchairs, and reduced mobility; sidewalk quality, station elevators, step-free routes, and paratransit where available.
      7. Cycling infrastructure, helmet and road rules, crash risk, seasonal weather constraints, and safe route-planning tools.
      Use current operator fares and schedules. If no defensible walkability score exists, provide a transparent criteria-based comparison rather than inventing a number.
    `,
  },
  {
    id: 'culture_entertainment',
    title: 'Culture, Arts & Entertainment',
    description: 'Festivals, nightlife, dining scenes, and social clubs.',
    Icon: CultureIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Cultural and entertainment dossier.
      INCLUDE:
      1. Annual calendar of major festivals.
      2. Dining districts: High-end culinary scenes vs. local traditions.
      3. Arts infrastructure: Concert halls, theaters, and gallery hubs.
      4. Local-language expectations, etiquette, dress, tipping, noise and alcohol rules, religious and cultural norms, and common adjustment challenges for Americans.
      5. Named local—not only expat—community groups, professional associations, volunteering, faith communities, libraries, classes, and practical ways to build relationships.
      6. Inclusion and discrimination considerations relevant to foreigners, race, religion, disability, age, gender, and LGBTQ+ residents, based on reliable legal and social evidence.
      7. Accessibility, transit home after events, representative participation costs, reservation practices, and options aligned with the customer's ${input.lifestyle} lifestyle and budget.
    `,
  },
  {
    id: 'sports_recreation',
    title: 'Sports & Active Recreation',
    description: 'Fitness infrastructure, stadiums, and outdoor activity.',
    Icon: HealthcareIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Analyze the sporting landscape.
      INCLUDE:
      1. Professional sports access and ticket benchmarks.
      2. Personal fitness: Gym chains, yoga studios, and swimming facilities.
      3. Outdoor: Hiking, cycling, and water sports availability.
      4. Current membership, day-pass, equipment-rental, coaching, and event costs, plus age restrictions, required medical certificates, waivers, and insurance considerations.
      5. Age-appropriate and accessible activities for a ${input.age}-year-old, including adaptive recreation, low-impact options, public facilities, and senior or family programs where applicable.
      6. Seasonal availability and compatibility with the customer's ${input.climatePreference} preference, heat/air-quality/water-safety risks, emergency access, and safe transport to and from venues.
      7. Named clubs, leagues, parks, trails, beaches, and facilities only when current access, location, and operating status can be verified.
    `,
  },
  {
    id: 'senior_benefits',
    title: 'Senior & Retirement Benefits',
    description: 'Tax exemptions, social discounts, and age-specific subsidies.',
    Icon: SeniorIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      CUSTOMER AGE: ${input.age}.
      TASK: ${Number(input.age) >= 60
        ? 'Create a current senior and retirement benefits eligibility briefing for this customer.'
        : 'Create a future-planning briefing that clearly states the customer is not yet 60 and identifies the age and residency thresholds for later eligibility. Do not imply current eligibility.'}
      INCLUDE:
      1. Eligibility rules by age, residency status, contribution history, means testing, and nationality for public pensions, tax relief, and foreign retirement income treatment.
      2. Transport, utility, cultural, property-tax, and other statutory or commercial senior discounts, including how to apply and required identification.
      3. Public healthcare eligibility, private insurance age rules, long-term care, home care, prescription support, and geriatric community programs.
      4. US Social Security and Medicare considerations abroad, relevant totalization agreements, and cross-border pension payment logistics.
      5. A checklist of benefits available now versus benefits available only at later ages. Do not describe a benefit as available without confirming residency and age requirements.
    `,
  },
  {
    id: 'childrens_education',
    title: "Children's Education & Schooling",
    description: 'Schools, curricula, admissions and costs in your chosen city.',
    Icon: EducationIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      FAMILY PROFILE: ${input.familyProfile.childrenCount} relocating children; ages: ${input.familyProfile.childrenAges}; stated education preferences or support needs: ${input.familyProfile.educationPreferences}.
      TASK: ${input.familyProfile.childrenCount > 0
        ? `Create a practical schooling plan personalized to this family and specific to ${input.destinationCity}. Prioritize age-appropriate options and the stated needs.`
        : `The customer reported no relocating children. Provide a concise future-reference overview for ${input.destinationCity}, clearly label it as not currently applicable, and do not invent children or schooling needs.`}
      INCLUDE:
      1. Named international, bilingual and private schools serving the city,
         with the curricula they teach (IB, British, American, national).
      2. Typical annual tuition ranges per school type, plus the enrolment,
         registration and capital fees families are commonly surprised by.
      3. How to access state/public schooling as a foreign resident: language
         of instruction, catchment rules, and documents required to enrol.
      4. Admissions reality: waiting lists, intake dates relative to the
         academic calendar, entrance assessments, and how far ahead to apply.
      5. Provision for children with additional learning needs or limited
         local-language ability.
      6. Higher education pathways locally, and whether local qualifications
         are recognised for university entry back in the United States.
    `,
  },
];
