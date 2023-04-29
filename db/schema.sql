DROP DATABASE IF EXISTS corporation_db;
CREATE DATABASE corporation_db;

USE corporation_db;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(30) NOT NULL
);

CREATE TABLE roles(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(5,2) NOT NULL,
    department_id INT  NOT NULL,
    FOREIGN KEY (department_id )
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL
    last_name VARCHAR(30) NOT NULL
    role_id INT,
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    manager_id INT,
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
);