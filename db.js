const {Pool, Client} = require('pg');

module.exports = { 
  query: pgQuery
}

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/harvoku"; 

const pool = new Pool({
  connectionString: connectionString,
})

async function pgQuery(){
  let resp = await pool.query('SELECT * FROM users'); 
  pool.end(); 
  return resp.rows; 
}
