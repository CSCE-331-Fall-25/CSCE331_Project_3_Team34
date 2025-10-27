const Tray = require('./Tray');


class Transaction {
    constructor(price, user, MainPage) {
        this.price = price;
        this.user = user;
        this.MainPage = MainPage;  
        this.currOrder = null;
        this.orders = [];      
    }

    NewOrder(itemID) {
       this.currOrder = new Order(itemID);
       this.orders.push(this.currOrder);
    }

    
}

class Order {
    constructor(Item) {
        this.Item = Item;
        this.Tray = new Tray(Item);
    }
}
module.exports = Transaction;

