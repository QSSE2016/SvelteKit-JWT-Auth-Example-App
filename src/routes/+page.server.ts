import {
  setAccessTokenAsync,
  setRefreshTokenAsync,
} from "$lib/server/jwtHandler";
import { verifyUserAsync } from "$lib/server/signInUser";
import { fail, redirect, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email: string = formData.get("email") as string;
    const password: string = formData.get("pass") as string;

    const user: UserData | null = await verifyUserAsync(email, password);
    if (!user) return fail(400, { message: "Please enter valid credentials" });

    // This is mostly for readability
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
    };

    await setAccessTokenAsync(cookies, accessPayload);
    await setRefreshTokenAsync(cookies, refreshPayload);

    redirect(303, "/main");
  },
} satisfies Actions;
