import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Eye } from 'lucide-react';

export default function Accessibility() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('static_pages')
        .select('content, title')
        .eq('slug', 'accessibility')
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data.content || '');
      }
    } catch (error) {
      console.error('Error fetching accessibility page:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Accessibility Statement | Waste Institute"
        description="Accessibility Statement for Waste Institute"
        canonical="https://wasteinstitute.org/accessibility"
        noindex={true}
      />
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <Eye size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Accessibility Statement</h1>
            <p className="text-xl text-emerald-50">
              Our commitment to making our platform accessible to everyone
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8 sm:p-12">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">Content not available at this time.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
