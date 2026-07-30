import React from 'react';

const SimpleMarkdown: React.FC<{ content: string | unknown }> = ({ content }) => {
    const contentAsString = typeof content === 'string' ? content : '';

    // If the content starts with an HTML tag (like our finance table), render it directly
    if (contentAsString.trim().startsWith('<') && contentAsString.includes('>')) {
        return <div className="prose max-w-none report-text-area" dangerouslySetInnerHTML={{ __html: contentAsString }} />;
    }

    const processInlines = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-950">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-900">$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-950 px-1.5 py-0.5 rounded text-sm font-bold border border-slate-200">$1</code>');
    };

    const blocks = contentAsString
        .split(/(\r\n|\n){2,}/)
        .filter(block => {
            const trimmed = block.trim();
            // FILTER: Skip blocks that are just artifact headers without text
            if (trimmed === '####' || trimmed === '###' || trimmed === '##' || trimmed === '#') return false;
            // FILTER: Skip blocks that look like broken table artifacts
            if (trimmed.startsWith('|') && trimmed.includes('---')) return false;
            if (trimmed === '| |' || trimmed === '|') return false;
            return trimmed !== '';
        });

    const htmlContent = blocks.map(block => {
        const trimmedBlock = block.trim();

        // Level 4 Header (Rendered as Bold High-Emphasis Sub-heading per instruction)
        if (trimmedBlock.startsWith('#### ')) {
            return `<p class="mt-6 mb-2"><strong class="text-sm font-black text-indigo-900 uppercase tracking-widest">${processInlines(trimmedBlock.substring(5))}</strong></p>`;
        }
        
        // Level 3 Header
        if (trimmedBlock.startsWith('### ')) {
            return `<h3 class="text-lg font-black mt-8 mb-4 text-slate-950 leading-tight uppercase tracking-wider">${processInlines(trimmedBlock.substring(4))}</h3>`;
        }
        
        // Level 2 Header
        if (trimmedBlock.startsWith('## ')) {
            return `<h2 class="text-2xl font-black mt-12 mb-6 border-b-2 border-slate-200 pb-3 text-slate-950 leading-tight">${processInlines(trimmedBlock.substring(3))}</h2>`;
        }
        
        // Level 1 Header
        if (trimmedBlock.startsWith('# ')) {
            return `<h1 class="text-3xl font-black mt-14 mb-8 text-slate-950 leading-tight border-l-4 border-indigo-600 pl-4">${processInlines(trimmedBlock.substring(2))}</h1>`;
        }

        // List detection
        if (trimmedBlock.split('\n').every(line => /^\s*[-*•]\s+/.test(line.trim()) || /^\s*\d+\.\s+/.test(line.trim()))) {
             const listItems = trimmedBlock.split(/\r\n|\n/)
                .map(item => item.replace(/^\s*([-*•]|\d+\.)\s+/, '').trim())
                .filter(item => item) 
                .map(item => `<li class="leading-relaxed mb-3 pl-2">${processInlines(item)}</li>`)
                .join('');
            return `<ul class="list-disc pl-8 space-y-2 mb-8 text-slate-950 font-medium">${listItems}</ul>`;
        }

        return `<p class="leading-relaxed mb-6 text-slate-950 font-medium text-base">${processInlines(trimmedBlock)}</p>`;
    }).join('');

    return <div className="prose max-w-none report-text-area" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default SimpleMarkdown;
