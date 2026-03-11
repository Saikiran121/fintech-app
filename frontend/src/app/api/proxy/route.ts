import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { path, body, method = "POST" } = await req.json();

  let targetUrl = "";
  if (path.startsWith("/register") || path.startsWith("/login") || path.startsWith("/verify")) {
    targetUrl = `http://user-service:8081${path}`;
  } else if (path.startsWith("/accounts")) {
    targetUrl = `http://account-service:8082${path}`;
  } else if (path.startsWith("/transactions")) {
    targetUrl = `http://transaction-service:8083${path}`;
  }

  if (!targetUrl) return NextResponse.json({ error: "Invalid path" }, { status: 400 });

  try {
    const res = await fetch(targetUrl, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });
    
    let data = {};
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch(e) { data = { message: text }; }
    }
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  
  if (!path) return NextResponse.json({ error: "Path required" }, { status: 400 });

  let targetUrl = "";
  if (path.startsWith("/users/")) {
    targetUrl = `http://user-service:8081${path}`;
  } else if (path.startsWith("/accounts/")) {
    targetUrl = `http://account-service:8082${path}`;
  } else if (path.startsWith("/transactions/")) {
    targetUrl = `http://transaction-service:8083${path}`;
  }

  try {
    const res = await fetch(targetUrl);
    let data = {};
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch(e) { data = { message: text }; }
    }
    
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
