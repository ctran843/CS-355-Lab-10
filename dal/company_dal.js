var mysql = require('mysql');
var db = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM company;';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

exports.insert = function(params, callback) {
    var query = 'INSERT INTO company (company_name) VALUES (?)';
    var queryData = [params.company_name];

    connection.query(query, queryData, function(err, result) {
        if(err || params.address_id === undefined) {
            console.log(err);
            callback(err, result);
        } else {
            // If the company was successfully inserted,
            // then then auto generated company_id value will be stored
            // in the result.insertId property. We will use that to
            // then insert records into the company_address table
            var company_id = result.insertId;

            // Notice that there is only one question mark after
            // values instead of (?, ?)
            var query = 'INSERT INTO company_address (company_id, address_id) VALUES ?';

            // create a multidimensional array of the values
            var companyAddressData = [];

            // if the user only selected one address
            // and its id is 10 or greater JavaScript will treat the
            // number as a string array i.e. ['1', '0']. We have this
            // if/else check to handle that problem
            if (params.address_id.constructor === Array) {
                // first we check if its an array of values
                for (var i = 0; i < params.address_id.length; i++) {
                    companyAddressData.push([company_id, params.address_id[i]]);
                }
            }
            else {
                companyAddressData.push([company_id, params.address_id]);
            }
            // Notice the extra [] around companyAddressData.
            // This is different from inserting one record
            // at a time like we did for company
            connection.query(query, [companyAddressData],
            function (err, result) {
                callback(err, result);
            });
        }

    });
};
