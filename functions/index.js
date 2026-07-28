const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.manageUsers = functions.https.onRequest(async (req, res) => {
  const { user, ticker, action } = req.query;
  const method = req.method;

  try {
    if (method === 'GET') {
      if (!user) {
        const snapshot = await db.collection('users').get();
        return res.json(snapshot.docs.map(doc => doc.data().name));
      }

      if (user.toLowerCase() === 'all') {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => doc.data());

        if (action === 'total') {
          let totalUSD = 0;
          users.forEach(u => {
            u.holdings.forEach(h => {
              totalUSD += (h.shares * (h.currentPrice - h.avgPrice));
            });
          });

          let conversionRate = 3.7;
          try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const rateData = await response.json();
            if (rateData && rateData.rates && rateData.rates.ILS) {
              conversionRate = rateData.rates.ILS;
            }
          } catch (e) {
            console.error('Conversion rate fetch failed, using fallback');
          }

          return res.json({
            user: 'All Users',
            totalEarningsUSD: totalUSD,
            totalEarningsNIS: totalUSD * conversionRate,
            conversionRate: conversionRate
          });
        }

        if (action === 'history') {
          const allHistory = [];
          users.forEach(u => {
            u.history.forEach(h => {
              allHistory.push({ ...h, user: u.name });
            });
          });
          return res.json(allHistory);
        }

        const combined = {};
        users.forEach(u => {
          u.holdings.forEach(h => {
            if (!combined[h.ticker]) {
              combined[h.ticker] = { ...h };
            } else {
              const current = combined[h.ticker];
              const totalShares = current.shares + h.shares;
              const totalCost = (current.shares * current.avgPrice) + (h.shares * h.avgPrice);
              current.shares = totalShares;
              current.avgPrice = totalCost / totalShares;
            }
          });
        });
        return res.json(Object.values(combined));
      }

      const userDoc = await db.collection('users').doc(user.toLowerCase()).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      if (!action || action === 'holdings') {
        return res.json(userData.holdings);
      }

      if (action === 'history') {
        return res.json(userData.history.map(h => ({ ...h, user: userData.name })));
      }

      if (action === 'stock') {
        if (!ticker) {
          return res.status(400).json({ error: 'Ticker parameter is required for stock action' });
        }
        const stock = userData.holdings.find(h => h.ticker.toUpperCase() === ticker.toUpperCase());
        if (!stock) {
          return res.status(404).json({ error: 'Stock not found for this user' });
        }
        return res.json(stock);
      }

      if (action === 'total') {
        const totalUSD = userData.holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice - h.avgPrice)), 0);
        let conversionRate = 3.7;
        try {
          const response = await fetch('https://open.er-api.com/v6/latest/USD');
          const rateData = await response.json();
          if (rateData && rateData.rates && rateData.rates.ILS) {
            conversionRate = rateData.rates.ILS;
          }
        } catch (e) {
          console.error('Conversion rate fetch failed, using fallback');
        }
        return res.json({
          user: userData.name,
          totalEarningsUSD: totalUSD,
          totalEarningsNIS: totalUSD * conversionRate,
          conversionRate: conversionRate
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    if (method === 'POST') {
      const body = req.body;
      if (body.name && !body.type) {
        const name = body.name.trim();
        const userRef = db.collection('users').doc(name.toLowerCase());
        const doc = await userRef.get();
        if (doc.exists) {
          return res.status(400).json({ error: 'User already exists' });
        }
        const newUser = { name, history: [], holdings: [] };
        await userRef.set(newUser);
        return res.json({ success: true, user: newUser });
      }

      const { user: userName, type, ticker: stockTicker, shares, price } = body;
      if (!userName || !type || !stockTicker || !shares || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const userRef = db.collection('users').doc(userName.toLowerCase());
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObj = userDoc.data();
      let holdings = userObj.holdings || [];
      let holdingIndex = holdings.findIndex(h => h.ticker.toUpperCase() === stockTicker.toUpperCase());
      let holding = holdings[holdingIndex];
      let transactionEarnings = null;

      if (type === 'buy') {
        if (!holding) {
          holding = { ticker: stockTicker.toUpperCase(), shares: 0, avgPrice: 0, currentPrice: price };
          holdings.push(holding);
        }
        const totalShares = holding.shares + shares;
        const totalCost = (holding.shares * holding.avgPrice) + (shares * price);
        holding.shares = totalShares;
        holding.avgPrice = totalCost / totalShares;
        holding.currentPrice = price;
      } else if (type === 'sell') {
        if (!holding || holding.shares < shares) {
          return res.status(400).json({ error: 'Insufficient shares to sell' });
        }
        const sellAvgPrice = holding.avgPrice;
        holding.shares -= shares;
        transactionEarnings = (price - sellAvgPrice) * shares;
        if (holding.shares === 0) {
          holdings = holdings.filter(h => h.ticker.toUpperCase() !== stockTicker.toUpperCase());
          holding = null;
        }
      } else {
        return res.status(400).json({ error: 'Invalid transaction type' });
      }

      const transaction = {
        date: new Date().toISOString().split('T')[0],
        type,
        ticker: stockTicker.toUpperCase(),
        shares,
        price,
        earnings: transactionEarnings
      };
      const history = userObj.history || [];
      history.push(transaction);

      await userRef.update({ holdings, history });
      return res.json({ success: true, holding });
    }

    if (method === 'PATCH') {
      const { oldName, newName } = req.body;
      if (!oldName || !newName) {
        return res.status(400).json({ error: 'Both oldName and newName are required' });
      }
      const oldUserRef = db.collection('users').doc(oldName.toLowerCase());
      const oldUserDoc = await oldUserRef.get();
      if (!oldUserDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const newNameTrimmed = newName.trim();
      const newUserRef = db.collection('users').doc(newNameTrimmed.toLowerCase());
      const newUserDoc = await newUserRef.get();
      if (newUserDoc.exists) {
        return res.status(400).json({ error: 'New name is already taken' });
      }
      const userData = oldUserDoc.data();
      userData.name = newNameTrimmed;
      await newUserRef.set(userData);
      await oldUserRef.delete();
      return res.json({ success: true, user: userData });
    }

    if (method === 'DELETE') {
      const userDelete = req.query.user;
      if (!userDelete) {
        return res.status(400).json({ error: 'User parameter is required' });
      }
      const userRef = db.collection('users').doc(userDelete.toLowerCase());
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      await userRef.delete();
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid method' });
  } catch (error) {
    console.error('Cloud Function Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
