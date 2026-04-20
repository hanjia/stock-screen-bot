---
name: stock-1month-checker
description: Fetches the 1-month price change percentage for a given stock ticker. Use when the user asks for monthly performance or the 30-day trend of a stock.
---

# Stock 1-Month Checker

This skill calculates the percentage change of a stock over the last month.

## Workflow

1. Identify the ticker symbol.
2. Run `node scripts/get_1month_change.js <TICKER>`.
3. Report the 1-month percentage change.

## Example

**User:** "How has GOOGL performed over the last month?"
**Action:** `node scripts/get_1month_change.js GOOGL`
**Output:**
```
Symbol: GOOGL
Current Price: 175.20 USD
1-Month Change: +5.30%
```
