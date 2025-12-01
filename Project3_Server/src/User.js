class User {
    constructor(username = '', password = '', email = '', isEmployee = false) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.isEmployee = isEmployee;
    }

    static async FetchByUsername(db, username, password) {
        return Employee.FetchByUsername(db, username, password);
    }

    FetchAllUsers(db) {
        console.log('Deprecated: FetchAllUsers called. Use FetchAllEmployees');
        return null;
    }
    static async AuthenticateLogin(db, username = "", password = "", googleId = null) {
        //googleId auth
        let user = null;
        if (googleId) {
            console.log(`Authenticating Google ID `);
            user = await User.FetchByGoogleId(db, googleId);
            if(!user) {
                console.log('Authentication failed for Google ID:', googleId);
                return null;
            }
            return user;
        }

        //Username /password auth
        console.log(`Authenticating login for user: ${username}`);
        user = await User.FetchByUsername(db, username, password);
        if(!user) {
            console.log('Authentication failed for user:', username);
            return null;
        }
        return user;
    }
    static async FetchByGoogleId(db, googleId) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        const q = 'SELECT * FROM Users WHERE googleid = $1';
        const res = await db.query(q, [googleId]);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No employee found with Google ID:', googleId);
            
            return null;
        }
        const row = res.rows[0];
        const username = row.username ?? '';
        const pass = row.password ?? '';
        const email = row.email ?? '';
        const isEmployee = row.isemployee ?? false;

        if (isEmployee) {
            return Employee.FetchByUsername(db, username, pass, email);
        } else {
            return Customer.FetchByUsername(db, username, pass, email);
        }
    }
    static async LinkGoogleIdToUser(db, username, googleId) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        const q = 'UPDATE Users SET googleid = $1 WHERE username = $2';
        const res = await db.query(q, [googleId, username]);
        if (res.rowCount === 0) {
            console.log('No user found to update with username:', username);
            return false;
        }
        console.log('Updated user with Google ID:', username);
        if(res.isemployee) {
            console.log('Linking Google ID to Employee');
            await Employee.LinkGoogleIdToEmployee(db, username, googleId);
        }
        else {
            console.log('Linking Google ID to Customer not implemented yet.');
            // await Customer.LinkGoogleIdToCustomer(db, username, googleId);
        }
        return true;
    }
    static async UnlinkGoogleIdFromUser(db, username) {
                if (!db || typeof db.query !== 'function') {
                    throw new Error('DB pool not provided or invalid');
                }
                const q = 'UPDATE Users SET googleid = NULL WHERE username = $1';
                const res = await db.query(q, [username]);
                if (res.rowCount > 0) {
                    console.log('Unlinked Google ID from user:', username);
                    return true;
                }
                console.log('No user found to unlink Google ID:', username);
                return false;
            }
           
    static async UnlinkGoogleId(db, username) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        // Fetch user to determine type
        const user = await User.FetchByUsername(db, username, undefined);
        if (!user) {
            console.log('No user found for unlink operation:', username);
            return false;
        }
        let result = await User.UnlinkGoogleIdFromUser(db, username);
        if (user.isEmployee) {
            result = await Employee.UnlinkGoogleIdFromEmployee(db, username) || result;
        }
        // If you add a Customer.UnlinkGoogleIdFromCustomer, call it here
        return result;
    }
}

class Employee extends User {
    constructor(username = '', password = '', email = '', employeeID = -1, name = '', role = '', wage = 0, isManager = false) {
        super(username, password, email, true);

        this.employeeID = employeeID;
        this.name = name;
        this.role = role;
        this.wage = wage;
        this.isManager = isManager;
    }

    static async FetchByUsername(db, username, password, email) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM employees WHERE username = $1';
        const res = await db.query(q, [username]);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No employee found with username:', username);
            return null;
        }
        // console.log('Employee query result:', res.rows);

        const row = res.rows[0];
        const employeeID = row.employeeid ?? -1;
        const name = row.name ?? '';
        const role = row.role ?? '';
        const wage = row.wage ?? 0;
        const isManager = row.ismanager ?? false;
        const pass = row.password ?? password;

        // If password is incorrect:
        if (pass !== password) {
            console.log('Incorrect password for employee:', username);
            return null;
        }

        // console.log(`Fetched Employee from DB: Username=${username}, ID=${employeeID}`);
        return new Employee(username, password, email, employeeID, name, role, wage, isManager);
    }

    static async FetchAllEmployees(db) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM employees';
        const res = await db.query(q);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No employees found in the database.');
            return [];
        }

        const employees = [];
        for (const row of res.rows) {
            const username = row.username ?? '';
            const pass = row.password ?? '';
            const email = row.email ?? '';
            const employeeID = row.employeeid ?? -1;
            const name = row.name ?? '';
            const role = row.role ?? '';
            const wage = row.wage ?? 0;
            const isManager = row.ismanager ?? false;

            const employee = new Employee(username, pass, email, employeeID, name, role, wage, isManager);
            employees.push(employee);

            // console.log(`Fetched Employee from DB: Username=${username}, ID=${employeeID}`);
        }

        return employees;
    }
    static async LinkGoogleIdToEmployee(db, username, googleId) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        const q = 'UPDATE Employees SET googleid = $1 WHERE username = $2';
        const res = await db.query(q, [googleId, username]);
        if (res.rowCount === 0) {
            console.log('No user found to update with username:', username);
            return false;
        }
        console.log('Updated user with Google ID:', username);
        return true;
    }
     static async UnlinkGoogleIdFromEmployee(db, username) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }
        const q = 'UPDATE Employees SET googleid = NULL WHERE username = $1';
        const res = await db.query(q, [username]);
        if (res.rowCount > 0) {
            console.log('Unlinked Google ID from employee:', username);
            return true;
        }
        console.log('No employee found to unlink Google ID:', username);
        return false;
    }
}

// THis entire class is deprecated but i don't want to delete it because it may break stuff
class Customer extends User {
    constructor(username, password, email, name, rewardsPoints, phoneNumber) {
        super(username, password, email, false);

        this.name = name;
        this.rewardsPoints = rewardsPoints;
        this.phoneNumber = phoneNumber;

        console.log(`Customer created: ${username}`);
    }

    static async FetchByUsername(db, username, password, email) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM customers WHERE username = $1';
        const res = await db.query(q, [username]);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No customer found with username:', username);
            return null;
        }

        const row = res.rows[0];
        const name = row.name ?? '';
        const rewardsPoints = row.rewardspoints ?? 0;
        const phoneNumber = row.phonenumber ?? '';

        console.log(`Fetched Customer from DB: Username=${username}`);

        return new Customer(username, password, email, name, rewardsPoints, phoneNumber);
    }

    static async FetchAllCustomers(db) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM customers';
        const res = await db.query(q);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No customers found in the database.');
            return [];
        }

        const customers = [];
        for (const row of res.rows) {
            const username = row.username ?? '';
            const pass = row.password ?? '';
            const email = row.email ?? '';
            const name = row.name ?? '';
            const rewardsPoints = row.rewardspoints ?? 0;
            const phoneNumber = row.phonenumber ?? '';

            const customer = new Customer(username, pass, email, name, rewardsPoints, phoneNumber);
            customers.push(customer);

            console.log(`Fetched Customer from DB: Username=${username}`);
        }

        return customers;
    }
}

export default User;
export { Employee, Customer };