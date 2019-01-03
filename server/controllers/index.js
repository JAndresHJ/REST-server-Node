const express = require('express');
const app = express();

// In order to use this routes, they must be listed in here

app.use(require('./login'));
app.use(require('./usuario'));
app.use(require('./category'));
app.use(require('./producto'));
app.use(require('./uploads'));
app.use(require('./images'));


module.exports = app;