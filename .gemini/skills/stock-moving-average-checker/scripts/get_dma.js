#!/usr/bin/env node

/**
 * Fetches the moving average (DMA) for a stock ticker from Yahoo Finance for a specified period.
 * 
 * Usage:
 * node get_dma.js <ticker> <period>
 * 
 * Example:
 * node get_dma.js AAPL 50
 */

const https = require('https');

async function getDMA() {
  const ticker = process.argv[2];
  const period = parseInt(process.argv[3], 10);
  
  if (!ticker || !period || isNaN(period)) {
    console.error('Usage: node get_dma.js <ticker> <period>');
    process.exit(1);
  }

  // Determine appropriate range based on period
  let range = '1mo';
  if (period > 20) range = '3mo';
  if (period > 60) range = '6mo';
  if (period > 120) range = '1y';
  if (period > 250) range = '2y';

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
          console.error(`Error: Could not find data for ticker "${ticker}".`);
          process.exit(1);
        }

        const closePrices = result.indicators.quote[0].close.filter(p => p !== null && p !== undefined);
        
        if (closePrices.length < period) {
          console.error(`Error: Not enough data to calculate ${period}DMA for "${ticker}". Only found ${closePrices.length} days. Try a longer period or check the ticker.`);
          process.exit(1);
        }

        // Get the last 'period' closing prices
        const lastPeriod = closePrices.slice(-period);
        const sum = lastPeriod.reduce((acc, price) => acc + price, 0);
        const dma = sum / period;

        const meta = result.meta;
        console.log(`Symbol: ${meta.symbol}`);
        console.log(`Current Price: ${meta.regularMarketPrice.toFixed(2)} ${meta.currency}`);
        console.log(`${period}-Day Moving Average (${period}DMA): ${dma.toFixed(2)} ${meta.currency}`);
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

getDMA();
