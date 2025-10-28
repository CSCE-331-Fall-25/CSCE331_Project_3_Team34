class Item {
    constructor(itemID) {
        this.itemID = itemID;
        console.log("Creating Item with ID: " + itemID);
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

module.exports = Item;