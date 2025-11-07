import { Menu } from './Item.js';
import { Employee } from './User.js';

class Transaction {
    constructor(employee) {
        this.employee = employee || new Employee('','','');
        this.amount = 0;
        this.profit = 0;

        this.orders = [];
        this.currOrder = null;
        this.customerID = null;
    }

    NewOrder(item) {
        this.currOrder = new Order(this, item);
        this.orders.push(this.currOrder);
        return this.currOrder;
    }

    static async AddToDatabase(db, transaction) {
        // Pull next available transaction ID
        const transIdRes = await db.query('SELECT NEXTVAL(\'transaction_id_seq\') AS transid');
        if (!transIdRes || !transIdRes.rows || transIdRes.rows.length === 0) {
            throw new Error('Failed to retrieve next transaction ID');
        }
        let transactionID = transIdRes.rows[0].transid;

        // Insert transaction record
        const insertTransQuery = `
            INSERT INTO transactions (transactionid, employeeid, time, amount, profit, customerid, stage)
            VALUES ($1, $2, NOW(), $3, $4, $5, $6)
        `;
        await db.query(insertTransQuery, [
            transactionID,
            // If transaction.employee is an Employee instance use its ID, otherwise NULL
            (transaction.employee && transaction.employee.employeeID) ? transaction.employee.employeeID : -1,
            transaction.amount,
            transaction.profit,
            transaction.customerID || null,
            0 // Assuming '0' is the initial stage
        ]);
        
        for (const order of transaction.orders) {
            await Order.AddToDatabase(db, transactionID, order);
        }

        return transactionID;
    }
}

class Order {
    constructor(transaction, item) {
        this.item = item;
        this.transaction = transaction;
        
        this.entrees = [];
        this.sides = [];
    }

    NewTray(menu, type) {
        const newTray = new Tray(this, menu, type);
        // Initialize arrays if they don't exist
        this.entrees = this.entrees || [];
        this.sides = this.sides || [];
        
        if (type === 'side') {
            this.sides.push(newTray);
        } else {
            this.entrees.push(newTray);
        }
        return newTray;
    }

    async AddTrays(db, entreeList = [], sideList = []) {
        // Helper to get a name whether caller passed a string or { name }
        const getName = (x) => (typeof x === 'string' ? x : x?.name);

        // Always add all provided entrees
        for (const entree of (entreeList || [])) {
            const name = getName(entree);
            if (!name) continue;
            let menu = await Menu.fetchByName(db, name);
            console.log('Fetched menu for entree:', menu);
            if (!menu) menu = { name };
            this.NewTray(menu, 'entree');
        }

        // Always add all provided sides
        for (const side of (sideList || [])) {
            const name = getName(side);
            if (!name) continue;
            let menu = await Menu.fetchByName(db, name);
            if (!menu) menu = { name };
            this.NewTray(menu, 'side');
        }

        // If nothing was provided (e.g., non-meal items), do nothing here.
        // Such items are typically handled elsewhere, or have zero trays.
    }

    static async AddToDatabase(db, transactionID, order) {
        // Get next available order ID
        const orderIdRes = await db.query('SELECT NEXTVAL(\'order_id_seq\') AS orderid');
        if (!orderIdRes || !orderIdRes.rows || orderIdRes.rows.length === 0) {
            throw new Error('Failed to retrieve next order ID');
        }
        const orderID = orderIdRes.rows[0].orderid;

        // Insert order record
        const insertOrderQuery = `
            INSERT INTO orders (transactionid, itemid, orderid)
            VALUES ($1, $2, $3)
        `;
        await db.query(insertOrderQuery, [
            transactionID,
            order.item.itemID || null,
            orderID
        ]);

        // Insert trays (await each to ensure correct ordering and that any lookups complete)
        for (const tray of [...(order.entrees || []), ...(order.sides || [])]) {
            await Tray.AddToDatabase(db, orderID, tray);
        }
    }
}

class Tray {
    constructor(order, menu, type) {
        this.order = order;
        this.menu = menu;
        this.type = type;
    }

    static async AddToDatabase(db, orderID, tray) {
        // Output to database
        const insertTrayQuery = `
            INSERT INTO trays (orderid, menuid, type)
            VALUES ($1, $2, $3)
        `;
        // Determine menuid: prefer tray.menu.menuid, fall back to a lookup by name if available
        let menuid = tray?.menu?.menuid ?? null;
        try {
            if ((!menuid || menuid === null) && tray?.menu?.name) {
                const fetched = await Menu.fetchByName(db, tray.menu.name);
                if (fetched && fetched.menuid) menuid = fetched.menuid;
            }
        } catch (err) {
            // If lookup fails, leave menuid as null and continue; logging helps debugging
            console.error('Failed to resolve menu id for tray:', tray?.menu?.name, err && err.message ? err.message : err);
        }

        await db.query(insertTrayQuery, [
            orderID,
            menuid,
            tray.type
        ]);
    }
}

export default Transaction;
export { Order, Tray };
