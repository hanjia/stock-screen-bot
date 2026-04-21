#!/usr/bin/env node

/**
 * Fetches and calculates the 5-day Relative Strength Index (RSI) for a stock ticker.
 * 
 * Usage:
 * node get_rsi.js AAPL
 */

const https = require('https');

async function getRSI() {
  const ticker = process.argv[2];
  const period = 5;
  
  if (!ticker) {
    console.error('Error: No ticker symbol provided.');
    process.exit(1);
  }

  // Fetching 1 month of data to have enough for smoothing
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
        
        if (closePrices.length <= period) {
          console.error(`Error: Not enough data for ${period}-day RSI for "${ticker}". Found ${closePrices.length} days.`);
          process.exit(1);
        }

        // Calculate changes
        const changes = [];
        for (let i = 1; i < closePrices.length; i++) {
          changes.push(closePrices[i] - closePrices[i - 1]);
        }

        let avgGain = 0;
        let avgLoss = 0;

        // Initial Average Gain/Loss (Simple Average of first 'period' changes)
        for (let i = 0; i < period; i++) {
          const change = changes[i];
          if (change > 0) avgGain += change;
          else avgLoss += Math.abs(change);
        }
        avgGain /= period;
        avgLoss /= period;

        // Wilder's Smoothing Method for subsequent values
        for (let i = period; i < changes.length; i++) {
          const change = changes[i];
          const currentGain = change > 0 ? change : 0;
          const currentLoss = change < 0 ? Math.abs(change) : 0;

          avgGain = (avgGain * (period - 1) + currentGain) / period;
          avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        }

        let rsi = 100;
        if (avgLoss !== 0) {
          const rs = avgGain / avgLoss;
          rsi = 100 - (100 / (1 + rs));
        } else if (avgGain === 0) {
          rsi = 50;
        }

        const meta = result.meta;
        console.log(`Symbol: ${meta.symbol}`);
        console.log(`Current Price: ${meta.regularMarketPrice.toFixed(2)} ${meta.currency}`);
        console.log(`5-Day RSI: ${rsi.toFixed(2)}`);
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

getRSI();
