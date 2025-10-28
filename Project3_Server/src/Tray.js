

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

module.exports = Tray;