# Financer API Documentation

## Base URL
`/api`

---

## 1. Stock Data Proxy
**Endpoint:** `/api/stocks`
**Method:** `GET`
**Params:** 
- `tickers` (string, required): Comma-separated list of stock tickers.
**Returns:** 
- Object mapping tickers to current market prices.
**Example:** `/api/stocks?tickers=AAPL,MSFT,GOOGL`

---

## 2. User Data API
**Endpoint:** `/api/users`
**Method:** `GET`
**Required Params:**
- `user` (string): The name of the user.

### Actions:

#### A. Get User Holdings
**Query:** `/api/users?user={name}` or `/api/users?user={name}&action=holdings`
**Returns:** Array of holding objects for the specified user.

#### B. Get User Stock
**Query:** `/api/users?user={name}&action=stock&ticker={ticker}`
**Returns:** A single holding object for the specified ticker.

#### C. Get User Total Earnings
**Query:** `/api/users?user={name}&action=total`
**Returns:** 
- `user`: User's name.
- `totalEarningsUSD`: Total profit/loss in USD.
- `totalEarningsNIS`: Total profit/loss in NIS.
- `conversionRate`: The exchange rate used for calculation.
