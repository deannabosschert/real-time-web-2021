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
const nextButton = document.querySelector(".nextButton")
const previousButton = document.querySelector(".previousButton")
const submitButton = document.querySelector(".submitButton");
const photographQuiz = document.querySelector(".photographQuiz")
const resultsGallery = document.querySelector('.resultsGallery')

socket.on('connect', () => { // wordt eenmalig uitgevoerd zodat de client entered (= on webpage load), gebeurt automatisch (ingebouwd in socketio)
  console.log('socket on connect')
  const dataDing = {
    userId: socket.id
  }

  socket.on(socket.id, (data) => {
    if (data.status == 'ready') {
      displayStatus('joining another user..')
      data.status = null
    } else if (data.status == 'waiting') {
      displayStatus('waiting for another user..')
      data.status = null
    } else {
      displayConsole('hier ging iets mis')
    }
  })

  socket.on('results', (data, status) => {
    console.log(data)
     data.map(data => {
      resultsGallery.innerHTML +=
        `
      <article>
      <figure>
        <img style="border: 6.5px solid ${data.color};" src="${data.url}" alt="${data.alt_description}">
      </figure>
      </article>
      `
    })

    if (status == 'showResults') {
      document.querySelector(".resultsGallery").classList.toggle("none")
    }

  })

  socket.on('new_game', (data) => {
    currentUsers.classList.remove("none")
    user1.innerHTML = `User 1: ${data.room.creator}`

    if (data.start == 'true') {
      user2.innerHTML = `User 2: ${data.username}`
      displayStatus('starting a new game!')
      startGame(data)
    }
  })

  socket.on('scoreboard', (data) => renderScoreboard(data))
})


function startGame(data) {
  const photos = data.room.roomPhotos


  photoduo1 = [photos[0], photos[2]] 
  photoduo2 = [photos[1], photos[3]] 
  photoduo3 = [photos[4], photos[6]] 
  photoduo4 = [photos[5], photos[7]] 

  renderPhotos(photoduo1, 1)
  renderPhotos(photoduo2, 2)
  renderPhotos(photoduo3, 3)
  renderPhotos(photoduo4, 4)

  addSubmitButton(data)
  
}

function renderPhotos(data, question) {

  const questionPhotos = document.querySelector(`.q${question}-photos`)

  // return data.map(data => {
  let div1 = document.createElement("div")
  let div2 = document.createElement("div")
  let photoA = `
    <label for="photo${question}a"><span>Photo ${question}- option A</span>
      <input type="radio" name="photo${question}" value="${data[0].id}" id="photo${question}a">
      <img src="${data[0].url}" alt="${data[0].alt_description}"</label>`

  let photoB = `<label for="photo${question}b"><span>Photo ${question}- option B</span>
      <input type="radio" name="photo${question}" value="${data[1].id}" id="photo${question}b">
      <img src="${data[1].url}" alt="${data[1].alt_description}"
    </label>`

  div1.innerHTML = photoA
  div2.innerHTML = photoB

  questionPhotos.appendChild(div1)
  questionPhotos.appendChild(div2)

  // })
}

function addSubmitButton(data) {
  photographQuiz.addEventListener("submit", function (event) {
    event.preventDefault()
  
    // let results = {
    //   photo1: document.querySelector('input[name=photo1]:checked').value,
    //   photo2: document.querySelector('input[name=photo2]:checked').value,
    //   photo3: document.querySelector('input[name=photo3]:checked').value,
    //   photo4: document.querySelector('input[name=photo4]:checked').value,
    //   time: new Date().toLocaleString(),
    //   username: document.querySelector('#username').value,
    //   userId: document.querySelector('#userid').value,
    //   roomNumber: data.room.roomID
    // }

    let results =[
      document.querySelector('input[name=photo1]:checked').value,
      document.querySelector('input[name=photo2]:checked').value,
      document.querySelector('input[name=photo3]:checked').value,
      document.querySelector('input[name=photo4]:checked').value,
    ]
  
    document.querySelector(".photograph-chooser").classList.toggle("none")
    socket.emit("quiz_results", data, results)
  })  
}


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
  displayUsername(usernameInput.value, socket.id)
  displayCategory(categoryInput.value)

  false
}, false)

function displayUsername(username, userId) {
  console.log('client function displayUsername')

  const p = document.createElement("p")
  p.innerHTML = `your username: <span id="username">${username}</span><span id="userId">${userId}</span>`
  userdataSet.appendChild(p)
}

function displayRoomnumber(roomnumber) {
  console.log('client function displayRoomnumber')

  const p = document.createElement("p")
  p.innerHTML = `room number: <span class="roomNumber">${roomnumber}</span>`
  userdataSet.appendChild(p)
}

function displayCategory(category) {
  console.log('client function displayCategory')

  const p = document.createElement("p")
  p.innerHTML = `your category: ${category}`
  userdataSet.appendChild(p)
}



// RENDER SCOREBOARD GALLERY ON HOMEPAGE
function renderScoreboard(data) {
  return data.map(data => {
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

// LOADING STATE
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