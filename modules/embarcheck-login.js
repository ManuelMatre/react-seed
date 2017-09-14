module.exports = function (supervisorData) 
{
	try {
		var key;
		switch(supervisorData.location){
			case "Las Mercedes": key = 951358; break;
			case "Santa Maria": key = 146528; break;
			case "Don Roberto": key = 326874; break;
			case "Sonhofrut Calle 4": key = 326845; break;
			case "Sonhofrut Pesqueira": key = 951256; break;
			default: return { status: false, message: 'Locación desconocida.' };
		}

		if (key == supervisorData.key) 
			return { status: true, message: '' };
	} catch (e) {
		console.log(e);
		return { status: false, message: 'Usuario desconocido.' };
	}
};