// Your code here
const url = "http://localhost:3000/films"
const filmsDiv = document.querySelector("#films")
const posterDiv = document.querySelector("#poster")
const showingDiv = document.querySelector("#showing")

//movie titles
const titlesDiv = document.querySelector("div#films").lastElementChild


//info-card nodes
const cardTitleDiv = document.querySelector("#title")
const runtimeDiv = document.querySelector("#runtime")
const filmInfoDiv = document.querySelector("#film-info")
const ticketNumberDiv = document.querySelector("#ticket-num")
const showtimeDiv = document.querySelector("#showtime")


posterDiv.hidden = true
showingDiv.style.display = "none"
document.addEventListener("DOMContentLoaded", () => {
  getMovies()
})

const getMovies = () => {
  fetch(url)
  .then(resp => resp.json())
  .then(data => data.forEach((movie) => {
    const moviesIndexBtn = document.createElement("button")
    const movieListPara = document.createElement("li")
    movieListPara.classList.add("index-list")
    movieListPara.innerHTML = movie.title

    movieListPara.addEventListener("click", () => {
      displayMovieInfo(movie)
    })

    titlesDiv.append(movieListPara)

    
  }))
  .catch(error => console.log("The fetch failed because " + error))
}

const displayMovieInfo = (movie) => {
  fetch(url + `/${movie.id}`)
  .then(resp => resp.json())
  .then(data => {
    cardTitleDiv.innerText = data.title
    runtimeDiv.innerText = data.runtime
    filmInfoDiv.innerText = data.description
    ticketNumberDiv.innerText = (data.capacity - data.tickets_sold)
    //using .substring to remove the first '0' on all the showtimes
    showtimeDiv.innerText = data.showtime.substring(1)
    posterDiv.src = `${data.poster}`
    posterDiv.hidden = false
    showingDiv.style.display = "inline-block"
    const buyTicketBtn = document.querySelector("div.extra.content div.ui")
    buyTicketBtn.addEventListener("click", () => {
      buyTicket(data)
    })
  })
  .catch(error => console.log(error + "We could get the info for that specific movie"))
}

const buyTicket = (movie) => {

  if (movie.tickets_sold < movie.capacity) {
    fetch(url + `/${movie.id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tickets_sold: movie.tickets_sold + 1
      })

    })
    .then(resp => resp.json())
    .then(data => {
      ticketNumberDiv.innerText = (data.capacity - data.tickets_sold)
      movie.tickets_sold = movie.tickets_sold + 1
    })
    .catch(error => console.log( error + " Issues connecting with the server"))
  } else {
  console.log("Sold Out")
  }
}