import { useEffect, useState, useRef } from 'react';
import {
  Brain,
  BookOpen,
  Search,
  ClipboardCheck,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  Filter,
  X,
  ChevronRight,
  Award,
  Layers,
  Rocket,
  Send,
  MessageCircle,
  Loader2,
  Eye,
  Pencil,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCourseHealthSummaries } from '../../lib/ai/courseGeneration';
import type { CourseHealthSummary, AIGenerationJob } from '../../types/ai';
import { CourseGenerationModal } from '../../components/admin/CourseGenerationModal';
import { SEOOptimiserTool } from '../../components/admin/SEOOptimiserTool';
import { CourseAuditorPanel } from '../../components/admin/CourseAuditorPanel';

type TabView = 'overview' | 'generate' | 'audit' | 'seo';

interface CourseFullData {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  price: number;
  published: boolean;
  sector_id: string | null;
  syllabus: Record<string, unknown> | null;
  created_at: string;
  sectors?: { id: string; name: string } | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AICourseDirector() {
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [healthSummaries, setHealthSummaries] = useState<CourseHealthSummary[]>([]);
  const [allCourses, setAllCourses] = useState<CourseFullData[]>([]);
  const [recentJobs, setRecentJobs] = useState<AIGenerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Filtering
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthData, coursesData, jobsData] = await Promise.all([
        getCourseHealthSummaries(),
        loadAllCourses(),
        loadRecentJobs(),
      ]);
      setHealthSummaries(healthData);
      setAllCourses(coursesData);
      setRecentJobs(jobsData);
    } catch (error) {
      console.error('Error loading AI Director data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCourses = async (): Promise<CourseFullData[]> => {
    const { data } = await supabase
      .from('courses')
      .select('id, title, slug, description, level, duration, price, published, sector_id, syllabus, created_at, sectors(id, name)')
      .is('deleted_at', null)
      .order('title');
    return (data as unknown as CourseFullData[]) || [];
  };

  const loadRecentJobs = async (): Promise<AIGenerationJob[]> => {
    const { data } = await supabase
      .from('ai_generation_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    return (data as AIGenerationJob[]) || [];
  };

  const getTier = (course: CourseFullData): string => {
    const syllabus = course.syllabus as Record<string, unknown> | null;
    if (syllabus && typeof syllabus === 'object' && !Array.isArray(syllabus) && 'tier' in syllabus) {
      return syllabus.tier as string;
    }
    // Fallback: detect tier from sector name
    const sectorName = course.sectors?.name || '';
    if (sectorName.toLowerCase().includes('wamitab')) return 'Tier 1 - WAMITAB Rival';
    if (sectorName.toLowerCase().includes('niche') || sectorName.toLowerCase().includes('industry')) return 'Tier 2 - Industry-Specific Niche';
    if (sectorName.toLowerCase().includes('future') || sectorName.toLowerCase().includes('innovation')) return 'Tier 3 - Future Tech & Innovation';
    return 'Other';
  };

  const wamitabCount = allCourses.filter(c => getTier(c).includes('Tier 1')).length;
  const nicheCount = allCourses.filter(c => getTier(c).includes('Tier 2')).length;
  const futureTechCount = allCourses.filter(c => getTier(c).includes('Tier 3')).length;
  const otherCount = allCourses.length - wamitabCount - nicheCount - futureTechCount;

  const filteredCourses = allCourses.filter(course => {
    if (filterTier !== 'all') {
      const tier = getTier(course);
      if (filterTier === 'tier1' && !tier.includes('Tier 1')) return false;
      if (filterTier === 'tier2' && !tier.includes('Tier 2')) return false;
      if (filterTier === 'tier3' && !tier.includes('Tier 3')) return false;
      if (filterTier === 'other' && (tier.includes('Tier 1') || tier.includes('Tier 2') || tier.includes('Tier 3'))) return false;
    }
    if (filterSector !== 'all' && course.sector_id !== filterSector) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.level?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sectors = Array.from(
    new Map(allCourses.filter(c => c.sectors).map(c => [c.sectors!.id, c.sectors!.name])).entries()
  );

  const selectedCourse = allCourses.find(c => c.id === selectedCourseId) || null;

  const healthyCourses = healthSummaries.filter(c => c.status === 'healthy').length;
  const attentionCourses = healthSummaries.filter(c => c.status === 'needs_attention').length;
  const criticalCourses = healthSummaries.filter(c => c.status === 'critical').length;
  const avgScore = healthSummaries.length > 0
    ? Math.round(healthSummaries.reduce((sum, c) => sum + c.overall_score, 0) / healthSummaries.length)
    : 0;

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-course-director`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'chat',
            message: userMessage.content,
            course_id: selectedCourseId,
            context: selectedCourse ? {
              title: selectedCourse.title,
              level: selectedCourse.level,
              syllabus: selectedCourse.syllabus,
            } : undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const result = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response || result.message || 'I processed your request but have no specific response.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. The AI endpoint may not support chat yet - please try using the specific action buttons (Audit, SEO, Generate) for now.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const tabs: { id: TabView; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'generate', label: 'Generate Content', icon: Plus },
    { id: 'audit', label: 'Course Auditor', icon: ClipboardCheck },
    { id: 'seo', label: 'SEO Optimiser', icon: Search },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
            <Brain className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Course Director</h1>
            <p className="text-sm text-gray-500">Intelligent course creation, auditing, and optimisation</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Tier Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Courses" value={allCourses.length} icon={BookOpen} color="emerald" />
        <MetricCard label="WAMITAB Rival" value={wamitabCount} icon={Award} color="blue" />
        <MetricCard label="Industry Niche" value={nicheCount} icon={Layers} color="amber" />
        <MetricCard label="Future Tech" value={futureTechCount} icon={Rocket} color="teal" />
        <MetricCard label="Avg Quality" value={`${avgScore}%`} icon={TrendingUp} color="emerald" />
        <MetricCard label="AI Jobs" value={recentJobs.length} icon={Zap} color="amber" />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main course list area */}
          <div className="xl:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter size={16} />
                  <span className="font-medium">Filters:</span>
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Tiers</option>
                  <option value="tier1">Tier 1 - WAMITAB Rival</option>
                  <option value="tier2">Tier 2 - Industry Niche</option>
                  <option value="tier3">Tier 3 - Future Tech</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {filteredCourses.length} of {allCourses.length} courses
                </span>
              </div>
            </div>

            {/* Course List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
                {filteredCourses.map((course) => {
                  const tier = getTier(course);
                  const isSelected = selectedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(isSelected ? null : course.id)}
                      className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-colors ${
                        isSelected ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                          {!course.published && (
                            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">Draft</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <TierBadge tier={tier} />
                          <span>{course.level}</span>
                          <span>{course.duration}</span>
                          <span>£{Number(course.price).toFixed(0)}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}
                {filteredCourses.length === 0 && (
                  <div className="px-6 py-12 text-center text-gray-500 text-sm">
                    No courses match your filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Course Detail + Chat */}
          <div className="space-y-4">
            {selectedCourse ? (
              <CourseDetailPanel
                course={selectedCourse}
                onClose={() => setSelectedCourseId(null)}
                onAudit={() => { setSelectedCourseId(selectedCourse.id); setActiveTab('audit'); }}
                onSEO={() => { setSelectedCourseId(selectedCourse.id); setActiveTab('seo'); }}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
                <div className="text-gray-400 mb-3">
                  <Eye size={32} className="mx-auto" />
                </div>
                <p className="text-sm text-gray-500">Select a course to view details and actions</p>
              </div>
            )}

            {/* AI Chat Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ height: '400px' }}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <MessageCircle size={16} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">AI Director Chat</h3>
                {selectedCourse && (
                  <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium truncate max-w-[150px]">
                    {selectedCourse.title}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center text-xs text-gray-400 mt-8">
                    <Brain size={24} className="mx-auto mb-2 text-gray-300" />
                    <p>Ask the AI Director anything about your courses.</p>
                    <p className="mt-1">Try: "Audit this course" or "Suggest improvements"</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-emerald-200' : 'text-gray-400'}`}>
                        {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <Loader2 size={16} className="animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-gray-100">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={selectedCourse ? `Ask about "${selectedCourse.title}"...` : 'Ask the AI Director...'}
                    className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Content Generation</h2>
              <p className="text-sm text-gray-500 mt-1">Generate courses, lessons, quizzes, and case studies with AI</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} />
              New Course
            </button>
          </div>
          <RecentJobsList jobs={recentJobs} />
        </div>
      )}

      {activeTab === 'audit' && (
        <CourseAuditorPanel
          courseId={selectedCourseId}
          courses={healthSummaries}
          onSelectCourse={setSelectedCourseId}
        />
      )}

      {activeTab === 'seo' && (
        <SEOOptimiserTool
          courseId={selectedCourseId}
          courses={healthSummaries}
          onSelectCourse={setSelectedCourseId}
        />
      )}

      {showGenerateModal && (
        <CourseGenerationModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={() => {
            setShowGenerateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    teal: 'text-teal-600 bg-teal-50',
  };
  const classes = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${classes}`}>
          <Icon size={14} />
        </div>
        <span className="text-xs font-medium text-gray-500 truncate">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  if (tier.includes('Tier 1')) return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">WAMITAB</span>;
  if (tier.includes('Tier 2')) return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">Niche</span>;
  if (tier.includes('Tier 3')) return <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-medium">Future</span>;
  return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">General</span>;
}

function CourseDetailPanel({
  course,
  onClose,
  onAudit,
  onSEO,
}: {
  course: CourseFullData;
  onClose: () => void;
  onAudit: () => void;
  onSEO: () => void;
}) {
  const syllabus = course.syllabus as Record<string, unknown> | null;
  const tier = syllabus?.tier as string || 'General';
  const wamitabEquiv = syllabus?.wamitab_equivalent as string || 'N/A';
  const uniqueFeatures = (syllabus?.unique_features as string[]) || [];
  const learningOutcomes = (syllabus?.learning_outcomes as string[]) || [];
  const caseStudies = (syllabus?.case_studies as Array<{ title: string; region: string }>) || [];
  const syllabusTopics = (syllabus?.syllabus_topics as string[]) || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900 truncate flex-1">{course.title}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto">
        {/* Key Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block">Level</span>
            <span className="font-medium text-gray-900">{course.level}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Duration</span>
            <span className="font-medium text-gray-900">{course.duration}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Price</span>
            <span className="font-medium text-gray-900">£{Number(course.price).toFixed(0)}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Status</span>
            <span className={`font-medium ${course.published ? 'text-emerald-700' : 'text-gray-500'}`}>
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Tier & Equivalent */}
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Tier:</span>
            <TierBadge tier={tier} />
          </div>
          {wamitabEquiv !== 'N/A' && (
            <div>
              <span className="text-gray-500">WAMITAB Equiv: </span>
              <span className="text-gray-700">{wamitabEquiv}</span>
            </div>
          )}
        </div>

        {/* Unique Features */}
        {uniqueFeatures.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Unique Features</p>
            <div className="flex flex-wrap gap-1">
              {uniqueFeatures.map((f, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* Syllabus */}
        {syllabusTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Syllabus ({syllabusTopics.length} topics)</p>
            <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside max-h-24 overflow-y-auto">
              {syllabusTopics.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* Learning Outcomes */}
        {learningOutcomes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Learning Outcomes</p>
            <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside max-h-20 overflow-y-auto">
              {learningOutcomes.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}

        {/* Case Studies */}
        {caseStudies.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Case Studies</p>
            <div className="space-y-1">
              {caseStudies.map((cs, i) => (
                <div key={i} className="text-xs flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>{cs.title}</span>
                  <span className="text-gray-400">({cs.region})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <button
            onClick={onAudit}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ClipboardCheck size={14} />
            Run AI Audit
          </button>
          <button
            onClick={onSEO}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <Search size={14} />
            Optimise SEO
          </button>
          <a
            href={`/admin/courses/edit/${course.id}`}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Pencil size={14} />
            Edit Course
          </a>
        </div>
      </div>
    </div>
  );
}

function RecentJobsList({ jobs }: { jobs: AIGenerationJob[] }) {
  const jobTypeLabels: Record<string, string> = {
    course_generate: 'Course Generation',
    lesson_generate: 'Lesson Generation',
    quiz_generate: 'Quiz Generation',
    case_study_generate: 'Case Study',
    seo_optimise: 'SEO Optimisation',
    course_audit: 'Course Audit',
    bulk_seo: 'Bulk SEO',
    content_enhance: 'Content Enhancement',
  };

  const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
    completed: { icon: CheckCircle2, color: 'text-emerald-500' },
    processing: { icon: RefreshCw, color: 'text-blue-500' },
    pending: { icon: Clock, color: 'text-gray-400' },
    failed: { icon: XCircle, color: 'text-red-500' },
    cancelled: { icon: XCircle, color: 'text-gray-400' },
  };

  return (
    <div className="divide-y divide-gray-100">
      {jobs.map((job) => {
        const StatusIcon = statusConfig[job.status]?.icon || Clock;
        const statusColor = statusConfig[job.status]?.color || 'text-gray-400';

        return (
          <div key={job.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon size={18} className={`${statusColor} ${job.status === 'processing' ? 'animate-spin' : ''}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {jobTypeLabels[job.job_type] || job.job_type}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(job.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              {job.tokens_used > 0 && (
                <p className="text-xs text-gray-500">{job.tokens_used.toLocaleString()} tokens</p>
              )}
              {job.progress > 0 && job.progress < 100 && (
                <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${job.progress}%` }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      {jobs.length === 0 && (
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          No AI generation jobs yet. Generate your first course to get started.
        </div>
      )}
    </div>
  );
}
