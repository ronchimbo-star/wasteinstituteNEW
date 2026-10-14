import { useState, FormEvent } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, ExternalLink, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  bot_field: string;
}

interface FormStatus {
  type: 'success' | 'error' | null;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    bot_field: '',
  });
  const [status, setStatus] = useState<FormStatus>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const { data: contactData, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            bot_field: formData.bot_field,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await supabase.from('notifications').insert([
        {
          type: 'contact_form',
          title: 'New Contact Form Submission',
          message: `New contact form submission from ${formData.name} (${formData.email})`,
          metadata: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
          },
          related_id: contactData?.id,
        },
      ]);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      fetch(`${supabaseUrl}/functions/v1/send-notification-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact_form',
          data: formData,
        }),
      }).catch(err => console.error('Email notification error:', err));

      setStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send your message. Please try again later.',
      });
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Contact Us | Waste Institute"
        description="Get in touch with the Waste Institute team about clinical waste management courses, certifications, or corporate training. Powered by MediWaste."
        canonical="https://wasteinstitute.org/contact"
      />

      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-full mb-6">
              <MessageCircle className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-emerald-50">
              Have questions about our courses, certifications, or corporate training? We're here to help.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                    Send Us a Message
                  </h2>

                  {status.type && (
                    <div
                      className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                        status.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {status.type === 'success' ? (
                        <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                      ) : (
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                      )}
                      <p>{status.message}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-y"
                        placeholder="Tell us more..."
                      />
                    </div>
                    <input
                      type="text"
                      name="bot_field"
                      value={formData.bot_field}
                      onChange={handleChange}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <a href="mailto:info@wasteinstitute.org" className="text-gray-700 hover:text-emerald-600 transition-colors">
                        info@wasteinstitute.org
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <a href="tel:+441322879087" className="text-gray-700 hover:text-emerald-600 transition-colors">
                        +44 (01322) 879 087
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">
                        82 James Carter Rd,<br />
                        Mildenhall, Bury Saint Edmunds<br />
                        IP28 7DE, United Kingdom
                      </span>
                    </li>
                  </ul>
                </div>

                {/* MediWaste link */}
                <div className="bg-emerald-50 rounded-xl shadow-lg p-6 border border-emerald-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Need Waste Collection?</h3>
                  <p className="text-gray-700 text-sm mb-4">
                    If you need clinical waste collection services for your practice, our parent company MediWaste can help.
                  </p>
                  <a
                    href="https://mediwaste.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                  >
                    Visit mediwaste.co.uk
                    <ExternalLink size={16} />
                  </a>
                </div>

                {/* Quick FAQ */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Questions</h3>
                  <div className="space-y-3">
                    <Link to="/faq" className="block text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                      How long do courses take?
                    </Link>
                    <Link to="/faq" className="block text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                      What is the certificate?
                    </Link>
                    <Link to="/faq" className="block text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                      Is there a money-back guarantee?
                    </Link>
                    <Link to="/faq" className="block text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                      Are bundle offers available?
                    </Link>
                    <Link to="/faq" className="block text-emerald-600 hover:text-emerald-700 font-semibold text-sm pt-2">
                      View all FAQs &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
