import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'super_admin' | 'admin' | 'user';
          created_at: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          featured_image: string;
          sector_id: string | null;
          price: number;
          duration: string;
          level: string;
          published: boolean;
          seo_title: string;
          seo_description: string;
          seo_keywords: string;
          created_at: string;
          updated_at: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          display_order: number;
          created_at: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string;
          video_url: string;
          resources: Array<{ name: string; url: string }>;
          display_order: number;
          duration: number;
          created_at: string;
        };
      };
      sectors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          icon: string;
          display_order: number;
          created_at: string;
        };
      };
      news_articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          featured_image: string;
          author_id: string;
          published: boolean;
          published_at: string | null;
          seo_title: string;
          seo_description: string;
          seo_keywords: string;
          created_at: string;
          updated_at: string;
        };
      };
      static_pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          published: boolean;
          seo_title: string;
          seo_description: string;
          seo_keywords: string;
          created_at: string;
          updated_at: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
      };
      seo_settings: {
        Row: {
          id: string;
          page: string;
          title: string;
          description: string;
          keywords: string;
          og_image: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          certificate_id: string;
          user_id: string;
          course_id: string;
          issued_date: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at: string;
        };
      };
      registration_submissions: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          organization: string;
          message: string;
          created_at: string;
        };
      };
      media_uploads: {
        Row: {
          id: string;
          filename: string;
          file_path: string;
          file_type: string;
          file_size: number;
          uploaded_by: string;
          created_at: string;
        };
      };
    };
  };
};
