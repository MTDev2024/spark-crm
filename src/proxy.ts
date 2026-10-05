import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * Point d'entrée de la protection des pages (convention « proxy » de Next.js 16,
 * ancien « middleware »). Toute la logique est dans lib/supabase/session.ts.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Toutes les pages, sauf fichiers statiques et images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
