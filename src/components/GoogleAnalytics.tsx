import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const GoogleAnalytics = () => {
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    loadGASettings();
  }, []);

  const loadGASettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'google_analytics_id')
        .maybeSingle();

      if (data?.value) {
        setGaId(data.value);
      }
    } catch (error) {
      console.error('Error loading GA settings:', error);
    }
  };

  useEffect(() => {
    if (!gaId || gaId.trim() === '') return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(script2);

    return () => {
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
      if (script2.parentNode) {
        script2.parentNode.removeChild(script2);
      }
    };
  }, [gaId]);

  return null;
};
