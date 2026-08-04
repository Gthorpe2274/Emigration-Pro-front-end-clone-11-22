import React from 'react';

/**
 * Renderer for generated report sections.
 *
 * Parses line by line rather than by blank-line-separated blocks. The models
 * routinely write a heading and its first paragraph on consecutive lines, and
 * introduce a list with a lead-in sentence on the line above the bullets. Block
 * parsing swallowed both cases: the paragraph after a heading was rendered as
 * part of the heading, and lists collapsed into prose with the dashes inline.
 */

const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Bold, italic, code and bare links, applied after escaping. */
const processInlines = (text: string) =>
    escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em class="italic">$2</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[0.9em] border border-slate-200">$1</code>')
        // Trailing research citations such as [1] — de-emphasised, not inline noise.
        .replace(/\[(\d+)\]/g, '<sup class="text-[0.7em] text-slate-400 ml-0.5">[$1]</sup>');

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

const SimpleMarkdown: React.FC<{ content: string | unknown }> = ({ content }) => {
    const source = typeof content === 'string' ? content : '';

    // Pre-built HTML (the cost-of-living table) is passed straight through.
    if (source.trim().startsWith('<') && source.includes('>')) {
        return (
            <div
                className="prose max-w-none report-text-area"
                dangerouslySetInnerHTML={{ __html: source }}
            />
        );
    }

    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const html: string[] = [];

    let paragraph: string[] = [];
    let listItems: string[] = [];
    let listOrdered = false;

    const flushParagraph = () => {
        if (paragraph.length === 0) return;
        const text = processInlines(paragraph.join(' ').trim());
        if (text) html.push(`<p class="text-[15px] leading-7 text-slate-700 mb-5">${text}</p>`);
        paragraph = [];
    };

    const flushList = () => {
        if (listItems.length === 0) return;
        const tag = listOrdered ? 'ol' : 'ul';
        const marker = listOrdered ? 'list-decimal' : 'list-disc';
        const items = listItems
            .map(item => `<li class="pl-1.5 leading-7">${processInlines(item)}</li>`)
            .join('');
        html.push(
            `<${tag} class="${marker} pl-6 mb-6 space-y-2 text-[15px] text-slate-700 marker:text-slate-400">${items}</${tag}>`
        );
        listItems = [];
    };

    const flushAll = () => {
        flushParagraph();
        flushList();
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line === '') {
            flushAll();
            continue;
        }

        // Skip stray header markers and table separator artefacts.
        if (/^#{1,6}$/.test(line)) continue;
        if (/^\|?\s*:?-{3,}/.test(line) && line.includes('-')) continue;
        if (line === '|' || line === '| |') continue;

        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading) {
            flushAll();
            const level = heading[1].length;
            const text = processInlines(heading[2]);

            if (level === 1) {
                html.push(
                    `<h1 class="text-[26px] font-semibold text-slate-900 leading-snug mt-10 mb-4 pb-3 border-b border-slate-200">${text}</h1>`
                );
            } else if (level === 2) {
                html.push(
                    `<h2 class="text-[20px] font-semibold text-slate-900 leading-snug mt-9 mb-3">${text}</h2>`
                );
            } else if (level === 3) {
                html.push(
                    `<h3 class="text-[16px] font-semibold text-slate-800 leading-snug mt-7 mb-2">${text}</h3>`
                );
            } else {
                html.push(
                    `<h4 class="text-[12px] font-semibold uppercase tracking-[0.08em] text-indigo-700 mt-6 mb-2">${text}</h4>`
                );
            }
            continue;
        }

        const numbered = NUMBERED.exec(line);
        const bulleted = BULLET.exec(line);

        if (numbered || bulleted) {
            flushParagraph();
            const ordered = Boolean(numbered);
            // A change of list type starts a new list.
            if (listItems.length > 0 && ordered !== listOrdered) flushList();
            listOrdered = ordered;
            listItems.push((numbered ? numbered[1] : bulleted![1]).trim());
            continue;
        }

        // Ordinary prose: a list has ended if one was open.
        flushList();
        paragraph.push(line);
    }

    flushAll();

    return (
        <div
            className="prose max-w-none report-text-area"
            dangerouslySetInnerHTML={{ __html: html.join('') }}
        />
    );
};

export default SimpleMarkdown;
