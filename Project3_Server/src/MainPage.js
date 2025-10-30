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
        let discountAmount = this.GetCostInformation().discountAmount;
        return { acceptedDiscount: 1, discountAmount: discountAmount};
        
    }


    PrintReceipt(transaction) {
        console.log("----- Receipt -----");
        transaction.orders.forEach((order, index) => {
            console.log(`${index + 1}. Item ID: ${order.Item.itemID}, Price: $${order.Item.price.toFixed(2)}`);
        });
        this.GetCostInformation();
        let { subtotal, discountAmount, tax, total } = this.GetCostInformation();
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
        const { total } = this.GetCostInformation();
        console.log("Total Price: $" + Math.ceil(total).toFixed(2));
        //add logic to store transaction in database, print receipt, etc.
        this.PrintReceipt(this.currTransaction);
    }

    RemoveItemByIndex(index) {
        if(this.debugging) {
            console.log("Removing item at index: " + index);
        }
        if(index < 0 || index >= this.currTransaction.orders.length) {
            if(this.debugging) {
                console.log("Invalid index: " + index);
            }
            return { success: false, error: "Invalid index" };
        }
        // Remove the order at the given index
        this.currTransaction.orders.splice(index, 1);
        if(this.debugging)console.log("Item removed. now " + this.currTransaction.orders.length + " items remain.");

        return {
            success: true
        };
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
    GetCostInformation(){
        let subtotal = 0;
        if (!this.currTransaction || !this.currTransaction.orders) {
            return { subtotal: 0, discountAmount: 0, tax: 0, total: 0, priceOff: 0 };
        }
        this.currTransaction.orders.forEach(order => {
            subtotal += order.Item.price;
        });
        let discountAmount = subtotal * this.discountRate;
        let tax = subtotal * this.taxRate;
        let total = subtotal - discountAmount + tax - this.priceOff;
        let priceOff = this.priceOff;
        return { subtotal, discountAmount, tax, total, priceOff };
    }
    GetCurrentState() {
        console.log("Getting current state...");
        if (!this.currTransaction || !this.currTransaction.orders) {
            return {
                orders: [],
                discountAmount: 0,
                priceOff: 0,
                totalPrice: 0
            };
        }
        const { subtotal, discountAmount, tax, total, priceOff } = this.GetCostInformation();
        return {
            orders: this.currTransaction.orders.map(order => ({
                cost: order.Item.price,
                item: order.Item.itemID,
                entrees: order.Tray.entrees,
                side: order.Tray.sides,
                orderNumber: this.currTransaction.orderNumber
            })),
            discountAmount,
            priceOff,
            totalPrice: total
        };
    }
    CustomizeOrder(index) {
        // Implement customization logic here
        if(this.debugging) {
            console.log("Customize order clicked");
        }
        let currentOrder = this.currTransaction.orders[index];
        if(!currentOrder) {
            if(this.debugging) {
                console.log("Invalid order index: " + index);
            }
            return { success: false, error: "Invalid order index" };
        }
        
        //TODO: add customization logic, Open a customization interface or modify the current order

        //temp
        //For example change first entree from orange chicken to beef
        currentOrder.Tray.entrees[0] = "Beef Teriyaki";
        if(this.debugging) {
            console.log("Order customized: " + JSON.stringify(currentOrder.Tray));
        }
        return { success: true, tray: currentOrder.Tray };
    }
}






module.exports = { CashierMainPage, User };




