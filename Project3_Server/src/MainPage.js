import Transaction from './Transaction.js';
import Item from './Item.js';

class User {
    constructor(username, password, email, employee = false) {
        // Initialize instance variables
        this.username = username;
        this.password = password;
        this.email = email;
        this.employee = employee;

        console.log(`User created: ${username}, Employee: ${employee}`);
    }
}

class CashierMainPage {
    
    constructor(user, db = null){
        // Initialize instance variables
        this.user = user;
        this.currentUser = user;
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;

        // Connects the database
        this.db = db;

        // Creates the current transaction
        this.currTransaction = new Transaction(null, this.user, this);
    }


    async BuyItemButton(givenItemID) {
        // Stores the current itemID
        this.itemID = givenItemID;

        // Creates a new transaction if transaction is null
        if(this.currTransaction == null) {
            console.log("Transaction is null, creating new transaction...");
            this.currTransaction = new Transaction(null, null, null, null, this.user, this);
        }

        // Instantiates the item based on the given item id 
        let currItem;
        if (this.db) {
            try {
                currItem = await Item.fetchByName(this.db, givenItemID);
                if (!currItem) {
                    console.error('Item with ButtonID ' + givenItemID + ' not found in database.');
                    currItem = new Item(givenItemID);
                }
            } catch (err) {
                console.error('Error querying DB for item: ', err);
                currItem = new Item(givenItemID);
            }
        } else {
            console.warn('No DB connection available, using placeholder item.');
            currItem = new Item(givenItemID);
        }

        // Creates a new order with the item 
        this.currTransaction.NewOrder(currItem);

        // Get the last order (just added)
        const lastOrder = this.currTransaction.orders[this.currTransaction.orders.length - 1];
        const tray = lastOrder.Tray;

        return {
            cost: currItem.price,
            item: currItem.name,
            entrees: tray.entrees,
            side: tray.sides
        };
    }


    AddDiscount(discountCode, override = false) {
        console.log("Adding discount with code: " + discountCode);

        // Allow the employee to set a manual discount override
        if(override && this.user.employee) {
            this.discountRate = 0.20; //TODO: employee will set the discount to whatever manually
            return { acceptedDiscount: true };
        }

        // Checks if the transaction exists
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

        // Hard coded discount codes, TODO: add database implementation
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

        // Apply the best discount for the customer
        if(newDiscountRate > this.discountRate) {
            this.discountRate = newDiscountRate;
            this.currTransaction.discountCode = currDicountCode;
        }

        // Apply the best priceOff for the customer
        if(newPriceOff > this.priceOff) {
            this.priceOff = newPriceOff;
            this.currTransaction.discountCode = currDicountCode;
        }

        return { acceptedDiscount: 1, discountPer: this.discountRate, priceOff: this.priceOff, discountCode: this.discountCode};     
    }


    GetTotalPrice() {
        // Totals the price of all the transaction orders
        let subtotal = 0;
        for (let order of this.currTransaction.orders) {
            subtotal += order.Item.price;
        }

        // Applies the discount and tax
        let discountAmount = subtotal * this.discountRate;
        let tax = subtotal * this.taxRate;
        this.totalPrice = subtotal - discountAmount + tax - this.priceOff;

        return subtotal,tax, this.totalPrice;
    }
    PurchaseButton() {
        // TODO: purchase logic
        console.log("Purchase button clicked. Finalizing transaction...");
        console.log("Total Price: $" + this.GetTotalPrice().toFixed(2));
    }

    clearTransaction() {
        // Clear instance variables
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




