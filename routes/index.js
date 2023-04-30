
const inquirer = require('inquirer');
const miniApp = require('express').Router();

const employeesRouter = require('./employees');
const rolesRouter = require('./roles');
const departments = require('./departments');

miniApp.use('/employees', employeesRouter);
miniApp.use('/roles', rolesRouter);
miniApp.use('/departments', departments);

module.exports = miniApp;


