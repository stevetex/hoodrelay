const GpioFactory = require('./gpiofactory');
const gpio = GpioFactory.create();
const express = require('express');
var app = express();

app.use(function(req, res, next) { 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.post('/pin', function (req, res) {
    console.log('received POST: %s', req.query);
    var val = req.query.value;
    var pin = new gpio(val, 'out');
    pin.writeSync(1);
    ping.writeSync(0);
});

var server = app.listen(8082, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("HoodRelay app listening at http://%s:%s", host, port)
 });