class Tray {
    constructor(item) {
        this.entrees = [];
        this.sides = [];
        this.item = item;
        const numberOfEntrees = item?.numberOfEntrees ?? 0;
        const numberOfSides = item?.numberOfSides ?? 0;

        for (let i = 0; i < numberOfEntrees; i++) {
            this.openSelectionPage('entree'); // Placeholder
        }
        for (let j = 0; j < numberOfSides; j++) {
            this.openSelectionPage('side'); // Placeholder
        }
        // console.log(`Tray completed with Entrees: ${this.entrees} and Sides: ${this.sides}`);
    }

    openSelectionPage(fillType) {
        switch (fillType) {
            case 'entree':
                this.entrees.push('Default Entree');
                break;
            case 'side':
                this.sides.push('Default Side');
                break;
            default:
                if (this.item?.debugging) console.log('Invalid fill type for tray selection.');
        }
    }
}

export default Tray;