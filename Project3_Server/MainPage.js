const Transaction = require('./Transaction');
const Item = require('./Item');

class User {
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
}





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






user = new User("testUser", "password123", "bob@gmail.com");
mainPage = new MainPage(user);
mainPage.BuyItemButton();


