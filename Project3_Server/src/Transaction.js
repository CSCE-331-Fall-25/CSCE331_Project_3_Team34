class Transaction {
    constructor(price, user, MainPage) {
        this.orderNumber = 0; // TODO : Generate unique order number
        this.orderNumber = 0; // TODO : Generate unique order number
        this.price = price;
        this.user = user;
        this.MainPage = MainPage;
        this.MainPage = MainPage;
        this.currOrder = null;
        this.orders = [];
        this.DiscountCode = null;
    }

    NewOrder(itemInstance) {
        this.currOrder = new Order(itemInstance);
        this.orders.push(this.currOrder);
    NewOrder(itemInstance) {
        this.currOrder = new Order(itemInstance);
        this.orders.push(this.currOrder);
    }
}

class Order {
    constructor(Item) {
        this.Item = Item;
        this.Tray = new Tray(Item);
        this.fillLarge = false;
        this.fillLarge = false;
    }
}

class Tray {
    constructor(item) {
        this.entrees = [];
        this.sides = [];
        this.item = item;
        const numberOfEntrees = item?.numberOfEntrees ?? 0;
        const numberOfSides = item?.numberOfSides ?? 0;

        for (let i = 0; i < numberOfEntrees; i++) {
            this.openSelectionPage('entree'); // Placeholder
        }
        for (let j = 0; j < numberOfSides; j++) {
            this.openSelectionPage('side'); // Placeholder
        }
        // console.log(`Tray completed with Entrees: ${this.entrees} and Sides: ${this.sides}`);
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

