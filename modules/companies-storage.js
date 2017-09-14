var storage = require('node-persist');
storage.initSync();

module.exports = function (terminalInfo, maxTerminals) 
{
	var terminals = getTerminals();
	var companyTerminals = terminals[terminalInfo.companyName];
	var terminalStatus = {
		isValid: true,
		isNew: false
	};

	if (isNew()) {
		if (maxTerminals > companyTerminals.length){
			companyTerminals.push(terminalInfo.macAdd);
			storage.setItemSync('terminals', terminals);

			terminalStatus.message = 'Terminal recien agregada';
			terminalStatus.isNew = true;
		} else {
			terminalStatus.message = 'Maximo de terminales';
			terminalStatus.isValid = false;
		}
	} else {
		terminalStatus.message = 'Ya esta registrado';
	}
	return terminalStatus;

	function isNew () {
		for (var i = companyTerminals.length - 1; i >= 0; i--) {
			if (companyTerminals[i] == terminalInfo.macAdd) {
				return false;
			}
		}
		return true;
	}

	function getTerminals () {
		var terminals= storage.getItemSync('terminals');

		if (typeof terminals === 'undefined') {
			terminals = {};
			terminals[terminalInfo.companyName] = [];
		}
		return terminals;
	}
};

