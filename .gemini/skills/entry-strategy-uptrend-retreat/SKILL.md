---
name: entry-strategy-uptrend-retreat
description: Identifies potential buy opportunities for stocks in an uptrend that are experiencing a short-term pullback to support levels. Use when the user wants to find "buy the dip" entries in strong stocks.
---

# Entry Strategy: Uptrend Retreat

This strategy identifies stocks in a strong long-term uptrend (50DMA > 200DMA) that are currently experiencing a short-term pullback to key moving average support (20DMA or 50DMA).

## Usage

This skill includes an automated batch script to scan all CSV watchlists in the `watchlist/` directory.

### Scripts

- `scripts/batch_checker.js`: Executes the complete 3-step strategy workflow across all watchlists.

#### Example

```bash
node scripts/batch_checker.js
```

## Strategy Workflow

1.  **De-duplicated Watchlist:** Dynamically read all unique stock symbols from the `watchlist/` directory.
2.  **Long-term Uptrend Validation:** Filter for stocks where the 50-day Moving Average (50DMA) is greater than the 200-day Moving Average (200DMA).
3.  **Short-term Pullback Identification:** Select stocks that meet the following criteria:
    *   **Support Level:** Current price is within 2% of either the 20-day MA or the 50-day MA.
    *   **Moderate Momentum:** 5-day RSI is less than 50 (indicating a cooling off from overbought conditions).
4.  **Candidate Selection:** Return the final list of stocks meeting all criteria along with their technical indicators.
