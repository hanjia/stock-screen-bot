---
name: stock-5dma-checker
description: Fetches the 5-day moving average (5DMA) for a given stock ticker. Use when the user asks for the short-term trend or the 5-day average price of a stock.
---

# Stock 5DMA Checker

This skill calculates the 5-day moving average (5DMA) of a stock's closing prices.

## Usage

Use the provided Node.js script to fetch and calculate the 5DMA for a ticker.

### Scripts

- `scripts/get_5dma.js`: Fetches historical data and returns the 5DMA.

#### Example

```bash
node scripts/get_5dma.js AAPL
```

## How it works

The script fetches the last 10 days of historical data from Yahoo Finance to ensure at least 5 trading days are available, then averages the 5 most recent closing prices.
