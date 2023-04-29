const express = require('express');
const mysql = require('mysql2');
const api = require('./routes/index')

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', api);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
  