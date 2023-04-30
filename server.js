const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const Table = require('cli-table');
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const currentDepartmenets = [];
const currentRoles = [];

//console.log(process.env.MySQL_password);

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: "Kakashka_89!",
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
            message:  "Please select one of the following",
            type: "list",
            name: "action",
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role\n']
        }
      )
      .then((data) => {
        switch(data.action) {
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
                inquirer.prompt(
                    {
                        message: "Please enter the department's name",
                        type: "input",
                        name: "departmentsName"
                    })
                    .then((department) => {
                        const sql = 'INSERT INTO departement (departement_name) VALUES (?)';
                        const params = [department.departmentsName];
                        db.query(sql, params, (err, result) => {
                            if (err) {
                              console.log(err);
                            }
                        });
                    }
                );
                init();
                break;
            case 'Add a role':
                inquirer.prompt(
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
                        choices: getAllDepartmentsArray()

                    }
                    )
                    .then((role) => {

                        var query = 'SELECT id FROM department WHERE department_name (?)';
                        db.query(query, [role.rolesDepartment], function (error, results, fields) {
                            if (err) {
                              console.log(err);
                              return;
                            }
                            if (results.length === 0) {
                              console.log('Department not found.');
                              return;
                            }
                            const departmentId = results[0].id;
                            const sql = 'INSERT INTO roles (title, salary, department_id) VALUES (?)';
                                const params = [role.rolesName, role.rolesSalary, departmentId];
                                db.query(sql, params, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                          
                          });          
                    });       
                init();
                break;
            case 'Add an employee':
                inquirer.prompt(
                    {
                        message: "Please enter the employee's First Name",
                        type: "input",
                        name: "employeesFirstName"
                    },
                    {
                        message: "Please enter the employee's Last Name",
                        type: "input",
                        name: "employeesLastName"
                    },
                    {
                        message: "Please enter the emplyee's role",
                        type: "list",
                        name: "employeesRole",
                        choices: [/*to do*/]
                    },
                    {
                        message: "Please enter employee's manager",
                        type: "input",
                        name: "employeesManager",
                        choices: [/*to do*/]

                    }
                    )
                    .then((employee) => {

                
                    })
                init();
                break;
            case 'Update an employee role':
                inquirer.prompt(
                    {
                        message: "Please select an employee from the list",
                        type: "input",
                        name: "updatedEmployee",
                        choices: [/*to do*/]

                    },
                    {
                        message: "Please enter the new role",
                        type: "list",
                        name: "updatedRole",
                        choices: [/*to do*/]
                    },
                    {
                        message: "Please enter the emplyee's role",
                        type: "list",
                        name: "employeesRole",
                        choices: [/*to do*/]
                    },
              
                    )
                    .then((employee) => {

                
                    })
                init();
                break;
            default:
            // code block
          }
        
      })
     
}
  
// Call the init function to start the program
init();

function getAllDepartments(){
    const sql = 'SELECT * FROM department';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Departments are available to be shown"); 
            return "";
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

function getAllRoles(){
    const sql = 'SELECT  roles.id AS Id, roles.title AS Title, department.department_name AS Department, roles.salary AS Salary FROM roles JOIN department ON roles.department_id = department.id ORDER BY roles.id;';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Roles are available to be shown"); 
            return "";
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
function getAllEmployees(){
    const sql = 'SELECT * FROM employee';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Employee are available to be shown"); 
            return "";
        }
        console.table(rows, ['id', 'first_name', 'last_name', 'role_id', 'manager_id']);
        init();
    });
}

function getAllDepartmentsArray(){
    const sql = 'SELECT * FROM department';
    db.query(sql, (err, rows) => {
        if (err) {
            console.log("No Departments are available to be shown"); 
            return "";
        }
        const returnArray = [];
        array.forEach(element => {
            returnArray.push(element.department_name)
        });

    });

}




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
  