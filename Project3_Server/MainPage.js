class MainPage {
    
    constructor(user){
        this.debugging = true;

            if(this.debugging) {
            console.log("Initializing Back End...");
        }
        this.user = user;
        this.currentUser = user;//May need to find a way to ensure only User

        this.currTransaction = new Transaction(null, null, null, null, user, this);
        
    }


    BuyItemButton() {
        const itemID = "Bowl"; //TODO: Get Real ID
        if(this.debugging) {
            console.log("Item Button ID: " + itemID);
        }
        if(this.currTransaction == null) {
            if(this.debugging) {
                console.log("Transaction is null, creating new transaction...");
            }
            this.currTransaction = new Transaction(null, null, null, null, this.user, this);
        }
        const currItem = new Item(itemID);
        this.currTransaction.NewOrder(currItem);
    }


}

class Item {
    constructor(itemID) {
        this.itemID = itemID;
        this.itemTypes = {
            ENTREE: 'entree',
            SIDE: 'side',
            FAMILY: 'family'
        };
        //get other item details from DB
        this.price = 9.99; // Placeholder
        this.numberOfEntrees = 3; // Placeholder
        this.numberOfSides = 2; // Placeholder
        this.itemType = this.itemTypes.ENTREE; // Placeholder
    }
}

class User {
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
}

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


class Tray {
    constructor(item) {
        this.entrees = [];
        this.sides = [];
        this.item = item;
        const numberOfEntrees = item.numberOfEntrees;
        const numberOfSides = item.numberOfSides;

        for(let i = 0; i < numberOfEntrees; i++) {
            this.openSelectionPage('entree'); // Placeholder for entree selections
        }
        for(let j = 0; j < numberOfSides; j++) {
            this.openSelectionPage('side'); // Placeholder for side selections
        }
        console.log("Tray completed with Entrees: " + this.entrees + " and Sides: " + this.sides);
    }

    openSelectionPage(fillType) {
        switch(fillType) {
            case 'entree':
                // Render entree selection UI
                //collect return from a button on that screen
                let selectedEntree = "Orange Chicken"; // Placeholder
                this.entrees.push(selectedEntree);
                break;
            case 'side':
                // Render side selection UI
                //collect return from a button on that screen
                let selectedSide = "Fries"; // Placeholder
                this.sides.push(selectedSide);
                break;
            default:
                if(this.item.debugging) {
                    console.log("Invalid fill type for tray selection.");
                }
                break;
        }
        // Log current selections
        if(fillType === 'entree') {
            console.log("Selected Entree: " + this.entrees);
        } else if(fillType === 'side') {
            console.log("Selected Side: " + this.sides);
        }
    }
}

user = new User("testUser", "password123", "bob@gmail.com");
mainPage = new MainPage(user);
mainPage.BuyItemButton();


