---
name: stock-trading-day-checker
description: Checks if a given date is a stock market trading day (NYSE). Use when the user asks if the market is open on a specific date, or if today is a trading day.
---

# Stock Trading Day Checker

This skill determines if a specific date is a valid trading day for the New York Stock Exchange (NYSE), accounting for weekends and market holidays.

## Workflow

1. Identify the date to check (defaults to today).
2. Run `node scripts/check_trading_day.js [YYYY-MM-DD]`.
3. Report whether it is a trading day and any reasons for closure (Weekend or Holiday).

## Example

**User:** "Is the stock market open today?"
**Action:** `node scripts/check_trading_day.js`
**Output:** `false`

**User:** "Was the market open on Christmas 2025?"
**Action:** `node scripts/check_trading_day.js 2025-12-25`
**Output:** `false`
