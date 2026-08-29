import type { AuthProvider, AuthUser } from "@/lib/auth/provider";

/**
 * Production auth via Supabase — SCAFFOLD ONLY.
 *
 * The demo build uses `DemoAuthProvider`. To switch, implement the three methods
 * below against `@supabase/ssr` (browser + server clients already exist in
 * `lib/auth/supabase/`), map a Supabase user + `profiles` row to `AuthUser`, and
 * set `auth = new SupabaseAuthProvider()` in `lib/auth/session.ts`. No UI change.
 */
export class SupabaseAuthProvider implements AuthProvider {
  readonly name = "supabase" as const;

  async signIn(
    _identifier: string,
    _password: string,
  ): Promise<AuthUser | null> {
    void _identifier;
    void _password;
    throw new Error(
      "SupabaseAuthProvider not implemented — see lib/auth/supabase-provider.ts",
    );
  }

  async resolveSession(_token: string): Promise<AuthUser | null> {
    void _token;
    throw new Error("SupabaseAuthProvider not implemented");
  }

  issueSession(_user: AuthUser): string {
    void _user;
    throw new Error("SupabaseAuthProvider not implemented");
  }
}
