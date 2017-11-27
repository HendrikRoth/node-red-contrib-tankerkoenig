var request = require('request')

module.exports = function(RED) {
	var locations = {}

	function TankerkoenigConfig(config) {
		var self = this
		RED.nodes.createNode(self, config)

		self.config = {
			key: config.key,
			latitude: config.latitude,
			longitude: config.longitude,
			petroltype: config.petroltype,
			radius: config.radius
		}

		locations[self.id] = self
	}

	RED.nodes.registerType('tankerkoenig-config', TankerkoenigConfig)

	function Tankerkoenig(n) {
		var self = this
		RED.nodes.createNode(self, n)
		self.on('input', function(msg) {
			var l = locations[n.location].config
			request('https://creativecommons.tankerkoenig.de/json/list.php?lat='+ l.latitude +'&lng='+ l.longitude +'8&rad='+ l.radius +'&sort=dist&type='+ l.petroltype +'&apikey='+ l.key, function(error, response, body) {
				var resp = JSON.parse(body)
				if (error) {
					self.error(error)
				} else if (resp.status === 'error') {
					self.error(resp.message)
				} else {
					msg.payload = resp.stations.slice(0, 10)
					self.send(msg)
				}
			})
		})
	}

	RED.nodes.registerType('tankerkoenig', Tankerkoenig)
}
