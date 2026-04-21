#!/usr/bin/env node

/**
 * Fetches the 5-day moving average (5DMA) for a stock ticker from Yahoo Finance.
 * 
 * Usage:
 * node get_5dma.js AAPL
 */

const https = require('https');

async function get5DMA() {
  const ticker = process.argv[2];
  
  if (!ticker) {
    console.error('Error: No ticker symbol provided.');
    process.exit(1);
  }

  // We request 10 days to ensure we have at least 5 valid closing prices (considering weekends/holidays)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}?range=10d&interval=1d`;

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  https.get(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const result = json.chart.result && json.chart.result[0];

        if (!result || !result.timestamp || result.timestamp.length === 0) {
          console.error(`Error: Could not find data for ticker "${ticker}".`);
          process.exit(1);
        }

        const closePrices = result.indicators.quote[0].close.filter(p => p !== null && p !== undefined);
        
        if (closePrices.length < 5) {
          console.error(`Error: Not enough data to calculate 5DMA for "${ticker}". Only found ${closePrices.length} days.`);
          process.exit(1);
        }

        // Get the last 5 closing prices
        const last5 = closePrices.slice(-5);
        const sum = last5.reduce((acc, price) => acc + price, 0);
        const dma5 = sum / 5;

        const meta = result.meta;
        console.log(`Symbol: ${meta.symbol}`);
        console.log(`Current Price: ${meta.regularMarketPrice.toFixed(2)} ${meta.currency}`);
        console.log(`5-Day Moving Average (5DMA): ${dma5.toFixed(2)} ${meta.currency}`);
        console.log(`Prices used: ${last5.map(p => p.toFixed(2)).join(', ')}`);
      } catch (error) {
        console.error('Error parsing response from Yahoo Finance.');
        console.error(error.message);
        process.exit(1);
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching data from Yahoo Finance:', error.message);
    process.exit(1);
  });
}

get5DMA();
