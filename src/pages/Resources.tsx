import { useEffect, useState } from 'react';
import { FileText, Image, Video, Link as LinkIcon, Download, ExternalLink, BookMarked, Sparkles, Users, FileStack, Recycle } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  file_url: string;
  thumbnail_url: string;
  file_size: number;
  display_order: number;
}

interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  resources: Resource[];
}

export default function Resources() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const { data: categoriesData } = await supabase
      .from('resource_categories')
      .select('*')
      .order('display_order');

    if (categoriesData) {
      const categoriesWithResources = await Promise.all(
        categoriesData.map(async (category) => {
          const { data: resourcesData } = await supabase
            .from('resources')
            .select('*')
            .eq('category_id', category.id)
            .eq('published', true)
            .order('display_order');

          return {
            ...category,
            resources: resourcesData || [],
          };
        })
      );

      setCategories(categoriesWithResources);
    }
    setLoading(false);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'link':
      default:
        return LinkIcon;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const filteredCategories = selectedCategory === 'all'
    ? categories
    : categories.filter(cat => cat.slug === selectedCategory);

  const allResources = categories.flatMap(cat => cat.resources);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Learning Resources | Waste Institute"
        description="Access industry standards, best practices, research papers and educational videos on waste management from the Waste Institute."
        canonical="https://wasteinstitute.org/resources"
      />
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 py-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Learning Resources
              </h1>
              <p className="text-xl text-emerald-50 mb-6">
                Access comprehensive guides, standards, research papers, and educational materials to enhance your waste management expertise
              </p>
              <div className="flex items-center gap-3 text-emerald-100">
                <BookMarked size={24} />
                <span className="text-lg">Curated by industry experts</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/resources/wasteinstitute-image3.jpg"
                  alt="Students studying together"
                  className="w-full h-[450px] object-cover object-[center_35%]"
                />

                <div className="absolute top-4 left-4 animate-bounce">
                  <img
                    src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/icons/white-icon.png"
                    alt="Waste Institute"
                    className="w-12 h-12 drop-shadow-lg"
                  />
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-20 right-10 text-yellow-300 animate-float-slow">
                    <Sparkles size={27} className="fill-current" />
                  </div>
                  <div className="absolute top-40 left-20 text-yellow-400 animate-float">
                    <Sparkles size={24} className="fill-current" />
                  </div>
                  <div className="absolute bottom-28 right-16 text-yellow-300 animate-float-delayed">
                    <Sparkles size={30} className="fill-current" />
                  </div>
                  <div className="absolute top-1/3 left-12 text-yellow-400 animate-float-slow">
                    <Sparkles size={21} className="fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-5 shadow-2xl animate-fade-in-up border border-white border-opacity-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-300">Resources Updated</span>
                  </div>
                  <p className="text-xl font-handwriting text-white font-semibold animate-text-wave">
                    "Great resources!"
                  </p>
                  <div className="flex gap-3 mt-3">
                    <FileStack size={32} className="text-emerald-400" />
                    <BookMarked size={32} className="text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Resources
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="mb-16">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 text-lg">{category.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.resources.map((resource) => {
                  const Icon = getResourceIcon(resource.type);
                  return (
                    <div
                      key={resource.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-emerald-500 transition-all"
                    >
                      {resource.thumbnail_url ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={resource.thumbnail_url}
                            alt={resource.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                          <Icon className="text-white" size={64} />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="text-emerald-600" size={20} />
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {resource.type}
                          </span>
                          {resource.file_size > 0 && (
                            <span className="text-xs text-gray-500">
                              • {formatFileSize(resource.file_size)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          {resource.type === 'link' ? (
                            <>
                              View Resource <ExternalLink size={16} />
                            </>
                          ) : (
                            <>
                              Download <Download size={16} />
                            </>
                          )}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {category.resources.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No resources available in this category yet.
                </p>
              )}
            </div>
          ))}

          {allResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No resources available at the moment. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
