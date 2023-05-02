// Require the necessary Node.js packages.
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
var figlet = require("figlet");
require('dotenv').config();


// Generate ASCII art using the "figlet" package.
figlet("Employee Tracker", { font: "ANSI Shadow" }, function (err, data) {
    if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
    }
    // Print the ASCII art to the console.
    console.log(data);
    // Call the "init" function to start the application.
    init();
});

// Connect to the MySQL database using the connection parameters.
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.MySQL_password,
        database: 'corporation_db'
    },
    console.log('Connected to the corporation_db database.')
);

// function that prompts the user for input using the inquirer module.
function init() {
    // Prompt the user for input using the inquirer module
    inquirer
        .prompt(
            {
                message: "Select one of the following:",
                type: "list",
                name: "action",
                choices: ['View all departments', 
                          'View all roles', 
                          'View all employees', 
                          'Add a department', 
                          'Add a role', 
                          'Add an employee', 
                          'Update an employee role'
                        ]
            }
        )
        .then((data) => {
            // Execute a function based on the user's input.
            switch (data.action) {
                case 'View all departments':
                    getAllDepartments();
                    break;
                case 'View all roles':
                    getAllRoles();
                    break;

                case 'View all employees':
                    getAllEmployees()
                    break;
                case 'Add a department':
                    addDepartment();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployee();
                    break;
            }

        })

}
//retrieves all departments from the database and displays them in a table.
function getAllDepartments() {
    // Define the SQL query to retrieve all departments.
    const sql = 'SELECT id as Id, department_name as Department FROM departments';
    // Execute the SQL query using the "db" connection.
    db.query(sql, (err, rows) => {
        // If an error occurs, display a message to the console and return.
        if (err) {
            console.log("No Departments are available to be shown");
            return;
        }
       
        console.table(rows);
        // Return to the main menu.
        init();
    });
}
//get all roles from the database and display them in a table
function getAllRoles() {
    // SQL query to select role information along with the department name and order by role id
    const sql = `SELECT roles.id AS Id, 
                        roles.title AS Title, 
                        departments.department_name AS Department, 
                        roles.salary AS Salary FROM roles 
                        JOIN departments ON roles.department_id = departments.id 
                        ORDER BY roles.id;`;
    // Execute the SQL query using the connection to the database
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Roles are available to be shown");
            return;
        }
        console.table(rows);
        init();
    });
}
function getAllEmployees() {
    // SQL query to join the employee, role, and department tables and get the required data
    const sql = `SELECT e1.id AS Id, 
                        e1.first_name AS Firstname, 
                        e1.last_name AS Lastname, 
                        roles.title as Title,  
                        departments.department_name AS Department, 
                        roles.salary AS Salary, 
                        CONCAT(e2.first_name, ' ', e2.last_name) AS Manager
                        FROM employees AS e1 
                        LEFT JOIN employees AS e2 ON e1.manager_id = e2.id
                        JOIN roles ON roles.id = e1.role_id 
                        JOIN departments ON roles.department_id = departments.id 
                        GROUP BY e1.id, e1.first_name, e2.last_name
                        ORDER BY e1.id;`;
    // Execute the SQL query
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Employee are available to be shown");
            return;
        }
        console.table(rows);
        // Call the init() function to prompt the user for input again
        init();

    });
}

// prompts the user to enter a new department name
function addDepartment() {
    // Define a SQL query that inserts the new department into the database
    inquirer.prompt(
        {
            message: "Please enter the department's name",
            type: "input",
            name: "departmentsName"
        })
        .then((department) => {
            const sql = 'INSERT INTO departments (department_name) VALUES (?)';
            const params = [department.departmentsName];
            // Execute the SQL query using the params array
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log(err);
                }
            });
            // Return to the main menu
            init();
        }
        );
}
//prompts the user to enter a new role name, salary, and department
function addRole() {
    // SQL query that retrieves all departments from the database
    db.query('SELECT * FROM departments', (err, rows) => {
        if (err) {
            console.log("No Departments are available to be shown");
            return;
        }
        // Create an array of department names to use in the inquirer prompt
        const departmentArray = [];
        rows.forEach(element => {
            departmentArray.push(element.department_name)
        });
        // Prompt the user to enter the new role's name, salary, and department
        inquirer.prompt(
            [
                {
                    message: "Please enter the role's name",
                    type: "input",
                    name: "rolesName"
                },
                {
                    message: "Please enter the role's salary",
                    type: "input",
                    name: "rolesSalary"
                },
                {
                    message: "Please enter the role's department",
                    type: "list",
                    name: "rolesDepartment",
                    choices: departmentArray

                }
            ]
        )
            .then((role) => {
                // Retrieve the ID of the selected department from the database
                const query = 'SELECT id FROM departments WHERE department_name =?';
                db.query(query, [role.rolesDepartment], function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (results.length === 0) {
                        console.log('Department not found.');
                        return;
                    }
                    const departmentId = results[0].id;
                    // Define a SQL query that inserts the new role into the database
                    const sql = `INSERT INTO roles (title, salary, department_id) 
                                 VALUES (?);`;
                    const params = [role.rolesName, role.rolesSalary, departmentId];
                    db.query(sql, [params], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                });
                // Return to the main menu
                init();
            });
    });

}

// Function to add an employee to the database
function addEmployee() {
    // Retrieve all roles from the database
    db.query('SELECT * FROM roles', (err, rows) => {
        if (err) {
            console.log("No roles are available to be shown");
            return;
        }
        const rolesId = [];
        const rolesArray = [];
        // Create an array of role names and IDs
        rows.forEach(element => {
            rolesArray.push(element.title);
            rolesId.push(element.id);
        });
        // Retrieve all employees from the database
        db.query('SELECT * FROM employees', (err, rows) => {
            if (err) {
                console.log("No employee are available to be shown");
                return;
            }
            const employeeArray = ["None"];
            const idArray = [-1];
            // Create an array of employee names and IDs
            rows.forEach(element => {
                employeeArray.push(element.first_name + " " + element.last_name);
                idArray.push(element.id);
            });
            // Prompt the user to enter employee details
            inquirer.prompt(
                [
                    {
                        message: "Please enter emplyee's first name",
                        type: "input",
                        name: "firstName"
                    },
                    {
                        message: "Please enter emplyee's last name",
                        type: "input",
                        name: "lastName"
                    },
                    {
                        message: "Please enter the emplyee's role",
                        type: "list",
                        name: "role",
                        choices: rolesArray
                    },
                    {
                        message: "Please enter the emplyee's manager",
                        type: "list",
                        name: "manager",
                        choices: employeeArray
                    }
                ]
            )
                .then((employee) => {
                    // Get the ID of the selected role
                    const roleIdx = rolesArray.indexOf(employee.role);
                    const roleId = rolesId[roleIdx];
                    // Get the ID of the selected manager
                    const managerIdx = employeeArray.indexOf(employee.manager);
                    let managerId = idArray[managerIdx];

                    if (managerId === -1) {
                        managerId = null;
                    }
                    const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?);`;
                    const params = [employee.firstName, employee.lastName, roleId, managerId];
                    db.query(sql, [params], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    // Return to the main menu
                    init();
                });


        });
    });

}


// This function updates the role of an existing employee
function updateEmployee() {
    // Select all employees from the employee table
    const sql = 'SELECT * FROM employees';
    db.query(sql, (err, rows) => {
        if (err) {
            // If there is an error, log an error message and return
            console.log("No employee are available to be shown");
            return;
        }

        // Create two arrays to hold employee names and their corresponding ids
        const employeeArray = [];
        const idArray = [];
        rows.forEach(element => {
            employeeArray.push(element.first_name + " " + element.last_name);
            idArray.push(element.id);
        });

        // Select all roles from the roles table
        db.query('SELECT * FROM roles', (error, role) => {

            if (error) {
                // If there is an error, log an error message and return
                console.log("No roles are available to be shown");
                return;
            }

            // Create two arrays to hold role names and their corresponding ids
            const rolesId = [];
            const rolesArray = [];
            role.forEach(element => {
                rolesArray.push(element.title);
                rolesId.push(element.id);
            });

            // Prompt the user to select an employee and their new role
            inquirer.prompt(
                [{
                    message: "Please select an employee from the list",
                    type: "list",
                    name: "employeeToUpdate",
                    choices: employeeArray
                },
                {
                    message: "Please enter the new role",
                    type: "list",
                    name: "updatedRole",
                    choices: rolesArray
                }]
            )
                .then((employee) => {
                    // Get the index of the selected employee and their corresponding id
                    const employeeIdx = employeeArray.indexOf(employee.employeeToUpdate);
                    const employeeId = idArray[employeeIdx];

                    // Get the index of the selected role and its corresponding id
                    const roleIdx = rolesArray.indexOf(employee.updatedRole);
                    const roleId = rolesId[roleIdx];

                    // Update the employee's role in the employee table
                    const params = [roleId, employeeId];
                    db.query(`UPDATE employees SET role_id = ? WHERE id = ?`, params, (err, result) => {
                        if (err) {
                            // If there is an error, log an error message
                            console.log("Could not update the employee's role");
                        }
                    });

                    // Return to the main menu
                    init();
                });
        });
    });
}
