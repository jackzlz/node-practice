var express = require('express');

var superagent = require('superagent');

var cheerio = require('cheerio');

var EventProxy = require('eventproxy');

var ep = new EventProxy();

var url = require('url');

var cnodeUrl = "https://cnodejs.org/";

var app = express();


app.get('/', function(req, res, next) {


});

superagent.get(cnodeUrl).end(function(err, sres) {
    if (err) {
        return next(err);
    }

    var topicUrls = [];
    var $ = cheerio.load(sres.text);

    var items = [];

    $('#topic_list .topic_title').each(function(idx, element) {
        var $element = $(element);
        var href = url.resolve(cnodeUrl, $element.attr('href'));
        topicUrls.push(href);
    });

    ep.emit('topic_url', topicUrls);
});

ep.all('topic_url', function(topicUrls) {
    topicUrls.forEach(function(topicUrl) {
        superagent.get(topicUrl).end(function(err, sres) {
            console.log('fetch ' + topicUrl + ' successful');
            ep.emit('topic_html', [topicUrl, sres.text]);
        });
    });

    ep.after('topic_html', topicUrls.length, function(topics) {
        var topicInfo = topics.map(function(topicPair) {
            var topicUrl = topicPair[0];
            var topicHtml = topicPair[1];
            var $ = cheerio.load(topicHtml);

            var obj = {
                title: $('.topic_full_title').text().trim(),
                href: topicUrl,
                comment: $('.reply_content').eq(0).text().trim(),
                author: $('.reply_author').eq(0).text().trim()
            };
            var authorHref = $('.reply_author').eq(0).attr('href');
            if (authorHref) {
                var authorUrl = url.resolve(cnodeUrl, authorHref);
                superagent.get(authorUrl).end(function(err, sres) {
                    var $ = cheerio.load(sres.text);
                    var score = $('.user_profile .big').text();
                    obj.score = score;
                    ep.emit('topic_repay', obj);
                });
            } else {
                ep.emit('topic_repay', {});
            }







            // return ({
            //     title: $('.topic_full_title').text().trim(),
            //     href: topicUrl,
            //     comment: $('.repay_content').eq(0).text().trim(),
            //     author: $('.reply_author').eq(0).text().trim()
            // });
        });
        // console.log('final:');
        // console.log(topicInfo);



    });

    ep.after('topic_repay', topicUrls.length, function(topics) {
        topics.forEach(function(topic) {
            console.log('final:');
            console.log(topic);
        });

    });

});
