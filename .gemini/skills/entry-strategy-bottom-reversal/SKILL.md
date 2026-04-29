---
name: entry-strategy-bottom-reversal
description: Identifies potential buy opportunities for stocks at a support level showing reversal signals. Use when the user wants to find "bottom-fishing" or reversal entries from their watchlists.
---

# Entry Strategy: Bottom Reversal

This strategy identifies stocks that have recently declined but are now showing short-term reversal signals from a support level.

## Usage

This skill includes an automated batch script to scan all CSV watchlists in the `watchlist/` directory.

### Scripts

- `scripts/batch_checker.js`: Executes the complete 5-step strategy workflow across all watchlists.

#### Example

```bash
node scripts/batch_checker.js
```

## Strategy Workflow

1.  **De-duplicated Watchlist:** Dynamically read all unique stock symbols from the `watchlist/` directory.
2.  **Positive Daily Momentum:** Filter for stocks with a positive price change in the current trading session.
3.  **Prior Decline Confirmation:** Filter for stocks with negative performance over both the last 10 days and 1 month.
4.  **Moving Average Breakout:** Validate short-term trend reversal and support:
    *   **Breakout:** 5-day Moving Average (5DMA) must be greater than both the 20-day and 50-day MAs.
    *   **Support:** 20-day MA must be greater than 95% of the 50-day MA.
5.  **Candidate Selection:** Return the final list of stocks meeting all criteria along with their technical indicators.
