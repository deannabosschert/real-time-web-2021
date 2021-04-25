// wat je doet; je opent een connectie, en gooit long polling op de api. edits in de database.
// next up: user-aanwezigheid fixen/stashen zodat alles bij elke user goed aankomt?

// NOTE: er is nog geen gebruik gemaakt van ES6-knowledge zoals gewoonlijk, dit doe ik voor consistency bij herkansingen wat meer tegen 't einde

const express = require('express')
const app = express()
const fetch = require("node-fetch")

const http = require('http').Server(app)
const io = require('socket.io')(http)
// const {
//   MongoClient
// } = require("mongodb")
// const request = require('request')
// const util = require('util')
// const get = util.promisify(request.get)
// const post = util.promisify(request.post)
let stream
let timeout = 0

let availableRooms = []

require('dotenv').config()

const port = process.env.PORT || 3000

// const url = process.env.MNG_URL
// const dbName = process.env.DB_NAME

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function (req, res) {
  res.render('index.ejs', {})
})

io.on('connect', async (socket) => { // alle pong-batjes
  console.log('IO on connect')

  // const userId = await fetchUserId(socket);
  // socket.join(userId);

  //   // // and then later


  //   setTimeout(function(){   io.to(userId).emit('yeet'); }, 2000);



  // socket.on("connect", function () {
  //   // openConnection() // voor document ophalen
  //   // getRecentEdits() // voor de recente edits weergeven onderaan de pagina (of liever gewoon storen..?)
  //   console.log('io socket on connect')

  // })


  socket.on("setSocketId", function (data) {
    // openConnection() // voor document ophalen
    // getRecentEdits() // voor de recente edits weergeven onderaan de pagina (of liever gewoon storen..?)
    console.log('io socket on setSocketId')
    console.log(data)
  })



  socket.on("start", function (userData) {
    console.log('io socket on start')

    getData(userData.category)
      .then((data) => cleanData(data))
      .then((data) =>
        findRoom({
          userId: userData.userId,
          username: userData.username,
          category: userData.category,
          photos: data
        })
      )
      .then(data => {
        // console.log('my username: ' + data.username)
        // console.log('room id: ' + data.room.roomID)
        // console.log('room creator: ' + data.room.creator)
        
        let roomNaam = data.room.roomID


        if (data.status == 'ready') {
          Array.prototype.push.apply(data.room.roomPhotos, data.photos)
          io.emit(data.userId, data) // stuur de individuele user of ze moeten wachten op een ander user of eentje joinen

          socket.join(roomNaam)
          io.to(roomNaam).emit('new_game', data)

        } else if (data.status == 'waiting') {
          io.emit(data.userId, data)  // stuur persoonlijk bericht; waiting for another user
         
          socket.join(roomNaam) // wijs socket toe aan deze room
          io.to(roomNaam).emit('new_game', data)

        } else {
          console.log('error')
        }
        // io.to(persoonlijkeID.emit,(data.room.roomID) // je stuurt nu alleen het besloten roomnummer en de data naar de client, zodat de client zelf aan client side die room van de server kan joinen    
        //  hierna stuurt de server de juiste data naar de room
      })
    // .then(data => {
    //   emit de roomPhotos-data naar de room
    // }) 
    // evt hierna weer een then met settimeout die overeenkomt met die van de client, ivm collecten uitslagen
  })

  socket.on("joinRoom", function (data) {
    console.log('io socket on joinRoom')
    io.to(data.room.roomID).emit(data)

  })

  socket.on("newUsername", async function (username) { // je ontvangt de username van 1 client
    console.log('io socket on newUsername')

    console.log(username)
    io.emit("new_username", username) // en je gooit die terug naar alle clients
  })

  socket.on('disconnect', function () {
    console.log('io socket on disconnect')

    // console.log('user has left the building')
    // openConnection('user_left')
    io.emit('user_left', 'anonymous user') // veranderen in username
  })

})

function getData(category) {
  console.log('function getData')
  const count = "4"
  const apiLink = `https://api.unsplash.com/photos/random/?count=${count}&query=${category}&client_id=${process.env.API_KEY}`

  return fetch(apiLink)
    .then(res => res.json())
    .then(data => data)
}

function cleanData(data) {
  console.log('function cleanData')

  return data.map(data => {
    return {
      id: data.id,
      url: data.urls.regular,
      // created_at: data.created_at,
      width: data.width,
      height: data.height,
      color: data.color,
      // blur_hash: data.blur_hash,
      // description: data.description,
      alt_description: data.alt_description,
      // categories: data.categories,
      photographer: data.user.name,
      location: data.location.title
    }
  })
}

function findRoom(data) {
  console.log('function findRoom')
  // console.log(data)

  if (availableRooms.length == 0) {
    console.log('maak nieuwe room aan')
    let roomInfo = {
      roomID: `room-${data.userId}`,
      creator: data.username,
      roomPhotos: data.photos
    }
    availableRooms.push(roomInfo)
    data.room = roomInfo
    data.status = 'waiting'

    return data

    // niet beter gelijk de photos erin stoppen? niemand boeit wie welke foto's exact heeft meegenomen
  } else {
    console.log('join bestaande room')
    data.room = availableRooms.shift() // verwijdert het eerste element van de array en geeft het element terug als resultaat
    data.status = 'ready'

    return data // je kan hier zeggen van 'nu pas de foto's assemblen'?
  }
}

function openConnection(status) { // deze runt dus 1 keer op connection van de user (dus: per client dat entered) en loopt dan in zichzelf gedurende de sessie
  // Listen to the stream.
  // This reconnection logic will attempt to reconnect when a disconnection is detected.
  // To avoid rate limites, this logic implements exponential backoff, so the wait time
  // will increase if the client cannot reconnect to the stream.


  const connect = () => {
    try {
      stream = streamConnect() // ja: open connectie

      // if (status == "user_left") {
      //   stream.emit('user_left', username)
      // }

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
  console.log('function streamConnect')

  // Listen to the stream
  const searchTerm = "tree"
  const count = "10"
  const clientID = "WgCeJ15nZWDOCklDsGksqOag8Xb4TvCILMy5datSx7w"
  const apiURL = `https://api.unsplash.com/photos/random/?count=${count}&query=${searchTerm}&client_id=${clientID}`

  // const config = {
  //   url = "https://api.unsplash.com/photos/random/?count=10&query=tree&client_id=WgCeJ15nZWDOCklDsGksqOag8Xb4TvCILMy5datSx7w",
  //   timeout: 20000
  // }

  fetch(apiURL)
    .then(res => res.json())
    .then(data => console.log(data))


  // const stream = request.get(apiURL) // beetje zoals fetch

  // stream.on('data', data => { // wanneer je data terugkrijgt, doe dan dit
  //   try {
  //     console.log('je hebt data ontvangen!')

  //     const datading = data.json()

  //     console.log(datading)

  //     const json = JSON.parse(data)
  //     console.log(json)

  //     if (json.connection_issue) {
  //       console.log('issue, timeout')
  //       console.log(json.connection_issue)
  //       stream.emit('timeout')
  //       io.emit("conn_issue", json)
  //     } else {
  //       console.log('geen issues, emit json naar de client')
  //       // io.emit("new_data", json) // stuur de data naar de client!
  //     }
  //   } catch (e) {
  //     // Heartbeat received. Niets nieuws ontvangen. Do nothing.
  //     console.log(e)
  //   }

  // }).on('error', error => {
  //   if (error.code === 'ESOCKETTIMEDOUT') {
  //     stream.emit('timeout') // terug naar openConnection() en re-try connectie
  //   }
  // })

  // return stream
}


async function sleep(delay) {
  console.log('function sleep')

  return new Promise((resolve) =>
    setTimeout(() =>
      resolve(true), delay))
}




// async function addEditLog(newEdit) {
//   const client = await MongoClient.connect(url, options)
//   const db = client.db(dbName)
//   console.log("Connected correctly to server to store edit")
//   const item = await db.collection('twitter_searches').insertOne(newEdit) // verander in document_edits
//   console.log('big data at your service')
//   client.close()
//   return
// }

// async function getRecentEdits() {
//   console.log('recente edits getten')
//   const client = await MongoClient.connect(url, options)
//   const db = client.db(dbName)
//   console.log("Connected correctly to server to retrieve edit") // verander dit naar de 5 meest recente ipv random searches
//   const recentEdit = await db.collection('twitter_searches').aggregate([{
//     $sample: {
//       size: 1
//     }
//   }]).toArray()
//   client.close()
//   io.emit("recent_edits", recentEdit)
// }

http.listen(port, () => {
  console.log('App listening on: ' + port)
})



// MUST HAVE: INTERACTIE
// socket.on("newEdit", async function (username) { // maak hier anders ff een promise chain van samen met de andere functies want dit is echt heel onoverzichtelijk
//   const newLogEdit = await logEdit('username')
//   addEditLog(newLogEdit) // stuur response/post data naar mongodb database voor iets (last edited by xxx om 10:30am oid ?)
// })


// NICE TO HAVE

// socket.on("last_edited_by", function () { // dat ding in de footer
//   setTimeout(function () {
//     getRecentEdits()
//   }, 8000);
// })


// USERNAME + edits log
// function logEdit(username) {
//   console.log("stop tijd en auteur van de laatste wijziging in een array") // iets met date-API voor time? of er was een dingetje voor; zie project web waar 't ook gebruikt is
//   return edit = [{
//     'author': `from:${username}`,
//     'time': `time: ${time}`
//   }]
// }