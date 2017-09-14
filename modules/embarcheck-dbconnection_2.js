const sql = require('mssql/msnodesqlv8');

module.exports = function () 
{
    var config = {
        user:'sa'            //SQL User Id. Please provide a valid user
        ,password:'Inventumc762'    //SQL Password. Please provide a valid password
        ,server:'10.150.130.10'   
        ,database: 'embarquesmj'        //You can use any database here
    }




    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select c_codigo_pal from t_palet where c_codigo_pro = 2201', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
        	console.log(recordset);
            //res.send(recordset);
            
        });
    });
};