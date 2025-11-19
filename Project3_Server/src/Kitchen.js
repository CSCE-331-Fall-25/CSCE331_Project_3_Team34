class Kitchen {
    constructor(db = null) {
        this.db = db;
    }

    async GetTransactions(stage) {
        // Obtain a mapping of transactions at the given stage
        if (!this.db || typeof this.db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM transactions WHERE stage = $1 ORDER BY time ASC';
        const res = await this.db.query(q, [stage]);
        if (!res || !res.rows) return [];

        return res.rows;
    }

    async UpdateStage(transactionID) {
        if (!this.db || typeof this.db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'UPDATE transactions SET stage = stage + 1 WHERE transactionid = $1';
        await this.db.query(q, [transactionID]);

        return true;
    }
}