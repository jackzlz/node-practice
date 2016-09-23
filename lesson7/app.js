var express = require('express');
var morgan = require('morgan');

var fs = require('fs');
var path = require('path');

var app = new express();

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
    flags: 'a'
});

app.use(morgan('combined', {
    stream: accessLogStream
}));

app.get('/', function(req, res) {
    res.send('hello world');
});
app.post('/aaa', function(req, res) {
    res.send('aaa');
});
console.log(__dirname);
app.listen(3000);
