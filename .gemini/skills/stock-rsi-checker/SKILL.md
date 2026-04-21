---
name: stock-rsi-checker
description: Fetches and calculates the 5-day Relative Strength Index (RSI) for a given stock ticker. Use when the user asks for momentum indicators or the RSI of a stock.
---

# Stock RSI Checker

This skill calculates the 5-day Relative Strength Index (RSI) of a stock using Wilder's smoothing method.

## Usage

Use the provided Node.js script to fetch and calculate the RSI for a ticker.

### Scripts

- `scripts/get_rsi.js`: Fetches historical data and returns the 5-day RSI.

#### Example

```bash
node scripts/get_rsi.js AAPL
```

## How it works

The script fetches the last month of historical data from Yahoo Finance, calculates daily price changes, and applies Wilder's smoothing method to determine the Relative Strength (RS) and finally the RSI.
