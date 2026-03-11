const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://account-service:8082';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8084';

// Mock DB for transactions
const transactions = [];

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.post('/transactions/transfer', async (req, res) => {
    const { from_account_id, to_account_id, amount, user_id } = req.body;

    if (!from_account_id || !to_account_id || !amount || !user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Verify accounts exist and get source account balance (mocking a real transaction)
        const fromAccountRes = await axios.get(`${ACCOUNT_SERVICE_URL}/accounts/details/${from_account_id}`);
        const fromAccount = fromAccountRes.data;

        if (fromAccount.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        const toAccountRes = await axios.get(`${ACCOUNT_SERVICE_URL}/accounts/details/${to_account_id}`);
        
        // 2. Perform transfer (in a real system this would be a distributed transaction/saga)
        await axios.post(`${ACCOUNT_SERVICE_URL}/accounts/${from_account_id}/update_balance`, { amount: -amount });
        await axios.post(`${ACCOUNT_SERVICE_URL}/accounts/${to_account_id}/update_balance`, { amount: amount });

        // 3. Record transaction locally
        const txId = crypto.randomUUID();
        const txRecord = {
            id: txId,
            from_account_id,
            to_account_id,
            amount,
            status: 'COMPLETED',
            timestamp: new Date().toISOString()
        };
        transactions.push(txRecord);

        // 4. Send Notification (fire and forget for this mock)
        axios.post(`${NOTIFICATION_SERVICE_URL}/notify`, {
            user_id: user_id,
            message: `Transfer of $${amount} to ${to_account_id} completed successfully. TxID: ${txId}`
        }).catch(err => console.error("Failed to send notification:", err.message));

        res.status(200).json(txRecord);
    } catch (error) {
        console.error("Transfer failed:", error.message);
        res.status(500).json({ error: 'Transfer transaction failed', details: error.message });
    }
});

app.get('/transactions/:account_id', (req, res) => {
    const accountId = req.params.account_id;
    const accountTxs = transactions.filter(t => t.from_account_id === accountId || t.to_account_id === accountId);
    res.json(accountTxs);
});

const PORT = 8083;
app.listen(PORT, () => {
    console.log(`Transaction Service running on port ${PORT}`);
});
