// See https://svelte.dev/docs/kit/types#app.d.ts

import type { JWTPayload } from "jose";

declare global {
  interface UserData {
    id: string;
    email: string;
  }

  // Interesting note, jose adds in iat and exp for you when it returns the payload. so having their types like this is most accurate.

  // You gotta put extends JWTPayload for it to work with jose without TS bitching about it
  interface AccessTokenPayload extends JWTPayload {
    sub: string; // subject: claim that uniquely identifies the user/entity that the JWT is about. in this case, user ID
    iat?: number; // issued at
    exp?: number; // expires at (i think)

    // standard JWT claims (optional, depending on what you need). I'm leaving them here for learning purposes but I don't use them at all.
    // email?: string;
    // role?: string;
  }

  interface RefreshTokenPayload extends JWTPayload {
    sub: string;
    iat?: number;
    exp?: number;

    // tokenVersion: number;
  }

  namespace App {
    // interface Error {}
    interface Locals {
      jwt: { sub?: string } | null;

      // for demonstration purposes
      accessTokenActive: boolean;
      refreshTokenActive: boolean;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
