#!/usr/bin/env node

/**
 * Fetches the 5-day stock change percentage from Yahoo Finance.
 * 
 * Usage:
 * node get_5day_change.js AAPL
 */

const https = require('https');

async function get5DayChange() {
  const ticker = process.argv[2];
  
  if (!ticker) {
    console.error('Error: No ticker symbol provided.');
    process.exit(1);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}?range=5d&interval=1d`;

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
          console.error(`Error: Could not find 5-day data for ticker "${ticker}".`);
          process.exit(1);
        }

        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        
        // The first element in indicators.quote[0].close is the close price from 5 trading days ago (or the start of the range)
        const closePrices = result.indicators.quote[0].close;
        const startPrice = closePrices[0];

        if (startPrice === undefined || startPrice === null) {
          console.error(`Error: Historical price data is incomplete for "${ticker}".`);
          process.exit(1);
        }

        const changePercent = ((currentPrice - startPrice) / startPrice) * 100;

        console.log(`Symbol: ${meta.symbol}`);
        console.log(`Current Price: ${currentPrice.toFixed(2)} ${meta.currency}`);
        console.log(`5-Day Change: ${changePercent.toFixed(2)}%`);
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

get5DayChange();
