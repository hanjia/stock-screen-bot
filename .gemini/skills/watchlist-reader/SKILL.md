---
name: watchlist-reader
description: Reads a CSV file from the watchlist directory and extracts the values from the "Symbol" column. Use this skill when you need to retrieve the list of stock symbols from a watchlist file.
---

# Watchlist Reader

This skill provides a script to read stock symbols from a CSV watchlist.

## Usage

Use the provided Node.js script to extract symbols from the "Symbol" column of a CSV file.

### Scripts

- `scripts/read_watchlist.js`: Reads a CSV file and returns a JSON array of strings from the "Symbol" column.

#### Example

```bash
node scripts/read_watchlist.js watchlist/current.csv
```

## Expected CSV Format

The CSV file should have a header row with at least a "Symbol" column.

Example:
```csv
Symbol
AAPL
AMZN
GOOG
```
