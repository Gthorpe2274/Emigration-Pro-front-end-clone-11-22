import { Link, useLocation } from 'react-router-dom';
import Navigation from '@/react-app/components/Navigation';
import { useSEO } from '@/react-app/hooks/useSEO';

export function SampleReport() {
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  useSEO({
    title: 'Sample Relocation Report — Rio de Janeiro',
    description:
      'A partial sample of the Emigration Pro personalized relocation report, covering healthcare strategy, cost of living and political stability for Rio de Janeiro, Brazil.',
    canonicalPath: '/sample-report',
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 text-slate-900 pb-12 min-h-screen scroll-smooth">
      <div className="no-print">
        <Navigation />
      </div>
      <div className="px-4 md:px-8 py-12">
        <style>{`
          body {
            font-family: 'Inter', sans-serif; 
            -webkit-print-color-adjust: exact; 
        }
        @media print {
            .no-print { display: none !important; }
            body { background-color: white !important; padding: 0 !important; }
            .report-card { box-shadow: none !important; border: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
        }
        /* Restore standard table borders for non-tailwind environments */
        table { border-collapse: collapse; width: 100%; margin-bottom: 1.5rem; }
        th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
        th { background-color: #f8fafc; font-weight: 600; }
        .break-after-page { page-break-after: always; }
        
        /* Custom scrollbar for better UX */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        `}</style>

        <div className="report-card max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Branding */}
          <div className="bg-slate-900 text-white p-8 text-center relative">
            {returnTo && (
              <div className="absolute top-4 left-8 no-print">
                <Link
                  to={returnTo}
                  className="inline-flex items-center text-slate-400 hover:text-white transition-colors font-medium text-sm"
                >
                  ← Back to Results
                </Link>
              </div>
            )}
            <h1 className="text-3xl font-bold">Emigration Pro Report</h1>
            <p className="text-slate-400 mt-2">Personalized Analysis & Relocation Strategy</p>
            <div className="mt-4 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
              This is a partial sample
            </div>
          </div>

          <div className="p-8 md:p-16">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-4xl font-black text-slate-950 tracking-tight">Relocation Analysis Report</h2>
              <p className="text-slate-950 font-bold">Rio de Janeiro, Brazil</p>
              <div className="flex justify-center items-center gap-2 text-sm text-slate-600 pt-2 font-bold uppercase tracking-widest">
                <span>Emigration Pro</span>
                <span>•</span>
                <span>December 31, 2025</span>
              </div>
            </div>

            <div className="mb-16 p-8 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 className="text-xl font-black text-slate-950 mb-6 flex items-center gap-2 uppercase tracking-wide">Table of Contents</h2>
              <nav>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {[
                    ['01', 'section-visa', 'Steps to Take to Leave America'],
                    ['02', 'section-situation', 'Job Market Analysis'],
                    ['03', 'section-relocation_timeline', 'Master Relocation Timeline & Guide'],
                    ['04', 'section-healthcare', 'Comprehensive Healthcare Mapping'],
                    ['05', 'section-finance', 'Cost of Living'],
                    ['06', 'section-political_stability', 'Political Stability & Security'],
                    ['07', 'section-environmental_health', 'Environmental & Water Quality'],
                    ['08', 'section-digital_infrastructure', 'Digital Connectivity & Internet'],
                    ['09', 'section-utility_resilience', 'Infrastructure & Power Reliability'],
                    ['10', 'section-transportation', 'Mobility & Urban Connectivity'],
                    ['11', 'section-culture_entertainment', 'Culture, Arts & Entertainment'],
                    ['12', 'section-sports_recreation', 'Sports & Active Recreation'],
                    ['13', 'section-senior_benefits', 'Senior & Retirement Benefits'],
                    ['14', 'section-childrens_education', 'Children’s Education & Schooling'],
                  ].map(([number, id, title]) => (
                    <li key={id} className="flex items-start gap-3">
                      <span className="text-indigo-600 font-black text-xs mt-1.5">{number}</span>
                      <a href={`#${id}`} className="text-slate-950 hover:text-indigo-700 transition-colors font-bold border-b border-transparent hover:border-indigo-200">{title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div id="section-healthcare" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Comprehensive Healthcare Mapping</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Healthcare Strategy Report: 78-Year-Old Professional in Rio de Janeiro</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">Neighborhood-Specific Hospital Rankings</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Copacabana & Leme (Ultra-Premium)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Copa Star:</strong> Widely considered the most luxurious hospital in Rio; offers "hospitality" services (concierge, gourmet dining) alongside high-complexity surgical units.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Copa D’Or:</strong> A top-tier general hospital with a robust 24/7 emergency department and specialized geriatric care.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Botafogo & Humaitá (Specialized Excellence)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Hospital Samaritano Botafogo:</strong> Renowned for cardiology and orthopedics; a preferred choice for senior professionals due to its tradition of clinical excellence.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Hospital Pró-Cardíaco:</strong> The city's leading center for cardiovascular emergencies and complex heart procedures.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Casa de Saúde São José:</strong> Located in Humaitá; highly rated for its nursing care and personalized patient attention.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Barra da Tijuca (Modern Infrastructure)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Hospital Barra D’Or:</strong> A massive, modern facility with the highest concentration of advanced diagnostic technology in the West Zone.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Hospital Samaritano Barra:</strong> Newer facility offering high-end private suites and specialized oncology and neurology units.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Gávea & Leblon (Public-Private Hybrid Context)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Hospital Municipal Miguel Couto (Public):</strong> The primary trauma center for the South Zone; while public, its "unidade de emergência" is the best option for immediate stabilization in severe trauma before transferring to private care.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Clínica São Vicente (Gávea):</strong> A prestigious private hospital favored by the local elite for its privacy and high doctor-to-patient ratio.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">Public vs. Private Healthcare Systems: Comprehensive Breakdown</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Private System (Saúde Suplementar)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Cost Structure:</strong> For a 78-year-old, private plans (e.g., Bradesco Saúde Premium, SulAmérica, Amil One) are expensive, often ranging from R$ 4,000 to R$ 8,000+ per month due to age-related risk adjustments.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Access:</strong> Provides immediate access to specialists, private suites, and the hospitals listed above. Most high-end plans include "reembolso" (reimbursement) for out-of-network doctors.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Quality:</strong> Superior amenities, shorter wait times for elective surgeries, and access to English-speaking staff in premium facilities like Copa Star.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Public System (Sistema Único de Saúde - SUS)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Cost Structure:</strong> 100% free at the point of service for all residents (including foreigners with a CPF).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Access:</strong> Universal coverage but characterized by long wait times for non-emergency procedures. Primary care is managed through "Clínicas da Família."</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Quality:</strong> Excellent for high-complexity treatments (transplants, HIV, oncology) and emergency trauma, but lacks the comfort and speed of the private sector.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">The "Super-Priority" Rule</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Statutory Rights:</strong> Under Brazilian law (Estatuto do Idoso), individuals over 60 have priority. However, those over 80 (and often those approaching it, like a 78-year-old) receive "super-priority" in queues and medical triaging within the SUS.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">Pharmaceutical Costs and Access</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Farmácia Popular Program</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Free Medications:</strong> The government provides 41 essential medications for free at any pharmacy with the "Aqui Tem Farmácia Popular" sign. This includes treatments for hypertension (e.g., Losartan), diabetes (e.g., Metformin), and asthma.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Subsidized Items:</strong> Geriatric diapers and certain cholesterol medications are available at a 90% discount.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Common Prescription Cost Estimates (Out-of-Pocket)</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Statins (e.g., Atorvastatin):</strong> R$ 30 – R$ 90 for a 30-day supply (Generic vs. Brand).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Blood Thinners (e.g., Xarelto/Rivaroxaban):</strong> R$ 200 – R$ 350 per month (High-cost category).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Hypertension (Brand-name combinations):</strong> R$ 50 – R$ 150 per month.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Pharmacy Chains in Rio</strong></li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Droga Raia / Drogasil:</strong> High-end chains with reliable stock and digital apps for delivery.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Pacheco / Venancio:</strong> Ubiquitous in the South Zone; often offer loyalty discounts tied to your CPF (tax ID number).</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">Emergency Infrastructure and Primary Contact Protocols</h2>
                  <ul className="list-disc pl-8 space-y-4 text-slate-950 font-medium">
                    <li>
                      <strong className="font-black text-slate-950">Public Emergency (SAMU)</strong>
                      <ul className="list-circle pl-6 mt-2 space-y-1">
                        <li><strong className="font-black text-slate-950">Primary Contact:</strong> Dial <strong className="font-black text-slate-950">192</strong>.</li>
                        <li><strong className="font-black text-slate-950">Protocol:</strong> Dispatchers categorize the emergency. If life-threatening, a "USA" (Advanced Support Unit) with a doctor is sent. Note: Public ambulances typically transport to the nearest public hospital (e.g., Miguel Couto).</li>
                      </ul>
                    </li>
                    <li>
                      <strong className="font-black text-slate-950">Private Ambulance & Home Care</strong>
                      <ul className="list-circle pl-6 mt-2 space-y-1">
                        <li><strong className="font-black text-slate-950">Vida Emergências Médicas:</strong> One of the most reliable private ambulance services in Rio; often included as a "concierge" add-on in premium health plans.</li>
                        <li><strong className="font-black text-slate-950">Contact Protocols:</strong> Keep the direct number for your chosen hospital's emergency room on speed dial (e.g., Copa D'Or: +55 21 2545-3600).</li>
                      </ul>
                    </li>
                    <li>
                      <strong className="font-black text-slate-950">Strategic Action Plan for a 78-Year-Old Professional</strong>
                      <ul className="list-circle pl-6 mt-2 space-y-1">
                        <li><strong className="font-black text-slate-950">Step 1: Secure a CPF:</strong> Essential for all health transactions, including pharmacy discounts and private insurance.</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Comprehensive Healthcare Mapping</span>
                <span>Section 1 / 14</span>
              </div>
            </div>

            <div id="section-finance" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Cost of Living</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <div className="my-6">
                    <a href="https://www.google.com/search?q=convert+BRL+to+usd" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 px-6 rounded-xl text-sm transition-all border border-indigo-200 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                      <span>Live Conversion: Brazilian Real (BRL) to USD</span>
                    </a>
                  </div>

                  <div className="overflow-x-auto not-prose rounded-2xl border border-slate-200 shadow-lg my-8 bg-white">
                    <table className="min-w-full text-sm border-collapse">
                      <thead className="bg-slate-900">
                        <tr>
                          <th className="p-4 text-left font-black text-white uppercase tracking-wider">Item Details</th>
                          <th className="p-4 text-center font-black text-white uppercase tracking-wider">Setup Cost</th>
                          <th className="p-4 text-center font-black text-white uppercase tracking-wider">Monthly</th>
                          <th className="p-4 text-center font-black text-white uppercase tracking-wider text-indigo-300">6-Month Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Housing
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Rent (2-Bedroom Apartment in Botafogo/Flamengo)</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Initial cost includes a 3-month security deposit common for moderate-tier long-term rentals.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">15000.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">5000.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">45000.00</td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Condo Fees (Condomínio) and Property Tax (IPTU)</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Essential monthly costs in Rio; varies by building amenities and location.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">0.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">1200.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">7200.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Legal & Immigration
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Retirement Visa (VITEM XIV) & CRNM Registration</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Includes government fees and professional assistance for the residency permit process.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">3500.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">0.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">3500.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Healthcare
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Private Health Insurance (Age 60+ Tier)</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Premium private plan (e.g., Bradesco or Amil) necessary for access to top hospitals like Copa Star.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">0.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">2200.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">13200.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Utilities
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Electricity, Water, and Gas</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Electricity is high in Rio due to air conditioning usage during summer months.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">400.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">850.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">5500.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Communication
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Fiber Internet and Mobile Data Plan</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Includes 300Mbps home fiber and a post-paid mobile plan with international roaming options.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">200.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">280.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">1880.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Lifestyle
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Groceries and Household Essentials</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Moderate lifestyle shopping at Zona Sul or Pão de Açúcar supermarkets.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">1200.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">2000.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">13200.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Transportation
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Public Transit and Rideshare (Uber/Taxi)</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">Assuming no car ownership; relying on RioCard for Metro and frequent Uber Comfort use.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">100.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">700.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">4300.00</td>
                        </tr>
                        <tr className="bg-slate-100">
                          <td className="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colSpan={4}>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                              Household Setup
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-950 text-base">Furniture and Basic Appliances</div>
                            <div className="text-slate-500 text-xs mt-1 leading-relaxed">One-time cost to furnish a semi-furnished unit with bedding, kitchenware, and small electronics.</div>
                          </td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">12000.00</td>
                          <td className="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">0.00</td>
                          <td className="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">12000.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="my-8">
                    <h3 className="text-2xl font-black mb-4 text-slate-950 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Customs & Importation Duties
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed shadow-sm">
                      New residents with a permanent visa are typically exempt from import duties on used personal household goods and furniture if imported within 180 days of arrival. However, motorized vehicles are strictly taxed at approximately 100% of their value, and new electronics exceeding $1,000 USD are subject to a 60% flat import tax.
                    </div>
                  </div>

                  <div className="my-8">
                    <h3 className="text-2xl font-black mb-4 text-slate-950 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 4v16m8-8H4"></path>
                      </svg>
                      Fiscal & Tax Optimization
                    </h3>
                    <div className="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 text-slate-800 leading-relaxed shadow-sm">
                      Brazil has Double Taxation Agreements (DTA) with many countries to prevent being taxed twice on retirement income. Retirees should utilize the 'Carnê-Leão' system for monthly tax declarations on foreign income to avoid heavy penalties. It is recommended to maintain 'Non-Resident' status in the home country and consult a local accountant regarding the 'Declaração de Saída Definitiva' if applicable.
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Cost of Living</span>
                <span>Section 2 / 14</span>
              </div>
            </div>

            <div id="section-political_stability" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Political Stability & Security</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium text-base">This analysis provides a comprehensive overview of the political and security environment in Brazil, with a specific focus on Rio de Janeiro, for the 2024–2025 period.</p>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">1. Current Political Landscape</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">The Brazilian political environment remains deeply polarized, characterized by a tension between the executive branch and segments of the opposition, as well as significant judicial activity involving high-ranking figures.</p>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Recent Strife and Legal Developments:</strong> In late 2024, the Federal Police officially indicted former President Jair Bolsonaro and 36 others for an alleged coup attempt intended to prevent President Luiz Inácio Lula da Silva from taking office. This has maintained a high level of political friction and remains a focal point for potential civil unrest among supporters.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Civil Unrest Risks:</strong> While large-scale riots similar to the January 2023 Brasília events have subsided, localized protests and social unrest remain a risk, particularly during sensitive judicial rulings or anniversaries of political events. Polarization is often fueled by digital misinformation, leading to sudden, though usually contained, demonstrations in major urban centers.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">2024 Municipal Elections:</strong> The October 2024 local elections saw a significant increase in political violence, with hundreds of incidents of harassment and several killings reported. This highlights a persistent "grassroots" volatility where local political disputes can escalate into physical confrontations.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Stability Outlook:</strong> Despite the rhetoric, federal institutions—specifically the Supreme Court and the Superior Electoral Court—have demonstrated resilience in maintaining the constitutional order. However, the high level of "political violence" (which increased 400% between 2018 and 2022) remains a structural risk for the 2026 general election cycle.</li>
                  </ul>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">2. Rio de Janeiro: Crime Statistics & Safety Ratings</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Public security in Rio de Janeiro is a study in contrasts. While overall intentional violent deaths have dropped to historical lows, specific property crimes and "mafia-style" organized crime (the <em>milícias</em>) present ongoing challenges.</p>
                  <h3 className="text-lg font-black mt-8 mb-4 text-slate-950 leading-tight uppercase tracking-wider">General Crime Trends (2024–2025)</h3>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Violent Crime:</strong> Intentional homicides in Rio fell by approximately 16% in early 2024, reaching the lowest levels since the early 1990s.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Property Crime:</strong> Conversely, "street crimes" like cell phone theft and pedestrian robbery have surged in specific transit hubs. Cell phone robberies in the <em>Centro</em> (Downtown) rose by over 50% in the last year.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Organized Crime:</strong> The state government has rebranded "militias" as "mafias" to reflect their sophisticated control over utilities, real estate, and local commerce. Clashes between these groups and drug factions (e.g., <em>Comando Vermelho</em>) occasionally cause "echo-chamber" violence in the North and West Zones.</li>
                  </ul>
                  <h3 className="text-lg font-black mt-8 mb-4 text-slate-950 leading-tight uppercase tracking-wider">Neighborhood-Level Safety Ratings</h3>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Low Risk (South Zone - Leblon, Ipanema):</strong> Generally the safest areas for foreign residents. Home robberies saw a slight decline in Leblon (5%) but remain a target for "social engineering" gangs.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Moderate Risk (South Zone - Copacabana, Botafogo, Flamengo):</strong> High police presence but frequent petty theft. Copacabana saw a 43% decrease in pedestrian robberies due to intensified policing, while Botafogo saw a surge in home invasions (over 100% increase in some sectors).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">High Risk (Centro / Downtown):</strong> Avoid at night and on weekends when foot traffic is low. Historical highs in cell phone and vehicle thefts.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Extreme Risk (North Zone - Penha, Complexo do Alemão; West Zone Favelas):</strong> Active conflict zones. Frequent police operations and factional fighting. In late 2025, significant traffic disruptions occurred on major arteries (Avenida Brasil) due to these conflicts.</li>
                  </ul>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">3. Governance and Rule of Law for Foreigners</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Rule of Law Index:</strong> According to the 2024 World Justice Project, Brazil’s rule of law score improved for the first time in eight years, ranking 80th globally.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Corruption and Transparency:</strong> While endemic at high levels, the judiciary remains independent. Navigating large-scale business bureaucracy may still involve "grey areas."</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Foreign Resident Protections:</strong> Brazil has a humanitarian-leaning migration policy, with simplified residence permits for work and study.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Political Stability & Security</span>
                <span>Section 3 / 14</span>
              </div>
            </div>

            <div id="section-environmental_health" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Environmental & Water Quality</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Environmental Health Assessment: Rio de Janeiro</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Tap Water Analysis: Potability and Risk Factors</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Potability Status:</strong> Water from the Guandu Treatment Plant meets federal standards, but distribution network age causes secondary contamination.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Microbial and Chemical Risks:</strong> Seasonal blooms of Geosmin/MIB cause earthy taste. Heavy metals/rust common in older building pipes.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Filtration Recommendations:</strong> Filtro de Barro (Clay Filter) or activated carbon filters are highly effective.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Air Quality Index (AQI)</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Pollution Sources:</strong> Vehicular emissions (Avenida Brasil) and industrial activity in North/West Zones.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Seasonal Fluctuations:</strong> Dry Season (May-Sept) sees higher PM concentrations. Peak summer heat intensifies Ozone production.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">3. Natural Disaster Profile</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Flooding and Landslides (High Risk):</strong> The most frequent threat during summer rains. 21% of households in high-risk zones.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Heatwaves (Increasing Risk):</strong> Guaratiba recorded record heat index of 62.3°C in March 2024.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Earthquakes (Very Low Risk):</strong> Geologically stable on the South American plate.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">4. Waste Management and Urban Green Space Access</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Waste Collection:</strong> Handled by COMLURB; nearly 100% in formal neighborhoods, inconsistent in favelas.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Green Space:</strong> Home to Tijuca National Park (~49% green coverage), but access is highly unequal between South and North Zones.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Environmental & Water Quality</span>
                <span>Section 4 / 14</span>
              </div>
            </div>

            <div id="section-digital_infrastructure" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Digital Connectivity & Internet</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Digital Infrastructure Report: Rio de Janeiro (2024–2025)</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Home Internet: Fiber Optic Infrastructure</h2>
                  <h3 className="text-lg font-black mt-8 mb-4 text-slate-950 leading-tight uppercase tracking-wider">Major Providers and Typical Plans</h3>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Vivo Fibra:</strong> 600 Mbps (~R$ 100/mo), up to 1 Gbps (R$ 150-300).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Claro:</strong> 350 Mbps to 600 Mbps (R$ 100-160).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">TIM Ultrafibra:</strong> Competitive high upload speeds.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Mobile Connectivity: 5G and 4G Coverage</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">TIM:</strong> Leads in 5G availability and consistency.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Vivo:</strong> Strongest indoor and underground signal penetration.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Reliability Issues:</strong> Spike in cable theft (160% in 2023-24) causes multi-day outages in some areas.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">3. Remote Work Friendliness</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Co-working hubs like WeWork (Botafogo), Selina (Copacabana), and Nex (Gávea) offer world-class redundant facilities.</p>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Digital Connectivity & Internet</span>
                <span>Section 5 / 14</span>
              </div>
            </div>

            <div id="section-utility_resilience" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Infrastructure & Power Reliability</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Critical Urban Infrastructure Analysis</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Power Grid Reliability</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Reliability:</strong> System under strain during summer months (Nov-April). Voltage instability due to informal connections is a risk.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Mitigation:</strong> Double-conversion UPS and Surge Protection Devices (SPD) are essential.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Road and Pavement Quality</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Walkability:</strong> High in South Zone, extremely low in West Zone (Barra/Recreio).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Maintenance:</strong> Expect 20-30% shorter lifespan for vehicle suspension parts due to pavement degradation.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">3. Sanitation and Future Projects</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Sanitation universalization projects (R$ 27.6B investment) targeting 90% sewage coverage by 2033. Major mobility projects include VLT expansion and BRT replacement.</p>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Infrastructure & Power Reliability</span>
                <span>Section 6 / 14</span>
              </div>
            </div>

            <div id="section-childrens_education" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Children’s Education & Schooling</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Education and Schooling Briefing for Rio de Janeiro</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. International, Bilingual, and Local Schools</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">The British School:</strong> British and international curricula across multiple Rio campuses.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Escola Americana do Rio de Janeiro:</strong> American-style education and international university preparation.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Tuition, Admissions, and Enrollment Planning</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Families should compare tuition, enrollment and capital fees, curriculum recognition, language support, waiting lists, and application dates well before relocating.</p>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">3. Education Support and University Pathways</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Public schooling:</strong> Residency documents, catchment rules, and Portuguese-language instruction affect enrollment.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Learning support:</strong> Availability varies, so families should confirm language and additional-needs services directly.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Higher education:</strong> Curriculum choice can affect qualification recognition and university entry abroad.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Children’s Education & Schooling</span>
                <span>Section 14 / 14</span>
              </div>
            </div>

            <div id="section-transportation" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Mobility & Urban Connectivity</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Rio de Janeiro Transportation White-Paper</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Public Transit Analysis</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Modals:</strong> MetrôRio (Lines 1, 2, 4), SuperVia (Commuter Rail), BRT, VLT, and Barcas (Ferries).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Fares:</strong> Metro ~R$ 7.90 per trip. No unlimited monthly passes available.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Guide to Vehicle Ownership</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Ownership is characterized by high taxes (IPVA 4% market value) and strict annual registration. Import taxes on new vehicles often exceed 100% value.</p>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Mobility & Urban Connectivity</span>
                <span>Section 8 / 14</span>
              </div>
            </div>

            <div id="section-culture_entertainment" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Culture, Arts & Entertainment</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Rio de Janeiro Cultural and Entertainment Dossier</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Annual Calendar of Major Festivals</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Rio Carnival:</strong> Feb/March. Special Group parades at Sambadrome.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Réveillon:</strong> Dec 31. Massive fireworks on Copacabana Beach.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">ArtRio:</strong> September. Latin America's top contemporary art fair.</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Dining Districts</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Fine Dining:</strong> Leblon epicenter (Oro - 2 Michelin stars).</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Historic Eateries:</strong> Confeitaria Colombo (Centro), Rio Minho (1884).</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Culture, Arts & Entertainment</span>
                <span>Section 9 / 14</span>
              </div>
            </div>

            <div id="section-sports_recreation" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Sports & Active Recreation</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Professional Sports and Personal Fitness</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Professional Sports</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Football:</strong> Maracanã Stadium (Flamengo, Fluminense). Ticket benchmarks R$ 60-150.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Personal Fitness:</strong> Gym chains range from R$ 119 (Smart Fit) to R$ 600+ (Bodytech).</li>
                  </ul>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Outdoor Activities</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Hiking in Tijuca Forest, 450km of cycling paths, and water sports at Arpoador and Posto 6.</p>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Sports & Active Recreation</span>
                <span>Section 10 / 14</span>
              </div>
            </div>

            <div id="section-senior_benefits" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Senior & Retirement Benefits</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Senior Benefits and Tax Advantages</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Tax Advantages (65+)</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Double exemption bracket for retirement income. Reciprocity treaties prevent double taxation with USA/UK/Germany.</p>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Statute of the Elderly Benefits</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Transport:</strong> Free transit (65+) and interstate bus seat reservations.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Culture:</strong> Legally guaranteed half-price tickets.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Healthcare:</strong> ANS prohibits age-based insurance hikes after 60.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Senior & Retirement Benefits</span>
                <span>Section 11 / 14</span>
              </div>
            </div>

            <div id="section-situation" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Job Market Analysis</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">SWOT Analysis: Retirement in Rio (Age 78)</h2>
                  <h3 className="text-lg font-black mt-8 mb-4 text-slate-950 leading-tight uppercase tracking-wider">Strengths & Opportunities</h3>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">High purchasing power with foreign currency, world-class healthcare in Zona Sul, and strong social integration for seniors. Real estate in premium neighborhoods serves as a strong hedge.</p>
                  <h3 className="text-lg font-black mt-8 mb-4 text-slate-950 leading-tight uppercase tracking-wider">Weaknesses & Threats</h3>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Security vulnerabilities, complex bureaucracy, and language barrier. BRL currency volatility and new 2025 tax reforms on offshore assets (15% flat tax).</p>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">Salary Benchmarks</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Top 10% Lifestyle: R$ 15,000 - R$ 20,000/mo. Top 1% Lifestyle: R$ 35,000+/mo.</p>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Job Market Analysis</span>
                <span>Section 2 / 14</span>
              </div>
            </div>

            <div id="section-visa" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Steps to Take to Leave America</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Legal Dossier: Residency in Brazil</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">1. Retirement Visa (VITEM XIV)</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Proof of USD 2,000/mo recurring income required. Apostilled documents and sworn translations are mandatory.</p>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">2. Customs & Duties</h2>
                  <p className="leading-relaxed mb-6 text-slate-950 font-medium">Duty-free importation of used household goods within 180 days of arrival. Used car imports strictly prohibited (except for collectors).</p>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Steps to Take to Leave America</span>
                <span>Section 1 / 14</span>
              </div>
            </div>

            <div id="section-relocation_timeline" className="mb-16 break-after-page relative pb-10">
              <h2 className="text-3xl font-bold text-slate-950 border-b-2 border-indigo-600 pb-2 mb-6">Master Relocation Timeline & Guide (full details in purchased Report)</h2>
              <div className="text-slate-900 leading-relaxed font-medium">
                <div className="prose max-w-none report-text-area">
                  <div className="mb-8 inline-block bg-orange-500/10 border border-orange-500/50 text-orange-400 px-6 py-2 rounded-full text-xl font-bold uppercase tracking-wider">
                    This is a partial sample
                  </div>
                  <h2 className="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">Rio de Janeiro Relocation Roadmap</h2>
                  <h2 className="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">Chronological Checklist</h2>
                  <ul className="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Months 12-6:</strong> Obtain CPF and apply for VITEM XIV at consulate.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Months 6-2:</strong> Neighborhood scouting and shipping inventory.</li>
                    <li className="leading-relaxed mb-3 pl-2"><strong className="font-black text-slate-950">Post-Arrival:</strong> Register CRNM with Federal Police, activate Light/Water utilities.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] select-none font-bold">
                <span>Emigration Pro — Master Relocation Timeline & Guide</span>
                <span>Section 3 / 14</span>
              </div>
            </div>

            <div className="mt-20 pt-10 border-t border-slate-200">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-[10px] leading-relaxed text-slate-600 text-justify italic font-medium">
                <p className="font-black text-slate-950 mb-2 uppercase tracking-widest">Legal Disclaimer</p>
                This report has been generated with AI assistance. It is for informational purposes only and does not constitute professional advice. Emigration Pro assumes no liability for reliance on this information.
              </div>
            </div>

            <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
              <p className="font-semibold text-slate-600">Generated by Emigration Pro Report Generator</p>
              <p>Y-Enterprises.com - Your Guide To Moving Abroad</p>
              <p className="mt-2">© 2026 Cleer Products</p>
            </footer>
          </div>
        </div>

        {/* Floating Scroll to Top Button for UX */}
        <div className="fixed bottom-8 right-8 no-print">
          <button
            onClick={scrollToTop}
            className="p-3 bg-white text-slate-600 rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Back to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SampleReport;
