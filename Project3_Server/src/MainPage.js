import Transaction from './Transaction.js';
import Item from './Item.js';

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
    
    constructor(user, db = null){
        this.debugging = true;

            if(this.debugging) {
            console.log("Initializing Back End...");
        }
    this.user = user;
        this.currentUser = user;//May need to find a way to ensure only User

    // Database pool (optional). Tests or index.js can inject this.
    this.db = db;
    this.currTransaction = new Transaction(null, this.user, this);
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;
        
    }


    async BuyItemButton(givenItemID) {
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

        let currItem;
        if (this.db) {
            try {
                currItem = await Item.fetchByName(this.db, givenItemID);
                if (!currItem) {
                    if (this.debugging) console.error('Item with ButtonID ' + givenItemID + ' not found in database.');
                    currItem = new Item(givenItemID);
                }
            } catch (err) {
                if (this.debugging) console.error('Error querying DB for item:', err);
                currItem = new Item(givenItemID);
            }
        } else {
            if (this.debugging) console.warn('No DB connection available, using placeholder item.');
            currItem = new Item(givenItemID);
        }

        this.currTransaction.NewOrder(currItem);
        // Get the last order (just added)
        const lastOrder = this.currTransaction.orders[this.currTransaction.orders.length - 1];
        const tray = lastOrder.Tray;
        if(this.debugging)console.log("Cost should be: " + currItem.price);
        return {
            cost: currItem.price,
            item: currItem.itemID,
            entrees: tray.entrees,
            side: tray.sides
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
    PurchaseButton() {
        // Finalize purchase logic here
        if(this.debugging) {
            console.log("Purchase button clicked. Finalizing transaction...");
        }
        console.log("Total Price: $" + this.GetTotalPrice().toFixed(2));
        console.log(this.GetTotalPrice())
    }

    clearTransaction() {
        this.currTransaction = null;
        this.currTransaction = new Transaction(null, this.user, this);
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;
        this.user = this.user; //TODO: WILL NEED TO GO BACK TO LOGIN PAGE FOR NEW CUSTOMER
    }

}






export { CashierMainPage, User };




