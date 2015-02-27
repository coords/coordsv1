var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function (req, res)
{
    res.set('Content-Type', 'application/xhtml+xml');
    // res.set('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, '../public', 'index.xhtml'));
});

module.exports = router;
