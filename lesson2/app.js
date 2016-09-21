var express = require('express');

var utility = require('utility');

var app = express();

app.get('/', function(req, res) {
    var q = req.query.q;

    var md5Value = utility.md5(q);

    var sha1Value = utility.sha1(q);

    res.send(sha1Value);
});

app.listen(3000, function(req, res) {
    console.log('app is running at port 3000');
});
