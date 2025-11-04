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
        
        this.trays = [];
    }

    NewTray(menu, type) {
        const newTray = new Tray(this, menu, type);
        this.trays.push(newTray);
    }

    AddTrays() {
        for (let i = 0; i < this.item.numEntrees; i++) {
            this.NewTray('entree', 'default');
        }

        for (let i = 0; i < this.item.numSides; i++) {
            this.NewTray('side', 'default');
        }

        for (let i = 0; i < this.item.numLargeEntrees; i++) {
            this.NewTray('entree', 'large');
        }

        for (let i = 0; i < this.item.numLargeSides; i++) {
            this.NewTray('side', 'large');
        }

        if (this.item.numEntrees === 0 && this.item.numSides === 0 && this.item.numLargeEntrees === 0 && this.item.numLargeSides === 0) {
            this.NewTray('none', 'none');
        }
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
