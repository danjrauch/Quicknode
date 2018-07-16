'use strict'

const http = require('http')
const port = process.env.PORT || 5000 
const path = require('path')
const request = require('request')
const json = require('json');
const qs = require('querystring')
const util = require('util')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser') 
const session = require('express-session')
const express = require('express')
const app = express()
const QuickBooks = require(path.resolve( __dirname, "./nodequickbooks.js" )) //..use this syntax to resolve homemade 'require' paths
// const sf = require(path.resolve( __dirname, "./sf.js" ))
// const { Pool, Client } = require('pg')
const db = require(path.resolve( __dirname, "./db.js" ))
const table = require(path.resolve( __dirname, "./table.js"))
const Tokens = require('csrf')
const csrf = new Tokens()

QuickBooks.setOauthVersion('2.0')

// Generic Express config
app.set('port', port) 
app.set('views', 'views')
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser('brad'))
app.use(session({ resave: false, saveUninitialized: false, secret: 'smith' }))

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'))
})

// PG

app.get('/pgTest', async (req, res) => {
  console.log('I\'m trying to get into postgres')

  //..query the db and display a table with data
  try{
    await db.query().then(
      results => {
        table.createUserTable(results, res)
      }
    )
    console.log('Created table')
  }catch (err){
    console.log(err.stack)
  }
})

//..insert the sf accounts into db
app.get('/insertAccounts', async (req, res) => {
  //..insert the sf accounts into db
  try{
    await sf.login('drauch.dev@hawk.iit.edu', 'passwordTOKEN').then(
      results => { console.log('Logged into Salesforce') } 
    )
  }catch (err){
    console.log(err.stack)
  }

  //TRANSACTION
  await sf.query().then(async (results) => {
    const query = {
      text: 'INSERT INTO accounts(id, name) VALUES($1, $2)',
      values: results.records.map((obj) => [obj.Id, obj.Name]), //..object . notation is case sensative
    }
    await db.insert(query).then(
      // res.redirect('/') //.. go home
      results => {
        //..kinda hacky
        res.send("<head><link rel=\"icon\" type=\"image/png\" href=\"public/imgs/menuresize.png\"><link rel=\"stylesheet\" href=\"css/bulma.css\"></head>" + JSON.stringify(results, null, 2))
      }
    )
  })
})

// PG

// SF

// async function errorHandler(fn){ // ERROR HANDLING?
//   try{
//     await fn
//   }catch(err){
//     console.log(err.stack)
//   }
// }

// app.get('/sfTest', async (req, res) => {
//   try{
//     await sf.login('drauch.dev@hawk.iit.edu', 'dummyPwd123!AlkdkWcPZ6spOpNwuNWQnLI7J').then(
//       results => { console.log('Logged into Salesforce') } 
//     )
//   }catch (err){
//     console.log(err.stack)
//   }

//   try{
//     await Promise.all([  
//       // sf.insert(['hey from hell']).then(
//       //   results => { res.send(results); res.end(); console.log(results) }
//       // ),
//       sf.query().then(
//         results => { table.createAccountTable(results, res) }
//       ), 
//       // sf.delete(['hey from hell', 'Hello from hell', 'New one']).then(
//       //   results => { res.send(results); res.end(); console.log(results) } 
//       // )
//     ])
//     console.log('Created table')
//   }catch (err){
//     console.log(err.stack)
//   }
// })

// SF

// QB   

// INSERT YOUR CONSUMER_KEY AND CONSUMER_SECRET HERE

const consumerKey = 'Q0GphSloikbyU7PzvX6waihOtcLR6tEUNJ748qEJdviaVxPmB0'
const consumerSecret = 'YFjUCiUBqMzFEHb8VY6dzloAKEMFOgqUj32vKQJg'

app.get('/', (req, res) => {
  // res.redirect('/intuit')
  res.render('pages/index.ejs')
})

app.get('/intuit', (req, res) => {
  res.render('pages/intuit.ejs', { port: port, appCenter: QuickBooks.APP_CENTER_BASE })
})

// OAUTH 2 makes use of redirect requests
function generateAntiForgery (session) {
  session.secret = csrf.secretSync()
  return csrf.create(session.secret)
}

app.get('/requestToken', (req, res) => {
  var redirecturl = QuickBooks.AUTHORIZATION_URL +
    '?client_id=' + consumerKey +
    '&redirect_uri=' + 
    //encodeURIComponent('https://quicknode.herokuapp.com/auth/intuit/callback/') + // PROD
    encodeURIComponent('http://localhost:' + port + '/auth/intuit/callback/') +  // LOCAl Make sure this path matches entry in application dashboard
    '&scope=com.intuit.quickbooks.accounting' +
    '&response_type=code' +
    '&state=' + generateAntiForgery(req.session)

  res.redirect(redirecturl)
})

app.get('/auth/intuit/callback', (req, res) => {
  var auth = (new Buffer(consumerKey + ':' + consumerSecret).toString('base64'))

  var postBody = {
    url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + auth,
    },
    form: {
      grant_type: 'authorization_code',
      code: req.query.code,
      //redirect_uri: 'https://quicknode.herokuapp.com/auth/intuit/callback/' //PROD
      redirect_uri: 'http://localhost:' + port + '/auth/intuit/callback/'  // LOCAL Make sure this path matches entry in application dashboard
    }
  }

  request.post(postBody, (e, r, data) => {
    var accessToken = JSON.parse(r.body)

    // save the access token somewhere on behalf of the logged in user
    var qbo = new QuickBooks(consumerKey,
                             consumerSecret,
                             accessToken.access_token, /* oAuth access token */
                             false, /* no token secret for oAuth 2.0 */
                             req.query.realmId,
                             true, /* use a sandbox account */
                             true, /* turn debugging on */
                             4, /* minor version */
                             '2.0', /* oauth version */
                             accessToken.refresh_token /* refresh token */)

    // console.log(qbo.token) save the token here probably to postgres

    qbo.findAccounts(async (_, accounts) => {
      try{
        await sf.login('serviointeg@servio.org', 'dummyPwd123!AlkdkWcPZ6spOpNwuNWQnLI7J').then(
          results => { console.log('Logged into Salesforce') } 
        )
      }catch (err){
        console.log(err.stack)
      } 

      try{
        await sf.insert(accounts.QueryResponse.Account.map((x) => x.Name)).then(
          results => { 
            // table.createAccountTable(results, res)
          }
        )
      }catch (err){
        console.log(err.stack); 
      }
    })
  })
  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
})

// QB