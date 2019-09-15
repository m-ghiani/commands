'use strict';
let express = require('express');
let fs = require('fs');
let path = require('path');
let app = express();

const dir = './plugins';

let plugins = fs
  .readdirSync(dir)
  .filter(name => path.extname(name) === '.json')
  .map(name => require('./' + path.join(dir, name)));

app.get('/commands', function(req, res) {
  res.json(plugins);
});

app.get('/commands/:type', function(req,res){
    res.json(plugins.filter(function(plugin){ if(plugin.name == req.params.type) return true; })[0]);
});


app.get('/command/:type/:name', function(req,res){
    var plugin = plugins.filter(function(plugin){ if(plugin.name == req.params.type) return true; })[0];
    console.dir(plugin);
    if (plugin) {
        var command = plugin.commands.filter(function(command){if(command.name == req.params.name) return true;})[0];
        if(command){
            res.json(command.value);
        } else {
            res.json("error");
        }
    } else {
        res.json("error");
    }
});


app.listen(3000, function() {
  console.log('listening on port 3000');
});
