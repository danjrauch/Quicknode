const jsforce = require('jsforce')

module.exports = { 
  login: sfLogin, 
  query: sfQuery, 
  insert: sfInsert, 
  delete: sfDelete
}

const conn = new jsforce.Connection()

async function sfLogin(user, pwd){
  return await conn.login(user, pwd)
}

async function sfQuery(){
  return await conn.query('SELECT Id, Name FROM Account')
}

async function sfInsert(names){ //bulkified
  return await conn.sobject('Account').insertBulk(names.map((x) => { return {Name: x} })) // {Name: name}); 
}

async function sfDelete(names){ //bulkified
  return await conn.sobject('Account')
                   .find({ Name : { $in : names} })
                   .destroy() 
}