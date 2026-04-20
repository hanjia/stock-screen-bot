#!/usr/bin/env node

/**
 * Fetches stock price and daily change percentage from Yahoo Finance.
 * 
 * Usage:
 * node get_stock_info.js AAPL
 */

const https = require('https');

async function getStockInfo() {
  const ticker = process.argv[2];
  
  if (!ticker) {
    console.error('Error: No ticker symbol provided.');
    process.exit(1);
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.toUpperCase()}`;

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

        if (!result) {
          console.error(`Error: Could not find data for ticker "${ticker}".`);
          process.exit(1);
        }

        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        const currency = meta.currency;
        const symbol = meta.symbol;

        const change = price - previousClose;
        const changePercent = (change / previousClose) * 100;

        console.log(`Symbol: ${symbol}`);
        console.log(`Price: ${price.toFixed(2)} ${currency}`);
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

getStockInfo();
