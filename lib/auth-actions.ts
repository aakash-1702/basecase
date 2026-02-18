// lib/auth-actions.ts (or app/actions/auth.ts)
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const signUp = async (name: string, email: string, password: string) => {
  try {
    const data = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: "/dashboard",
      },
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signup failed",
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const data = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    };
  }
};


