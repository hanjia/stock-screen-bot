---
name: stock-movers-checker
description: Fetches today's top stock movers (day gainers and losers) in the stock market. Returns tickers, names, and percentage change. Use when the user asks for "top gainers", "top losers", "market movers", or "worst performing stocks today".
---

# Stock Movers Checker

This skill identifies the stocks with the greatest percentage gains or losses during the current or most recent trading day.

## Workflow

1. Execute the `get_top_movers.js` script.
2. Arguments:
   - `type`: 'gainers' (default) or 'losers'.
   - `count`: Number of results (default 10).
3. Report the list of movers to the user.

## Examples

**User:** "What are the top gainers today?"
**Action:** `node scripts/get_top_movers.js gainers 5`
**Output:**
```
Top 5 Day Gainers:
1. TSLA (Tesla, Inc.): +15.20%
2. ...
```

**User:** "Show me today's top losers."
**Action:** `node scripts/get_top_movers.js losers 5`
**Output:**
```
Top 5 Day Losers:
1. ...: -10.50%
```
