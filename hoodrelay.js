const GpioFactory = require('./gpiofactory');
const gpio = GpioFactory.create();
const express = require('express');
var app = express();

const light = new gpio(4, 'out');
const lofan = new gpio(22, 'out');
const medfan = new gpio(6, 'out');
const hifan = new gpio(26, 'out');

function dolight(turnon) {
    console.log('setting light to %s', turnon);
    if (turnon) {
        light.writeSync(1);
    } else {
        light.writeSync(0);
    }
}

function dofan(speed) {
    lofan.writeSync(0);
    medfan.writeSync(0);
    hifan.writeSync(0);
    if (speed > 0) {
        console.log('setting fan to speed %d', speed);
        switch(speed) {
            case 1: lofan.writeSync(1); break;
            case 2: medfan.writeSync(1); break;
            case 3: hifan.writeSync(1); break;
        }
    } else {
        console.log('turned fan off')
    }
}

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.post('/light', function (req, res) {
    console.log('received POST: %s', req.query);
    var val = req.query.value;
    if (val === "on") {
        dolight(true);
    } else if (val === "off") {
        dolight(false);
    } else {
        console.log("no action taken for POST");    }
});

app.post('/fan', function (req, res) {
    console.log('received POST: %s', req.query);
    var setvalue = 0;
    var speed = req.query.speed;
    switch (speed) {
        case "1": setvalue = 1; break;
        case "2": setvalue = 2; break;
        case "3": setvalue = 3; break;
    } 
    dofan(setvalue);
    console.log("Fan set to %s", setvalue);
});

app.get('/state', function (req, res) {
    console.log('received GET: %s', req.originalUrl);
    var fanval = 0; 
    var lightval = light.read();
    if (lofan.read() === 1) {
        fanval = 1;
    } else if (medfan.read() === 1) {
        fanval = 2;
    } else if (hifan.read() === 1) {
        fanval = 3;
    }        
    res.json({light: lightval, fan: fanval});
});

dolight(false);
dofan(0);

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("HoodRelay app listening at http://%s:%s", host, port)
 });