var express = require('express');

var superagent = require('superagent');

var cheerio = require('cheerio');

var url = require('url');

var cnodeUrl = "https://cnodejs.org/";

var async = require('async');

var getTopicUrls = function(callback) {
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
        callback(null, topicUrls);
    });
};

var getTopicHtmls = function(topicUrls, callback) {
    async.mapSeries(topicUrls, function(topicUrl, callback) {
        superagent.get(topicUrl).end(function(err, sres) {
            console.log('fetch ' + topicUrl + ' successful');
            callback(null, {
                topicUrl: topicUrl,
                topicHtml: sres.text
            });
        });
    }, function(err, results) {
        callback(null, results);
    });
};


var getTopicReplys = function(topicHtmls, callback) {
    async.mapSeries(topicHtmls, function(topic, callback) {
        var topicUrl = topic.topicUrl;
        var topicHtml = topic.topicHtml;
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
                callback(null, obj);
            });
        } else {
            callback(null, {});
        }
    }, function(err, results) {
        callback(null, results);
    });
};

async.waterfall([getTopicUrls, getTopicHtmls, getTopicReplys], function(err, result) {
    result.forEach(function(topic) {
        console.log('final:');
        console.log(topic);
    });
});
