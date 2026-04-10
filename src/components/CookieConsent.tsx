import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, Cookie, Shield, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

type ConsentLevel = 'all' | 'essential' | null;

interface ConsentContextType {
  consent: ConsentLevel;
  hasAnalyticsConsent: boolean;
  openPreferences: () => void;
}

const ConsentContext = createContext<ConsentContextType>({
  consent: null,
  hasAnalyticsConsent: false,
  openPreferences: () => {},
});

export const useCookieConsent = () => useContext(ConsentContext);

const STORAGE_KEY = 'wi_cookie_consent';

export default function CookieConsent({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentLevel>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentLevel;
    if (stored === 'all' || stored === 'essential') {
      setConsent(stored);
      setAnalyticsEnabled(stored === 'all');
    } else {
      setTimeout(() => setShowBanner(true), 800);
    }
    setMounted(true);
  }, []);

  const saveConsent = (level: ConsentLevel) => {
    if (!level) return;
    localStorage.setItem(STORAGE_KEY, level);
    setConsent(level);
    setAnalyticsEnabled(level === 'all');
    setShowBanner(false);
    setShowPreferences(false);
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: { level } }));
  };

  const openPreferences = () => {
    setShowBanner(false);
    setShowPreferences(true);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasAnalyticsConsent: analyticsEnabled && consent === 'all',
        openPreferences,
      }}
    >
      {children}

      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Cookie className="text-emerald-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-gray-900 mb-1">We use cookies</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to improve your experience and analyse site traffic. Essential cookies are required for the site to function. Analytics cookies help us understand how you use the platform.{' '}
                    <a href="/cookies" className="text-emerald-600 hover:underline font-medium">Cookie Policy</a>
                    {' '}&amp;{' '}
                    <a href="/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</a>.
                  </p>
                </div>
                <button
                  onClick={() => setShowBanner(false)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => saveConsent('all')}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => saveConsent('essential')}
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={openPreferences}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Manage Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Cookie className="text-emerald-600" size={22} />
                <h2 className="text-lg font-bold text-gray-900">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <CookieCategory
                icon={<Shield size={18} className="text-emerald-600" />}
                title="Essential Cookies"
                description="Required for the website to function. These cannot be disabled and include authentication, session management, and security cookies."
                enabled={true}
                locked={true}
                onToggle={() => {}}
              />

              <CookieCategory
                icon={<BarChart2 size={18} className="text-blue-600" />}
                title="Analytics Cookies"
                description="Help us understand how visitors interact with the website by collecting anonymised information. We use Google Analytics to improve your experience."
                enabled={analyticsEnabled}
                locked={false}
                onToggle={() => setAnalyticsEnabled(!analyticsEnabled)}
              />
            </div>

            <div className="p-6 pt-2 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => saveConsent(analyticsEnabled ? 'all' : 'essential')}
                className="flex-1 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => {
                  setAnalyticsEnabled(true);
                  saveConsent('all');
                }}
                className="flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}

function CookieCategory({
  icon,
  title,
  description,
  enabled,
  locked,
  onToggle,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900">{title}</span>
            <div className="flex items-center gap-2">
              {locked ? (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Always on</span>
              ) : (
                <button
                  onClick={onToggle}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    enabled ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={enabled}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-gray-600"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {description}
        </div>
      )}
    </div>
  );
}
