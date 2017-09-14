const sql = require('mssql');

module.exports = { getLoads: getLoads, getLoadInfo: getLoadInfo };

function getLoads (_callback) {
    var config = getSqlConfig();
    sql.connect(config, function (err) {
        if (err){
            console.log(err);
            _callback({status: false, message: 'dbError', result: [] });
            sql.close();
        } else {
            var strQuery = "select c_codigo_man, v_numcaj_man from t_manifiesto "
                        + "where c_activo_man = 1 and d_embarque_man between '05/29/2013' and '05/29/2013 23:59:59'";

            var request = new sql.Request();
            request.query(strQuery, function (err, recordset) {
                if (err){
                    _callback({status: false, message: 'dbError', result: [] });
                    console.log(err);
                    sql.close();
                } 
                else{
                    /************************** QUITAR ***********************/
                    recordset.recordset.forEach(function(item) { 
                        item.c_codigo_man = item.c_codigo_man.substring(0,6);
                    });

                    _callback({status: true, message: '', result: recordset.recordset });
                    console.log(recordset.recordset);
                    sql.close();
                }
            });
        }
    });
}

function getLoadInfo (_callback, c_codigo_man) {
    var config = getSqlConfig();
    sql.connect(config, function (err) {
        if (err){
            console.log(err);
            _callback({status: false, message: 'dbError', result: [] });
            sql.close();
        } else {
            //var strQuery1 = "select c_codigo_tem from t_temporada where c_activo_tem = 1";
            var codTempActivo;
            /*var request = new sql.Request();
            request.query(strQuery1, function (err, recordset) {
                if (err){
                    _callback({status: false, message: 'dbError', result: [] });
                    console.log(err);
                    sql.close();
                } 
                else{
                    if (recordset.recordset.length > 0)
                        codTempActivo = recordset.recordset[0];
                    else
                        _callback({status: false, message: 'dbError', result: [] });

                    console.log(recordset.recordset);
                }*/
                getLoadDetails();
            //});


            function getLoadDetails () {
                console.log(c_codigo_man);
                var strQuery2 = "select c_codigo_pro, c_codigo_eti from t_palet "
                                + "where c_codigo_man = '" + c_codigo_man + "    ' ";
                                //+ "and c_codigo_tem = '" + codTempActivo + "'";

                request = new sql.Request();
                request.query(strQuery2, function (err, recordset) {
                    if (err){
                        _callback({status: false, message: 'dbError', result: [] });
                        console.log(err);
                        sql.close();
                    } 
                    else{
                        //console.log(recordset.recordset);
                        var productList = [];
                        var codigoProducto = '';
                        var objeto = {};

                        recordset.recordset.forEach(function(item) { 
                            if (item.c_codigo_pro.toString().length != 4) item.c_codigo_pro = "0" + item.c_codigo_pro;
                            if (item.c_codigo_eti.toString().length != 2) item.c_codigo_eti = "0" + item.c_codigo_eti;
                            codigoProducto = "" + item.c_codigo_pro + item.c_codigo_eti;
                            objeto = productList.find(elem => elem.keyProduct == codigoProducto)
                            if (objeto) objeto.productQuantity++;
                            else productList.push({ keyProduct: codigoProducto, productQuantity: 1 })
                        });
                        console.log(productList);

                        _callback({status: true, message: '', result: productList });
                        sql.close();
                    }
                });
            }
        }
    });
}

function getSqlConfig () {
    return {
        user: 'molina',
        password: 'molina',
        server: 'DESKTOP-93FB5I6',
        database: 'DBMolina',
        port: 1433,
        debug: true,
        options: {
            encrypt: false // Use this if you're on Windows Azure
            ,instanceName: 'MSSQLSERVER'
        }
    };
}