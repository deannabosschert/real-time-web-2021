// wat je doet; je opent een connectie, en gooit long polling op de api. edits in de database.

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
// const Twitter = require('twitter')
const request = require('request')
const util = require('util')
const get = util.promisify(request.get)
const post = util.promisify(request.post)
let token, currentRules, stream
let timeout = 0

require('dotenv').config()

const port = 3000
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

app.use(express.static('./public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function (req, res) {
  res.render('index.ejs', {})
})

io.on('connection', socket => { // alle pong-batjes

  socket.on("start", function () {
    openConnection() // voor document
    // getRecentEdits() // voor onderaan de pagina
  })

  socket.on("newUsername", async function (username) { // je ontvangt de username van 1 client
    console.log(username)
    io.emit("new_username", username) // en je gooit die terug naar alle clients
  })

  socket.on('disconnect', function () {
    console.log('user has left the building')
    stream.emit('user_left', username)
  })

})




function openConnection() { // deze runt dus 1 keer op connection van de user (dus: per client dat entered) en loopt dan in zichzelf gedurende de sessie
  // Listen to the stream.
  // This reconnection logic will attempt to reconnect when a disconnection is detected.
  // To avoid rate limites, this logic implements exponential backoff, so the wait time
  // will increase if the client cannot reconnect to the stream.
  const connect = () => {
    try {
      stream = streamConnect() // ja: open connectie
      stream.on('timeout', async () => { // bijna: re-try connectie
        // Reconnect on error
        console.warn('A connection error occurred. Reconnecting…')
        timeout++
        stream.abort()
        await sleep((2 ** timeout) * 1000) // wacht ff, en increase dit exponentioneel bij elke keer dat 't niet lukt
        connect()
      })

      stream.on('user_left', function () { // nee: close connectie
        console.log('user has left, closing connnection now')
        stream.abort()
      })

    } catch (e) {
      connect()
    }
  }
  connect()
}

function streamConnect() { // pingpong middels 'stream'
  // Listen to the stream
  const searchTerm = "tree"
  const count = "10"
  const clientID = "WgCeJ15nZWDOCklDsGksqOag8Xb4TvCILMy5datSx7w"

  const config = {
    url = `https://api.unsplash.com/photos/random/?count=${count}&query=${searchTerm}&client_id=${clientID}`,
    timeout: 20000
  }


  const stream = request.get(config) // beetje zoals fetch

  stream.on('data', data => { // wanneer je data terugkrijgt, doe dan dit
    try {

      console.log('je hebt data ontvangen!')

      const json = JSON.parse(data)
      console.log(json)

      if (json.connection_issue) {
        console.log('issue, timeout')
        console.log(json.connection_issue)
        stream.emit('timeout')
        io.emit("conn_issue", json)
      } else {
        console.log('geen issues, emit json naar de client')
        io.emit("new_data", json) // stuur de data naar de client!
      }
    } catch (e) {
      // Heartbeat received. Niets nieuws ontvangen. Do nothing.
      console.log(e)
    }

  }).on('error', error => {
    if (error.code === 'ESOCKETTIMEDOUT') {
      stream.emit('timeout') // terug naar openConnection() en re-try connectie
    }
  })

  return stream
}


async function sleep(delay) {
  return new Promise((resolve) =>
    setTimeout(() =>
      resolve(true), delay))
}



function getDocument() {
  console.log('document ophalen')
}


async function addEditLog(newEdit) {
  const client = await MongoClient.connect(url, options)
  const db = client.db(dbName)
  console.log("Connected correctly to server to store edit")
  const item = await db.collection('twitter_searches').insertOne(newEdit) // verander in document_edits
  console.log('big data at your service')
  client.close()
  return
}

async function getRecentEdits() {
  console.log('recente edits getten')
  const client = await MongoClient.connect(url, options)
  const db = client.db(dbName)
  console.log("Connected correctly to server to retrieve edit") // verander dit naar de 5 meest recente ipv random searches
  const recentEdit = await db.collection('twitter_searches').aggregate([{
    $sample: {
      size: 1
    }
  }]).toArray()
  client.close()
  io.emit("recent_edits", recentEdit)
}

http.listen(port, () => {
  console.log('App listening on: ' + port)
})

// USERNAME-PRESENCE
function logEdit(username_1) {
  console.log("stop tijd en auteur van de laatste wijziging in een array") // iets met date-API voor time? of er was een dingetje voor; zie project web waar 't ook gebruikt is
  const rules = [{
    'author': `from:${username_1}`,
    'time': `time: ${time}`
  }]
  return rules
}


// MUST HAVE: INTERACTIE
function logEdit(username_1) {
  console.log("stop tijd en auteur van de laatste wijziging in een array") // iets met date-API voor time? of er was een dingetje voor; zie project web waar 't ook gebruikt is
  const rules = [{
    'author': `from:${username_1}`,
    'time': `time: ${time}`
  }]
  return rules
}


socket.on("newEdit", async function (username) { // maak hier anders ff een promise chain van samen met de andere functies want dit is echt heel onoverzichtelijk
  const newLogEdit = await logEdit('username')
  addEditLog(newLogEdit) // stuur response/post data naar mongodb database voor iets (last edited by xxx om 10:30am oid ?)
})


// NICE TO HAVE

// socket.on("last_edited_by", function () { // dat ding in de footer
//   setTimeout(function () {
//     getRecentEdits()
//   }, 8000);
// })