---
name: entry-strategy-overpriced-short
description: Identifies potential opportunities to buy put options or short stocks that are technically overpriced and overextended. Use when the user wants to find shorting candidates.
---

# Entry Strategy: Overpriced Short

This strategy identifies stocks that are technically overextended to the upside and are likely due for a short-term correction.

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
2.  **Overbought RSI Check:** Filter for stocks where the 5-day Relative Strength Index (RSI) is greater than 70, indicating overbought conditions.
3.  **Price Extension Check:** Identify stocks that are significantly extended above their moving averages:
    *   Current price is more than **10% above** the 20-day Moving Average (20DMA).
    *   **OR** Current price is more than **15% above** the 50-day Moving Average (50DMA).
4.  **Candidate Selection:** Return the final list of stocks meeting all criteria along with their technical indicators.
