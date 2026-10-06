// Editor-only typings for the Deno globals used by the Edge Functions, so VS Code
// type-checks them without the Deno extension. Supabase runs the functions on Deno,
// which supplies the real types; this file is never imported or deployed.
declare namespace Deno {
  const env: { get(key: string): string | undefined };
  function serve(handler: (req: Request) => Response | Promise<Response>): void;
}
