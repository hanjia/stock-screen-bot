---
name: stock-5day-checker
description: Fetches the 5-day price change percentage for a given stock ticker. Use when the user asks for weekly performance or the 5-day trend of a stock.
---

# Stock 5-Day Checker

This skill calculates the percentage change of a stock over the last 5 trading days.

## Workflow

1. Identify the ticker symbol.
2. Run `node scripts/get_5day_change.js <TICKER>`.
3. Report the 5-day percentage change.

## Example

**User:** "How has MSFT performed over the last 5 days?"
**Action:** `node scripts/get_5day_change.js MSFT`
**Output:**
```
Symbol: MSFT
Current Price: 420.50 USD
5-Day Change: +1.25%
```
