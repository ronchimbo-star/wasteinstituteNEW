import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  faqs: FAQ[];
}

export default function FAQ() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setLoading(true);
    const { data: categoriesData } = await supabase
      .from('faq_categories')
      .select('*')
      .order('display_order');

    if (categoriesData) {
      const categoriesWithFAQs = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: faqsData } = await supabase
            .from('faqs')
            .select('*')
            .eq('category_id', category.id)
            .eq('published', true)
            .order('display_order');

          return {
            ...category,
            faqs: faqsData || [],
          };
        })
      );

      setCategories(categoriesWithFAQs.filter((cat) => cat.faqs.length > 0));
    }
    setLoading(false);
  };

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  const allFAQs = categories.flatMap(cat => cat.faqs);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Layout>
      <SEO
        title="Frequently Asked Questions | Waste Institute"
        description="Find answers to common questions about Waste Institute courses, certifications, enrolment, pricing and accreditation."
        canonical="https://wasteinstitute.org/faq"
        structuredData={structuredData}
      />
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-emerald-50">
              Find answers to common questions about our courses, certifications, and platform
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {categories.map((category) => (
              <div key={category.id} className="mb-12">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>

                <div className="space-y-3">
                  {category.faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-emerald-500 transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`flex-shrink-0 text-emerald-600 transition-transform ${
                            openItems.has(faq.id) ? 'transform rotate-180' : ''
                          }`}
                          size={24}
                        />
                      </button>
                      {openItems.has(faq.id) && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No FAQs available at the moment. Please check back later.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
