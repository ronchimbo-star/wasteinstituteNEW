import { ReactElement } from 'react';

interface FormattingOptions {
  includeAds?: boolean;
  ads?: {
    ad1: any | null;
    ad2: any | null;
  };
  AdComponent?: React.ComponentType<{ ad: any }>;
}

export function formatArticleContent(content: string, options: FormattingOptions = {}): ReactElement[] {
  const { includeAds = false, ads = { ad1: null, ad2: null }, AdComponent } = options;

  const paragraphs = content.split('\n\n');
  const totalParagraphs = paragraphs.length;
  const oneThirdIndex = Math.floor(totalParagraphs / 3);
  const twoThirdsIndex = Math.floor((totalParagraphs * 2) / 3);

  const contentParts: ReactElement[] = [];
  let htmlBuffer = '';
  let bufferKey = 0;

  const flushBuffer = () => {
    if (htmlBuffer.trim()) {
      contentParts.push(
        <div
          key={`content-${bufferKey++}`}
          className="overflow-hidden"
          dangerouslySetInnerHTML={{ __html: htmlBuffer }}
        />
      );
      htmlBuffer = '';
    }
  };

  paragraphs.forEach((paragraph, index) => {
    // Skip quotes and FAQs - they're rendered separately
    if (paragraph.match(/"([^"]+)"\s*—\s*([^\n]+)/) ||
        paragraph.includes('## Frequently Asked Questions') ||
        paragraph.match(/\*\*Q:/)) {
      return;
    }

    // Skip empty paragraphs
    if (!paragraph.trim()) {
      return;
    }

    const html = formatParagraph(paragraph);
    htmlBuffer += html;

    // Insert ad at 1/3 position
    if (includeAds && index === oneThirdIndex && ads.ad1 && AdComponent) {
      flushBuffer();
      contentParts.push(
        <div key="ad-1" className="my-12">
          <AdComponent ad={ads.ad1} />
        </div>
      );
    }

    // Insert ad at 2/3 position
    if (includeAds && index === twoThirdsIndex && ads.ad2 && AdComponent) {
      flushBuffer();
      contentParts.push(
        <div key="ad-2" className="my-12">
          <AdComponent ad={ads.ad2} />
        </div>
      );
    }
  });

  // Flush any remaining content
  flushBuffer();

  return contentParts;
}

function formatParagraph(paragraph: string): string {
  // Handle H2 headers (## )
  if (paragraph.startsWith('## ')) {
    const text = escapeHtml(paragraph.replace('## ', ''));
    return `<div class="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-6 my-12 border-l-4 border-emerald-600">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 flex items-start gap-3">
        <span class="text-emerald-600 flex-shrink-0 mt-1">▸</span>
        <span class="break-words overflow-wrap-anywhere">${text}</span>
      </h2>
    </div>`;
  }

  // Handle H3 headers (### )
  if (paragraph.startsWith('### ')) {
    const text = escapeHtml(paragraph.replace('### ', ''));
    return `<h3 class="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-5 break-words overflow-wrap-anywhere">${text}</h3>`;
  }

  // Handle bold text with colons or multiple bold items
  if (paragraph.includes('**')) {
    // Bullet list with bold items (e.g., "- **Item**: Description")
    if (paragraph.match(/^[-•]\s*\*\*/)) {
      const items = paragraph.split('\n').filter(item => item.trim());
      const listItems = items.map(item => {
        const match = item.match(/[-•]\s*\*\*(.+?)\*\*(?::\s*)?-?\s*(.+)/);
        if (match) {
          const title = escapeHtml(match[1]);
          const desc = escapeHtml(match[2]);
          return `<li class="flex gap-3 mb-4 p-4 bg-white rounded-lg border border-gray-100 hover:border-emerald-300 hover:shadow-sm transition-all">
            <div class="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="break-words overflow-wrap-anywhere min-w-0 flex-1">
              <strong class="text-gray-900 font-semibold">${title}</strong>
              <span class="text-gray-700">: ${desc}</span>
            </div>
          </li>`;
        }
        return '';
      }).join('');
      return `<ul class="space-y-3 my-8">${listItems}</ul>`;
    }

    // Standalone bold headings with dash (e.g., "**Challenge 1** - Description")
    if (paragraph.match(/^\*\*[^*]+\*\*\s*-/m)) {
      const items = paragraph.split('\n\n').filter(item => item.trim());
      const cards = items.map(item => {
        const match = item.match(/\*\*(.+?)\*\*\s*-\s*(.+)/s);
        if (match) {
          const title = escapeHtml(match[1]);
          const desc = escapeHtml(match[2]);
          return `<div class="mb-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
            <h4 class="text-lg font-bold text-gray-900 mb-3 break-words overflow-wrap-anywhere">${title}</h4>
            <p class="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">${desc}</p>
          </div>`;
        }
        return '';
      }).join('');
      return cards;
    }

    // Multi-line blocks with title and bold fields (e.g., facility details)
    const lines = paragraph.split('\n').filter(line => line.trim());
    if (lines.length > 1 && lines[0].match(/^[A-Z]/)) {
      const titleMatch = lines[0].match(/\*\*(.+?)\*\*/);
      if (titleMatch || lines.slice(1).some(line => line.match(/\*\*(.*?)\*\*:/))) {
        const title = titleMatch ? escapeHtml(titleMatch[1]) : escapeHtml(lines[0].replace(/\*\*/g, ''));
        const details = lines.slice(titleMatch ? 1 : 0).map(line => {
          const match = line.match(/[-•]?\s*\*\*(.*?)\*\*:\s*(.*)/);
          if (match) {
            const label = escapeHtml(match[1]);
            const value = escapeHtml(match[2]);
            return `<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-2">
              <span class="font-semibold text-emerald-700 sm:min-w-[140px] break-words overflow-wrap-anywhere">${label}:</span>
              <span class="text-gray-700 break-words overflow-wrap-anywhere flex-1">${value}</span>
            </div>`;
          }
          return '';
        }).join('');

        return `<div class="mb-8 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
          <h4 class="text-lg font-bold text-gray-900 mb-4 break-words overflow-wrap-anywhere">${title}</h4>
          ${details}
        </div>`;
      }
    }

    // Single-line bold heading with colon (e.g., "**Label**: Description")
    const match = paragraph.match(/\*\*(.*?)\*\*:\s*(.*)/);
    if (match) {
      const label = escapeHtml(match[1]);
      const desc = escapeHtml(match[2]);
      return `<div class="mb-6">
        <p class="text-gray-900 font-bold text-lg mb-2 break-words overflow-wrap-anywhere">${label}:</p>
        <p class="text-gray-700 text-base sm:text-lg leading-relaxed break-words overflow-wrap-anywhere">${desc}</p>
      </div>`;
    }
  }

  // Handle regular bullet lists
  if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
    const items = paragraph.split('\n').filter(item => item.trim());
    const listItems = items.map(item => {
      const text = escapeHtml(item.replace(/^[-•]\s*/, ''));
      return `<li class="flex gap-3 mb-3">
        <div class="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
          <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <span class="text-gray-700 break-words overflow-wrap-anywhere min-w-0 leading-relaxed flex-1">${text}</span>
      </li>`;
    }).join('');
    return `<ul class="space-y-2 my-6">${listItems}</ul>`;
  }

  // Default: regular paragraph
  const text = escapeHtml(paragraph);
  return `<p class="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 break-words overflow-wrap-anywhere max-w-full">${text}</p>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function extractQuote(content: string): { quote: string; author: string } | null {
  const quoteMatch = content.match(/"([^"]+)"\s*—\s*([^\n]+)/);
  if (quoteMatch) {
    return {
      quote: quoteMatch[1],
      author: quoteMatch[2]
    };
  }
  return null;
}

export function extractFAQs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const lines = content.split('\n');
  let inFAQSection = false;
  let currentQuestion = '';
  let currentAnswer = '';

  for (const line of lines) {
    if (line.includes('## Frequently Asked Questions')) {
      inFAQSection = true;
      continue;
    }

    if (inFAQSection) {
      const questionMatch = line.match(/\*\*Q:\s*(.*?)\*\*/);
      if (questionMatch) {
        if (currentQuestion && currentAnswer) {
          faqs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim()
          });
        }
        currentQuestion = questionMatch[1];
        currentAnswer = '';
        continue;
      }

      const answerMatch = line.match(/\*\*A:\*\*\s*(.*)/);
      if (answerMatch) {
        currentAnswer = answerMatch[1];
      } else if (currentAnswer && line.trim()) {
        currentAnswer += ' ' + line.trim();
      }

      if (line.trim() === '' && currentQuestion) {
        if (currentAnswer) {
          faqs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim()
          });
        }
        currentQuestion = '';
        currentAnswer = '';
      }
    }
  }

  // Add the last FAQ if exists
  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: currentQuestion.trim(),
      answer: currentAnswer.trim()
    });
  }

  return faqs;
}
