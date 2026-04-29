#!/usr/bin/env node

/**
 * Fetches the stock change percentage from Yahoo Finance for a given range.
 * 
 * Usage:
 * node get_performance.js <ticker> <range>
 * 
 * Example:
 * node get_performance.js AAPL 5d
 * node get_performance.js AAPL 1mo
 */

const https = require('https');

async function getPerformance() {
  const ticker = process.argv[2];
  const range = process.argv[3] || '5d';
  
  if (!ticker) {
    console.error('Usage: node get_performance.js <ticker> <range>');
    console.error('Supported ranges: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max');
    process.exit(1);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}?range=${range}&interval=1d`;

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
          console.error(`Error: Could not find "${range}" data for ticker "${ticker}".`);
          process.exit(1);
        }

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const closePrices = result.indicators.quote[0].close;
        
        // Find the first valid starting price in the range
        let startPrice = null;
        for (let i = 0; i < closePrices.length; i++) {
          if (closePrices[i] !== null && closePrices[i] !== undefined) {
            startPrice = closePrices[i];
            break;
          }
        }

        if (startPrice === null) {
          console.error(`Error: Historical price data is incomplete for "${ticker}".`);
          process.exit(1);
        }

        const changePercent = ((currentPrice - startPrice) / startPrice) * 100;

        console.log(`Symbol: ${meta.symbol}`);
        console.log(`Current Price: ${currentPrice.toFixed(2)} ${meta.currency}`);
        console.log(`Range: ${range}`);
        console.log(`Start Price (at beginning of range): ${startPrice.toFixed(2)}`);
        console.log(`Change: ${changePercent.toFixed(2)}%`);
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

getPerformance();
