import { clearAuthCookies } from "$lib/server/jwtHandler.js";
import { redirect, type Actions } from "@sveltejs/kit";

export function load({ locals }) {
  return {
    accessTokenActive: locals.accessTokenActive,
    refreshTokenActive: locals.refreshTokenActive,
  };
}

export const actions: Actions = {
  default: async ({ cookies }) => {
    clearAuthCookies(cookies);
    redirect(303, "/");
  },
} satisfies Actions;
