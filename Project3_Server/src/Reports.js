class Report {
    constructor(db = null) {
        this.db = db;
    }

    async XReportData() {
        const now = new Date();
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
            const q = 'SELECT time FROM transactions WHERE stage = 1 ORDER BY time ASC';
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("No transactions during this time");
                return { hour: 0, sales: 0 };
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
        const q = 'UPDATE transactions SET stage = 0';
        try {
            await this.db.query(q);
        }
        catch (err) {
            console.log("Error clearing recent flags");
            return { hour: -1, sales: -1 };
        }
        return data;
    }

    async RestockReportData() {
        const data = [];
        try {
            const q = 'SELECT inventoryid, items, quantity from inventory WHERE quantity < minstock ORDER BY quantity ASC';
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("No items need restocking");
                return { itemid: 0, name: 0, quantity: 0 };
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
        const now = new Date();
        let realStartTime = this.parseTime(startTime);
        let realEndTime = this.parseTime(endTime);
        let code = 0;
        try {
            if (!isNaN(realStartTime)) {
                if (realStartTime == 0) {
                    startTime = `${startTime}${now.getFullYear()}`;
                    realStartTime = this.parseTime(startTime);
                    code += 512;
                }
                if (realStartTime == 1) {
                    startTime = `${startTime}-${now.getMonth() + 1}`;
                    realStartTime = this.parseTime(startTime);
                    code += 256;
                }
                if (realStartTime == 3) {
                    startTime = `${startTime}-${now.getDate()}`;
                    realStartTime = this.parseTime(startTime);
                    code += 128;
                }
                if (realStartTime == 7) {
                    startTime = `${startTime} 00`;
                    realStartTime = this.parseTime(startTime);
                    code += 64;
                }
                if (realStartTime == 15) {
                    startTime = `${startTime}:00`;
                    realStartTime = this.parseTime(startTime);
                    code += 32;
                }
            }
            if (!isNaN(realEndTime)) {
                if (realEndTime == 0) {
                    endTime = `${endTime}${now.getFullYear()}`;
                    realEndTime = this.parseTime(endTime);
                    code += 16;
                }
                if (realEndTime == 1) {
                    endTime = `${endTime}-${now.getMonth() + 1}`;
                    realEndTime = this.parseTime(endTime);
                    code += 8;
                }
                if (realEndTime == 3) {
                    endTime = `${endTime}-${now.getDate()}`;
                    realEndTime = this.parseTime(endTime);
                    code += 4;
                }
                if (realEndTime == 7) {
                    endTime = `${endTime} 23`;
                    realEndTime = this.parseTime(endTime);
                    code += 2;
                }
                if (realEndTime == 15) {
                    endTime = `${endTime}:59`;
                    realEndTime = this.parseTime(endTime);
                    code++;
                }
            }

            const q = 'SELECT i.inventoryid, i.items, COUNT(inventoryitem) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.orderid = tr.orderid INNER JOIN menu AS m ON tr.menuid = m.menuid, UNNEST(inventoryids) AS inventoryitem INNER JOIN inventory AS i ON i.inventoryid = inventoryitem WHERE t.time BETWEEN \'' + realStartTime + '\' AND \'' + realEndTime + '\' GROUP BY i.inventoryid, i.items ORDER BY COUNT(inventoryitem) DESC';
            console.log(q);
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("Empty query");
                code += 1024
                return { inventoryid: 0, name: 0, sales: 0, code: code };
            }
            for (const row of result.rows) {
                data.push({ inventoryid: row.inventoryid, name: row.items, sales: row.occurrence_count, code: code });
            }
        } catch (err) {
            console.log("Invalid input data" + err);
            code += 2048;
            return { inventoryid: -1, name: -1, sales: -1, code: code };
        }
        return data;
    }

    async SalesReportData(startTime, endTime) {
        const data = [];
        const now = new Date();
        let realStartTime = this.parseTime(startTime);
        let realEndTime = this.parseTime(endTime);
        let code = 0;
        try {
            if (!isNaN(realStartTime)) {
                if (realStartTime == 0) {
                    startTime = `${startTime}${now.getFullYear()}`;
                    realStartTime = this.parseTime(startTime);
                    code += 512;
                }
                if (realStartTime == 1) {
                    startTime = `${startTime}-${now.getMonth() + 1}`;
                    realStartTime = this.parseTime(startTime);
                    code += 256;
                }
                if (realStartTime == 3) {
                    startTime = `${startTime}-${now.getDate()}`;
                    realStartTime = this.parseTime(startTime);
                    code += 128;
                }
                if (realStartTime == 7) {
                    startTime = `${startTime} 00`;
                    realStartTime = this.parseTime(startTime);
                    code += 64;
                }
                if (realStartTime == 15) {
                    startTime = `${startTime}:00`;
                    realStartTime = this.parseTime(startTime);
                    code += 32;
                }
            }
            if (!isNaN(realEndTime)) {
                if (realEndTime == 0) {
                    endTime = `${endTime}${now.getFullYear()}`;
                    realEndTime = this.parseTime(endTime);
                    code += 16;
                }
                if (realEndTime == 1) {
                    endTime = `${endTime}-${now.getMonth() + 1}`;
                    realEndTime = this.parseTime(endTime);
                    code += 8;
                }
                if (realEndTime == 3) {
                    endTime = `${endTime}-${now.getDate()}`;
                    realEndTime = this.parseTime(endTime);
                    code += 4;
                }
                if (realEndTime == 7) {
                    endTime = `${endTime} 23`;
                    realEndTime = this.parseTime(endTime);
                    code += 2;
                }
                if (realEndTime == 15) {
                    endTime = `${endTime}:59`;
                    realEndTime = this.parseTime(endTime);
                    code++;
                }
            }

            const q = 'SELECT m.menuid, m.name, COUNT(tr.menuid) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.orderid = tr.orderid INNER JOIN menu AS m ON tr.menuid = m.menuid WHERE t.time BETWEEN \'' + realStartTime + '\' AND \'' + realEndTime + '\' GROUP BY m.menuid, m.name ORDER BY COUNT(tr.menuid) DESC';
            // const q = 'SELECT m.menuid, m.name, COUNT(tr.menuid) AS occurrence_count FROM transactions AS t INNER JOIN orders AS o ON t.transactionid = o.transactionid INNER JOIN trays AS tr ON o.trayid = tr.trayid INNER JOIN menu AS m ON tr.menuid = m.menuid WHERE t.time BETWEEN \'2025-01-01 10:00:00\' AND \'2025-12-01 20:00:00\' GROUP BY m.menuid, m.name ORDER BY COUNT(tr.menuid) DESC';
            console.log(q);
            const result = await this.db.query(q);
            if (!result.rows || result.rows.length === 0) {
                console.log("Empty query");
                code += 1024
                return { menuid: 0, name: 0, sales: 0, code: code };
            }
            for (const row of result.rows) {
                data.push({ menuid: row.menuid, name: row.name, sales: row.occurrence_count, code: code });
            }
        } catch (err) {
            console.log("Invalid input data" + err);
            code += 2048;
            return { menuid: -1, name: -1, sales: -1, code: code };
        }
        return data;
    }

    HourToSQLTime(hour) {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${hour}:00:00`;
    }

    CurrentDaySQLTime() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} 00:00:00`;
    }

    parseTime(time) {
        let stage = 0;
        let year = '';
        let month = '';
        let day = '';
        let hour = '';
        let minute = '';
        for (let i = 0; i < time.length; i++) {
            if (stage == 0) {
                if (!isNaN(time.substring(i, i + 4), 10) && parseInt(time.substring(i, i + 4), 10) > 0) {
                    if (time.substring(i, i + 1) != " ") {
                        year += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        year += time.substring(i + 1, i + 2);
                    }
                    if (time.substring(i + 2, i + + 3) != " ") {
                        year += time.substring(i + 2, i + 3);
                    }
                    if (time.substring(i + 3, i + 4) != " ") {
                        year += time.substring(i + 3, i + 4);
                    }
                    while (year.length < 4) {
                        year = '0' + year;
                    }
                    stage++;
                    i += 3;
                }
                else if (!isNaN(time.substring(i, i + 3), 10) && parseInt(time.substring(i, i + 4), 10) > 0) {
                    if (time.substring(i, i + 1) != " ") {
                        year += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        year += time.substring(i + 1, i + 2);
                    }
                    if (time.substring(i + 2, i + + 3) != " ") {
                        year += time.substring(i + 2, i + 3);
                    }
                    while (year.length < 4) {
                        year = '0' + year;
                    }
                    stage++;
                    i += 2;
                }
                else if (!isNaN(time.substring(i, i + 2), 10) && parseInt(time.substring(i, i + 4), 10) > 0) {
                    if (time.substring(i, i + 1) != " ") {
                        year += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        year += time.substring(i + 1, i + 2);
                    }
                    while (year.length < 4) {
                        year = '0' + year;
                    }
                    stage++;
                    i += 1;
                }
                else if (!isNaN(time.substring(i, i + 1), 10) && parseInt(time.substring(i, i + 4), 10) > 0) {
                    if (time.substring(i, i + 1) != " ") {
                        year += time.substring(i, i + 1);
                    }
                    while (year.length < 4) {
                        year = '0' + year;
                    }
                    stage++;
                }
            }
            else if (stage == 1) {
                if (!isNaN(time.substring(i, i + 2), 10) && parseInt(time.substring(i, i + 2), 10) > 0 && parseInt(time.substring(i, i + 2), 10) <= 12) {
                    if (time.substring(i, i + 1) != " ") {
                        month += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        month += time.substring(i + 1, i + 2);
                    }
                    while (month.length < 2) {
                        month = '0' + month;
                    }
                    stage += 2;
                    i += 1;
                }
                else if (!isNaN(time.substring(i, i + 1), 10) && parseInt(time.substring(i, i + 1), 10) > 0) {
                    month = '0' + time.substring(i, i + 1);
                    stage += 2;
                }
            }
            else if (stage == 3) {
                if (!isNaN(time.substring(i, i + 2), 10) && parseInt(time.substring(i, i + 2), 10) > 0 && parseInt(time.substring(i, i + 2), 10) <= 31) {
                    if (time.substring(i, i + 1) != " ") {
                        day += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        day += time.substring(i + 1, i + 2);
                    }
                    while (day.length < 2) {
                        day = '0' + day;
                    }
                    stage += 4;
                    i += 1;
                }
                else if (!isNaN(time.substring(i, i + 1), 10) && parseInt(time.substring(i, i + 1), 10) > 0) {
                    day = '0' + time.substring(i, i + 1);
                    stage += 4;
                }
            }
            else if (stage == 7) {
                if (!isNaN(time.substring(i, i + 2), 10) && parseInt(time.substring(i, i + 2), 10) >= 0 && parseInt(time.substring(i, i + 2), 10) <= 23) {
                    if (time.substring(i, i + 1) != " ") {
                        hour += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        hour += time.substring(i + 1, i + 2);
                    }
                    while (hour.length < 2) {
                        hour = '0' + hour;
                    }
                    stage += 8;
                    i += 2;
                }
                else if (!isNaN(time.substring(i, i + 1), 10) && parseInt(time.substring(i, i + 1), 10) >= 0) {
                    hour = '0' + time.substring(i, i + 1);
                    stage += 8;
                }
            }
            else if (stage == 15) {
                if (!isNaN(time.substring(i, i + 2), 10) && parseInt(time.substring(i, i + 2), 10) >= 0 && parseInt(time.substring(i, i + 2), 10) <= 59) {
                    if (time.substring(i, i + 1) != " ") {
                        minute += time.substring(i, i + 1);
                    }
                    if (time.substring(i + 1, i + 2) != " ") {
                        minute += time.substring(i + 1, i + 2);
                    }
                    while (minute.length < 2) {
                        minute = '0' + minute;
                    }
                    stage += 16;
                    break;
                }
                else if (!isNaN(time.substring(i, i + 1), 10) && parseInt(time.substring(i, i + 1), 10) >= 0) {
                    minute = '0' + time.substring(i, i + 1);
                    stage += 16;
                    break;
                }
            }
        }
        if (stage != 31) {
            return stage;
        }
        return `${year}-${month}-${day} ${hour}:${minute}:00`;
    }
}

export { Report };
