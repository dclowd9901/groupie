var express = require('express');
var app = express();

require('./controllers/index').set(app);

app.listen(3001);
console.log('running on port 3001');