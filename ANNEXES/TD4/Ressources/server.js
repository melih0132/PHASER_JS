var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use("/",express.static(__dirname + '/public'));

http.listen(3000, function () {
    console.log(`Server is listening on $:${http.address().port}`);
  });