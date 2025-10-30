import Tray from './Tray.js';

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
        this.currOrder = new Order(itemInstance);
        this.orders.push(this.currOrder);
    }
}

class Order {
    constructor(Item) {
        this.Item = Item;
        this.Tray = new Tray(Item);
        this.fillLarge = false;
    }
}

export default Transaction;

