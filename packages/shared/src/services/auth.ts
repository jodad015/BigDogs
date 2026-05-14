import type { AppSupabaseClient } from '../supabase/client';

interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

interface SignInInput {
  email: string;
  password: string;
}

export function createAuthService(client: AppSupabaseClient) {
  return {
    async signUp({ email, password, displayName }: SignUpInput) {
      return client.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
    },

    async signIn({ email, password }: SignInInput) {
      return client.auth.signInWithPassword({ email, password });
    },

    async signOut() {
      return client.auth.signOut();
    },

    async getSession() {
      return client.auth.getSession();
    },

    onAuthStateChange(callback: Parameters<typeof client.auth.onAuthStateChange>[0]) {
      return client.auth.onAuthStateChange(callback);
    },
  };
}
