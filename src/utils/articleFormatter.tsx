import { ReactElement } from 'react';
import { BookOpen, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormattingOptions {
  includeAds?: boolean;
  ads?: {
    ad1: any | null;
    ad2: any | null;
  };
  AdComponent?: React.ComponentType<{ ad: any }>;
}

function isHTMLContent(content: string): boolean {
  return /<(h[1-6]|p|div|ul|ol|table|blockquote|section|article|figure)\b/i.test(content);
}

function ExpandExpertiseCard(): ReactElement {
  return (
    <div className="my-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-8 md:p-10 border border-emerald-200 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 opacity-5 rounded-full -mr-16 -mt-16"></div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-shrink-0 w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
          <BookOpen className="text-emerald-700" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Expand Your Waste Management Expertise</h3>
          <p className="text-gray-700 leading-relaxed">
            Stay ahead of industry changes with our accredited training programmes. From regulatory compliance to advanced operations, our courses are designed by practitioners for practitioners.
          </p>
        </div>
        <Link
          to="/courses"
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          View Courses
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function CertifiedProfessionalCard(): ReactElement {
  return (
    <div className="my-12 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 rounded-2xl p-8 md:p-10 border border-blue-200 shadow-lg overflow-hidden relative">
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600 opacity-5 rounded-full -ml-12 -mb-12"></div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
          <Award className="text-blue-700" size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Become a Certified Waste Professional</h3>
          <p className="text-gray-700 leading-relaxed">
            Gain industry-recognised certifications that demonstrate your competence. Our qualifications are respected by employers and regulators across the UK and internationally.
          </p>
        </div>
        <Link
          to="/membership"
          className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Learn More
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export function formatArticleContent(content: string, options: FormattingOptions = {}): ReactElement[] {
  if (isHTMLContent(content)) {
    return formatHTMLContent(content, options);
  }
  return formatMarkdownContent(content, options);
}

function splitHTMLIntoBlocks(html: string): string[] {
  const blockTags = /(<(?:h[1-6]|p|div|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|section|article|figure|figcaption|hr|pre|dl|dt|dd)[^>]*>[\s\S]*?<\/(?:h[1-6]|p|div|ul|ol|li|table|thead|tbody|tr|th|td|blockquote|section|article|figure|figcaption|pre|dl|dt|dd)>|<hr\s*\/?>)/gi;

  const blocks: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockTags.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index).trim();
    if (before) {
      blocks.push(before);
    }
    blocks.push(match[0]);
    lastIndex = match.index + match[0].length;
  }

  const after = html.slice(lastIndex).trim();
  if (after) {
    blocks.push(after);
  }

  return blocks.filter(b => b.trim().length > 0);
}

function formatHTMLContent(content: string, options: FormattingOptions): ReactElement[] {
  const { includeAds = false, ads = { ad1: null, ad2: null }, AdComponent } = options;
  const blocks = splitHTMLIntoBlocks(content);
  const totalBlocks = blocks.length;
  const oneThirdIndex = Math.floor(totalBlocks / 3);
  const twoThirdsIndex = Math.floor((totalBlocks * 2) / 3);

  const contentParts: ReactElement[] = [];
  let htmlBuffer = '';
  let bufferKey = 0;

  const flushBuffer = () => {
    if (htmlBuffer.trim()) {
      contentParts.push(
        <div
          key={`html-${bufferKey++}`}
          className="article-html-content"
          dangerouslySetInnerHTML={{ __html: htmlBuffer }}
        />
      );
      htmlBuffer = '';
    }
  };

  blocks.forEach((block, index) => {
    htmlBuffer += block;

    if (index === oneThirdIndex) {
      flushBuffer();
      if (includeAds && ads.ad1 && AdComponent) {
        contentParts.push(<div key="ad-1"><AdComponent ad={ads.ad1} /></div>);
      } else {
        contentParts.push(<ExpandExpertiseCard key="promo-expertise" />);
      }
    }

    if (index === twoThirdsIndex) {
      flushBuffer();
      if (includeAds && ads.ad2 && AdComponent) {
        contentParts.push(<div key="ad-2"><AdComponent ad={ads.ad2} /></div>);
      } else {
        contentParts.push(<CertifiedProfessionalCard key="promo-certified" />);
      }
    }
  });

  flushBuffer();
  return contentParts;
}

function formatMarkdownContent(content: string, options: FormattingOptions): ReactElement[] {
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
          className="article-html-content"
          dangerouslySetInnerHTML={{ __html: htmlBuffer }}
        />
      );
      htmlBuffer = '';
    }
  };

  paragraphs.forEach((paragraph, index) => {
    if (paragraph.match(/"([^"]+)"\s*—\s*([^\n]+)/) ||
        paragraph.includes('## Frequently Asked Questions') ||
        paragraph.match(/\*\*Q:/)) {
      return;
    }

    if (!paragraph.trim()) return;

    const html = formatParagraph(paragraph);
    htmlBuffer += html;

    if (index === oneThirdIndex) {
      flushBuffer();
      if (includeAds && ads.ad1 && AdComponent) {
        contentParts.push(<div key="ad-1"><AdComponent ad={ads.ad1} /></div>);
      } else {
        contentParts.push(<ExpandExpertiseCard key="promo-expertise" />);
      }
    }

    if (index === twoThirdsIndex) {
      flushBuffer();
      if (includeAds && ads.ad2 && AdComponent) {
        contentParts.push(<div key="ad-2"><AdComponent ad={ads.ad2} /></div>);
      } else {
        contentParts.push(<CertifiedProfessionalCard key="promo-certified" />);
      }
    }
  });

  flushBuffer();
  return contentParts;
}

function formatParagraph(paragraph: string): string {
  if (paragraph.startsWith('## ')) {
    const text = escapeHtml(paragraph.replace('## ', ''));
    return `<div class="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-6 my-10 border-l-4 border-emerald-600">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 flex items-start gap-3 m-0">
        <span class="text-emerald-600 flex-shrink-0 mt-1">&#9656;</span>
        <span>${text}</span>
      </h2>
    </div>`;
  }

  if (paragraph.startsWith('### ')) {
    const text = escapeHtml(paragraph.replace('### ', ''));
    return `<h3 class="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-5">${text}</h3>`;
  }

  if (paragraph.includes('**')) {
    if (paragraph.match(/^[-•]\s*\*\*/)) {
      const items = paragraph.split('\n').filter(item => item.trim());
      const listItems = items.map(item => {
        const match = item.match(/[-•]\s*\*\*(.+?)\*\*(?::\s*)?-?\s*(.+)/);
        if (match) {
          return `<li class="flex gap-3 mb-4 p-4 bg-white rounded-lg border border-gray-100 hover:border-emerald-300 hover:shadow-sm transition-all">
            <div class="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <strong class="text-gray-900 font-semibold">${escapeHtml(match[1])}</strong>
              <span class="text-gray-700">: ${escapeHtml(match[2])}</span>
            </div>
          </li>`;
        }
        return '';
      }).join('');
      return `<ul class="space-y-3 my-8 list-none p-0">${listItems}</ul>`;
    }

    if (paragraph.match(/^\*\*[^*]+\*\*\s*-/m)) {
      const items = paragraph.split('\n\n').filter(item => item.trim());
      const cards = items.map(item => {
        const match = item.match(/\*\*(.+?)\*\*\s*-\s*(.+)/s);
        if (match) {
          return `<div class="mb-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
            <h4 class="text-lg font-bold text-gray-900 mb-3">${escapeHtml(match[1])}</h4>
            <p class="text-gray-700 leading-relaxed m-0">${escapeHtml(match[2])}</p>
          </div>`;
        }
        return '';
      }).join('');
      return cards;
    }

    const lines = paragraph.split('\n').filter(line => line.trim());
    if (lines.length > 1 && lines[0].match(/^[A-Z]/)) {
      const titleMatch = lines[0].match(/\*\*(.+?)\*\*/);
      if (titleMatch || lines.slice(1).some(line => line.match(/\*\*(.*?)\*\*:/))) {
        const title = titleMatch ? escapeHtml(titleMatch[1]) : escapeHtml(lines[0].replace(/\*\*/g, ''));
        const details = lines.slice(titleMatch ? 1 : 0).map(line => {
          const match = line.match(/[-•]?\s*\*\*(.*?)\*\*:\s*(.*)/);
          if (match) {
            return `<div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-2">
              <span class="font-semibold text-emerald-700 sm:min-w-[140px]">${escapeHtml(match[1])}:</span>
              <span class="text-gray-700 flex-1">${escapeHtml(match[2])}</span>
            </div>`;
          }
          return '';
        }).join('');

        return `<div class="mb-8 p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
          <h4 class="text-lg font-bold text-gray-900 mb-4">${title}</h4>
          ${details}
        </div>`;
      }
    }

    const match = paragraph.match(/\*\*(.*?)\*\*:\s*(.*)/);
    if (match) {
      return `<div class="mb-6">
        <p class="text-gray-900 font-bold text-lg mb-2">${escapeHtml(match[1])}:</p>
        <p class="text-gray-700 text-base sm:text-lg leading-relaxed m-0">${escapeHtml(match[2])}</p>
      </div>`;
    }
  }

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
        <span class="text-gray-700 min-w-0 leading-relaxed flex-1">${text}</span>
      </li>`;
    }).join('');
    return `<ul class="space-y-2 my-6 list-none p-0">${listItems}</ul>`;
  }

  const text = escapeHtml(paragraph);
  return `<p class="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">${text}</p>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function extractQuote(content: string): { quote: string; author: string } | null {
  const quoteMatch = content.match(/"([^"]+)"\s*—\s*([^\n]+)/);
  if (quoteMatch) {
    return { quote: quoteMatch[1], author: quoteMatch[2] };
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
          faqs.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
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
          faqs.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
        }
        currentQuestion = '';
        currentAnswer = '';
      }
    }
  }

  if (currentQuestion && currentAnswer) {
    faqs.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
  }

  return faqs;
}
