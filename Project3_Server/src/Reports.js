class Report {
    constructor(db = null) {
        this.db = db;
        this.zClear = false;
    }

    async XReportData() {
        const now = new Date();
        console.log(this.zClear);
        if (this.zClear) {
            console.log("Z-Report cleared data");
            this.zClear = false;
            return { hour: -1, sales: -1 };
        }
        let hour = now.getHours();
        const hours = new Array();
        const sales = new Array();
        if (hour < 10) {
            console.log("Invalid start time");
            return { hour: -1, sales: -1 };
        }
        if (!this.db) {
            console.log("No database connection");
            return { hour: -1, sales: -1 };
        }
        if (hour == 23) {
            hour--;
        }

        while (hour >= 10) {
            hours.push(hour);
            sales.push(0);
            hour--;
        }

        const data = [];
        try {
            // const q = 'SELECT time FROM transactions WHERE time BETWEEN \'' + this.HourToSQLTime(hours[0]) + '\' AND \'' + this.HourToSQLTime(hours[hours.length - 1]) + '\' ORDER BY time ASC';
            const q = 'SELECT time FROM transactions WHERE time BETWEEN \'2020-1-1 10:00:00\' AND \'2020-1-1 20:00:00\' ORDER BY time ASC';
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("No transactions during this time");
                return { hour: -1, sales: -1 };
            }
            for (const row of result.rows) {
                // The time is ahead by 7 hours and I have no idea why. This weird indexing is becauce 10 is always the first hour of operation
                if (parseInt(JSON.stringify(row.time).substring(12, 14), 10) > 8) {
                    sales[parseInt(JSON.stringify(row.time).substring(12, 14), 10) - 17] = sales[parseInt(JSON.stringify(row.time).substring(12, 14), 10) - 17] + 1;
                }
                else {
                    sales[parseInt(JSON.stringify(row.time).substring(12, 14), 10) + 7] = sales[parseInt(JSON.stringify(row.time).substring(12, 14), 10) + 7] + 1;
                }
            }

            for (let i = 0; i < hours.length; i++) {
                data.push({ sales: sales[hours.length - i - 1], hour: hours[i] });
            }
        } catch (err) {
            console.log("error");
            return { hour: -1, sales: -1 };
        }
        return data;
    }

    async ZReportData() {
        const data = await this.XReportData();
        this.zClear = true;
        return data;
    }

    async RestockReportData() {
        const data = [];
        try {
            const q = 'SELECT inventoryid, items, quantity from inventory WHERE quantity > minstock ORDER BY quantity ASC';
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("No items need restocking");
                return { itemid: -1, name: -1, quantity: -1 };
            }
            for (const row of result.rows) {
                data.push({ itemid: row.inventoryid, name: row.items, quantity: row.quantity });
            }
        } catch (err) {
            console.log("Error getting data");
            return { itemid: -1, name: -1, quantity: -1 };
        }
        return data;
    }

    async ProductUsageReportData(startTime, endTime) {
        const data = [];
        try {
            // const q = 'SELECT i.inventoryid, i.items, COUNT(inventoryitem) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.trayid = tr.trayid INNER JOIN menu AS m ON tr.menuid = m.menuid, UNNEST(inventoryids) AS inventoryitem INNER JOIN inventory AS i ON i.inventoryid = inventoryitem WHERE t.time BETWEEN \'' + startTime + '\' AND \'' + endTime + '\' GROUP BY i.inventoryid, i.items ORDER BY COUNT(inventoryitem) DESC';
            const q = 'SELECT i.inventoryid, i.items, COUNT(inventoryitem) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.trayid = tr.trayid INNER JOIN menu AS m ON tr.menuid = m.menuid, UNNEST(inventoryids) AS inventoryitem INNER JOIN inventory AS i ON i.inventoryid = inventoryitem WHERE t.time BETWEEN \'2025-01-01 10:00:00\' AND \'2025-12-01 20:00:00\' GROUP BY i.inventoryid, i.items ORDER BY COUNT(inventoryitem) DESC';
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("No items need restocking");
                return { inventoryid: -1, name: -1, sales: -1 };
            }
            for (const row of result.rows) {
                data.push({ inventoryid: row.inventoryid, name: row.items, sales: row.occurrence_count });
            }
        } catch (err) {
            console.log("Invalid input data");
            return { inventoryid: -1, name: -1, sales: -1 };
        }
        return data;
    }

    async SalesReportData(startTime, endTime) {
        const data = [];
        try {
            // const q = 'SELECT m.menuid, m.name, COUNT(tr.menuid) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.trayid = tr.trayid INNER JOIN menu AS m ON tr.menuid = m.menuid WHERE t.time BETWEEN \'' + startTime + '\' AND \'' + endTime + '\' GROUP BY m.menuid, m.name ORDER BY COUNT(tr.menuid) DESC';
            const q = 'SELECT m.menuid, m.name, COUNT(tr.menuid) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.trayid = tr.trayid INNER JOIN menu AS m ON tr.menuid = m.menuid WHERE t.time BETWEEN \'2025-01-01 10:00:00\' AND \'2025-12-01 20:00:00\' GROUP BY m.menuid, m.name ORDER BY COUNT(tr.menuid) DESC';
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("No items need restocking");
                return { menuid: -1, name: -1, sales: -1 };
            }
            for (const row of result.rows) {
                data.push({ menuid: row.menuid, name: row.name, sales: row.occurrence_count });
            }
        } catch (err) {
            console.log("Invalid input data");
            return { menuid: -1, name: -1, sales: -1 };
        }
        return data;
    }

    HourToSQLTime(hour) {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${hour}:00:00`;
    }
}

export { Report };
