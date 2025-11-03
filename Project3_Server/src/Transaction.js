class Transaction {
    constructor(price, user, MainPage) {
        this.orderNumber = 0; // TODO : Generate unique order number
        this.price = price;
        this.user = user;
        this.MainPage = MainPage;
        this.currOrder = null;
        this.orders = [];
        this.DiscountCode = null;
    }

    NewOrder(itemInstance) {
        // Ensure we have a valid item instance, create a default if none provided
        const item = itemInstance || new Item('default');
        this.currOrder = new Order(item);
        this.orders.push(this.currOrder);
        return this.currOrder;
    }
}

class Order {
    constructor(Item) {
        this.Item = Item;
        this.Tray = new Tray(Item);
        this.fillLarge = false;
    }
}

class Tray {
    constructor(item) {
        this.entrees = [];
        this.sides = [];
        this.item = item || { numberOfEntrees: 1, numberOfSides: 1 }; // Provide default if item is null
        const numberOfEntrees = this.item.numberOfEntrees ?? 1;
        const numberOfSides = this.item.numberOfSides ?? 1;

        // Always initialize with at least one of each
        for (let i = 0; i < numberOfEntrees; i++) {
            this.openSelectionPage('entree');
        }
        for (let j = 0; j < numberOfSides; j++) {
            this.openSelectionPage('side');
        }
        console.log(`Tray initialized with ${this.entrees.length} entrees and ${this.sides.length} sides`);
    }

    openSelectionPage(fillType) {
        switch (fillType) {
            case 'entree':
                this.entrees.push('Default Entree');
                break;
            case 'side':
                this.sides.push('Default Side');
                break;
            default:
                if (this.item?.debugging) console.log('Invalid fill type for tray selection.');
        }
    }
}

export default Transaction;

