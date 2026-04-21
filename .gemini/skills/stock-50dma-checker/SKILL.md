---
name: stock-50dma-checker
description: Fetches the 50-day moving average (50DMA) for a given stock ticker. Use when the user asks for the long-term trend or the 50-day average price of a stock.
---

# Stock 50DMA Checker

This skill calculates the 50-day moving average (50DMA) of a stock's closing prices.

## Usage

Use the provided Node.js script to fetch and calculate the 50DMA for a ticker.

### Scripts

- `scripts/get_50dma.js`: Fetches historical data and returns the 50DMA.

#### Example

```bash
node scripts/get_50dma.js AAPL
```

## How it works

The script fetches the last 3 months of historical data from Yahoo Finance to ensure at least 50 trading days are available, then averages the 50 most recent closing prices.
