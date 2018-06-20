const jsforce = require('jsforce');

module.exports = { 
  login: login, 
  query: query, 
  insert: insert
}

const conn = new jsforce.Connection();

async function login(user, pwd){
  var response; //..return value for the query 
  await conn.login(user, pwd, function(err, res) {
    if (err) { return response = err; }
    response = 'Login Success';  
  }); 
  return response; 
}

async function query(){
  var response; //..return value for the query 
  await conn.query('SELECT Id, Name FROM Account', function(err, res) {
    if (err) { return console.error(err); }
    response = res; 
    });
  return response;
}

async function insert(name){
  var response; //..return value for the query 
  await conn.create('Account', {Name: name}, undefined, function(err, res) {
    if (err) { return err; }
    response = 'Insert Success'; 
    }); 
  return response; 
}