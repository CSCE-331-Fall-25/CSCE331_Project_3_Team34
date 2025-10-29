// ES module Item with DB loader
class Item {
    // constructor supports placeholders or full DB-provided values
    constructor(itemID, name = null, price = null, numberOfSides = null, numberOfEntrees = null, inventoryIDs = null, type = null, numSideL = null, numEntresL = null) {
        this.itemID = itemID;
        this.name = name || `item-${itemID}`;
        this.itemTypes = {
            ENTREE: 'entree',
            SIDE: 'side',
            FAMILY: 'family'
        };
        this.price = (price !== null && price !== undefined) ? Number(price) : 9.99;
        this.numberOfEntrees = (numberOfEntrees !== null && numberOfEntrees !== undefined) ? Number(numberOfEntrees) : 3;
        this.numberOfSides = (numberOfSides !== null && numberOfSides !== undefined) ? Number(numberOfSides) : 2;
        this.itemType = type || this.itemTypes.ENTREE;
        this.inventoryIDs = inventoryIDs || '';
        this.numSideLarge = (numSideL !== null && numSideL !== undefined) ? Number(numSideL) : 0;
        this.numEntreeLarge = (numEntresL !== null && numEntresL !== undefined) ? Number(numEntresL) : 0;
    }

    // Load an item by Name (buttonId) using a pg Pool-like db
    static async fetchByName(db, buttonId) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        const q = 'SELECT * FROM items WHERE name = $1';
        const res = await db.query(q, [buttonId]);
        if (!res || !res.rows || res.rows.length === 0) return null;
        const row = res.rows[0];

        const itemName = row.name ?? buttonId;
        const itemPrice = row.price ?? null;
        const numEntrees = row.numentrees ?? null;
        const numSides = row.numsides ?? null;
        const itemId = row.itemid ?? buttonId;
        const type = row.type ?? '';
        const numSideL = row.numlargesides ?? 0;
        const numEntresL = row.numlargeentrees ?? 0;
        const invIDs = row.inventoryids ?? '';

        return new Item(itemId, itemName, itemPrice, numSides, numEntrees, invIDs, type, numSideL, numEntresL);
    }
}

export default Item;