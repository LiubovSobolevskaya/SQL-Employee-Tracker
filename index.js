const mysql = require('mysql2');
const inquirer = require('inquirer');
const Table = require('cli-table');
var figlet = require("figlet");
const currentDepartmenets = [];
const currentRoles = [];
require('dotenv').config();



figlet("Employee Tracker", { font: "ANSI Shadow"}, function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
  init();
});


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.MySQL_password,
        database: 'corporation_db'
    },
    console.log('Connected to the corporation_db database.')
);


// Function to initialize the program
function init() {
    // Prompt the user for input using the inquirer module
    inquirer
        .prompt(
            {
                message: "Select one of the following:",
                type: "list",
                name: "action",
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
            }
        )
        .then((data) => {
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

// Call the init function to start the program


function getAllDepartments() {
    const sql = 'SELECT * FROM department';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Departments are available to be shown");
            return;
        }

        const table = new Table({
            head: ['Id', 'Department']
        });

        // Add each row of data to the table
        rows.forEach(row => {
            table.push(Object.values(row));
        });

        // Output the table to the console
        console.log(table.toString());

        init();
    });
}

function getAllRoles() {
    const sql = `SELECT roles.id AS Id, 
                        roles.title AS Title, 
                        department.department_name AS Department, 
                        roles.salary AS Salary FROM roles 
                        JOIN department ON roles.department_id = department.id 
                        ORDER BY roles.id;`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Roles are available to be shown");
            return;
        }
        //console.log(rows); //['Id', 'Title', 'Department', 'Salary']);
        // Create a new table with column headers
        const table = new Table({
            head: ['Id', 'Title', 'Department', 'Salary']
        });

        // Add each row of data to the table
        rows.forEach(row => {
            table.push(Object.values(row));
        });

        // Output the table to the console
        console.log(table.toString());
        init();
    });
}
function getAllEmployees() {
    const sql = `SELECT e1.id AS Id, 
                        e1.first_name AS Firstname, 
                        e1.last_name AS Lastname, 
                        roles.title as Title,  
                        department.department_name AS Department, 
                        roles.salary AS Salary, 
                        CONCAT(e2.first_name, ' ', e2.last_name) AS Manager
                        FROM employee AS e1 
                        LEFT JOIN employee AS e2 ON e1.manager_id = e2.id
                        JOIN roles ON roles.id = e1.role_id 
                        JOIN department ON roles.department_id = department.id 
                        GROUP BY e1.id, e1.first_name, e2.last_name
                        ORDER BY e1.id;`;

    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Employee are available to be shown");
            return;
        }
        const table = new Table({
            //head: ['Id', 'Firstname', 'Lastname', 'Title', 'Department', 'Salary', 'Manager']
        });

        // Add each row of data to the table
        rows.forEach(row => {
            if (row.Manager === null) {
                row.Manager = "NULL";
            }
            table.push(Object.values(row));
        });

        // Output the table to the console
        console.log(table.toString());
        init();

    });
}


function addDepartment() {
    inquirer.prompt(
        {
            message: "Please enter the department's name",
            type: "input",
            name: "departmentsName"
        })
        .then((department) => {
            const sql = 'INSERT INTO department (department_name) VALUES (?)';
            const params = [department.departmentsName];
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.log(err);
                }
            });
            init();
        }
        );

}

function addRole() {
    const sql = 'SELECT * FROM department';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Departments are available to be shown");
            return;
        }
        const departmentArray = [];
        rows.forEach(element => {
            departmentArray.push(element.department_name)
        });

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
                var query = 'SELECT id FROM department WHERE department_name =?';
                db.query(query, [role.rolesDepartment], function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (results.length === 0) {
                        console.log('Department not found.');
                        return;
                    }
                    console.log(results);
                    const departmentId = results[0].id;

                    const sql = `INSERT INTO roles (title, salary, department_id) 
                                 VALUES (?);`;
                    const params = [role.rolesName, role.rolesSalary, departmentId];
                    db.query(sql, [params], (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                });
                init();
            });
    });

}
function addEmployee() {
    const sql = 'SELECT * FROM roles';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No roles are available to be shown");
            return;
        }
        const rolesId = [];
        const rolesArray = [];
        rows.forEach(element => {
            rolesArray.push(element.title);
            rolesId.push(element.id);
        });
        const sql = 'SELECT * FROM employee';
        db.query(sql, (err, rows) => {
            if (err) {
                console.log("No employee are available to be shown");
                return;
            }
            const employeeArray = ["None"];
            const idArray = [-1];
            rows.forEach(element => {
                employeeArray.push(element.first_name + " " + element.last_name);
                idArray.push(element.id);
            });
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
                const roleIdx = rolesArray.indexOf(employee.role);
                const roleId = rolesId[roleIdx];
                const managerIdx = employeeArray.indexOf(employee.manager);
                let managerId = idArray[managerIdx];
        
                if(managerId === -1){
                    managerId = null;
                }
                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?);`;
                const params = [employee.firstName, employee.lastName, roleId, managerId];
                db.query(sql, [params], (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                });
                init();    
            });
           
        
        });
    });

}


function updateEmployee() {

    const sql = 'SELECT * FROM employee';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No employee are available to be shown");
            return;
        }

        const employeeArray = [];
        const idArray = [];
        rows.forEach(element => {
            employeeArray.push(element.first_name + " " + element.last_name);
            idArray.push(element.id);
        });
        db.query('SELECT * FROM roles', (error, role) => {

            if (error) {
                console.log("No roles are available to be shown");
                return;
            }

            const rolesId = [];
            const rolesArray = [];
            role.forEach(element => {
                rolesArray.push(element.title);
                rolesId.push(element.id);
            });
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

                const employeeIdx = employeeArray.indexOf(employee.employeeToUpdate);
                const employeeId = idArray[employeeIdx];
                const roleIdx = rolesArray.indexOf(employee.updatedRole);
                const roleId = rolesId[roleIdx];
                const params = [roleId, employeeId];

                db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, params, (err, result) => {
                  console.log("I am here!\n");   
                  console.log(result);
                  if (err) {
                    console.log("Could not update the employee's role");
                  } 
                 
                });
                init();
            });
        });
    });       
}