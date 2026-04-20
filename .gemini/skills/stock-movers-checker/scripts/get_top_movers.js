#!/usr/bin/env node

/**
 * Fetches today's top stock movers (gainers and losers) from Yahoo Finance.
 * 
 * Usage:
 * node get_top_movers.js [type] [count]
 * 
 * type: 'gainers' (default) or 'losers'
 * count: number of results (default 10)
 */

const https = require('https');

async function getTopMovers() {
  const type = process.argv[2] === 'losers' ? 'losers' : 'gainers';
  const count = parseInt(process.argv[3]) || 10;
  
  const scrId = type === 'losers' ? 'day_losers' : 'day_gainers';
  const url = `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=${scrId}`;

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
        const result = json.finance.result && json.finance.result[0];

        if (!result || !result.quotes) {
          console.error(`Error: Could not fetch top ${type} data.`);
          process.exit(1);
        }

        const movers = result.quotes.slice(0, count);

        console.log(`Top ${movers.length} Day ${type.charAt(0).toUpperCase() + type.slice(1)}:`);
        console.log('----------------------------');
        movers.forEach((stock, index) => {
          const symbol = stock.symbol;
          const name = stock.shortName || stock.longName || 'N/A';
          const price = stock.regularMarketPrice;
          const changePercent = stock.regularMarketChangePercent;
          const currency = stock.currency;

          const sign = changePercent > 0 ? '+' : '';
          console.log(`${index + 1}. ${symbol} (${name}): ${sign}${changePercent.toFixed(2)}%`);
        });
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

getTopMovers();
