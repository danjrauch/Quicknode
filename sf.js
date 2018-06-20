const jsforce = require('jsforce');

module.exports = sfTest

const conn = new jsforce.Connection();

async function sfTest(){
  var response; //..return value for the query 
  await conn.login('serviointeg@servio.org', 'dummyPwd123!AlkdkWcPZ6spOpNwuNWQnLI7J', function(err, res) {
    if (err) { return console.error(err); }}); 
  await conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    response = res; 
    });
  return response;
}
