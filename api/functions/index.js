const functions = require('firebase-functions');
const feed = require('rss-to-json');
const express = require('express');

const app = express();

app.get('/', function (req, res) {
    feed.load('http://www.sritown.com/manga/one_piece/rss.php', function (err, rss) {
        if (!err) {
            res.status(200).send(rss.items);
        } else {
            res.status(404).send(JSON.stringify({
                message: 'Not Found!'
            }))
        }
    });
})
exports.api = functions.https.onRequest(app);