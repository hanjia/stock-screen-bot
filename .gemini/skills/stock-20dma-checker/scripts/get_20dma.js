#!/usr/bin/env node

/**
 * Fetches the 20-day moving average (20DMA) for a stock ticker from Yahoo Finance.
 * 
 * Usage:
 * node get_20dma.js AAPL
 */

const https = require('https');

async function get20DMA() {
  const ticker = process.argv[2];
  
  if (!ticker) {
    console.error('Error: No ticker symbol provided.');
    process.exit(1);
  }

  // We request 1 month to ensure we have at least 20 valid closing prices
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}?range=1mo&interval=1d`;

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
        
        if (closePrices.length < 20) {
          console.error(`Error: Not enough data to calculate 20DMA for "${ticker}". Only found ${closePrices.length} days.`);
          process.exit(1);
        }

        // Get the last 20 closing prices
        const last20 = closePrices.slice(-20);
        const sum = last20.reduce((acc, price) => acc + price, 0);
        const dma20 = sum / 20;

        const meta = result.meta;
        console.log(`Symbol: ${meta.symbol}`);
        console.log(`Current Price: ${meta.regularMarketPrice.toFixed(2)} ${meta.currency}`);
        console.log(`20-Day Moving Average (20DMA): ${dma20.toFixed(2)} ${meta.currency}`);
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

get20DMA();
