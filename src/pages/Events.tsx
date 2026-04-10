import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Clock, Users, Monitor, ArrowRight, Filter } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  event_type: string;
  featured_image: string;
  start_date: string;
  end_date: string | null;
  location: string;
  is_online: boolean;
  price: number;
  currency: string;
  capacity: number | null;
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

function formatEventDate(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  if (!endDate) return start.toLocaleDateString('en-GB', options);

  const end = new Date(endDate);
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-GB', options);
  }

  const startStr = start.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' });
  return `${startStr} – ${end.toLocaleDateString('en-GB', options)}`;
}

function formatEventTime(startDate: string): string {
  return new Date(startDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function isUpcoming(date: string): boolean {
  return new Date(date) >= new Date();
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .order('start_date', { ascending: true });

    if (data) setEvents(data);
    setLoading(false);
  };

  const filteredEvents = events.filter((event) => {
    const matchesTime =
      filter === 'all' ||
      (filter === 'upcoming' && isUpcoming(event.start_date)) ||
      (filter === 'past' && !isUpcoming(event.start_date));

    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;

    return matchesTime && matchesType;
  });

  const upcomingCount = events.filter((e) => isUpcoming(e.start_date)).length;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wasteinstitute.org/" },
      { "@type": "ListItem", "position": 2, "name": "Events", "item": "https://wasteinstitute.org/events" }
    ]
  };

  return (
    <Layout>
      <SEO
        title="Events & Webinars | Waste Institute"
        description="Attend Waste Institute workshops, webinars, conferences, and networking events. Connect with waste management professionals and expand your expertise."
        canonical="https://wasteinstitute.org/events"
        structuredData={structuredData}
      />

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Events & Webinars</h1>
            <p className="text-xl text-emerald-50 mb-6">
              Connect with industry experts, learn new skills, and grow your professional network
            </p>
            {upcomingCount > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                <Calendar size={16} />
                {upcomingCount} upcoming event{upcomingCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
              <Filter size={16} />
              Filter:
            </div>
            <div className="flex gap-2">
              {(['upcoming', 'past', 'all'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    filter === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    typeFilter === key ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-24">
              <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No events found</h2>
              <p className="text-gray-500 mb-6">
                {filter === 'upcoming'
                  ? 'No upcoming events scheduled yet. Check back soon!'
                  : 'No events match your current filters.'}
              </p>
              <button
                onClick={() => { setFilter('all'); setTypeFilter('all'); }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const upcoming = isUpcoming(event.start_date);
                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.slug}`}
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-400 flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      {event.featured_image ? (
                        <img
                          src={event.featured_image}
                          alt={event.title}
                          width="600"
                          height="192"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                          <Calendar className="text-white opacity-50" size={64} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${EVENT_TYPE_COLORS[event.event_type] || 'bg-gray-100 text-gray-700'}`}>
                          {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                        </span>
                        {!upcoming && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-600 text-white">Past</span>
                        )}
                      </div>
                      {event.price === 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">Free</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {event.title}
                      </h2>

                      {event.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{event.excerpt}</p>
                      )}

                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={15} className="text-emerald-600 flex-shrink-0" />
                          <span>{formatEventDate(event.start_date, event.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={15} className="text-emerald-600 flex-shrink-0" />
                          <span>{formatEventTime(event.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {event.is_online ? (
                            <Monitor size={15} className="text-emerald-600 flex-shrink-0" />
                          ) : (
                            <MapPin size={15} className="text-emerald-600 flex-shrink-0" />
                          )}
                          <span className="truncate">{event.is_online ? 'Online' : (event.location || 'TBC')}</span>
                        </div>
                        {event.capacity && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={15} className="text-emerald-600 flex-shrink-0" />
                            <span>{event.capacity} places</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-600">
                          {event.price === 0 ? 'Free' : `£${event.price.toFixed(2)}`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all">
                          {upcoming ? 'Register' : 'View Details'}
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
