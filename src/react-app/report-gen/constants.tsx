
import React from 'react';
import { UserInput, Concern } from './types';

// Icons for sections
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
        importDuties: { type: 'STRING' },
        taxOptimizationStrategies: { type: 'STRING' }
    },
    required: ['currencyName', 'currencyCode', 'budgetItems', 'importDuties', 'taxOptimizationStrategies']
};

export const CONCERNS: Concern[] = [
  {
    id: 'visa',
    title: 'Steps To Take To Leave America',
    description: 'Residency pathways, customs laws, and property relocation (cars, etc.).',
    Icon: VisaIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCountry}.
      TASK: Generate an exhaustive legal dossier on residency and physical relocation.
      INCLUDE:
      1. Residency Pathways: Step-by-step for the most relevant work or investment visas for a ${input.profession}.
      2. Customs & Duties: Exhaustive guide to importing personal effects, duty-free exemptions for relocators, and prohibited items.
      3. Vehicle Importation: Legal requirements, emissions standards (Euro/EPA/etc.), importation taxes, and registration logistics for cars.
      4. Property Relocation: Documentation for household goods and international shipping legalities.
      5. Citizenship Track: Requirements for permanent residency and naturalization.
      FORMATTING: Professional headers and checklist formatting.
    `,
  },
  {
    id: 'situation',
    title: 'Job Market Analysis',
    description: 'Job market demand, legal risks, and migration timelines.',
    Icon: SituationIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: SWOT analysis for a ${input.profession} at age ${input.age}.
      INCLUDE: 
      1. Salary benchmarks for the top 10% locally.
      2. Critical legal or economic risks for 2025.
      3. 12-month pre- and post-move checklist.
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
      1. Phase 1: Preparation & Visa (Months 12-6 before move) - Focus on legal document gathering and initial application.
      2. Phase 2: Logistics & Housing (Months 6-2 before move) - Focus on shipping quotes, local banking setup, and neighborhood scouting.
      3. Phase 3: The Transition (Last 60 days) - Selling assets, terminating local contracts, and medical records transfer.
      4. Phase 4: Arrival & Integration (Month 1-3 post-move) - Local ID registration, utility activation, and community integration.
      
      FORMATTING: Use a bold, chronological numbered list. Include "Critical Milestone" callouts for each phase.
    `,
  },
  {
    id: 'healthcare',
    title: 'Comprehensive Healthcare Mapping',
    description: 'Hospitals, emergency response, and pharmaceutical ecosystem.',
    Icon: HealthcareIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Generate an exhaustive healthcare strategy report for a ${input.age}yo professional.
      FORMATTING: Narrative headers and bullet points only.
      INCLUDE: 
      1. Neighborhood-specific hospital rankings within ${input.destinationCity}.
      2. Comprehensive breakdown of Public vs Private systems.
      3. Pharmaceutical costs for common prescriptions.
      4. Emergency infrastructure and primary contact protocols.
    `,
  },
  {
    id: 'finance',
    title: 'Cost of Living',
    description: 'Transition budgets, local pricing, and fiscal optimizations.',
    Icon: FinanceIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCity}, ${input.destinationCountry}.
      TASK: Create an itemized 6-month relocation budget for a ${input.profession} with a ${input.lifestyle} lifestyle.
      
      IMPORTANT: You are acting as a senior relocation financial analyst. Provide realistic local prices in ${input.destinationCountry}.
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
    `,
  },
  {
    id: 'senior_benefits',
    title: 'Senior & Retirement Benefits',
    description: 'Tax exemptions, social discounts, and age-specific subsidies.',
    Icon: SeniorIcon,
    prompt: (input: UserInput) => `
      GEOGRAPHIC CONTEXT: ${input.destinationCountry}.
      TASK: Senior-specific (60+) benefits and tax advantages briefing.
      INCLUDE:
      1. Legal tax exemptions for foreign retirement income.
      2. "Golden Age" discount programs for transport and utilities.
      3. Healthcare subsidies and geriatric community programs.
    `,
  },
];
