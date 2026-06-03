import "server-only";
import { cookies } from "next/headers";
import {
  MAX_AGE_SECONDS,
  SESSION_COOKIE,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "./jwt";

export { SESSION_COOKIE, type SessionPayload };

/** Cria o cookie de sessão (usar dentro de Server Actions / Route Handlers). */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Remove o cookie de sessão (logout). */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Lê a sessão atual a partir do cookie (Server Components / Actions). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Atalho para páginas que exigem usuário autenticado. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado");
  return session;
}
