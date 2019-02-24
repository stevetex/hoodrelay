const GpioFactory = require('./gpiofactory');
const gpio = GpioFactory.create();
const express = require('express');
var app = express();

// listening on this port
const serverport = 8081;

// pins used to control relays on Keyestudio 4-channel
// relay shield used with Raspberry Pi 3
const light = new gpio(26, 'out');  // relay 4
const lofan = new gpio(6, 'out');   // relay 3
const medfan = new gpio(22, 'out'); // relay 2
const hifan = new gpio(4, 'out');   // relay 1

// sets light (off, on) by writing boolean value to relay control pin
function dolight(turnon) {
    console.log('setting light to %s', turnon);
    if (turnon) {
        light.writeSync(1);
    } else {
        light.writeSync(0);
    }
}

// sets fan speed (off, low, med, high) by writing to relay control pins to
// turn all relays off then turning on the appropriate relay 
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

// headers required to host web and node server on same device
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Parses HTTP POST intended to set light value (off, on) and calls dolight() to set
app.post('/light', function (req, res) {
    console.log('received POST: %s', req.query);
    var val = req.query.value;
    if (val === "on") {
        dolight(true);
    } else if (val === "off") {
        dolight(false);
    } else {
        console.log("no action taken for POST");    }
    res.status(200).send('Ok\n');
});

// Parses HTTP POST intended to set fan value (off, low, med, high) and calls dofan() to set
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
    res.status(200).send('Ok\n');
});

// returns the current state of the light (off, on) and fan (off, low, med, high)
// by reading appropriate relay control pins
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

// turn light and fan off to start
dolight(false);
dofan(0);

var server = app.listen(serverport, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("HoodRelay app listening at http://%s:%s", host, port)
 });