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
            // then the auto generated company_id value will be stored
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

exports.getinfo = function(company_id, callback) {
    var query = 'CALL company_getinfo(?)';
    var queryData = [company_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

// declare the function so it can be used locally
var companyAddressInsert = function(company_id, addressIdArray, callback) {
    // note that there is only one question mark in values
    var query = 'INSERT INTO company_address (company_id, address_id) VALUES ?';

    // to bulk insert records we create a multidimensional array of the values
    var companyAddressData = [];
    if (addressIdArray.constructor === Array) {
        for (var i = 0; i < addressIdArray.length; i++) {
            companyAddressData.push([company_id, addressIdArray[i]]);
        }
    }
    else {
        companyAddressData.push([company_id, addressIdArray]);
    }
    connection.query(query, [companyAddressData], function(err, result) {
        callback(err, result);
    });
};

var companyAddressUpdate = function(company_id, addressIdArray, callback) {
    // first we need to remove all the entries, and then re-insert new ones
    var query = 'CALL company_address_delete(?)';

    connection.query(query, company_id, function (err, result) {
        if(err || addressIdArray === undefined) {
            // if error or no address were selected then return
            callback(err, result);
        } else { // insert addresses
            companyAddressInsert(company_id, addressIdArray, callback);
        }
    });
};

exports.update = function(params, callback) {
    var query = 'UPDATE company SET company_name = ? WHERE company_id = ?';

    var queryData = [params.company_name, params.company_id];

    connection.query(query, queryData, function(err, result) {
        companyAddressUpdate(params.company_id, params.address_id, function (err, result) {
            callback(err, result);
        });
    });
};