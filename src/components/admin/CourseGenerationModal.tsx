import { useState } from 'react';
import { X, Brain, BookOpen, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { generateCourseOutline, createCourseFromOutline } from '../../lib/ai/courseGeneration';
import type {
  CourseGenerationInput,
  GeneratedCourseOutline,
  CourseLevel,
  RiskLevel,
  CaseStudyRegion,
} from '../../types/ai';

interface Props {
  onClose: () => void;
  onGenerated: () => void;
}

type Step = 'input' | 'generating' | 'preview' | 'saving' | 'done' | 'error';

export function CourseGenerationModal({ onClose, onGenerated }: Props) {
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState('');
  const [outline, setOutline] = useState<GeneratedCourseOutline | null>(null);

  const [formData, setFormData] = useState<CourseGenerationInput>({
    title: '',
    topic: '',
    level: 'Intermediate',
    risk_level: 'Medium',
    target_hours: 40,
    sector: 'Waste Management',
    description: '',
    target_audience: '',
    regions: ['UK'],
  });

  const handleGenerate = async () => {
    if (!formData.title || !formData.topic) {
      setError('Title and topic are required');
      return;
    }

    setStep('generating');
    setError('');

    try {
      const result = await generateCourseOutline(formData);
      setOutline(result);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('error');
    }
  };

  const handleCreate = async () => {
    if (!outline) return;
    setStep('saving');

    try {
      await createCourseFromOutline(outline);
      setStep('done');
      setTimeout(() => onGenerated(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      setStep('error');
    }
  };

  const regions: CaseStudyRegion[] = ['UK', 'EU', 'USA', 'Africa', 'Asia'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <Brain size={24} className="text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">AI Course Generator</h2>
              <p className="text-xs text-gray-500">Create a complete course from a topic brief</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' && (
            <InputForm
              formData={formData}
              setFormData={setFormData}
              regions={regions}
              error={error}
            />
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={48} className="text-emerald-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-900">Generating Course Outline</p>
              <p className="text-sm text-gray-500 mt-2">This typically takes 15-30 seconds...</p>
            </div>
          )}

          {step === 'preview' && outline && (
            <OutlinePreview outline={outline} />
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={48} className="text-emerald-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-gray-900">Creating Course in Database</p>
              <p className="text-sm text-gray-500 mt-2">Setting up modules and lessons...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 size={48} className="text-emerald-600 mb-4" />
              <p className="text-lg font-semibold text-gray-900">Course Created Successfully</p>
              <p className="text-sm text-gray-500 mt-2">You can now edit the course and generate lesson content.</p>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <p className="text-lg font-semibold text-gray-900">Generation Failed</p>
              <p className="text-sm text-red-600 mt-2">{error}</p>
              <button
                onClick={() => setStep('input')}
                className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'input' || step === 'preview') && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            {step === 'input' && (
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                <Brain size={16} />
                Generate Outline
              </button>
            )}
            {step === 'preview' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Edit Brief
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  <BookOpen size={16} />
                  Create Course
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InputForm({
  formData,
  setFormData,
  regions,
  error,
}: {
  formData: CourseGenerationInput;
  setFormData: React.Dispatch<React.SetStateAction<CourseGenerationInput>>;
  regions: CaseStudyRegion[];
  error: string;
}) {
  return (
    <div className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Advanced Hazardous Waste Handling"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sector</label>
          <input
            type="text"
            value={formData.sector}
            onChange={(e) => setFormData((prev) => ({ ...prev, sector: e.target.value }))}
            placeholder="e.g., Healthcare, Industrial, Municipal"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic Description</label>
        <textarea
          value={formData.topic}
          onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
          rows={3}
          placeholder="Describe the course topic in detail. What should students learn?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value as CourseLevel }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Risk Level</label>
          <select
            value={formData.risk_level}
            onChange={(e) => setFormData((prev) => ({ ...prev, risk_level: e.target.value as RiskLevel }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Hours</label>
          <input
            type="number"
            value={formData.target_hours}
            onChange={(e) => setFormData((prev) => ({ ...prev, target_hours: Number(e.target.value) }))}
            min={5}
            max={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
        <input
          type="text"
          value={formData.target_audience || ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, target_audience: e.target.value }))}
          placeholder="e.g., Environmental managers, waste operatives, compliance officers"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Case Study Regions</label>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <label key={region} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.regions?.includes(region) || false}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    regions: e.target.checked
                      ? [...(prev.regions || []), region]
                      : (prev.regions || []).filter((r) => r !== region),
                  }));
                }}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">{region}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function OutlinePreview({ outline }: { outline: GeneratedCourseOutline }) {
  return (
    <div className="space-y-5">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{outline.title}</h3>
        <p className="text-sm text-gray-700 mb-3">{outline.description}</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">{outline.level}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md">{outline.duration}</span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
            {outline.modules.length} modules, {outline.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Course Structure</h4>
        {outline.modules.map((module, mi) => (
          <div key={mi} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                Module {mi + 1}: {module.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
            </div>
            <ul className="divide-y divide-gray-100">
              {module.lessons.map((lesson, li) => (
                <li key={li} className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-gray-700">{lesson.title}</span>
                  <span className="text-xs text-gray-400">{lesson.duration_minutes} min</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-blue-900 mb-2">SEO Preview</h4>
        <p className="text-sm text-blue-800 font-medium">{outline.seo_title}</p>
        <p className="text-xs text-blue-700 mt-1">{outline.seo_description}</p>
        <p className="text-xs text-blue-600 mt-1">Keywords: {outline.seo_keywords}</p>
      </div>
    </div>
  );
}
