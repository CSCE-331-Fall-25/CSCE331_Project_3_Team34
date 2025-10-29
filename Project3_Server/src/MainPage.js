const Transaction = require('./Transaction');
const Item = require('./Item');

class User {
    constructor(username, password, email, employee = false) {
        //if this is an employee, set employee to true AND username is the employee ID
        this.username = username;
        this.password = password;
        this.email = email;
        this.employee = employee;
    }
    
}





class CashierMainPage {
    
    constructor(user){
        this.debugging = true;

        if(this.debugging) {
            console.log("Initializing Back End...");
        }
        if(user === undefined) {
            console.log("No user provided, creating default user.");
            user = new User("empty", "", "", false);
        }
        this.user = user;
        console.log("User set to: " + this.user.username);
        this.currentUser = user;//May need to find a way to ensure only User

        this.currTransaction = new Transaction(null, null, null, null, user, this);
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;
        
        
    }


    BuyItemButton(givenItemID) {
        this.itemID = givenItemID; // Store the itemID if needed
        if(this.debugging) {
            console.log("Item Button ID: " + givenItemID);
        }
        if(this.currTransaction == null) {
            if(this.debugging) {
                console.log("Transaction is null, creating new transaction...");
            }
            this.currTransaction = new Transaction(null, null, null, null, this.user, this);
        }
        const currItem = new Item(givenItemID);
        this.currTransaction.NewOrder(currItem);
        // Get the last order (just added)
        const lastOrder = this.currTransaction.orders[this.currTransaction.orders.length - 1];
        const tray = lastOrder.Tray;
        if(this.debugging)console.log("Cost should be: " + currItem.price);
        return {
            cost: currItem.price,
            item: currItem.itemID,
            entrees: tray.entrees,
            side: tray.sides,
            orderNumber: this.currTransaction.orderNumber
        };
    }


    AddDiscount(discountCode, override = false) {
        if(this.debugging) console.log("Adding discount with code: " + discountCode);
        if(override && this.user.employee) {
            this.discountRate = 0.20; //TODO: employee will set the discount to whatever manually
            return { acceptedDiscount: true };
        }
        if(this.currTransaction == null) {
            if(this.debugging) {
                console.log("Transaction is null, cant apply discount yet");
            }
            return { acceptedDiscount: -1};
        }
        console.log("length: " + this.currTransaction.orders.length);
        if(this.currTransaction.orders.length === 0) {
            if(this.debugging) {
                console.log("No items in transaction, cant apply discount yet");
            }
            return { acceptedDiscount: -1};
        }
        //check code validity
        // if db contains discountCode {
        //     this.discountRate = db.getDiscountRate(discountCode);
        // }
        let newDiscountRate = 0;
        let newPriceOff = 0;
        let currDicountCode = null;
        switch(discountCode) {
            case "SAVE10":
                currDicountCode = "SAVE10";
                newDiscountRate = 0.10;
                break;
            case "SAVE20":
                currDicountCode = "SAVE20";
                newPriceOff = 20;
                break;
            default:
                if(this.debugging) console.log("Invalid discount code: " + discountCode);
                return { acceptedDiscount: false };
        }
        if(newDiscountRate > this.discountRate) {
            this.discountRate = newDiscountRate;
            this.currTransaction.discountCode = currDicountCode;
        }
        if(newPriceOff > this.priceOff) {
            this.priceOff = newPriceOff;
            this.currTransaction.discountCode = currDicountCode;
        }
        return { acceptedDiscount: 1, discountPer: this.discountRate, priceOff: this.priceOff, discountCode: this.discountCode};
        
    }


    GetTotalPrice() {
        let subtotal = 0;
        for (let order of this.currTransaction.orders) {
            subtotal += order.Item.price;
        }
        let discountAmount = subtotal * this.discountRate;
        let tax = subtotal * this.taxRate;
        this.totalPrice = subtotal - discountAmount + tax - this.priceOff;
        return subtotal,tax, this.totalPrice;
    }
    PrintReceipt(transaction) {
        console.log("----- Receipt -----");
        transaction.orders.forEach((order, index) => {
            console.log(`${index + 1}. Item ID: ${order.Item.itemID}, Price: $${order.Item.price.toFixed(2)}`);
        });
        let subtotal = 0;
        transaction.orders.forEach(order => {
            subtotal += order.Item.price;
        });
        let discountAmount = subtotal * this.discountRate;
        let tax = subtotal * this.taxRate;
        let total = subtotal - discountAmount + tax - this.priceOff;
        console.log(`Subtotal: $${subtotal.toFixed(2)}`);
        console.log(`Discount: -$${discountAmount.toFixed(2)}`);
        console.log(`Price Off: -$${this.priceOff.toFixed(2)}`);
        console.log(`Tax: $${tax.toFixed(2)}`);
        console.log(`Total: $${Math.ceil(total * 100) / 100}`);
        console.log("-------------------");
        this.ClearTransaction();
    }
    PurchaseTransaction() {
        // Finalize purchase logic here
        if(this.debugging) {
            console.log("Purchase button clicked. Finalizing transaction...");
        }
        console.log("Total Price: $" + Math.ceil(this.GetTotalPrice()).toFixed(2));
        //add logic to store transaction in database, print receipt, etc.
        this.PrintReceipt(this.currTransaction);
    }

    
    ClearTransaction() {
        console.log("Clearing current transaction...");
        //this.user = user; //TODO: if kiosk WILL NEED TO GO BACK TO LOGIN PAGE FOR NEW CUSTOMER

        this.currTransaction = null;
        this.currTransaction = new Transaction(null, null, null, null, this.user, this);
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;
        
    }
    GetCurrentState() {
        console.log("Getting current state...");
        console.log(this.currTransaction.orders.length);
        return {
            orders: this.currTransaction.orders.map(order => ({
                cost: order.Item.price,
                item: order.Item.itemID,
                entrees: order.Tray.entrees,
                side: order.Tray.sides,
                orderNumber: this.currTransaction.orderNumber
            })),
            discountRate: this.discountRate,
            priceOff: this.priceOff
        };
    }
}






module.exports = { CashierMainPage, User };




