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
            console.warn("No user provided, creating default user.");
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
        this.currTransaction = new Transaction(this.db, this.user);
    }


    async BuyItemButton(givenItemID, entreeList = [], sideList = [], size) {
        // Stores the current itemID
        this.itemID = givenItemID;
        
        // Make size lowercase for consistency
        size = size ? size.toLowerCase() : null;

        // Creates a new transaction if transaction is null
        if(this.currTransaction == null) {
            this.currTransaction = new Transaction(this.db, this.user);
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
        await currOrder.AddTrays(this.db, entreeList, sideList, size);

        // Get the last order (just added)
        if(this.debugging)console.log("new item name: " + currItem.name);
        
        // console.log("new order price: " + currOrder.price);
        //TODO: check if we even need to return anything here besides confirmation we bought the item
        return {
            cost: currOrder.price,
            item: currItem.name,
            entrees: currOrder.entrees.map(e => e.menu?.name || 'Select Entree'),
            sides: currOrder.sides.map(s => s.menu?.name || 'Select Side'),
            requirements: {
                numberOfTrays: (currOrder.entrees?.length || 0) + (currOrder.sides?.length || 0)
            },
            orderNumber: this.currTransaction.orderNumber
        };
    }



    async AddDiscount(discountCode, priceOff = 0, discountPer = 0) {
        //SET TO ONLY ACCEPT IF GREATER THAN CURRENT DISCOUNT
        //SET TO ONLY ACCEPT 1 type at a time
        console.log("Adding discount with code: " + discountCode);
        // Validate discount code from database
        if(this.currTransaction == null) {
            if(this.debugging) {
                console.log("Transaction is null, cant apply discount yet");
            }
            return { acceptedDiscount: -1};
        }
        // console.log("length: " + this.currTransaction.orders.length);
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
        if(priceOff > 0 && priceOff > this.priceOff) {
            this.priceOff = priceOff;
            console.log("Applied manager price off: " + priceOff);
            return { acceptedDiscount: 1, discountAmount: this.GetCostInformation().discountAmount  };
        }
        if(discountPer > 0) {
            this.discountRate = discountPer / 100;
            console.log("Applied manager discount percent: " + discountPer);
            return { acceptedDiscount: 1, discountAmount: this.GetCostInformation().discountAmount  };
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
            const itemId = order.item?.itemID ?? order.item?.name ?? 'unknown';
            const price = order.price || 0;
            console.log(`${index + 1}. ${itemId}, Price: $${price.toFixed(2)}`);
            
            // Print entrees if they exist
            if (order.entrees && order.entrees.length > 0) {
                order.entrees.forEach(entree => {
                    const entreeName = entree.menu?.name || entree.name || 'Unknown Entree';
                    console.log(`   - Entree: ${entreeName}`);
                });
            }
            
            // Print sides if they exist
            if (order.sides && order.sides.length > 0) {
                order.sides.forEach(side => {
                    const sideName = side.menu?.name || side.name || 'Unknown Side';
                    console.log(`   - Side: ${sideName}`);
                });
            }
        });
    // Use GetCostInformation and coerce values to numbers to avoid runtime errors
    const costInfo = this.GetCostInformation();
    let subtotal = Number(costInfo.subtotal) || 0;
    let discountAmount = Number(costInfo.discountAmount) || 0;
    let priceOff = Number(costInfo.priceOff) || 0;
    let tax = Number(costInfo.tax) || 0;
    let total = Number(costInfo.total) || 0;

    console.log(`Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`Discount: -$${discountAmount.toFixed(2)}`);
    console.log(`Price Off: -$${priceOff.toFixed(2)}`);
    console.log(`Tax: $${tax.toFixed(2)}`);
    console.log(`Total: $${Math.ceil(total * 100) / 100}`);
        console.log("-------------------");
        this.ClearTransaction();
    }
    async PurchaseTransaction() {
        // Finalize purchase logic here
        if(this.debugging) {
            console.log("Purchase button clicked. Finalizing transaction...");
        }
        const { total } = this.GetCostInformation();

        // Ensure the transaction has the correct employee assigned (if current user is an employee)
        if (this.user && typeof this.user.employeeID !== 'undefined') {
            this.currTransaction.employee = this.user;
        }

        // Return the promise so callers can await the inserted transaction ID.
        return Transaction.AddToDatabase(this.db, this.currTransaction)
            .then((transactionID) => {
                console.log("Transaction stored in database with ID: " + transactionID);
                console.log("Total Price: $" + Math.ceil(total).toFixed(2));
                // Print receipt and clear transaction
                this.PrintReceipt(this.currTransaction);
                return transactionID;
            })
            .catch((err) => {
                console.error("Error storing transaction in database: ", err);
                throw err;
            });
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
        console.log("Current orders after removal:");
        this.currTransaction.orders.forEach((order, idx) => {
            const itemId = order.item?.itemID ?? order.item?.name ?? 'unknown';
            console.log(`  ${idx}: Item ID: ${itemId}`);
        });

        return {
            success: true
        };
    }
    ClearTransaction() {
        console.log("Clearing current transaction...");
        //this.user = user; //TODO: if kiosk WILL NEED TO GO BACK TO LOGIN PAGE FOR NEW CUSTOMER

        this.currTransaction = null;
        this.currTransaction = new Transaction(this.db, this.user);
        this.totalPrice = 0;
        this.taxRate = 0.0825;
        this.discountRate = 0;
        this.priceOff = 0;

        this.user = this.user; //TODO: WILL NEED TO GO BACK TO LOGIN PAGE FOR NEW CUSTOMER
    }
    GetCostInformation(){
        let subtotal = 0;
        if (!this.currTransaction || !this.currTransaction.orders) {
            console.log("No current transaction or orders found.");
            return { subtotal: 0, discountAmount: 0, tax: 0, total: 0, priceOff: 0 };
        }
        
        this.currTransaction.orders.forEach(order => {
            // Avoid stringifying the whole order (it contains circular references).
            const itemId = order.item?.itemID ?? order.item?.name ?? 'unknown';
            const price = order.price || 0;
            // Skip any orders with missing or invalid items (treat missing price as 0)
            console.log("Adding order item ID: " + itemId + " with price: " + price);
            subtotal += price;
        });
    // Compute percent-based discount and fixed price-off separately
    let discountAmount = subtotal * (this.discountRate || 0);
    let priceOff = Number(this.priceOff) || 0;
    discountAmount += priceOff;
    // Tax is applied after discounts (both percent and fixed)
    let taxable = subtotal - discountAmount;
    let tax = taxable * (this.taxRate || 0.0825);
    let total = subtotal - discountAmount + tax;

    return { subtotal, discountAmount, tax, total };
    }
    GetCurrentState() {
        if (!this.currTransaction || !this.currTransaction.orders) {
            console.logerror("No current transaction or orders found.");
            return {
                orders: [],
                discountAmount: 0,
                priceOff: 0,
                totalPrice: 0
            };
        }
        const { subtotal, discountAmount, tax, total, priceOff } = this.GetCostInformation();
        // For better client-side rendering, include both the tray name and a displayType for each tray.
        // displayType will be used on the receipt (e.g., 'A La Carte', 'Appetizer', 'Drink', 'Bottle')
        // while the client still groups trays by entree/side.

        return {
            orders: this.currTransaction.orders.map(order => ({
                cost: order.price,
                item: order.item.name,
                // Entrees: include name and an optional displayType. If the parent order's item
                // is one of the single-item types, use that as displayType; otherwise default to 'Entree'.
                entrees: (order.entrees || []).map(e => ({
                    name: e.menu?.name || 'Select Entree',
                    displayType: ['A La Carte', 'Appetizer', 'Drink', 'Bottle'].includes(order.item?.name) ? order.item?.name : 'Entree'
                })),
                sides: (order.sides || []).map(s => ({
                    name: s.menu?.name || 'Select Side',
                    displayType: 'Side'
                })),
            })),
            discountAmount,
            priceOff,
            tax,
            totalPrice: total,
            currCost:subtotal
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

        // temp: example customization - change first entree to a different name
        try {
            if (currentOrder.Tray && Array.isArray(currentOrder.Tray.entrees)) {
                currentOrder.Tray.entrees[0] = "Beef Teriyaki";
            } else if (Array.isArray(currentOrder.entrees)) {
                // fallback if structure differs
                currentOrder.entrees[0] = "Beef Teriyaki";
            }
        } catch (err) {
            console.error('Error applying temp customization:', err);
        }

        // Build a safe summary to return (avoid circular structures)
        const traySummary = {
            entrees: (currentOrder.entrees || currentOrder.Tray?.entrees || []).map(e => (e?.menu?.name || e?.name || e || null)),
            sides: (currentOrder.sides || currentOrder.Tray?.sides || []).map(s => (s?.menu?.name || s?.name || s || null))
        };
        if (this.debugging) {
            console.log('Order customized (summary):', traySummary);
        }
        return { success: true, tray: traySummary };
    }
}

export default CashierMainPage;
