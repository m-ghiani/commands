'use strict';
let express = require('express');
let fs = require('fs');
let path = require('path');
let net = require('net');
let dgram = require('dgram');

let app = express();
const plugins_dir = './plugins';
const servers_dir = './servers';

let plugins = fs
	.readdirSync(plugins_dir)
	.filter(name => path.extname(name) === '.json')
	.map(name => require('./' + path.join(plugins_dir, name)));

let servers = fs
	.readdirSync(servers_dir)
	.filter(name => path.extname(name) === '.json')
	.map(name => require('./' + path.join(servers_dir, name)));

app.get('/commands', function(req, res) {
	res.json(plugins);
});

app.get('/commands/:type', function(req, res) {
	res.json(
		plugins.filter(function(plugin) {
			if (plugin.name == req.params.type) return true;
		})[0]
	);
});

app.get('/command/:type/:name', function(req, res) {
	var plugin = plugins.filter(function(plugin) {
		if (plugin.name == req.params.type) return true;
	})[0];
	console.dir(plugin);
	if (plugin) {
		var command = plugin.commands.filter(function(command) {
			if (command.name == req.params.name) return true;
		})[0];
		if (command) {
			res.json(command.value);
		} else {
			res.json('error');
		}
	} else {
		res.json('error');
	}
});

app.get('/SendCommand/:server/:command', function(req, res) {
	var server = servers.filter(function(server) {
		if (server.name == req.params.server) return true;
	})[0];
	if (server) {
		var plugin = plugins.filter(function(plugin) {
			if (plugin.name == server.type) return true;
		})[0];
		if (plugin) {
			var command = plugin.commands.filter(function(command) {
				if (command.name == req.params.command) return true;
			})[0];
			if (command) {
				switch (server.communication) {
					case 'tcp':
						let tcpclient = new net.Socket();
						tcpclient.connect(server.port, server.host, function() {
							console.log('Connected');
							tcpclient.write(command);
							res.json({ command: command });
						});
						break;
					case 'udp':
                            let udpclient = dgram.createSocket('udp4');
                            udpclient.send(command, 0, command.length, server.port, server.host, function(err, bytes) {
                              if (err) throw err;
                              res.json({ error: 'communication error' });
                              udpclient.close();
                            });
						break;
				}
			} else {
				res.json({ error: 'command not found' });
			}
		} else {
			res.json({ error: 'plugin not loaded' });
		}
	} else {
		res.json({ error: 'server not loaded' });
	}
});

app.listen(3000, function() {
	console.log('listening on port 3000');
});
