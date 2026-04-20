---
name: stock-price-checker
description: Fetches the latest stock price and daily change percentage for a given ticker symbol. Use when the user asks for current market data, stock prices, or performance of a specific symbol (e.g., "What is the price of AAPL?").
---

# Stock Price Checker

This skill provides a simple way to get real-time stock information for any ticker symbol using Yahoo Finance.

## Workflow

1. Identify the ticker symbol from the user's request (e.g., "AAPL" for Apple, "TSLA" for Tesla).
2. Execute the `get_stock_info.js` script with the ticker symbol as an argument.
3. Report the symbol, price, and percentage change to the user.

## Example

**User:** "How is Nvidia doing today?"
**Action:** `node scripts/get_stock_info.js NVDA`
**Output:**
```
Symbol: NVDA
Price: 450.12 USD
Change: 2.84%
```

## Bundled Resources

- **scripts/get_stock_info.js**: A Node.js script that fetches data from Yahoo Finance's chart API.
