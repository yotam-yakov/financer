import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get('tickers')?.split(',') || [];

  if (tickers.length === 0) {
    return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
  }

  try {
    const priceUpdates = {};
    
    // Fetch prices in parallel on the server
    await Promise.all(tickers.map(async (ticker) => {
      try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        const meta = json.chart.result[0].meta;
        priceUpdates[ticker] = {
          currentPrice: meta.regularMarketPrice,
          previousClose: meta.previousClose
        };
      } catch (e) {
        console.error(`Server-side fetch error for ${ticker}:`, e);
      }
    }));

    return NextResponse.json(priceUpdates);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
