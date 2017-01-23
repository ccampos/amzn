var application_root = __dirname,
    mongoose = require('mongoose'),
    express = require('express'),
    path = require('path'),
    app = express(),
    db,
    Schema = mongoose.Schema,
    http = require('http');

// Access Control Allow Origin
app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
});

connectResults();

function connectResults() {
    mongoose.connect('mongodb://localhost/running');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
        var results = mongoose.model('Results', new Schema ({firstName: String, seconds: Number},{collection: 'results'}));
        results.find({seconds: {$lt: 1320}},
            'firstName lastName age seconds',
            {
                sort: {
                    seconds: 1
                }
            },
            function(err, data) {
                if (err) { console.log(err); return };
                app.get('/', function(req, res) {
                    res.json(data);
                })
            }
        )
    });
};

// Launch server
app.listen(8125);
