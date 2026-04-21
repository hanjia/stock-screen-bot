---
name: stock-20dma-checker
description: Fetches the 20-day moving average (20DMA) for a given stock ticker. Use when the user asks for the medium-term trend or the 20-day average price of a stock.
---

# Stock 20DMA Checker

This skill calculates the 20-day moving average (20DMA) of a stock's closing prices.

## Usage

Use the provided Node.js script to fetch and calculate the 20DMA for a ticker.

### Scripts

- `scripts/get_20dma.js`: Fetches historical data and returns the 20DMA.

#### Example

```bash
node scripts/get_20dma.js AAPL
```

## How it works

The script fetches the last month of historical data from Yahoo Finance to ensure at least 20 trading days are available, then averages the 20 most recent closing prices.
