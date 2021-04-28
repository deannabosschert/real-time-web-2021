const express = require('express')
const app = express()
const fetch = require("node-fetch")
const http = require('http').Server(app)
const io = require('socket.io')(http)
const {
  MongoClient
} = require("mongodb")
require('dotenv').config()

const port = process.env.PORT || 3000
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

let availableRooms = []
let quizResults = []


app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function (req, res) {
  res.render('index.ejs', {})
})

io.on('connect', async (socket) => { // alle pong-batjes
  getScoreboard()
  .then((data) => io.emit("scoreboard", data))


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
        socket.join(data.room.roomID);
        return data
      })
      .then((data) => checkStatus(data))
      .then((data) => shufflePhotos(data))
  })


  socket.on("quiz_results", function (data, results) {
    const winningPhotos = matchPhotoResults(data, results).flat()

    if (quizResults.find(element => element == data.room.roomID)) {
      console.log('de ander heeft al gesubmit, laat results zien')
      io.to(data.room.roomID).emit('results', winningPhotos, 'showResults')
    } else {

      quizResults.push(data.room.roomID)
      io.to(data.room.roomID).emit('results', winningPhotos, 'hideResults')
    }

    addToScoreboard(winningPhotos)
  })


  socket.on("joinRoom", function (data) {
    console.log('io socket on joinRoom')
    io.to(data.room.roomID).emit(data)

  })

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })

})

function matchPhotoResults(data, results) {
  // merge results into data als turven
  let roomPhotos = data.room.roomPhotos
  //  const found = results.map(photo => {
  //   return roomPhotos.findIndex(element => element.id == photo)
  //  })

  return results.map(photo => {
    return roomPhotos.filter(item => item.id == photo)
  })
}

function addScore(data) {
  return data.map(i => {
    return roomPhotos[i].score + 1
  })
}



function checkStatus(data) {

  if (data.status == 'ready') {
    Array.prototype.push.apply(data.room.roomPhotos, data.photos)
    io.emit(data.userId, data) // stuur de individuele user dat ze een andere user nu joinen
    return data
  } else if (data.status == 'waiting') {
    io.emit(data.userId, data) // stuur persoonlijk bericht; waiting for another user
    return data
  } else {
    console.log('error')
  }
  // io.to(persoonlijkeID.emit,(data.room.roomID) // je stuurt nu alleen het besloten roomnummer en de data naar de client, zodat de client zelf aan client side die room van de server kan joinen    
  //  hierna stuurt de server de juiste data naar de room

}

function shufflePhotos(data) {
  let roomNaam = data.room.roomID

  if (data.status == 'ready') {
    data.start = 'true'
    let idRoomphotos = addID(data.room.roomPhotos)
    data.room.roomPhotos = idRoomphotos

    io.to(roomNaam).emit('new_game', data)

  } else if (data.status == 'waiting') {
    data.start = 'false'
    io.to(roomNaam).emit('new_game', data) // beetje onnodig om alle data mee te sturen ivm performance maargoed
  }
}

function addID(array) {
  return array.map((x, i) => {
    x.photoid = i + 1
    return x
  })
}


function getData(category) {
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

// SCOREBOARD FROM DATABASE
async function addToScoreboard(data) {
  data.map(async (data) => {
    const client = await MongoClient.connect(url, options)
    await client.db(dbName).collection('unsplash_scores').findOneAndUpdate({
      "id": data.id
    }, {
      $inc: {
        "score": 1
      },
      $setOnInsert: {
        id: data.id,
        url: data.url,
        width: data.width,
        height: data.height,
        color: data.color,
        alt_description: data.alt_description,
        photographer: data.photographer,
        location: data.location,
        photoid: data.photoid
      }
    }, {
      upsert: true,
      multi: true,
    })
    client.close()
  })
}

async function getScoreboard() {
  try {
    return MongoClient.connect(url, options)
      .then((client) => {
         return client.db(dbName).collection('unsplash_scores').find({}).sort([["score", -1]]).limit(10).toArray()
      })
  } catch (err) {
    console.error(err)
  }
}

http.listen(port, () => {
  console.log('App listening on: ' + port)
})