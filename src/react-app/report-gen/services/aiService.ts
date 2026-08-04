import { UserInput, Concern } from '../types';

/**
 * Removes common AI markdown artifacts like broken table headers and empty separators.
 */
const sanitizeMarkdown = (text: string): string => {
  if (!text) return "";
  return text
    // Remove complex broken table artifacts
    .replace(/###\s*\|\s*\|\s*:---.*\|/g, '')
    .replace(/\|\s*:---.*\|/g, '')
    .replace(/^#+\s*[|:-]*\s*$/gm, '')
    .replace(/^[\s|:-]+$/gm, '')
    .replace(/\|(\s*\|)+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const formatFinanceDataAsHtmlTable = (data: any): string => {
  const {
    currencyName,
    currencyCode,
    budgetItems,
    assumptionsAndExchangeRate,
    customerBudgetComparison,
    estimatedMonthlyTotal,
    estimatedSixMonthTotal,
    estimatedAnnualTotal,
    recommendedEmergencyFund,
    importDuties,
    taxOptimizationStrategies
  } = data;

  let conversionButtonHtml = '';
  if (currencyCode && currencyName) {
    const conversionUrl = `https://www.google.com/search?q=convert+${encodeURIComponent(currencyCode)}+to+usd`;
    conversionButtonHtml = `
      <div class="my-6">
        <a href="${conversionUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 px-6 rounded-xl text-sm transition-all border border-indigo-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Live Conversion: ${currencyName} (${currencyCode}) to USD</span>
        </a>
      </div>
    `;
  }

  const groupedByCategory = (budgetItems || []).reduce((acc: any, item: any) => {
    const category = item.category || 'General';
    (acc[category] = acc[category] || []).push(item);
    return acc;
  }, {});

  let tableHtml = `
  <div class="overflow-x-auto not-prose rounded-2xl border border-slate-200 shadow-lg my-8 bg-white">
    <table class="min-w-full text-sm border-collapse">
      <thead class="bg-slate-900">
        <tr>
          <th class="p-4 text-left font-black text-white uppercase tracking-wider">Item Details</th>
          <th class="p-4 text-center font-black text-white uppercase tracking-wider">Setup Cost</th>
          <th class="p-4 text-center font-black text-white uppercase tracking-wider">Monthly</th>
          <th class="p-4 text-center font-black text-white uppercase tracking-wider text-indigo-300">6-Month Total</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200">`;

  for (const category in groupedByCategory) {
    tableHtml += `
      <tr class="bg-slate-100">
        <td class="p-4 font-black text-slate-900 uppercase tracking-widest text-xs" colspan="4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-indigo-600 rounded-full"></span>
            ${category}
          </div>
        </td>
      </tr>`;
      
    groupedByCategory[category].forEach((item: any) => {
      tableHtml += `
                <tr class="hover:bg-indigo-50/30 transition-colors">
                    <td class="p-4">
                      <div class="font-bold text-slate-950 text-base">${item.item}</div>
                      <div class="text-slate-500 text-xs mt-1 leading-relaxed">${item.notes}</div>
                    </td>
                    <td class="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">${item.initialSetupCost}</td>
                    <td class="p-4 text-slate-800 text-center font-medium tabular-nums border-l border-slate-100">${item.monthlyOngoingCost}</td>
                    <td class="p-4 text-indigo-950 text-center font-black text-base tabular-nums border-l border-slate-100 bg-indigo-50/20">${item.sixMonthTotal}</td>
                </tr>
            `;
    });
  }

  tableHtml += `</tbody></table></div>`;

  const totalsHtml = `
    <div class="not-prose my-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs font-black uppercase tracking-wider text-slate-500">Monthly Total</div>
        <div class="text-xl font-black text-slate-950 mt-2">${estimatedMonthlyTotal || 'Not available'}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs font-black uppercase tracking-wider text-slate-500">6-Month Total</div>
        <div class="text-xl font-black text-slate-950 mt-2">${estimatedSixMonthTotal || 'Not available'}</div>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs font-black uppercase tracking-wider text-slate-500">Annual Total</div>
        <div class="text-xl font-black text-slate-950 mt-2">${estimatedAnnualTotal || 'Not available'}</div>
      </div>
      <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
        <div class="text-xs font-black uppercase tracking-wider text-indigo-600">Emergency Fund</div>
        <div class="text-xl font-black text-indigo-950 mt-2">${recommendedEmergencyFund || 'Not available'}</div>
      </div>
    </div>`;

  const assumptionsHtml = assumptionsAndExchangeRate ? `
    <div class="my-8">
      <h3 class="text-2xl font-black mb-4 text-slate-950">Assumptions & Exchange Rate</h3>
      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed shadow-sm">
        ${sanitizeMarkdown(assumptionsAndExchangeRate).replace(/\n/g, '<br/>')}
      </div>
    </div>` : '';

  const budgetComparisonHtml = customerBudgetComparison ? `
    <div class="my-8">
      <h3 class="text-2xl font-black mb-4 text-slate-950">Your Budget Comparison</h3>
      <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 text-indigo-950 leading-relaxed shadow-sm font-medium">
        ${sanitizeMarkdown(customerBudgetComparison).replace(/\n/g, '<br/>')}
      </div>
    </div>` : '';
  
  const importDutiesHtml = importDuties ? `
    <div class="my-8">
      <h3 class="text-2xl font-black mb-4 text-slate-950 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Customs & Importation Duties
      </h3>
      <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed shadow-sm">
        ${sanitizeMarkdown(importDuties).replace(/\n/g, '<br/>')}
      </div>
    </div>` : '';

  const taxHtml = taxOptimizationStrategies ? `
    <div class="my-8">
      <h3 class="text-2xl font-black mb-4 text-slate-950 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 4v16m8-8H4" />
        </svg>
        Fiscal & Tax Optimization
      </h3>
      <div class="bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100 text-slate-800 leading-relaxed shadow-sm">
        ${sanitizeMarkdown(taxOptimizationStrategies).replace(/\n/g, '<br/>')}
      </div>
    </div>` : '';

  return conversionButtonHtml + assumptionsHtml + tableHtml + totalsHtml + budgetComparisonHtml + importDutiesHtml + taxHtml;
};

export const generateReportSummary = async (userInput: UserInput): Promise<{ content: string; title: string }> => {
  if (!userInput.destinationCountry || !userInput.destinationCity || !userInput.profession || !userInput.age) {
    throw new Error('Customer assessment data is incomplete; report generation was stopped.');
  }
  try {
    const response = await fetch('/api/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateSummary',
        payload: userInput
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend error raw response:', text);
      let errorMessage = 'Failed to generate summary via backend';
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch (e) {
        errorMessage = `Server Error (${response.status}): ${text.substring(0, 100)}...`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Summary Generation Error:", error);
    throw new Error(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateReportSection = async (userInput: UserInput, concern: Concern): Promise<{ content: string; sources: { title: string; uri: string }[] }> => {
  if (!userInput.destinationCountry || !userInput.destinationCity || !userInput.profession || !userInput.age) {
    throw new Error('Customer assessment data is incomplete; report generation was stopped.');
  }
  try {
    const response = await fetch('/api/perplexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateSection',
        payload: { 
          input: userInput, 
          concern: {
            id: concern.id,
            title: concern.title,
            description: concern.description,
            // Evaluate the prompt function on the frontend before sending
            promptText: concern.prompt(userInput),
            responseSchema: concern.responseSchema
          }
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend error raw response:', text);
      let errorMessage = 'Failed to generate section via backend';
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch (e) {
        errorMessage = `Server Error (${response.status}): ${text.substring(0, 100)}...`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let content = data.content;

    if (concern.id === 'finance' && concern.responseSchema) {
      try {
        const jsonData = JSON.parse(content);
        content = formatFinanceDataAsHtmlTable(jsonData);
      } catch (e) {
        console.warn("JSON parse failed, falling back to raw text");
        content = sanitizeMarkdown(content);
      }
    } else {
      content = sanitizeMarkdown(content);
    }

    return { content, sources: data.sources };
  } catch (error) {
    console.error(`Section Error [${concern.title}]:`, error);
    throw new Error(`Analysis failed for ${concern.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
