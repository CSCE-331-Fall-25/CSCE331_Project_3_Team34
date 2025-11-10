// ES module Item with DB loader
class Item {
    // constructor supports placeholders or full DB-provided values
    constructor(itemID, name = null, price = null, numberOfSides = null, numberOfEntrees = null, inventoryIDs = null, type = null, numSideL = null, numEntresL = null) {
        // Updates instance variables with parameters
        this.itemID = itemID;
        this.name = name || `item-${itemID}`;
        this.price = (price !== null && price !== undefined) ? Number(price) : 9.99;
        this.numberOfEntrees = (numberOfEntrees !== null && numberOfEntrees !== undefined) ? Number(numberOfEntrees) : 3;
        this.numberOfSides = (numberOfSides !== null && numberOfSides !== undefined) ? Number(numberOfSides) : 2;
        this.itemType = type || null;
        this.inventoryIDs = inventoryIDs || '';
        this.numSideLarge = (numSideL !== null && numSideL !== undefined) ? Number(numSideL) : 0;
        this.numEntreeLarge = (numEntresL !== null && numEntresL !== undefined) ? Number(numEntresL) : 0;
    }

    // Load an item by Name (buttonId) using a pg Pool-like db
    static async fetchByName(db, buttonId) {
        // Checks if the database exists
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        // Creates the query
        const q = 'SELECT * FROM items WHERE name = $1';
        const res = await db.query(q, [buttonId]);

        // If the query didn't return enough information
        if (!res || !res.rows || res.rows.length === 0) return null;
        
        // Isolate the queries first result
        const row = res.rows[0];

        // Obtain the row values
        const itemName = row.name ?? buttonId;
        const itemPrice = row.price ?? null;
        const numEntrees = row.numentrees ?? null;
        const numSides = row.numsides ?? null;
        const itemId = row.itemid ?? buttonId;
        const type = row.type ?? '';
        const numSideL = row.numlargesides ?? 0;
        const numEntresL = row.numlargeentrees ?? 0;
        const invIDs = row.inventoryids ?? '';

        console.log(`Fetched Item from DB: ID=${itemId}, Name=${itemName}, Price=${itemPrice}`);

        return new Item(itemId, itemName, itemPrice, numSides, numEntrees, invIDs, type, numSideL, numEntresL);
    }

    static async fetchAllItems(db) {
        // Checks if the database exists
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        // Creates the query
        const q = 'SELECT * FROM items';
        const res = await db.query(q);
        if (!res || !res.rows || res.rows.length === 0) return [];
        const items = [];
        
        // Loop through each element of the result and create Item instances
        for (const row of res.rows) {
            const itemName = row.name ?? `item-${row.itemid}`;
            const itemPrice = row.price ?? null;
            const numEntrees = row.numentrees ?? null;
            const numSides = row.numsides ?? null;
            const itemId = row.itemid ?? -1;
            const type = row.type ?? '';
            const numSideL = row.numlargesides ?? 0;
            const numEntresL = row.numlargeentrees ?? 0;
            const invIDs = row.inventoryids ?? '';
            console.log(`Fetched Item from DB: ID=${itemId}, Name=${itemName}, Price=${itemPrice}`);
            items.push(new Item(itemId, itemName, itemPrice, numSides, numEntrees, invIDs, type, numSideL, numEntresL));
        }

        return items;
    } 
}

class Menu {
    // constructor supports placeholders or full DB-provided values
    constructor(menuid, name = null, type = null, pricemod = null, inventoryids = null) {
        // Updates instance variables with parameters
        this.menuid = menuid;
        this.name = name || `menu-${menuid}`;
        this.type = type || null;
        this.pricemod = (pricemod !== null && pricemod !== undefined) ? Number(pricemod) : 0;
        this.inventoryids = inventoryids || '';
    }

    // Load menu item by Name (buttonId) using a pg Pool-like db
    static async fetchByName(db, buttonId) {
        // Checks if the database exists
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        // Creates the query
        const q = 'SELECT * FROM menu WHERE name = $1';
        const res = await db.query(q, [buttonId]);

        // If the query didn't return enough information
        if (!res || !res.rows || res.rows.length === 0) return null;
        
        // Isolate the queries first result
        const row = res.rows[0];

        // Obtain the row values
        const menuID = row.menuid ?? buttonId;
        const menuName = row.name ?? `menu-${menuID}`;
        const type = row.type ?? '';
        const priceMod = row.pricemod ?? 0;
        const invIDs = row.inventoryids ?? '';

        console.log(`Fetched Menu from DB: ID=${menuID}, Name=${menuName}, Price=${priceMod}`);

        return new Menu(menuID, menuName, type, priceMod, invIDs);
    }

    // Load menu items by type using a pg Pool-like db
    static async fetchByType(db, type) {
        // Checks if the database exists
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        // Case-insensitive query: match type regardless of capitalization
        const q = 'SELECT * FROM menu WHERE LOWER(type) = LOWER($1)';
        const res = await db.query(q, [type]);

        // If the query returned no rows, return an empty array (client expects an array)
        if (!res || !res.rows || res.rows.length === 0) return [];

        // Loop through each element of the result and create Menu instances
        const menus = [];
        for (const row of res.rows) {
            const menuID = row.menuid ?? -1;
            const menuName = row.name ?? `menu-${menuID}`;
            const rowType = row.type ?? '';
            const priceMod = row.pricemod ?? 0;
            const invIDs = row.inventoryids ?? '';

            menus.push(new Menu(menuID, menuName, rowType, priceMod, invIDs));
        }

        console.log(`Fetched ${menus.length} Menus of type=${type} from DB`);

        return menus;
    }

    static async fetchAllMenus(db) {
        // Checks if the database exists
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        // Creates the query
        const q = 'SELECT * FROM menu';
        const res = await db.query(q);
        if (!res || !res.rows || res.rows.length === 0) return [];

        // Loop through each element of the result and create Menu instances
        const menus = [];
        for (const row of res.rows) {
            const menuID = row.menuid ?? -1;
            const menuName = row.name ?? `menu-${menuID}`;
            const type = row.type ?? '';
            const priceMod = row.pricemod ?? 0;
            const invIDs = row.inventoryids ?? '';
            console.log(`Fetched Menu from DB: ID=${menuID}, Name=${menuName}, Price=${priceMod}`);
            menus.push(new Menu(menuID, menuName, type, priceMod, invIDs));
        }
        return menus;
    }
}

export default Item;
export { Menu };