import { Menu } from './Item.js';

class Transaction {
    constructor(employee) {
        this.employee = employee;
        this.amount = 0;
        this.profit = 0;

        this.orders = [];
        this.currOrder = null;
    }

    NewOrder(item) {
        this.currOrder = new Order(this, item);
        this.orders.push(this.currOrder);
        return this.currOrder;
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
}

class Tray {
    constructor(order, menu, type) {
        this.order = order;
        this.menu = menu;
        this.type = type;
    }
}

export default Transaction;
export { Order, Tray };
