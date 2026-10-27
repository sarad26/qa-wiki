import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const creds = Netlify.env.get("BASIC_AUTH");
  if (!creds) return new Response("Not configured", { status: 500 });

  const sent = request.headers.get("authorization") || "";
  if (sent === "Basic " + btoa(creds)) {
    return context.next();
  }

  return new Response("Login required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="QA Wiki"' },
  });
};

export const config = { path: "/*" };