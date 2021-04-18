const socket = io()
const defineUsername = document.querySelector(".defineUsername")
const usernameInput = document.querySelector(".username-input")
const usernameSet = document.querySelector(".username-set")
const current_users = document.querySelector(".current_users")
const errorlogs = document.querySelector(".errorlogs")


socket.emit("start") // wordt eenmalig uitgevoerd zodat de client entered (= on webpage load)

defineUsername.addEventListener("submit", function (event) {
  event.preventDefault() // when changing the username/entering as a new user, don't show the results of the previous username
  const username = usernameInput.value
  console.log('ingevoerde username: ' + username)
  socket.emit("newUsername", username)
  defineUsername.classList.add("hidden")
  usernameSet.classList.remove("hidden")
  setUsername(username)
   false
}, false)

socket.on("new_username", function (username) {
  console.log("nieuwe user aanwezig!")
  console.log(username)

  const li = document.createElement("li")
  li.innerHTML = username
  current_users.appendChild(li)
  window.scrollTo(0, current_users.scrollHeight)
})

socket.on("user_left", function (username) {
  console.log("user gaat doei")
  console.log(username)

  const li = document.createElement("li")
  li.innerHTML = `left just now: ${username}`
  current_users.appendChild(li)
  window.scrollTo(0, current_users.scrollHeight)
})

socket.on("new_data", function (data) { // mag ook samengevoegd worden met addData maar tis nice om even de sockets gescheiden te houden wanneer er gemapped wordt
  console.log("nieuwe data op de client!")
  console.log(data)
  loadingState('')

  // const username = username_tag.charAt(5) // kan wellicht zoals bij Dropbox paper de naam van de auteur erbij zetten, en in deze functie al lostrekken?
  addData(data)
})

function setUsername(username) {
  const p = document.createElement("p")
  p.innerHTML = `your username: ${username}`
  usernameSet.appendChild(p)
  window.scrollTo(0, usernameSet.scrollHeight)
}

function addData(data) {
  console.log('data adden aan de DOM')
  // loadingState('') die later erin doen
  console.log(data)
  // const documentContents = data.data.text // hier zometeen de data mappen en omvormen naar html-elementen om te kunnen injecten of lekker ''veilig'' te kunnen innerhtml'en
}

// function editPost() {
//   // wanneer de user een edit maakt, dan dit
// }

function loadingState(state) {
  const loader = document.querySelector('div.loader')
  if (state === 'active') {
    loader.classList.add('loading')
  } else {
    loader.classList.remove('loading')
  }
}

// ERRORAFHANDELING
socket.on("conn_issue", function (json) {
  loadingState('')
  // if (json.connection_issue = "TooManyConnections") {
  const errorDetail = json.detail
  showError(errorDetail)
  // } else {
  // console.log('andere error')
  // }
})

function showError(errorDetail) {
  loadingState('')
  const errorMessage = `Error: ${errorDetail}`
  const li = document.createElement("li")
  li.innerHTML = errorMessage
  errorlogs.appendChild(li)
  window.scrollTo(0, errorlogs.scrollHeight)
}



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