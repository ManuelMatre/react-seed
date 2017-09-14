var registerTerminal = require('./companies-storage.js');
var procheckCrypt = require('./procheck-crypt.js');
var fs = require('fs');

module.exports = function (terminalInfo) 
{
	var validationResults;
	try {
		validationResults = validateTerminal(terminalInfo);
	} catch (e) {
		console.log(e);
		validationResults = setValidationResult({}, 403, 'Usted no está autorizado para usar '
			+ 'esta aplicación.');
	}
	return validationResults;
};

function validateTerminal (terminalInfo) {
	var companyObject = getCompanyObject(terminalInfo.productKey, terminalInfo.companyName);

	var validationResults = {};

	if (typeof companyObject === 'undefined') {
		validationResults = setValidationResult({}, 401, 'Clave de activación incorrecta.');
	} else {
		var terminalStatus = registerTerminal(terminalInfo, companyObject.maxTerminals);
		if(!terminalStatus.isValid) {
			validationResults = setValidationResult({}, 401, 'Se ha alcanzado el límite de '
				+ 'dispositivos para su compañía. Contacte al proveedor para más información.');
		} else {
			if (!isMacValid(terminalInfo.macAdd, companyObject.cryptoPass)) {
				validationResults = setValidationResult({}, 401, 'Identificador de terminal no válido.');
			} else {
				console.log(terminalStatus.message);
				var securityModel = newSecurityModel(terminalStatus, terminalInfo, companyObject.cryptoPass);
				validationResults = setValidationResult(securityModel, 200, '');
			}
		}
	}
	return validationResults;
}

function getCompanyObject (productKey, companyName) {
	var companies = JSON.parse(fs.readFileSync('registeredCompanies.json', 'utf8'));
	var company = companies[companyName];
	
	if (company != undefined) {
		var decryptedProductKey = procheckCrypt.decryptIt(productKey, company.cryptoPass);
		console.log('Degub getCompanyObject');
		console.log('decripted: ');
		console.log(decryptedProductKey);
		console.log('serail send: ');
		console.log(company.serialKey);
		if (decryptedProductKey === company.serialKey) {
			return company;
		}
	}
}

function isMacValid (macAdd, cryptoPass) {
	var decryptedMac = procheckCrypt.decryptIt(macAdd, cryptoPass);
	var macParts = decryptedMac.split(':');
	return (macParts.length === 6);
}

function setValidationResult (objectResponse, statusCode, errorMessage) {
	return {
		objectResponse: objectResponse,
		statusCode: statusCode,
		errorMessage: errorMessage
	};
}

function newSecurityModel (terminalStatus, terminalInfo, cryptoPass) {
	var securityModel = {
		lastUpdate: procheckCrypt.encryptIt(getDateString(), cryptoPass),
		usagesPerMonth: procheckCrypt.encryptIt('0', cryptoPass),
		macAdd: terminalInfo.macAdd,
		companyName: terminalInfo.companyName
	}

	if (terminalStatus.isNew) {
		securityModel.installDate = procheckCrypt.encryptIt(getDateString(), cryptoPass);
		securityModel.daysCount = procheckCrypt.encryptIt('30', cryptoPass);
		securityModel.lastUse = procheckCrypt.encryptIt(getDateString(), cryptoPass);
	} else {
		var lastUpdate = procheckCrypt.decryptIt(terminalInfo.lastUpdate, cryptoPass);
		var daysLeft = getDaysLeft(lastUpdate);
		var daysCount = daysLeft + 30;

		securityModel.installDate = terminalInfo.installDate;
		securityModel.daysCount = procheckCrypt.encryptIt(daysCount.toString(), cryptoPass);
		securityModel.lastUse = terminalInfo.lastUse;
	}
	securityModel.productKey = generateProductKeyForTerminal(terminalInfo, securityModel.installDate, cryptoPass);

	return securityModel;
}

function getDateString () {
	var date = new Date();
	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

function getDaysLeft (dateString) {
	var lastUpdate = new Date(dateString);
	lastUpdate.setMonth(lastUpdate.getMonth() - 1);
	var currentDate = new Date(getDateString());

	return Math.round((currentDate-lastUpdate)/(1000*60*60*24));
}

function generateProductKeyForTerminal (terminalInfo, _installDate, cryptoPass) {
	var macAdd = procheckCrypt.decryptIt(terminalInfo.macAdd, cryptoPass).split(':');
	var installDate = procheckCrypt.decryptIt(_installDate, cryptoPass);
	var companyName = terminalInfo.companyName;

	var productKeyString = macAdd[0] + '_' + installDate + '_' + companyName + '_' + macAdd[macAdd.length - 1];

	return procheckCrypt.encryptIt(productKeyString, cryptoPass);
}