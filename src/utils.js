const $ = require('jquery');

class Utils {

	static savePrefix(prefix) {
		$.getJSON('cfg.json', function(json) {
			console.log(prefix);
			console.log(json);
		});
	}

}

exports.Utils = Utils;