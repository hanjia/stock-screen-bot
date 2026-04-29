---
name: stock-moving-average-checker
description: Fetches and calculates the moving average (DMA) for a stock ticker for any specified period (e.g., 5, 20, 50, 200 days). Use when the user asks for the trend or average price of a stock over a specific timeframe.
---

# Stock Moving Average Checker

This skill calculates the moving average (DMA) of a stock's closing prices for any user-specified period.

## Usage

Use the provided Node.js script to fetch historical data and calculate the moving average.

### Scripts

- `scripts/get_dma.js`: Fetches historical data and returns the DMA for a given ticker and period.

#### Examples

```bash
# Calculate 5-day moving average
node scripts/get_dma.js AAPL 5

# Calculate 20-day moving average
node scripts/get_dma.js AAPL 20

# Calculate 50-day moving average
node scripts/get_dma.js AAPL 50

# Calculate 200-day moving average
node scripts/get_dma.js AAPL 200
```

## How it works

The script automatically selects the appropriate historical data range from Yahoo Finance based on the requested period to ensure enough trading days are available for the calculation. It then averages the most recent closing prices for that period.
