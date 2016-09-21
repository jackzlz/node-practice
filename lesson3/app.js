var express = require('express');

var superagent = require('superagent');

var cheerio = require('cheerio');

var app = express();

app.get('/', function(req, res, next) {

    superagent.get('https://cnodejs.org/').end(function(err, sres) {
        if (err) {
            return next(err);
        }

        var $ = cheerio.load(sres.text);

        var items = [];

        $('#topic_list .cell').each(function(idx, element) {
            var $element = $(element);
            var headImg = $element.find(".user_avatar img");
            var title = $element.find('.topic_title');

            items.push({
                title: title.attr('title'),
                href: title.attr('href'),
                author: headImg.attr('title')
            });
        });

        res.send(items);
    });
});

app.listen(3000, function(req, res) {
    console.log('app is running at port 3000');
});
