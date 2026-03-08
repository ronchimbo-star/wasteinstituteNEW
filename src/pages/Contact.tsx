import { useState, FormEvent } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageCircle, Sparkles, Users, Headphones, Recycle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormStatus {
  type: 'success' | 'error' | null;
  message: string;
}

export const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
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
        description="Get in touch with the Waste Institute team. Enquire about courses, certifications, corporate training or partnership opportunities."
        canonical="https://wasteinstitute.org/contact"
      />
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 py-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/contact/wasteinstitute-image4.jpg"
                  alt="Team members collaborating"
                  className="w-full h-[500px] object-cover"
                />

                <div className="absolute top-4 right-4 animate-bounce">
                  <img
                    src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/icons/white-icon.png"
                    alt="Waste Institute"
                    className="w-12 h-12 drop-shadow-lg"
                  />
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-16 left-10 text-yellow-300 animate-float">
                    <Sparkles size={27} className="fill-current" />
                  </div>
                  <div className="absolute top-28 right-20 text-yellow-400 animate-float-delayed">
                    <Sparkles size={24} className="fill-current" />
                  </div>
                  <div className="absolute bottom-36 left-16 text-yellow-300 animate-float-slow">
                    <Sparkles size={30} className="fill-current" />
                  </div>
                  <div className="absolute top-1/2 right-12 text-yellow-400 animate-float">
                    <Sparkles size={21} className="fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-5 shadow-2xl max-w-xs animate-fade-in-up border border-white border-opacity-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-300">Support Available</span>
                  </div>
                  <p className="text-xl font-handwriting text-white font-semibold animate-text-wave">
                    "We're here to help!"
                  </p>
                  <div className="flex gap-3 mt-3">
                    <MessageCircle size={32} className="text-emerald-400" />
                    <Headphones size={32} className="text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-emerald-50">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
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
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
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
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
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
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
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
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Contact Information
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Mail className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <a
                          href="mailto:info@wasteinstitute.org"
                          className="text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          info@wasteinstitute.org
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Phone className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                        <a
                          href="tel:+441322879087"
                          className="text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          +44 (01322) 879 087
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                        <p className="text-gray-600">
                          82 James Carter Rd<br />
                          Mildenhall, Bury Saint Edmunds<br />
                          IP28 7DE, United Kingdom
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-600 rounded-xl shadow-lg p-6 text-white">
                  <h3 className="text-xl font-bold mb-3">Office Hours</h3>
                  <div className="space-y-2 text-emerald-50">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Response</h3>
                  <p className="text-gray-600">
                    We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
