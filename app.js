
const express = require('express');
const routes = require('./routes');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Se hizo una consulta a: ${req.url}`);
  next();
});

app.use(routes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});