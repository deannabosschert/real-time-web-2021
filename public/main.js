const socket = io()
const userdataForm = document.querySelector(".userdataForm")
const usernameInput = document.querySelector(".username-input")
const categoryInput = document.querySelector(".category")
const photographQuiz = document.querySelector(".photographQuiz")
const resultsGallery = document.querySelector('.resultsGallery')
const selfChosenGallery = document.querySelector('.selfChosenGallery')

socket.on('connect', () => { // wordt eenmalig uitgevoerd zodra de client entered (= on webpage load), gebeurt automatisch (ingebouwd in socketio)
  socket.on('scoreboard', (data) => renderGallery(data, ".masonry-with-columns"))

  socket.on(socket.id, (data) => {
    if (data.status == 'ready') {
      renderInfo(".statusField", 'p', 'joining another user..')
      data.status = null
    } else if (data.status == 'waiting') {
      renderInfo(".statusField", 'p', 'waiting for another user..')
      data.status = null
    } else {
      renderInfo(".errorMessages", 'li', 'oeps, er ging iets mis!')
    }
  })

  socket.on('new_game', (data) => {
    document.querySelector(".currentUsers").classList.remove("none")
    document.querySelector(".user1").innerHTML = `User 1: ${data.room.creator}`

    if (data.start == 'true') {
      document.querySelector(".user2").innerHTML = `User 2: ${data.username}`
      renderInfo(".statusField", 'p', 'starting a new game!')
      startGame(data)
    }
  })

  socket.on('results', (data, status) => {
    if (status == 'showResults') {
      toggleNone(".resultsGallery")
      toggleNone(".selfChosenGallery")
      renderGallery(data, ".resultsGallery")
    } else if (status == 'hideResults') {
     renderGallery(data, ".selfChosenGallery")
     toggleNone(".selfChosenGallery")
    }

  })
})

// ENTER WITH USERNAME AND CATEGORY
userdataForm.addEventListener("submit", (event) => {
  event.preventDefault() // when entering as a new user and/or submitting, don't show the results of the previous username which would reset the form instantly
  const userData = {
    userId: socket.id,
    username: usernameInput.value,
    category: categoryInput.value
  }

  toggleNone(".unsplashGallery")
  toggleNone(".userdataForm")
  toggleNone(".userdataSet")

  socket.emit("start", userData)


  renderInfo(".userdataSet", 'p', `your username: <span id="username">${usernameInput.value}</span>`)
  renderInfo(".userdataSet", 'p', `your category: ${categoryInput.value}`)
  false
}, false)


// RENDER SCOREBOARD GALLERY ON HOMEPAGE
function renderScoreboard(data) {
  gallery.innerHTML = ""
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

// FUNCTIONAL FUNCTIONS
function toggleNone(classname) {
  document.querySelector(`${classname}`).classList.toggle("none")
}


function renderInfo(destination, element, message) {
  let ding = document.querySelector(`${destination}`)
  const el = document.createElement(`${element}`)
  el.innerHTML = message
  ding.appendChild(el)
}

// ACTIONS
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
  toggleNone(".photographForm")

  handleForm(data)
}

function renderPhotos(data, question) {
  const questionPhotos = document.querySelector(`.q${question}-photos`)

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
}

function handleForm(data) {
  photographQuiz.addEventListener("submit", (event) => {
    event.preventDefault()
  
    let results =[
      document.querySelector('input[name=photo1]:checked').value,
      document.querySelector('input[name=photo2]:checked').value,
      document.querySelector('input[name=photo3]:checked').value,
      document.querySelector('input[name=photo4]:checked').value,
    ]
  
    socket.emit("quiz_results", data, results)
    toggleNone(".photographForm")
    toggleNone(".formResults")
  })  
}

function renderGallery(data, classname) {
  const destination = document.querySelector(`${classname}`)
  destination.innerHTML = ""

  return data.map(data => {
    destination.innerHTML +=
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
  const loader = document.querySelector('div.loader')
  if (state === 'active') {
    loader.classList.add('loading')
  } else {
    loader.classList.remove('loading')
  }
}