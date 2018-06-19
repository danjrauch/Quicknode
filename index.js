const express = require('express')
const path = require('path')
const axios = require('axios')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async (req, res) => await res.render('pages/index'))
  .get('/hello', async (req, res) => {
    res.send('Hey what\'s up?'); 
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
