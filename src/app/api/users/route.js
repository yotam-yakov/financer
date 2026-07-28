import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CLOUD_FUNCTION_URL = 'https://us-central1-yotam-yakov-project.cloudfunctions.net/manageUsers';

async function proxyRequest(request) {
  const { searchParams } = new URL(request.url);
  const url = new URL(CLOUD_FUNCTION_URL);
  
  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const method = request.method;
  const body = await request.json().catch(() => ({}));

  const response = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function GET(request) {
  return proxyRequest(request);
}

export async function POST(request) {
  return proxyRequest(request);
}

export async function PATCH(request) {
  return proxyRequest(request);
}

export async function DELETE(request) {
  return proxyRequest(request);
}
