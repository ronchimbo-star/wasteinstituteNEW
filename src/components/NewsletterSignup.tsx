import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewsletterSignupProps {
  variant?: 'inline' | 'banner';
  source?: string;
}

export default function NewsletterSignup({ variant = 'inline', source = 'website' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        source,
        status: 'active',
        bot_field: botField,
      });

    if (error) {
      if (error.code === '23505') {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${variant === 'banner' ? 'justify-center text-white' : 'text-emerald-700'}`}>
        <CheckCircle className="flex-shrink-0" size={24} />
        <p className="font-semibold">
          {firstName ? `Thanks, ${firstName}! ` : 'Thanks! '}
          You're subscribed to our newsletter.
        </p>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
        <div aria-hidden="true" style={{ display: 'none' }}>
          <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" value={botField} onChange={e => setBotField(e.target.value)} />
        </div>
        <input
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
        />
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
        {status === 'error' && (
          <p className="text-red-300 text-sm flex items-center gap-1 sm:col-span-3">
            <AlertCircle size={14} />
            {errorMessage}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div aria-hidden="true" style={{ display: 'none' }}>
        <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" value={botField} onChange={e => setBotField(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-0"
        />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <AlertCircle size={12} />
          {errorMessage}
        </p>
      )}
    </form>
  );
}
