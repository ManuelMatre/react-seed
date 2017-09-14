var crypto = require('crypto');

module.exports = { decryptIt: decryptIt, encryptIt: encryptIt };

function decryptIt (value, keyPass) {
	var decipher = crypto.createDecipher('aes-128-ecb', keyPass);

	chunks = []
	chunks.push( decipher.update(value, 'base64', 'binary') );
	chunks.push( decipher.final('binary') );
	var txt = chunks.join("");
	txt = new Buffer(txt, "binary").toString("utf-8");
	return txt;
}

function encryptIt (data, keyPass) {
	var cipher = crypto.createCipher('aes-128-ecb', keyPass);
	return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
}