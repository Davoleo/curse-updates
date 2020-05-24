const { JSDOM } = require('jsdom');
const { window } = new JSDOM('');
const $ = require('jquery')(window);


class Utils {

	static savePrefix(prefix) {
		$.getJSON('cfg.json', function(json) {
			console.log(prefix);
			console.log(json);
		});
	}

}

exports.Utils = Utils;