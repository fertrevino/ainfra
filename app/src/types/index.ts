// import type { User } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  profile_picture_url?: string; // Optional field for user profile picture
}

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
}

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudCredentials {
  id: string;
  user_id: string;
  provider: CloudProvider;
  name: string;
  credentials: {
    // AWS
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;

    // Azure
    subscriptionId?: string;
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;

    // Google Cloud
    projectId?: string;
    keyFile?: string; // JSON key content
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TabType = 'chat' | 'diagrams' | 'settings' | 'cloud';

// export type { User };
