import { Link, useLocation } from 'react-router-dom';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';

export default function SampleReport() {
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  // Sample of Health Care and Financial Financial Overview Sections of a Total Report - Updated content

  return (
    <div className="bg-gray-100 text-gray-800">
      <Navigation />
      
      <div className="container mx-auto p-6 md:p-12 lg:p-16 bg-white shadow-lg min-h-screen">
        <style>{`
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          }
          .redacted-cell {
            background-color: #333;
            min-height: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ccc;
          }
          .financial-grid-header {
            background-color: #e5e7eb;
            font-weight: 600;
            color: #1f2937;
            padding: 0.75rem;
            border-bottom: 1px solid #d1d5db;
          }
          .financial-grid-category {
            font-weight: 600;
            background-color: #f9fafb;
            padding: 0.75rem;
            border-bottom: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
          }
          .financial-grid-item {
            padding: 0.75rem;
            padding-left: 1.5rem;
            border-bottom: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
          }
          .financial-grid-redacted-value {
            border-bottom: 1px solid #d1d5db;
            border-right: 1px solid #d1d5db;
          }
          .financial-grid-item.last-row, .financial-grid-redacted-value.last-row {
            border-bottom: none;
          }
        `}</style>

        {/* Page 1 - Table of Contents and Main Title Introduction */}
        <header className="mb-10 pt-4">
          {returnTo && (
            <div className="mb-6">
              <Link 
                to={returnTo}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Your Assessment Results
              </Link>
            </div>
          )}
          
          <h1 className="text-5xl font-bold text-gray-900 mb-8">Sample of Health Care and Financial Financial Overview Sections of a Total Report</h1>
          <div className="border-b-2 border-blue-500 pb-2 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">Table of Contents</h2>
          </div>
          <ol className="list-decimal space-y-2 text-xl ml-8">
            <li>Quality Hospitals</li>
            <li>Insurance Providers</li>
            <li>Emergency Procedures</li>
            <li>Precise Financial Overview</li>
          </ol>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 1 of 53</p>
        </header>

        {/* Page 2-3 - Introduction to Healthcare Mapping */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-blue-700 mb-6">Healthcare Mapping in Dominican Republic</h2>
          <p className="text-lg leading-relaxed mb-4">
            Here is a detailed healthcare report focusing on Santiago de los Caballeros, Dominican Republic.
          </p>
          <p className="text-lg leading-relaxed mb-8">
            This report outlines key healthcare options for a 78-year-old individual residing in Santiago de los Caballeros, providing a clear and professional overview.
          </p>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 2 of 53 & Page 3 of 53 (partial)</p>
        </section>

        {/* Page 3-5 - Section 1: Quality Hospitals */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">1. Quality Hospitals in Santiago de los Caballeros</h3>
          <p className="text-lg leading-relaxed mb-4">
            Santiago de los Caballeros offers a range of hospitals, primarily in the private sector. Hospitals in major cities often provide better care and more specialized services. Here are some of the top hospitals:
          </p>
          <ul className="list-disc ml-6 space-y-3 text-lg">
            <li>
              <p className="font-semibold text-gray-800">Clínica Unión Médica del Norte:</p>
              <p className="ml-4 text-base">One of the most modern and well-equipped private medical facilities in the region, offering a wide array of specialized medical services including internal medicine, surgery, pediatrics, and gynecology. It also boasts a robust 24/7 emergency care department.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Hospital Metropolitano de Santiago (HOMS):</p>
              <p className="ml-4 text-base">A leading medical center known for its advanced technology and comprehensive services. It features specialized medical units for cardiovascular surgery, neurosurgery, oncology, and boasts a sophisticated diagnostic lab. While a precise address is not explicitly shown in the snippets, it's a prominent facility in Santiago de los Caballeros.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Centro Médico Cibao-UCE:</p>
              <p className="ml-4 text-base">Known for its patient-centered approach and modern facilities, offering specialized care in various fields. While a precise address is not explicitly shown, it's a recognized hospital in Santiago.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Hospital Regional Universitario Dr. José María Cabral y Báez:</p>
              <p className="ml-4 text-base">A public teaching hospital. It offers a broad range of services including general surgery, internal medicine, and specialized clinics, playing a vital role in medical education and public health in the region. Located in Santiago.</p>
            </li>
          </ul>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 4 of 53 & Page 5 of 53 (partial)</p>
        </section>

        {/* Page 6-9 - Section 2: Insurance Providers */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">2. Insurance Providers</h3>
          <p className="text-lg leading-relaxed mb-4">
            Private health insurance is highly recommended given the varying quality between public and private facilities, especially in tourist areas. Many international health insurance companies offer plans for expats and residents. Here are at least three major providers with English-speaking customer support:
          </p>
          <ul className="list-disc ml-6 space-y-3 text-lg">
            <li>
              <p className="font-semibold text-gray-800">Cigna Global:</p>
              <p className="ml-4 text-base">Offers comprehensive plans like Silver, Gold, Platinum, and Close Care. Provides access to Cigna's trusted global network (excluding the US) and regional networks. Cigna is a strong option for international coverage.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Bupa Global:</p>
              <p className="ml-4 text-base">A well-known international health insurer with a wide network of providers and direct billing options. Bupa offers various plans with flexible coverage levels, popular among expats.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">International Medical Group (IMG):</p>
              <p className="ml-4 text-base">Offers a range of plans, including plans like iTravel and Global Medical Insurance, providing extensive coverage. International plans often include emergency medical evacuation and repatriation services. While specific plans might vary, IMG is a major player in the international health insurance market, known for its strong customer support.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Allianz Care:</p>
              <p className="ml-4 text-base">Provides international health insurance solutions for global citizens. These plans typically cover inpatient and outpatient stays, and various treatments, backed by multilingual customer support.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">APRIL International:</p>
              <p className="ml-4 text-base">Offers flexible and secure international health insurance for those seeking top-tier healthcare facilities. APRIL provides tailored plans for individuals and families, ensuring comprehensive coverage.</p>
            </li>
          </ul>
          <p className="text-lg leading-relaxed mt-6">
            It's crucial to confirm the specifics of coverage directly with the providers, including network hospitals in Santiago.
          </p>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 6 of 53 & Page 7 of 53 & Page 8 of 53 & Page 9 of 53 (partial)</p>
        </section>

        {/* Page 9-11 - Section 3: Emergency Procedures */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">3. Emergency Procedures</h3>
          <p className="text-lg leading-relaxed mb-4">
            Understanding emergency procedures and contacts is vital for safety in the Dominican Republic:
          </p>
          <ul className="list-disc ml-6 space-y-3 text-lg">
            <li>
              <p className="font-semibold text-gray-800">National Emergency Number: 911</p>
              <p className="ml-4 text-base">This toll-free number was launched in 2017, initially covering metropolitan areas and now extending to cover the entire country for unified emergency response (police, fire, ambulance).</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Police Numbers (Alternative/Direct):</p>
              <p className="ml-4 text-base">For general police, the numbers are 809-200-3500 or 809-222-2002. Use these if 911 is slow or for non-life-threatening issues.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Medical Assistance & Ambulance Services:</p>
              <p className="ml-4 text-base">For medical assistance and ambulance services, while 911 is the primary, it is often recommended to contact private hospitals directly in a medical emergency. Ambulances in the Dominican Republic are generally more reliable in major cities and when arranged through private facilities.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Private Ambulance Services:</p>
              <p className="ml-4 text-base">For immediate transport, some private services exist. For example, some sources mention services like "Servicios de Ambulancia Autopista Duarte," but it's best to have direct contacts from your chosen private hospital. Your private health insurance provider might also have preferred ambulance services.</p>
            </li>
            <li>
              <p className="font-semibold text-gray-800">Hospital Emergency Departments:</p>
              <p className="ml-4 text-base">Most major private hospitals (like HOMS or Clínica Unión Médica del Norte) have 24/7 emergency departments with well-equipped rooms and specialized staff. These facilities generally have better equipped emergency rooms and quicker response times for internal emergencies compared to public options.</p>
            </li>
          </ul>
          <p className="text-lg leading-relaxed mt-6">
            It is highly recommended that you program these numbers and your emergency contact information into your phone. Additionally, consider travel insurance that includes medical evacuation, as international medical transport can be very expensive.
          </p>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 9 of 53 & Page 10 of 53 & Page 11 of 53 (partial)</p>
        </section>

        {/* Page 12 - Sources */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">Sources:</h3>
          <p className="text-lg leading-relaxed">
            (Sources will be provided in purchased report)
          </p>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 12 of 53</p>
        </section>

        {/* Page 13 - Precise Financial Overview Introduction */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-blue-700 mb-6">Precise Financial Overview</h2>
          <p className="text-lg leading-relaxed mb-4">
            This section provides an estimated financial breakdown for living in Santiago de los Caballeros, Dominican Republic.
          </p>
          <p className="text-gray-600 text-sm mt-8 text-right">Page 13 of 53</p>
        </section>

        {/* Pages 14-18 - Financial Breakdown Table */}
        <section className="mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">Estimated Monthly Expenses (Santiago de los Caballeros)</h3>
          <div className="grid grid-cols-2 border border-gray-300 rounded-md overflow-hidden text-lg financial-grid-container">
            <div className="financial-grid-header border-r">Category / Item</div>
            <div className="financial-grid-header flex items-center justify-center">Estimated Cost (USD/month, unless specified)</div>

            {/* Housing */}
            <div className="financial-grid-category">Housing</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Rent (1-bedroom apartment)</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Security Deposit</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Real Estate Agency Fee</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            {/* Utilities */}
            <div className="financial-grid-category">Utilities</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Electricity</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Water & Sewer</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Internet (High-speed)</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Mobile Phone Plan</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            {/* Initial Setup Costs */}
            <div className="financial-grid-category">Initial Setup Costs</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Basic Furniture/Appliances</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Bank Account Setup</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Residency Permit Application</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            {/* Living Expenses */}
            <div className="financial-grid-category">Living Expenses</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Groceries</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Local Transportation</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Healthcare (Private Insurance & Out-of-Pocket)</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Leisure & Entertainment</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item">Personal Care & Miscellaneous</div>
            <div className="redacted-cell financial-grid-redacted-value"></div>

            <div className="financial-grid-item last-row">Domestic Help (part-time)</div>
            <div className="redacted-cell financial-grid-redacted-value last-row"></div>
          </div>
        </section>

        <footer className="mt-12 text-center text-gray-500 text-sm">
        </footer>
      </div>
      
      <Footer />
    </div>
  );
}
