const express = require('express')
const app = express()
const fetch = require("node-fetch")
const http = require('http').Server(app)
const io = require('socket.io')(http)
const { MongoClient } = require("mongodb")
require('dotenv').config()

const port = process.env.PORT || 3000
const url = process.env.MNG_URL
const dbName = process.env.DB_NAME
const options = {useNewUrlParser: true, useUnifiedTopology: true }

let availableRooms = []
let quizResults = []


app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')
app.get('/', function (req, res) {
  res.render('index.ejs', {})
})

// ALL CONN POINTS
io.on('connect', async (socket) => {

  getScoreboard()
  .then((data) => io.emit("scoreboard", data))

  socket.on("start", (userData) => {
    getData(userData.category)
      .then((data) => cleanData(data))
      .then((data) =>
        findRoom({
          userId: userData.userId,
          username: userData.username,
          category: userData.category,
          photos: data
        }))
      .then(data => {
        socket.join(data.room.roomID)
        return data
      })
      .then((data) => checkStatus(data))
      .then((data) => emitPhotos(data))
  })


  socket.on("form_results", (data, results) => {
    const chosenPhotos = matchFormtoRoomPhotos(data, results).flat()
    data.room.chosenPhotos = chosenPhotos
    checkUserMatches(data, chosenPhotos)
    addToScoreboard(chosenPhotos)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

})


// API DATA
function getData(category) {
  try {
    return fetch(`https://api.unsplash.com/photos/random/?count=4&query=${category}&client_id=${process.env.API_KEY}`)
    .then(res => res.json())
    .then(data => {
      if (data.errors) {
        return fetch(`https://api.unsplash.com/photos/random/?count=4&client_id=${process.env.API_KEY}`)
         .then(res => res.json())
      } else {
        return data
      }
    }) 
  }
  catch (err) {
    console.error(err)
  }
}

function cleanData(data) {
  return data.map(data => {
    return {
      id: data.id,
      url: data.urls.regular,
      width: data.width,
      height: data.height,
      color: data.color,
      alt_description: data.alt_description,
      photographer: data.user.name,
      location: data.location.title
    }
  })
}

// MULTIPLE USERS
function findRoom(data) {
  if (availableRooms.length == 0) {
    let roomInfo = {
      roomID: `room-${data.userId}`,
      creator: data.username,
      roomPhotos: data.photos
    }
    availableRooms.push(roomInfo)
    data.room = roomInfo
    data.status = 'waiting'
    return data
  } else {
    data.room = availableRooms.shift() // join bestaande room; verwijdert het eerste element van de array en geeft het element terug als resultaat
    data.status = 'ready'
    return data
  }
}

function checkStatus(data) {
  if (data.status == 'ready') {
    Array.prototype.push.apply(data.room.roomPhotos, data.photos)
    io.emit(data.userId, data) // joining another user
    return data
  } else if (data.status == 'waiting') {
    io.emit(data.userId, data) // waiting for another user
    return data
  } else {
    console.log('error')
  }
}

// PREPARE/ASSEMBLE FORM PHOTOS
function emitPhotos(data) {
  let room = data.room

  if (data.status == 'ready') {
    data.start = 'true'
    room.roomPhotos = addID(room.roomPhotos)
    io.to(room.roomID).emit('new_game', data)
  } else if (data.status == 'waiting') {
    data.start = 'false'
    io.to(room.roomID).emit('new_game', data) // beetje onnodig om alle data mee te sturen ivm performance maargoed
  }
}

function addID(array) {
  return array.map((x, i) => {
    x.photoid = i + 1
    return x
  })
}

// FORM RESULTS
function matchFormtoRoomPhotos(data, results) {
  let roomPhotos = data.room.roomPhotos
  
  return results.map(photo => {
    return roomPhotos.filter(item => item.id == photo)
  })
}

// MATCH RESULTS OF THE TWO USERS
function checkUserMatches(data, chosenPhotos) {
  const resultArray = quizResults.find(element => element.room.roomID == data.room.roomID)
   if (resultArray != undefined ){
     resultArray.room.chosenPhotos.push(chosenPhotos)
     const bothChosenPhotos = [...new Set(resultArray.room.chosenPhotos.flat())]
     console.log(bothChosenPhotos)
      io.to(data.room.roomID).emit('results', bothChosenPhotos, 'showResults')
  } else {
    quizResults.push(data)
    io.to(data.room.roomID).emit('results', chosenPhotos, 'hideResults')
  }
}

// GET OR STORE IN SCOREBOARD (DATABASE)
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
      .then(client => {
         return client.db(dbName).collection('unsplash_scores').find({}).sort([["score", -1]]).limit(10).toArray()
      })
  } catch (err) {
    console.error(err)
  }
}

// PORT
http.listen(port, () => {
  console.log('App listening on: ' + port)
})