// Yeah so this function doesn't actually "verify", but for this example app it will do
export async function verifyUserAsync(
  email: string,
  password: string,
): Promise<UserData | null> {
  if (!email || !password) return null;

  return { id: crypto.randomUUID(), email: email } as UserData;
}
