import {
  setAccessTokenAsync,
  verifyAccessTokenAsync,
  verifyRefreshTokenAsync,
} from "$lib/server/jwtHandler";
import type { Cookies, Handle, RequestEvent } from "@sveltejs/kit";

const protectedRoutes = ["/main"];

async function tryRefresh(
  cookies: Cookies,
): Promise<AccessTokenPayload | null> {
  const refreshToken = cookies.get("refresh_token");
  if (!refreshToken) return null;

  const payload: RefreshTokenPayload | null =
    await verifyRefreshTokenAsync(refreshToken);
  if (!payload) return null;

  await setAccessTokenAsync(cookies, {
    sub: payload.sub,
  });

  return payload;
}

// This is completely optional and unrelated and only for the demo (also double work)
async function setLocalsForDemonstration(
  jwtPayload: AccessTokenPayload | null,
  event: RequestEvent<Record<string, never>, "/main" | "/" | null>,
) {
  const refreshToken = event.cookies.get("refresh_token");

  if (refreshToken) {
    const refreshPayload = await verifyRefreshTokenAsync(refreshToken);
    event.locals.refreshTokenActive = !!refreshPayload;
  }

  event.locals.accessTokenActive = !!jwtPayload;
}

// Called every time the svelte kit server gets a request
export const handle: Handle = async ({ event, resolve }) => {
  let jwtPayload: AccessTokenPayload | null = await verifyAccessTokenAsync(
    event.cookies.get("access_token"),
  );

  if (!jwtPayload) jwtPayload = await tryRefresh(event.cookies);

  event.locals.jwt = jwtPayload;

  await setLocalsForDemonstration(jwtPayload, event);

  const isProtected = protectedRoutes.some((r) =>
    event.url.pathname.startsWith(r),
  );

  // If route is protected and you don't have valid JWT, you're getting the boot (back to the sign in page you go)
  if (isProtected && !event.locals?.jwt?.sub) {
    return Response.redirect(new URL("/", event.url), 303);
  }

  // If you are trying to sign in but already have valid JWT, then redirect to the main page
  if (event.url.pathname === "/" && event.locals?.jwt?.sub) {
    return Response.redirect(new URL("/main", event.url), 303);
  }

  // btw it doesn't matter that much if you await this or not, but i heard best practice is to await for error catching purposes. so await i guess.
  return await resolve(event);
};
