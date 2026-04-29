---
name: stock-performance-checker
description: Fetches the price change percentage for a stock ticker over various time ranges (e.g., 5d, 1mo, 1y). Use when the user asks for the performance, return, or price change of a stock over a specific period.
---

# Stock Performance Checker

This skill calculates the percentage change in a stock's price over a specified time range.

## Usage

Use the provided Node.js script to fetch performance data.

### Scripts

- `scripts/get_performance.js`: Fetches historical data and returns the percentage change for a given ticker and range.

#### Examples

```bash
# Get 5-day performance
node scripts/get_performance.js AAPL 5d

# Get 1-month performance
node scripts/get_performance.js AAPL 1mo

# Get year-to-date performance
node scripts/get_performance.js AAPL ytd

# Get 1-year performance
node scripts/get_performance.js AAPL 1y
```

## Supported Ranges

The following ranges are supported: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `10y`, `ytd`, `max`.

## How it works

The script queries Yahoo Finance for historical data over the requested range, identifies the first valid closing price in that period, and calculates the percentage change relative to the current market price.
