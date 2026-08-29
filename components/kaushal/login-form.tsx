"use client";

import { useActionState } from "react";

import { signIn, type SignInState } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="identifier" className="text-sm font-medium">
          Username
        </label>
        <input
          id="identifier"
          name="identifier"
          autoComplete="username"
          defaultValue=""
          placeholder="e.g. student"
          className="border-border bg-background focus:border-primary mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="border-border bg-background focus:border-primary mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none"
        />
      </div>
      {state.error ? (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
