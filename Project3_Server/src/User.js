class User {
    constructor(username, password, email, isEmployee) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.isEmployee = isEmployee;
    }

    static async fetchByUsername(db, username, password) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM users WHERE username = $1';
        const res = await db.query(q, [username]);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No user found with username:', username);
            return null;
        }

        const row = res.rows[0];
        const pass = row.password ?? '';
        const email = row.email ?? '';
        const isEmployee = row.isemployee ?? false;

        if (pass !== password) {
            console.log('Password mismatch for user:', username);
            return null; 
        }

        if (isEmployee) {
            return Employee.fetchByUsername(db, username, pass, email);
        } else {
            return Customer.fetchByUsername(db, username, pass, email);
        }
    }

    static async fetchAllUsers(db) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM users';
        const res = await db.query(q);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No users found in the database.');
            return [];
        }

        const users = [];
        for (const row of res.rows) {
            const username = row.username ?? '';
            const pass = row.password ?? '';
            const email = row.email ?? '';
            const isEmployee = row.isemployee ?? false;

            let user;
            if (isEmployee) {
                user = await Employee.fetchByUsername(db, username, pass, email);
            } else {
                user = await Customer.fetchByUsername(db, username, pass, email);
            }

            if (user) {
                users.push(user);
            }

            console.log(`Fetched User from DB: Username=${username}, Employee=${isEmployee}`);
        }

        return users;
    }

}

class Employee extends User {
    constructor(username, password, email, isEmployee, employeeID, name, role, wage, isManager) {
        super(username, password, email, isEmployee);

        this.employeeID = employeeID;
        this.name = name;
        this.role = role;
        this.wage = wage;
        this.isManager = isManager;
    }

    static async fetchByUsername(db, username, password, email) {
        if (!db || typeof db.query !== 'function') {
            throw new Error('DB pool not provided or invalid');
        }

        const q = 'SELECT * FROM employees WHERE username = $1';
        const res = await db.query(q, [username]);
        if (!res || !res.rows || res.rows.length === 0) {
            console.log('No employee found with username:', username);
            return null;
        }

        const row = res.rows[0];
        const employeeID = row.employeeid ?? -1;
        const name = row.name ?? '';
        const role = row.role ?? '';
        const wage = row.wage ?? 0;
        const isManager = row.ismanager ?? false;
        

        console.log(`Fetched Employee from DB: Username=${username}, ID=${employeeID}`);
        return new Employee(username, password, email, true, employeeID, name, role, wage, isManager);
    }

    static async fetchAllEmployees(db) {
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

            const employee = new Employee(username, pass, email, true, employeeID, name, role, wage, isManager);
            employees.push(employee);

            console.log(`Fetched Employee from DB: Username=${username}, ID=${employeeID}`);
        }

        return employees;
    }
}

class Customer extends User {
    constructor(username, password, email, isEmployee, name, rewardsPoints, phoneNumber) {
        super(username, password, email, isEmployee);

        this.name = name;
        this.rewardsPoints = rewardsPoints;
        this.phoneNumber = phoneNumber;

        console.log(`Customer created: ${username}`);
    }

    static async fetchByUsername(db, username, password, email) {
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

        return new Customer(username, password, email, false, name, rewardsPoints, phoneNumber);
    }

    static async fetchAllCustomers(db) {
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

            const customer = new Customer(username, pass, email, false, name, rewardsPoints, phoneNumber);
            customers.push(customer);

            console.log(`Fetched Customer from DB: Username=${username}`);
        }

        return customers;
    }
}

export default User;
export { Employee, Customer };