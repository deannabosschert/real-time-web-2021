# Real-Time Web @cmda-minor-web · 2020/21
https://real-time-web-21.herokuapp.com/

<details>
  <summary><strong>Table of Contents</strong> (click to expand)</summary>

<!-- toc -->

- [✅ To-do](#--to-do)
- [📋 Concept](#---concept)
- [⚙️ Installation](#---installation)
- [🧑🏼‍ Actor Diagram](#------actor-diagram)
- [↔️ Interaction diagram](#---interaction-diagram)
- [🌍 Design patterns](#---design-patterns)
- [🗃 Data](#---data)
  * [🐒 Github API](#---github-api)
    + [Endpoint(s)](#endpoint-s-)
    + [Rate limiting](#rate-limiting)
  * [💽 Data cleaning](#---data-cleaning)
- [👯🏿‍ Features (+ wishlist)](#------features----wishlist-)
- [🏫 Assignment](#---assignment)
  * [Learning goals](#learning-goals)
  * [Week 1 - Hello API 🐒](#week-1---hello-api---)
  * [Week 2 - Design and Refactor 🛠](#week-2---design-and-refactor---)
  * [Week 3 - Wrapping up 🎁](#week-3---wrapping-up---)
  * [Rubric](#rubric)
- [ℹ️ Resources](#---resources)
  * [Credits](#credits)
  * [Small inspiration sources](#small-inspiration-sources)
- [🗺️ License](#----license)

<!-- tocstop -->

</details>


## ✅ To-do
- [x] Draw DLC's for every concept
- [x] Ask questions to Justus (Room logic, scoreboard logic)
- [x] Fix error things (e.g. when an user tries to submit an unfound category.. check api statuscodes!)
- [x] Hash for usernames
- [ ] Haven't made use of modules for this one as I usually do, I figured it'd be cleaner to read in terms of the real-time flow?
- [ ] Timeout voor wanneer een user geen partner kan vinden

#### Quirks
- [ ] If someone opened a room and disconnected before another player could join, the room has to be destroyed from the availableRooms-array
- Removed build command for css to avoid issues with Heroku, so CSS is built locally first.


## MOSCOW
### Must have
- [x] App is working and published on Heroku
- [x] App is thorougly documented in README
- [x] Description of data life cycle
- [x] Description of external data source
- [x] Description of real-time events (making use of sockets)

- [x] Implemented enough real-time functionality to test my comprehension of the subject (I also made a quite complex structure last year that I decided to leave out for this one, but along with this project it should show enough.)
- [x] I've written all of the functionality myself and I'm proud I actually did it all by myself lol, I have asked for help and been in a call with Reinier to Rubber Ducky' and contacted Justus but that's all
- [x] I am able to manipulate online examples live; I can pull up the database, reset the current amounts and then update by doing voting sessions.
- [x] User is influencing API requests between server and source
- [x] I have set up the data manipulations myself
- [x] The server maintains a data model and each client is continuously updated with the correct data. (sockets!)
- [x] Multiple clients can connect to the server.
- [x] Interaction works as expected
- [x] I can explain how my app approaches this.

### Should have
- [x] Database connection to store votes
- [ ] Interaction is not dependent on the number of clients --> add setTimeOut on the matching of users, and catch to a solo room if no other user is found?

### Could have
- [x] Retrieve top-10 photos from database
- [x] Multiplayer voting (rooms)
- [ ] By interacting with the app, a user can influence the data model of the server in real time by directly modifying data --> idk if the DB-connection influence counts, or the Rooms?

### Nice to have
- [ ] Hand-written/illustrated examples of how sockets work (I've used quite some metaphors to help with my understanding of the subject..)

### Won't have (? yea..)

## ⚙️ Installation
Clone this repository to your own device:
```bash
$ git clone https://github.com/deannabosschert/real-time-web-2021.git
```
Then, navigate to this folder and run:


```bash
npm install
```

Last,

```bash
npm run dev
```


## Description
During this course I learned how to build a real-time application. I learned techniques to setup an open connection between the client and the server. This enabled me to send data in real-time both ways, at the same time.

## 📋 Concept
_What does your app do, what is the goal? (passing butter)_ 

> Users kunnen uit 4x2 foto's uit een zelfgekozen categorie kiezen, en stemmen op de beste hiervan.

Op Unsplash zijn er binnen bepaalde keywords/categories, een bijgehouden top-x populaire foto's. Deze haal ik op en laat de users in mijn app onderling beslissen welke daarvan beter zijn.

Twee users krijgen 2 foto's te  zien en kiezen hieruit de mooiste foto, en doen hier 4 rondes van. De mooiste foto van de 2 wint en welke foto's na zo'n vote-session winnen, wordt door de server bijgehouden in bijv een array van objecten. Dit wordt opgeslagen in een database om een scoreboard samen te stellen. 

Interactie:
- User komt binnen, voert username in en selecteert een categorie van foto's 
- Client stuurt deze keuze naar de server 
- Server doet een request met deze query naar de api, ontvangt data en cleant dit
- Server kijkt of er al een open Room is en laat de client ofwel joinen of maakt een nieuwe aan
- Server stuurt naar de client of deze moet wachten op een andere user of dat het spel kan beginnen
- Server bundelt de twee gecleande data-arrays en zet dit om naar een form en stuurt dit naar een 'new_game'-socket in de room
- Client zet dit om naar een formulier en serveer dit aan de users
- User selecteert de 'beste' foto en deze data wordt door de client teruggestuurd naar de server en bijgehouden in een (tijdelijke) array met de score
- Server matcht de keuzes aan de foto's in de roomData
- Server zet de tijdelijke array om tot een eindscore en stuurt dit naar de clients in de room
- Server stuurt dit ook naar de database

Multi-user support; er zit al een default in socket.io zodra de user binnenkomt, dat diegene een personal ID toegewezen krijgt. Bij het binnentreden op de website komt iedereen in de 'general' room terecht; hier kunnen ze een scoreboard zien met de top-10-foto's, hun username invullen en een categorie invullen. Na het invullen van de categorie, doet de server met deze query een request naar de API. Hierna wordt de user aan een room toegevoegd met een andere user; de client krijgt de status hierover terug over een private verbinding. Zo worden de 1v1-groepen samengesteld, zodra de vote-sessie klaar is (of alle user disconnecten) worden de resultaten ontvangen en verwerkt op de server, de 'winning pictures'-data-array teruggestuurd naar de server en geupdatet in de database.


<details>
  <summary><strong>Vorige versie</strong> (click to expand)</summary>
Twee (of meer) users krijgen 4 foto's te  zien en kiezen hieruit de mooiste foto, en doen hier 4 rondes van. De mooiste foto wint en welke foto's na zo'n vote-session winnen, wordt door de server bijgehouden in bijv een array van objecten. Dit kan nog opgeslagen worden in een database om een scoreboard samen te stellen. 

Interactie:
- User komt binnen, voert username in en selecteert een categorie van foto's 
- Client stuurt deze keuze naar de server 
- Server doet een request met deze query naar de api, ontvangt data en cleant dit
- Server stuurt deze data terug naar de client
- User selecteert de 'beste' foto en deze data wordt door de client teruggestuurd naar de server en bijgehouden in een (tijdelijke) array met de score
- Volgende 4 foto's worden door de server naar de client gestuurd en dit wordt herhaald voor 4 sessies
- Na afloop van de 4 sessies reducet de server de tijdelijke array tot een eindscore en stuurt dit naar de clients in de room
- Dit blijft 1 minuut op het scherm staan, daarna wordt de room destroyed
- De eindscore wordt wellicht in de database nog gestored

Multi-user support; er zit al een default in zodra de user binnenkomt, dat diegene een personal ID toegewezen krijgt. Bij het binnentreden op we website komt iedereen in de 'general' room terecht; hier kunnen ze een scoreboard zien met de top-10-foto's, hun username invullen en een categorie invullen. Na het invullen van de categorie, doet de server met deze query een request naar de API. De client krijgt deze data terug over een priveverbinding. Hierna wordt de user aan een room toegevoegd met een andere user; zo worden de 1v1 (of meer) -groepen samengesteld, zodra de vote-sessie klaar is (of alle user disconnecten) wordt deze destroyed en de 'winning pictures'-data-array teruggestuurd naar de server.
</details>

#### Dependencies
```json
 "devDependencies": {
    "cross-env": "^7.0.2",
    "ejs": "^3.0.1",
    "node-sass": "^4.14.1",
    "node-sass-glob-importer": "^5.3.2",
    "npm-run-all": "^4.1.5"
  },
  "dependencies": {
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "heroku": "^7.2.0",
    "mongodb": "^3.6.6",
    "mongoose": "^5.9.10",
    "node-fetch": "^2.6.0",
    "nodemon": "^2.0.2",
    "socket.io": "^4.0.0"
  }
```


## 🧑🏼‍ Actor Diagram
_Which actors are there in your application? (actor diagram)_

#### DLC
![data life cycle sketch](https://github.com/deannabosschert/real-time-web-2021/blob/main/public/assets/img/documentation/data-life-cycles/DLC_final.jpg)


<details>
  <summary><strong>Vorige versie</strong> (click to expand)</summary>
![data life cycle sketch](https://github.com/deannabosschert/real-time-web-2021/blob/main/public/assets/img/documentation/data-life-cycles/Data%20Flow%20Diagram%20-%20concept%203_%20popular%20photos.jpg)
</details>

## ↔️ Interaction diagram
_How does flowed interaction through the application? (interaction diagram)_
See above --> this one with focus on the user actions, like a wireflow? 

#### Socket
![socket](https://experiencetube.com/wp-content/uploads/sites/9/2017/09/ExperienceTube_A5T0181-1200x630.jpg)

#### 1v1 rooms
![](https://experiencetube.com/wp-content/uploads/sites/9/2017/09/ET-FINAL-POSTER-FRAME.jpg)

## 🌍 Design patterns

- Functional programming patterns
- Document structured as a cascade

## 🗃 Data

### 🐒 API
_What external data source is featured in your project and what are its properties?_ 

#### Unsplash API!
https://www.programmableweb.com/api/unsplash

![unsplash screenshot](https://gblobscdn.gitbook.com/assets%2F-MO3t4x8E_KNQlUwiOWq%2F-MO3t6SU8qGoybL570JI%2F-MO3u5zjbetqd4w9y-F4%2FDeanna%20-%20New%20frame%20(2).jpg?alt=media&token=b1a3b6ab-f359-4e9b-bc90-cd4a0e0d76cf)

*Endpoint*
https://api.unsplash.com/photos/?client_id=YOUR_ACCESS_KEY


#### Properties
*Response*
JSON

![json response](https://gblobscdn.gitbook.com/assets%2F-MO3t4x8E_KNQlUwiOWq%2F-MO3t6SU8qGoybL570JI%2F-MO3uN7pwD9lGYCYnRmW%2Fimage%20(10).png?alt=media&token=4560d63e-9b04-4ba5-bd2f-feb23a685e0e)

Ik doe een request naar de API met de volgende URL+queries; hierin is het keyword uiteraard afhankelijk van de input van de gebruiker.

`https://api.unsplash.com/photos/random/?count=4&query=ROSES&client_id=WgCeJ15nZWDOCklDsGksqOag8Xb4TvCILMy5datSx7w`

Daarmee haal ik in totaal 4 foto's op per user.

#### Rate limiting
- Unsplash: max 4000 per uur
- Volgens de Dropbox Paper API kunnen maximaal 500 users connecten in dev, daarna moet je voor een Production-pack gaan

### 💽 Data cleaning
_What has been done with the fetched data?_What has been done with the initial data? Cleaning pattern?

```js
(12) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
0: {id: "Cp_VUkZgXUk", created_at: "2021-01-24T04:25:53-05:00", updated_at: "2021-01-25T16:18:09-05:00", promoted_at: null, width: 3881, …}
1: {id: "vqgXGe79Z28", created_at: "2021-01-22T12:54:54-05:00", updated_at: "2021-01-25T14:17:00-05:00", promoted_at: null, width: 4000, …}
2: {id: "0pJjQFV6GVs", created_at: "2021-01-25T12:08:50-05:00", updated_at: "2021-01-25T18:28:38-05:00", promoted_at: null, width: 4000, …}
3: {id: "3QdnUQi7rWs", created_at: "2021-01-25T10:56:52-05:00", updated_at: "2021-01-25T12:47:39-05:00", promoted_at: null, width: 5472, …}
```


Een enkele foto heeft de volgende data:

```js
alt_description: "black and gray stone on white surface"
blur_hash: "LCPQ4~_4?bofx]t7WCog~qj[4nt6"
categories: []
color: "#d9d9d9"
created_at: "2021-01-24T04:25:53-05:00"
current_user_collections: []
description: null
downloads: 1
exif: {make: "Apple", model: "iPhone XR", exposure_time: "1/120", aperture: "1.8", focal_length: "4.2", …}
height: 2562
id: "Cp_VUkZgXUk"
liked_by_user: false
likes: 0
links: {self: "https://api.unsplash.com/photos/Cp_VUkZgXUk", html: "https://unsplash.com/photos/Cp_VUkZgXUk", download: "https://unsplash.com/photos/Cp_VUkZgXUk/download", download_location: "https://api.unsplash.com/photos/Cp_VUkZgXUk/download"}
location: {title: null, name: null, city: null, country: null, position: {…}}
promoted_at: null
sponsorship: null
updated_at: "2021-01-25T16:18:09-05:00"
urls: {raw: "https://images.unsplash.com/photo-1611480192372-a1…wxODgwNTh8MHwxfHJhbmRvbXx8fHx8fHx8&ixlib=rb-1.2.1", full: "https://images.unsplash.com/photo-1611480192372-a1…wNTh8MHwxfHJhbmRvbXx8fHx8fHx8&ixlib=rb-1.2.1&q=85", regular: "https://images.unsplash.com/photo-1611480192372-a1…wxfHJhbmRvbXx8fHx8fHx8&ixlib=rb-1.2.1&q=80&w=1080", small: "https://images.unsplash.com/photo-1611480192372-a1…HwxfHJhbmRvbXx8fHx8fHx8&ixlib=rb-1.2.1&q=80&w=400", thumb: "https://images.unsplash.com/photo-1611480192372-a1…HwxfHJhbmRvbXx8fHx8fHx8&ixlib=rb-1.2.1&q=80&w=200"}
user: {id: "gJT9v0ULiY4", updated_at: "2021-01-25T17:08:00-05:00", username: "juvnsky", name: "Juvnsky Anton Maksimov", first_name: "Juvnsky", …}
views: 216
width: 3881
```


Een heel tof detail hierbij is dat #color automatisch gegenereerd wordt, evenals in sommige gevallen de alt-tekst.
Uiteindelijk render ik met deze data de gallery van foto's:

```html
<article>
   <figure>
      <img style="border: 6.5px solid ${data.color};" src="${data.urls.regular}" alt="${data.alt_description}">
   </figure>
</article>
```



## 👯🏿‍ Features (+ wishlist)
_What would you like to add (feature wishlist / backlog)?_ 

- [ ]  hmmmoduless?
- [ ]  Disconnection-support


## 🏫 Assignment
<details>
  <summary></strong> (click to expand)</summary>

## Synopsis
- Course: Real-Time Web
- Minor: [Web Design and Development](https://dlo.mijnhva.nl/d2l/le/content/275640/Home) (*login required)
- Course Coordinator: Justus Sturkenboom ([@ju5tu5](https://github.com/ju5tu5))
- Minor Coordinator(s): Koop Reynders ([@KoopReynders](https://github.com/KoopReynders))
- Lecturers: Justus Sturkenboom ([@ju5tu5](https://github.com/ju5tu5)) & Lukas van Driel ([@lukasvan3l](https://github.com/lukasvan3l))
- Student Assistants: Robin ([@]()) & Wouter ([@]())
- Credit: 3 ECTS credits
- Academic year: 2020-2021
- Programme: Communication and Multimedia Design (full time bachelor)
- Language: Dutch instructions and English resources


## Learning Goals
After finishing this program I can:
- _deal with real-time complexity;_
- _handle real-time client-server interaction;_
- _handle real-time data management;_
- _handle multi-user support._

## Grading/goals
My efforts will be graded using a single point rubric (see below). I will have to pass the criterion (centre column) to pass the course. During the test I will be consulted and will be given feedback on things they think deficient and things they think are an improvement on the criterion.

| Deficiency | Criterion | Improvement |
|:--|:--|:--|
|  | *Project* Your app is working and published on Heroku. Your project is thoroughly documented in the `README.md` file in your repository. Included are a description of the data-lifecycle, real-time events and external data source used by your app. |  |
|  | *Complexity* You’ve implemented enough real-time functionality for us to test your comprehension of the subject. A lot of functionality is self-written. You are able to manipulate online examples live. |  |
|  | *Client-server interaction* By interacting with the app, a user can influence the data model of the server in real time by directly modifying data OR by influencing API requests between server and source. The student has set up the data manipulations. |  |
|  | *Data management* The server maintains a data model and each client is continuously updated with the correct data. |  |
|  | *Multi-user support* Multiple clients can connect to the server. Interaction works as expected and is not dependent on the number of clients. You can explain how your app approaches this. |  |

## Programme

### Daily schedule
To keep things simple we use a daily schedule that will be used during normal course days. We make exceptions for checkups and assessments, on these days a different schedule will be given.

| Time | Who | Activity |
|:--|:--|:--|
| *~09:00* | *(Lukas, Justus, Robin, Wouter)* | *Standup* |
| 09:30 | Tribe *+(Lukas, Justus, Robin, Wouter)* | Talk with crucial information (make sure you attend!) |
| 11:00 | Teams in MS Teams: *(ex. R2D2 Team A)* | Work on the (day)assignment |
|  | Squad R2D2 Team B *+(Justus, Wouter)* | Standup |
|  | Squad SQUID Team B *+(Lukas, Robin)* | Standup |
| 11:30 | Squad R2D2 Team C *+(Justus, Wouter)* | Standup |
|  | Squad SQUID Team C *+(Lukas, Robin)* | Standup |
| 12:00 | Squad R2D2 Team A *+(Justus, Wouter)* | Standup |
|  | Squad SQUID Team A *+(Lukas, Robin)* | Standup |
| 13:00 | Tribe *+(Robin, Wouter)* | Continue work on the (day)assignment |
| 16:00 | Squad R2D2 Team B *+(Wouter)* | Standup |
|  | Squad SQUID Team B *+(Robin)* | Standup |
| 16:15 | Squad R2D2 Team C *+(Wouter)* | Standup |
|  | Squad SQUID Team C *+(Robin)* | Standup |
| 16:30 | Squad R2D2 Team A *+(Wouter)* | Standup |
|  | Squad SQUID Team A *+(Robin)* | Standup |

### Week 1 - Getting a grip
Goal: Build and deploy a simple but unique real-time app

#### Tuesday 6 April
**Talk subjects:** Hit the ground running... [(slides)](https://docs.google.com/presentation/d/1Z-zOIDvFB0P2qGHV0F74n9T4kprgybJ_8GYU-1MaKfM/edit?usp=sharing) Course objective and explanation of the assignment, examples from last year, explanation of real-time, (live coded) bare bone chat app and deployment on Heroku.\
**Day assignment:** [(assignment)](./course/week-1.md#assignment-1-make-it-so) Make it so *(as a team)*: Implement (code/style/discuss/deploy) basic chat (or other realtime) functionality on your teampage!

#### Friday 9 April
**Talk subjects:** My first realtime web app! [(slides)](https://docs.google.com/presentation/d/18eftO3epzIXDjdwl3cn5Wq99fkQYCUnExUqq9P72A3k/edit?usp=sharing) Short recap, (local) data management, using (wire) flows for realtime web apps, (live coded) multi-user woordzoeker.\
**Day assignment:** [(assignment)](./course/week-1.md#assignment-2-make-it-so) Make it so *(individually)*. i) Create (code/style/discuss/deploy) a chat app (or other realtime functionality) based on the examples and ii) add your own unique feature!

### Week 2 - Sockets and data
Goal: Store, manipulate and share data between server-client   

#### Monday 12 April
**Talk subjects:** Data driven development?! [(slides)](https://docs.google.com/presentation/d/1WC1DxkQm2eUCTQp7dEfv0cTVMK7zlg3der0P0qP7S5I/edit?usp=sharing) *Gastcollege Thijs Spijker* Feedback about last week, final assignment and conditions (rubric), explanation of data management, (live coded) Long polling vs Websockets. \
**Day assignment:** [(assignment)]() (Proof of) Concept *(individually)*. i) Create a (3 > 1) concept based on existing data from an API and ii) map this data using modelling techniques.

#### Tuesday 13 April
**Talk subjects:** Above all else, show the data. [(slides)](https://docs.google.com/presentation/d/1tW4klrDjt1AfWte311uKkfQYwaHwokzQ-ue3a4VphqA/edit?usp=sharing) Securing real-time web apps, offline support, the publication/subscription model and (case study) Quek!\
**Day assignment:** [(assignment)]() Proof of concept (individueel): i) Werk een deel van de kernfunctionaliteit van jouw concept uit en ii) toon het bijbehorende data lifecycle diagram.

#### Friday 16 April - Checkup!
Instead of our talk we will have a [peer review session](). You will read, comment and fire issues on each others code. Doing this is really good for your programming insight and helps others refining/refactoring their code.

| Time | Who | Activity |
|:--|:--|:--|
| 09:30 | Tribe *+(Lukas, Justus, Robin, Wouter)* | Peer review |
| 10:30 | Squad R2D2 Team B.1 *+(Justus)* | Checkup |
|  | Squad R2D2 Team B.2 *+(Wouter)* | Checkup |
|  | Squad SQUID Team B.1 *+(Lukas)* | Checkup |
|  | Squad SQUID Team B.2 *+(Robin)* | Checkup |
| 11:00 | Squad R2D2 Team C.1 *+(Justus)* | Checkup |
|  | Squad R2D2 Team C.2 *+(Wouter)* | Checkup |
|  | Squad SQUID Team C.1 *+(Lukas)* | Checkup |
|  | Squad SQUID Team C.2 *+(Robin)* | Checkup |
| 11:30 | Squad R2D2 Team A *+(Justus)* | Checkup |
|  | Squad R2D2 Team A *+(Wouter)* | Checkup |
|  | Squad SQUID Team A *+(Lukas)* | Checkup |
|  | Squad SQUID Team A *+(Robin)* | Checkup |

### Week 3 - Dealing with multiple users
Goal: Handle data sharing and multi-user support 

#### Monday 19 April
**Talk subjects:** Roll your own... [(slides) ](https://docs.google.com/presentation/d/1Cx9qCo8QQXH5Btbtwg0L61so-wn2OxFQZdphIhbumQk/edit?usp=sharing) Data management using firebase and other ways of adding your own data. Authentication via OAuth\
**Day assignment:** [(assignment)]()

#### Tuesday 20 April
**Talk subjects:** Not ignoring the UI-Stack! [(slides)](https://docs.google.com/presentation/d/1ACuUJ-B19hgFN2CCTYH8ClN0WD69ok8ZVnkRGbU0FjA/edit?usp=sharing). Usability, feedback, feedforward etc. in real-time web apps, (case study) postNL loader and FAQ.
**Day assignment:** [(assignment)]()

#### Friday 23 April
We will have our final [peer review session](). You will read, comment and fire issues on each others code. Doing this helps others dotting the i’s on their project.

| Time | Who | Activity |
|:--|:--|:--|
| 09:30 | Tribe *+(Lukas, Justus, Robin, Wouter)* | Peer review |
| 10:30 | Squad R2D2 Team B.1 *+(Justus)* | Checkup |
|  | Squad R2D2 Team B.2 *+(Wouter)* | Checkup |
|  | Squad SQUID Team B.1 *+(Lukas)* | Checkup |
|  | Squad SQUID Team B.2 *+(Robin)* | Checkup |
| 11:00 | Squad R2D2 Team C.1 *+(Justus)* | Checkup |
|  | Squad R2D2 Team C.2 *+(Wouter)* | Checkup |
|  | Squad SQUID Team C.1 *+(Lukas)* | Checkup |
|  | Squad SQUID Team C.2 *+(Robin)* | Checkup |
| 11:30 | Squad R2D2 Team A *+(Justus)* | Checkup |
|  | Squad R2D2 Team A *+(Wouter)* | Checkup |
|  | Squad SQUID Team A *+(Lukas)* | Checkup |
|  | Squad SQUID Team A *+(Robin)* | Checkup |

### Week 4
Goal: Assess and wrap-up the course!

#### Wednesday
**09.30** [*Lukas, Justus*] Assessments (scheduled)

#### Thursday
**09.30** [*Lukas, Justus*] Assessments (scheduled)

#### Friday
**15.00** [*Everyone*] Wrap-up for the course. (drinks?!)



</details>

### Rubric

[Rubric- detailed rating of my project](https://github.com/deannabosschert/real-time-web-2021/wiki/Rubric)
![rubric](https://github.com/deannabosschert/real-time-web-2021/blob/master/src/img/rubric.png)
[rubric]: https://docs.google.com/spreadsheets/d/e/2PACX-1vTjLC7HzQngsRCmkxTGWvKkkH1JuA5KivKdky_9dzr1zzghARw4-ldQW_tWO3zpxT7ZQC7SpiUa0q2z/pubhtml?gid=0&single=true

## ℹ️ Resources

### Credits
- Our superamazingteachers at @CMD

### Small inspiration sources

- Rubber ducky

## 🗺️ License
Author: [Deanna Bosschert](https://github.com/deannabosschert)
License by [MIT](https://github.com/deannabosschert/project/blob/master/LICENSE)
