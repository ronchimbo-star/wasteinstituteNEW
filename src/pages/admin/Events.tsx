import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit, Trash2, Calendar, Eye, EyeOff, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  slug: string;
  event_type: string;
  start_date: string;
  location: string;
  is_online: boolean;
  published: boolean;
  featured: boolean;
  price: number;
  registrations_count?: number;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  webinar: 'Webinar',
  workshop: 'Workshop',
  conference: 'Conference',
  cleanup: 'Cleanup',
  networking: 'Networking',
  training: 'Training',
};

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });

    if (data) {
      const eventsWithCounts = await Promise.all(
        data.map(async (event) => {
          const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .neq('status', 'cancelled');
          return { ...event, registrations_count: count || 0 };
        })
      );
      setEvents(eventsWithCounts);
    }
    setLoading(false);
  };

  const togglePublished = async (event: Event) => {
    await supabase
      .from('events')
      .update({ published: !event.published })
      .eq('id', event.id);
    setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, published: !e.published } : e));
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event? All registrations will also be deleted.')) return;
    await supabase.from('events').delete().eq('id', id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage workshops, webinars, and community events</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Plus size={18} />
          New Event
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-6">Create your first event to get started.</p>
          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            Create Event
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrations</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {event.is_online ? 'Online' : event.location || 'Location TBC'}
                        {event.price === 0 ? ' · Free' : ` · £${event.price}`}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-700">
                      {new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.start_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Users size={14} className="text-emerald-600" />
                      {event.registrations_count}
                      {event.capacity && (
                        <span className="text-gray-400">/ {event.capacity}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      event.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {event.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublished(event)}
                        title={event.published ? 'Unpublish' : 'Publish'}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        {event.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link
                        to={`/admin/events/${event.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
