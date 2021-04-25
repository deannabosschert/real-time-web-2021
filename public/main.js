const socket = io()
const userDataForm = document.querySelector(".userDataForm")
const usernameInput = document.querySelector(".username-input")
const categoryInput = document.querySelector(".category")
const userdataSet = document.querySelector(".userdata-set")
const consoleLogs = document.querySelector(".consoleLogs")
const gallery = document.querySelector(".masonry-with-columns")
const currentUsers = document.querySelector(".currentUsers")
const user1 = document.querySelector(".user1")
const user2 = document.querySelector(".user2")
const statusField = document.querySelector(".statusField")
const q1Photos = document.querySelector(".q1-photos")
const q2Photos = document.querySelector(".q2-photos")
const nextButton = document.querySelector(".nextButton")


socket.on('connect', () => { // wordt eenmalig uitgevoerd zodat de client entered (= on webpage load), gebeurt automatisch (ingebouwd in socketio)
  console.log('socket on connect')
  const dataDing = {
    userId: socket.id
  }
  console.log(dataDing)

  socket.on(socket.id, (data) => {
    if (data.status == 'ready') {
      displayStatus('joining another user..')
    } else if (data.status == 'waiting') {
      displayStatus('waiting for another user..')
    } else {
      displayConsole('hier ging iets mis')
    }
  })

  socket.on('new_game', (data) => {
    currentUsers.classList.remove("none")

    user1.innerHTML = `User 1: ${data.room.creator}`


    if (data.username != data.room.creator) {
      // user1.innerHTML = `User 1: ${data.room.creator} (creator)`
      user2.innerHTML = `User 2: ${data.username}`
      displayStatus('starting a new game!')
      startGame(data)
    }
  })
})

function startGame(data) {
  console.log(data)
  const photos = data.room.roomPhotos

  question1data = photos.slice(0, 2)
  question2data = photos.slice(2, 4)
  // question3data = photos.slice(8, 12) // deze zometeen uncommenten
  // question4data = photos.slice(12, 16)
  console.log(question1data)
  question1data.map(data => {
    let div = document.createElement("div")
    let photo = `<label for="photo1"><span>Photo 1</span>
    <input type="radio" name="photo" id="photo1">
    <img src="${data.url}" alt="${data.alt_description}"
  </label>`


    div.innerHTML = photo
  
    q1Photos.appendChild(div)

  })

  nextButton.addEventListener("click", function (event) {
    question2data.map(data => {
      let div = document.createElement("div")
      let photo = `<label for="photo2"><span>Photo 2</span>
      <input type="radio" name="photo" id="photo2">
      <img src="${data.url}" alt="${data.alt_description}"
    </label>`
  
  
      div.innerHTML = photo
    
      q2Photos.appendChild(div)
  
    })
  })


  // map over photos, maak voor elk een question aan?
}

function renderGame(data) {

}


// socket.on(socket.id, (data) => {
//   console.log('socket on socketid')    
//   console.log(data)
//   if (data.room) {
//     socket.emit("joinRoom", userData)
//     // socket.join(data.room.roomId, data)
//     socket.join(data.room.roomId) // data van de twee users wordt verzameld, gebundeld en gebroadcast op de server
//   }

//   })

socket.on('user_left', (data) => {
  console.log('the other user has left')
  console.log(data)
  console.log(socket.id)
})

function displayConsole(message) {
  const li = document.createElement("li")
  li.innerHTML = message
  consoleLogs.appendChild(li)
}

function displayStatus(status) {
  statusField.innerHTML = status
}

function displayUsers(username) {
  const p = document.createElement("p")
  p.innerHTML = username
  currentUsers.appendChild(p)
}

userDataForm.addEventListener("submit", function (event) {
  console.log('client function userDataForm')

  event.preventDefault() // when entering as a new user and/or submitting, don't show the results of the previous username which would reset the form instantly

  console.log('ingevoerde username: ' + usernameInput.value)
  console.log('ingevoerde category: ' + categoryInput.value)

  const userData = {
    userId: socket.id,
    username: usernameInput.value,
    category: categoryInput.value
  }

  socket.emit("start", userData)

  userDataForm.classList.add("none")
  userdataSet.classList.remove("none")
  displayUsername(usernameInput.value)
  displayCategory(categoryInput.value)

  false
}, false)

function displayUsername(username) {
  console.log('client function displayUsername')

  const p = document.createElement("p")
  p.innerHTML = `your username: ${username}`
  userdataSet.appendChild(p)
  // window.scrollTo(0, userdataSet.scrollHeight)
}

function displayCategory(category) {
  console.log('client function displayCategory')

  const p = document.createElement("p")
  p.innerHTML = `your category: ${category}`
  userdataSet.appendChild(p)
  // window.scrollTo(0, userdataSet.scrollHeight)
}

// socket.on("new_username", function (username) {
//   console.log("nieuwe user aanwezig!")
//   console.log(username)

//   const li = document.createElement("li")
//   li.innerHTML = username
//   current_users.appendChild(li)
//   window.scrollTo(0, current_users.scrollHeight)
// })

// socket.on("user_left", function (username) {
//   console.log("user gaat doei")
//   console.log(username)

//   const li = document.createElement("li")
//   li.innerHTML = `left just now: ${username}`
//   current_users.appendChild(li)
//   window.scrollTo(0, current_users.scrollHeight)
// })

// socket.on("new_data", function (data) { // mag ook samengevoegd worden met addData maar tis nice om even de sockets gescheiden te houden wanneer er gemapped wordt
//   console.log("nieuwe data op de client!")
//   console.log(data)
//   loadingState('')

//   // const username = username_tag.charAt(5) // kan wellicht zoals bij Dropbox paper de naam van de auteur erbij zetten, en in deze functie al lostrekken?
//   addData(data)
// })



// function addData(data) {
//   console.log('data adden aan de DOM')
//   // loadingState('') die later erin doen
//   console.log(data)
//   // const documentContents = data.data.text // hier zometeen de data mappen en omvormen naar html-elementen om te kunnen injecten of lekker ''veilig'' te kunnen innerhtml'en
// }

// function editPost() {
//   // wanneer de user een edit maakt, dan dit
// }

function loadingState(state) {
  console.log('client function loadingState')

  const loader = document.querySelector('div.loader')
  if (state === 'active') {
    loader.classList.add('loading')
  } else {
    loader.classList.remove('loading')
  }
}

// ERRORAFHANDELING
socket.on("conn_issue", function (json) {
  console.log('socket on connection issue')

  loadingState('')
  // if (json.connection_issue = "TooManyConnections") {
  const errorDetail = json.detail
  showError(errorDetail)
  // } else {
  // console.log('andere error')
  // }
})

// function showError(errorDetail) {
//   loadingState('')
//   const errorMessage = `Error: ${errorDetail}`
//   const li = document.createElement("li")
//   li.innerHTML = errorMessage
//   errorlogs.appendChild(li)
//   window.scrollTo(0, errorlogs.scrollHeight)
// }



// NICE TO HAVE - rotating footnote, stockmarket-style met 'recente edits door [naam] om [tijd]
// const recent_edits = document.querySelector(".recent_edits")

// socket.on("last_edited_by", function (data) { // dat ding in de footer
//   showEdits(data)
//   socket.emit("last_edited_by")  // pong terug naar de server, en daar staat een time-out klaar
// })


// function showEdits(data) { // dat ding in de footer
//   const lastEdit = `${data},  `
//   const li = document.createElement("li")
//   li.innerHTML = lastEdit
//   recent_edits.appendChild(li)
//   window.scrollTo(0, recent_edits.scrollHeight)
// }



// SCOREBOARD UIT DATABASE
// loadScoreboard()
function loadScoreboard() { // gaat gereplaced worden met data uit database ofc, dit is alleen even om vast te kunnen stylen (en naar plaatjes te kijken lol)
  const count = "10"
  const category = "snow"
  // const apiLink = `https://api.unsplash.com/photos/random/?count=${count}&query=${category}&client_id=WgCeJ15nZWDOCklDsGksqOag8Xb4TvCILMy5datSx7w`

  return fetch(apiLink)
    .then(res => res.json())
    .then(data => cleanScoreboard(data))
    .then(data => renderScoreboard(data))
}

function cleanScoreboard(data) {
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

function renderScoreboard(data) {
  return data.map(data => {
    // console.log(data.urls.regular)
    gallery.innerHTML +=
      `
    <article>
    <figure>
      <img style="border: 6.5px solid ${data.color};" src="${data.url}" alt="${data.alt_description}">
    </figure>
    </article>
    `
  })
}