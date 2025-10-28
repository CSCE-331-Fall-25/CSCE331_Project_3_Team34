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
        this.user = user;
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
            side: tray.sides
        };
    }


    AddDiscount(discountCode, override = false) {
        if(this.debugging) console.log("Adding discount with code: " + discountCode);
        if(override && this.user.employee) {
            this.discountRate = 0.20; //TODO: employee will set the discount to whatever manually
            return { acceptedDiscount: true };
        }
        //check code validity
        // if db contains discountCode {
        //     this.discountRate = db.getDiscountRate(discountCode);
        // }
        switch(discountCode) {
            case "SAVE10":
                this.discountRate = 0.10;
                return { acceptedDiscount: true };
            case "SAVE20":
                this.priceOff = 20;
                return { acceptedDiscount: true };
            default:
                if(this.debugging) console.log("Invalid discount code: " + discountCode);
                return { acceptedDiscount: false };
        }
        
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
        this.currTransaction = new Transaction(null, null, null, null, user, this);
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;
        this.user = user; //TODO: WILL NEED TO GO BACK TO LOGIN PAGE FOR NEW CUSTOMER
    }

}






module.exports = { CashierMainPage, User };




