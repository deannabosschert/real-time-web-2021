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
- [👍🏽 Best practices](#-----best-practices)
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
- [ ] Sketch wireframes for every concept
- [ ] Ask questions to Justus (Room logic, scoreboard logic)
- [ ] Add functionalities
- [ ] Fix error things (e.g. when an user tries to submit an unfound category.. check api statuscodes!)

#### Quirks
- Removed build command for css to avoid issues with Heroku
- Heroku removed MongoDB support
- If someone opened a room and disconnected before another player could join, the room has to be destroyed from the availableRooms-array

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
### Concept 1
> Users kunnen uit 4 foto's uit een zelfgekozen categorie kiezen, en stemmen op de beste.

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

#### DLC
![data life cycle sketch](https://github.com/deannabosschert/real-time-web-2021/blob/main/public/assets/img/documentation/data-life-cycles/Data%20Flow%20Diagram%20-%20concept%203_%20popular%20photos.jpg)


### Concept 2
Bij nader inzien misschien beter om voor een veel simpelere api/structure te gaan;
Ik ga denk ik voor het gebruik van https://quizapi.io/ als Trivia-API, laat mensen in rooms potjes tegen elkaar spelen van like 5 vragen, en store de resultaten in een database voor het genereren van een leaderboard. Is een beter haalbare MVP, en er kan alsnog uitgebouwd worden met kekke CSS en categories etc.

Wel nog checken of/hoe de real-time functionaliteit voldoende aan de orde komt dan.

#### DLC
<img src="https://github.com/deannabosschert/real-time-web-2021/blob/main/public/assets/img/documentation/data-life-cycles/Data%20Flow%20Diagram%20-%20concept%202_%20trivia.jpg" alt="data life cycle sketch" style="display: inline-block;"  width="546.5" height="520.4">

### Concept 3
GitHub/Paper/anything-connectie voor maken van docs, zodat ik de docs kan schrijven in bijv Markdown via de Wiki en het weergeven wordt op mijn website in kek blogformaat

Ik heb heel lang GitBook, Dropbox Paper, GitHub Wiki of andere document editing-programma's gebruikt. Laatst ben ik Figma gaan gebruiken om m'n documenten eindelijk eens geheel in eigen stijl/opmaak op te kunnen leveren. Nu typt dat alleen niet bepaald lekker weg en is het daardoor niet de meest ideale situatie voor grotere docs. Ik vond het juist wel 'lekker doortypen' in iets als GitBook of Dropbox Paper, maar daar kon die eigen opmaak dus niet in gebruikt worden. Stom! 

Daarom lijkt het mij tof om een realtime connectie te maken tussen één van deze editors en een eigen output/website:

- Ik typ m'n teksten gewoon in bijv Dropbox Paper
- Ik kan de teksten inclusief custom vormgeving realtime terugvinden op m'n eigen blogpost-site
- Ook op m'n eigen site kan ik de teksten aanpassen, waarbij de teksten eveneens realtime geüpdatet worden in Dropbox Paper

#### DLC
<img src="https://github.com/deannabosschert/real-time-web-2021/blob/main/public/assets/img/documentation/data-life-cycles/Data%20Flow%20Diagram%20-%20concept%201_%20dropbox%20paper.jpg" alt="data life cycle sketch" style="display: inline-block;"  width="502.8" height="565.6">



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
See above --> this one with the functions specifically? 

## ↔️ Interaction diagram
_How does flowed interaction through the application? (interaction diagram)_
See above --> this one with focus on the user actions, like a wireflow? 

#### Socket
![socket](https://experiencetube.com/wp-content/uploads/sites/9/2017/09/ExperienceTube_A5T0181-1200x630.jpg)

#### 1v1 rooms
![](https://experiencetube.com/wp-content/uploads/sites/9/2017/09/ET-FINAL-POSTER-FRAME.jpg)

## 🌍 Design patterns

- opsomming
- van
- patterns
- die
- gebruikt
- zijn

## 👍🏽 Best practices

- Any tips applicable to this course or project


## 🗃 Data

### 🐒 API
_What external data source is featured in your project and what are its properties?_ 

Unsplash API

#### Properties

#### Rate limiting
- Unsplash: max 4000 per uur
- Volgens de Dropbox Paper API kunnen maximaal 500 users connecten in dev, daarna moet je voor een Production-pack gaan

### 💽 Data cleaning
_What has been done with the fetched data?_What has been done with the initial data? Cleaning pattern?

```js
```

outcome:
```json
```

## 👯🏿‍ Features (+ wishlist)
_What would you like to add (feature wishlist / backlog)?_ 

- [x] one thing
- [ ] second something
- [ ] third thing


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

- one source
- second source

## 🗺️ License
Author: [Deanna Bosschert](https://github.com/deannabosschert)
License by [MIT](https://github.com/deannabosschert/project/blob/master/LICENSE)
