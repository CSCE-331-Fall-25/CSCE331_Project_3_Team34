const Tray = require('./Tray');


class Transaction {
    constructor(price, user, MainPage) {
        this.orderNumber = 0; //TODO : Generate unique order number
        this.price = price;
        this.user = user;
        this.MainPage = MainPage;  
        this.currOrder = null;
        this.orders = [];
        this.DiscountCode = null;     
    }

    NewOrder(itemID) {
       this.currOrder = new Order(itemID);
       this.orders.push(this.currOrder);
       console.log("New order added. Total orders in transaction: " + this.orders.length);
    }

    
}

class Order {
    constructor(Item) {
        this.Item = Item;
        this.Tray = new Tray(Item);
    }
}
module.exports = Transaction;

