import { SignJWT, jwtVerify } from "jose";
import type { Cookies } from "@sveltejs/kit";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "$env/static/private";
import { JWTClaimValidationFailed, JWTExpired, JWTInvalid } from "jose/errors";

// For an explanation of most concepts and implementations, take a look at explain.md on the same folder. It should answer most questions.

const ACCESS_TOKEN_DURATION = 60 * 15; // 15 minutes
const REFRESH_TOKEN_DURATION = 60 * 60 * 24 * 30; // 30 days

// You might be wondering... why encode to a UintArray? It's because cryptographic algorithms work on binary input not characters. So this is necessary
// Uint8Array = typed array of bytes, backed by an ArrayBuffer (raw memory buffer)
function getAccessTokenSecretKey(): Uint8Array<ArrayBuffer> {
  if (!ACCESS_TOKEN_SECRET)
    throw new Error(
      "JWT Access Token Secret is not set, set to a proper value",
    );

  return new TextEncoder().encode(ACCESS_TOKEN_SECRET);
}

function getRefreshTokenSecretKey(): Uint8Array<ArrayBuffer> {
  if (!REFRESH_TOKEN_SECRET)
    throw new Error(
      "JWT Refresh Token Secret is not set, set to a proper value",
    );

  return new TextEncoder().encode(REFRESH_TOKEN_SECRET);
}

export async function setAccessTokenAsync(
  cookies: Cookies,
  tokenData: AccessTokenPayload,
): Promise<void> {
  // We create the token, setting the algorithm to HS512 (decent option but there are better afaik)
  // Set the expiration time to the duration we said (in seconds)
  const token: string = await new SignJWT(tokenData)
    .setProtectedHeader({
      alg: "HS512",
    })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_DURATION}s`)
    .sign(getAccessTokenSecretKey());

  cookies.set("access_token", token, {
    path: "/",
    sameSite: "lax", // this is the default value i think
    secure: true, // hardcoding this but this should be true only in production. Read the description by hovering over the attribute, it explains itself.
    httpOnly: true, // now client-side js cannot access the cookie through "document.cookie" or whatever
    expires: new Date(Date.now() + ACCESS_TOKEN_DURATION * 1000),
  });
}

export async function setRefreshTokenAsync(
  cookies: Cookies,
  tokenData: RefreshTokenPayload,
) {
  const token: string = await new SignJWT(tokenData)
    .setProtectedHeader({
      alg: "HS512",
    })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_DURATION}s`)
    .sign(getRefreshTokenSecretKey());

  // Gonna be storing the refresh token on an http-only cookie, this is very common
  cookies.set("refresh_token", token, {
    path: "/",
    sameSite: "lax",
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + REFRESH_TOKEN_DURATION * 1000),
  });
}

export async function verifyAccessTokenAsync(
  token: string | undefined,
): Promise<AccessTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAccessTokenSecretKey());
    return payload as AccessTokenPayload;
  } catch (err) {
    // Keep in mind in most cases you don't actually care about what kind of error has occured, as you can just treat it as unauthenticated
    if (err instanceof JWTExpired) {
      console.log("Token has expired");
    } else if (err instanceof JWTInvalid) {
      console.log("Token is invalid");
    } else if (err instanceof JWTClaimValidationFailed) {
      console.warn("JWT claim validation failed", err);
    } else {
      console.warn("Some generic error idk: ", err);
    }

    return null;
  }
}

export async function verifyRefreshTokenAsync(
  token: string | undefined,
): Promise<RefreshTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getRefreshTokenSecretKey());
    return payload as RefreshTokenPayload;
  } catch (err) {
    // Keep in mind in most cases you don't actually care about what kind of error has occured, as you can just treat it as unauthenticated
    if (err instanceof JWTExpired) {
      console.log("Token has expired");
    } else if (err instanceof JWTInvalid) {
      console.log("Token is invalid");
    } else if (err instanceof JWTClaimValidationFailed) {
      console.warn("JWT claim validation failed", err);
    } else {
      console.warn("Some generic error idk: ", err);
    }

    return null;
  }
}

export function clearAuthCookies(cookies: Cookies): void {
  cookies.delete("access_token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });
}
