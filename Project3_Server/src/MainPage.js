import Transaction, {Order, Tray} from './Transaction.js';
import Item, {Menu} from './Item.js';
import User, {Employee, Customer} from './User.js';

class CashierMainPage {
    
    constructor(user, db = null){
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

        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;

        // Connects the database
        this.db = db;

        // Creates the current transaction
        this.currTransaction = new Transaction(null, this.user, this);
    }


    async BuyItemButton(givenItemID, entreeList = [], sideList = []) {
        // Stores the current itemID
        if(this.debugging) {
            console.log("Buy Item Button clicked for itemID: " + givenItemID + "\n with Entrees: " + entreeList.map(e => e ? e.name : "empty") + "\n and Sides: " + sideList.map(s => s ? s.name : "empty"));
        }
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
    const currOrder = this.currTransaction.NewOrder(currItem);
    await currOrder.AddTrays(this.db, entreeList, sideList);

        // Get the last order (just added)
        if(this.debugging)console.log("new item name: " + currItem.name);
        
        //TODO: check if we even need to return anything here besides confirmation we bought the item
        return {
            cost: currItem.price,
            item: currItem.name,
            entrees: currOrder.entrees.map(e => e.menu?.name || 'Select Entree'),
            sides: currOrder.sides.map(s => s.menu?.name || 'Select Side'),
            requirements: {
                numberOfTrays: (currOrder.entrees?.length || 0) + (currOrder.sides?.length || 0)
            },
            orderNumber: this.currTransaction.orderNumber
        };
    }


    async AddDiscount(discountCode, override = false) {
        console.log("Adding discount with code: " + discountCode);

        // Allow the employee to set a manual discount override
        if(override && this.user.employee) {
            this.discountRate = 0.20; //TODO: employee will set the discount to whatever manually
            console.log("Employee override");
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

        // Check if we have a database connection
        if (!this.db) {
            console.warn('No DB connection available, cannot validate discount code');
            return { acceptedDiscount: false };
        }

        try {
            console.log("Querying the database for the code");
            // Query the discounts table for the provided code
            const q = 'SELECT * FROM discounts WHERE code = $1';
            const result = await this.db.query(q, [discountCode]);

            if (!result.rows || result.rows.length === 0) {
                console.log("Invalid discount code: " + discountCode);
                return { acceptedDiscount: false };
            }

            const discount = result.rows[0];
            let newDiscountRate = discount.percent ? (discount.percent / 100) : 0;
            let newPriceOff = discount.fixed || 0;

            // Apply the best percentage discount for the customer
            if(newDiscountRate > this.discountRate) {
                this.discountRate = newDiscountRate;
                this.currTransaction.discountCode = discountCode;
            }

            // Apply the best fixed discount for the customer
            if(newPriceOff > this.priceOff) {
                this.priceOff = newPriceOff;
                this.currTransaction.discountCode = discountCode;
            }

            console.log("Returning discount with " + this.discountRate + " " + this.priceOff)
            let discountAmount = this.GetCostInformation().discountAmount;
            return { acceptedDiscount: 1, discountAmount: discountAmount};


        } catch (err) {
            console.error('Error querying discounts table:', err);
            return { acceptedDiscount: false };
        }

        //TODO problem is improved discountRate will overwrite priceOff and vice versa
        // Need to store both the best percentage and best fixed discount separately
        let currDicountCode = discountCode;
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
        // This breaks because we havent started outputting to database yet
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

        this.user = this.user; //TODO: WILL NEED TO GO BACK TO LOGIN PAGE FOR NEW CUSTOMER
    }
    GetCostInformation(){
        let subtotal = 0;
        if (!this.currTransaction || !this.currTransaction.orders) {
            return { subtotal: 0, discountAmount: 0, tax: 0, total: 0, priceOff: 0 };
        }
        this.currTransaction.orders.forEach(order => {
            // Skip any orders with missing or invalid items
            if (order && order.Item && typeof order.Item.price === 'number') {
                subtotal += order.Item.price;
            }
        });
        let discountAmount = subtotal * (this.discountRate || 0);
        let tax = subtotal * (this.taxRate || 0.0825);
        let total = subtotal - discountAmount + tax - (this.priceOff || 0);
        let priceOff = this.priceOff || 0;
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
                cost: order.item.price,
                item: order.item.name,
                entrees: order.entrees.map(e => e.menu?.name || 'Select Entree'),
                sides: order.sides.map(s => s.menu?.name || 'Select Side'),
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

export default CashierMainPage;
