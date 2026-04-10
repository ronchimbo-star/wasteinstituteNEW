import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Users,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  event_type: string;
  featured_image: string;
  start_date: string;
  end_date: string | null;
  location: string;
  address: string;
  online_link: string;
  is_online: boolean;
  capacity: number | null;
  price: number;
  currency: string;
  registration_deadline: string | null;
  organiser_name: string;
  organiser_email: string;
  seo_title: string;
  seo_description: string;
}

interface RegistrationForm {
  full_name: string;
  email: string;
  organisation: string;
  notes: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  webinar: 'Webinar',
  workshop: 'Workshop',
  conference: 'Conference',
  cleanup: 'Community Cleanup',
  networking: 'Networking',
  training: 'Training',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  webinar: 'bg-blue-100 text-blue-700',
  workshop: 'bg-amber-100 text-amber-700',
  conference: 'bg-emerald-100 text-emerald-700',
  cleanup: 'bg-teal-100 text-teal-700',
  networking: 'bg-orange-100 text-orange-700',
  training: 'bg-cyan-100 text-cyan-700',
};

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isUpcoming(date: string): boolean {
  return new Date(date) >= new Date();
}

function isPastDeadline(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [registerError, setRegisterError] = useState('');
  const [form, setForm] = useState<RegistrationForm>({ full_name: '', email: '', organisation: '', notes: '' });

  useEffect(() => {
    if (slug) loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setEvent(data);

    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', data.id)
      .neq('status', 'cancelled');

    setRegistrationCount(count || 0);

    if (user) {
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', data.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) setAlreadyRegistered(true);
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setRegisterStatus('loading');
    setRegisterError('');

    const { error } = await supabase.from('event_registrations').insert({
      event_id: event.id,
      user_id: user?.id || null,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      organisation: form.organisation.trim(),
      notes: form.notes.trim(),
      status: 'confirmed',
    });

    if (error) {
      if (error.code === '23505') {
        setRegisterStatus('success');
        setAlreadyRegistered(true);
      } else {
        setRegisterStatus('error');
        setRegisterError('Registration failed. Please try again.');
      }
    } else {
      setRegisterStatus('success');
      setAlreadyRegistered(true);
      setRegistrationCount((c) => c + 1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (notFound || !event) {
    return (
      <Layout>
        <SEO
          title="Event Not Found | Waste Institute"
          description="The event you're looking for could not be found."
          canonical={`https://wasteinstitute.org/events/${slug}`}
          noindex={true}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Not Found</h1>
            <Link to="/events" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Back to Events
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const upcoming = isUpcoming(event.start_date);
  const deadlinePassed = isPastDeadline(event.registration_deadline);
  const isFull = event.capacity !== null && registrationCount >= event.capacity;
  const canRegister = upcoming && !deadlinePassed && !isFull && !alreadyRegistered;

  const seoTitle = event.seo_title || `${event.title} | Waste Institute`;
  const seoDesc = event.seo_description || event.excerpt || event.description.substring(0, 160);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "description": seoDesc,
      "startDate": event.start_date,
      ...(event.end_date ? { "endDate": event.end_date } : {}),
      "eventStatus": upcoming ? "https://schema.org/EventScheduled" : "https://schema.org/EventPostponed",
      "eventAttendanceMode": event.is_online
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      "location": event.is_online
        ? { "@type": "VirtualLocation", "url": event.online_link || "https://wasteinstitute.org" }
        : { "@type": "Place", "name": event.location, "address": event.address },
      "organizer": { "@type": "Organization", "name": event.organiser_name, "url": "https://wasteinstitute.org" },
      "offers": {
        "@type": "Offer",
        "price": event.price.toString(),
        "priceCurrency": event.currency,
        "availability": isFull ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wasteinstitute.org/" },
        { "@type": "ListItem", "position": 2, "name": "Events", "item": "https://wasteinstitute.org/events" },
        { "@type": "ListItem", "position": 3, "name": event.title, "item": `https://wasteinstitute.org/events/${event.slug}` }
      ]
    }
  ];

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={`https://wasteinstitute.org/events/${event.slug}`}
        structuredData={structuredData}
      />

      {event.featured_image && (
        <div className="h-72 lg:h-96 w-full overflow-hidden relative">
          <img
            src={event.featured_image}
            alt={event.title}
            width="1400"
            height="400"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Events
          </Link>

          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${EVENT_TYPE_COLORS[event.event_type] || 'bg-gray-100 text-gray-700'}`}>
              <Tag size={13} className="inline mr-1" />
              {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
            </span>
            {!upcoming && (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 text-white">Past Event</span>
            )}
            {event.price === 0 && (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white text-emerald-700">Free</span>
            )}
          </div>

          <h1 className="text-3xl lg:text-5xl font-bold mb-4 max-w-3xl">{event.title}</h1>
          {event.excerpt && (
            <p className="text-xl text-emerald-50 max-w-2xl">{event.excerpt}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                {event.description}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Event Details</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <p className="font-semibold text-gray-900">Start</p>
                    <p className="text-gray-600">{formatDateTime(event.start_date)}</p>
                  </div>
                </div>
                {event.end_date && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-gray-900">End</p>
                      <p className="text-gray-600">{formatDateTime(event.end_date)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  {event.is_online ? (
                    <Monitor className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                  ) : (
                    <MapPin className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{event.is_online ? 'Online' : 'Location'}</p>
                    {event.is_online ? (
                      <p className="text-gray-600">Virtual event — link provided on registration</p>
                    ) : (
                      <>
                        <p className="text-gray-600">{event.location}</p>
                        {event.address && <p className="text-gray-500 text-xs mt-0.5">{event.address}</p>}
                      </>
                    )}
                  </div>
                </div>
                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-gray-900">Capacity</p>
                      <p className="text-gray-600">
                        {registrationCount} / {event.capacity} registered
                        {isFull && <span className="ml-2 text-red-600 font-semibold">Full</span>}
                      </p>
                    </div>
                  </div>
                )}
                {event.registration_deadline && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-emerald-600 mt-0.5 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-semibold text-gray-900">Registration Deadline</p>
                      <p className={`text-sm ${deadlinePassed ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {new Date(event.registration_deadline).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                        {deadlinePassed && ' (Closed)'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-gray-700 font-medium">Price</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {event.price === 0 ? 'Free' : `£${event.price.toFixed(2)}`}
                  </span>
                </div>

                {alreadyRegistered || registerStatus === 'success' ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                    <p className="text-emerald-800 font-semibold text-sm">You're registered!</p>
                  </div>
                ) : !upcoming ? (
                  <p className="text-center text-gray-500 text-sm py-2">This event has ended.</p>
                ) : isFull ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 text-sm font-medium">
                    This event is fully booked.
                  </div>
                ) : deadlinePassed ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center text-amber-700 text-sm font-medium">
                    Registration has closed.
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Organisation (optional)"
                      value={form.organisation}
                      onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <textarea
                      placeholder="Any questions or notes (optional)"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                    {registerStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-600 text-xs">
                        <AlertCircle size={14} />
                        {registerError}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={registerStatus === 'loading'}
                      className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    >
                      {registerStatus === 'loading' ? 'Registering...' : canRegister ? 'Register Now' : 'Express Interest'}
                    </button>
                    {event.price === 0 && (
                      <p className="text-xs text-gray-500 text-center">Free — no payment required</p>
                    )}
                  </form>
                )}
              </div>

              {event.is_online && alreadyRegistered && event.online_link && (
                <a
                  href={event.online_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  <ExternalLink size={18} />
                  Join Online
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
