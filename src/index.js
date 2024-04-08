// Your code here
document.addEventListener('DOMContentLoaded', function() {
    const url = "http://localhost:3000/films";
    const ulFilms = document.getElementById("films");
  
    function grabMovies() {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          ulFilms.innerHTML = "";
          data.forEach(movie => addMovie(movie));
        })
        .catch(e => console.error(e.message));
    }
  
    function addMovie(movie) {
      const liFilm = document.createElement("li");
      liFilm.classList.add("film", "item");
      liFilm.innerText = movie.title;
      ulFilms.appendChild(liFilm);
  
      const remainingTickets = movie.capacity - movie.tickets_sold;
  
      if (remainingTickets <= 0) {
        liFilm.classList.add("sold-out");
        const buyTicketBtn = document.createElement("button");
        buyTicketBtn.innerText = "Sold Out";
        liFilm.appendChild(buyTicketBtn);
      } else {
        liFilm.addEventListener('click', () => {
          displayMovieDetails(movie, remainingTickets);
        });
      }
    }
  
    function displayMovieDetails(movie, remainingTickets) {
      const posterImg = document.getElementById("poster");
      const titleElem = document.getElementById("title");
      const runtimeElem = document.getElementById("runtime");
      const filmInfoElem = document.getElementById("film-info");
      const showtimeElem = document.getElementById("showtime");
      const ticketNumElem = document.getElementById("ticket-num");
      const buyTicketBtn = document.getElementById("buy-ticket");
  
      posterImg.src = movie.poster;
      posterImg.alt = movie.title;
      titleElem.innerText = movie.title;
      runtimeElem.innerText = movie.runtime + " minutes";
      filmInfoElem.innerText = movie.description;
      showtimeElem.innerText = movie.showtime;
      ticketNumElem.innerText = remainingTickets;
  
      buyTicketBtn.onclick = () => {
        if (remainingTickets > 0) {
          buyTicket(movie.id, remainingTickets);
          remainingTickets--;
          ticketNumElem.innerText = remainingTickets;
          if (remainingTickets === 0) {
            buyTicketBtn.innerText = "Sold Out";
            liFilm.classList.add("sold-out");
          }
        } else {
          alert('Not enough tickets available.');
        }
      };
    }
  
    function buyTicket(movieId, remainingTickets) {
      const requestOptions = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tickets_sold: remainingTickets })
      };
  
      fetch(`/films/${movieId}`, requestOptions)
        .then(response => response.json())
        .then(data => {
          console.log(data); // Updated movie data from the server
          alert('Ticket purchased successfully!');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  
    grabMovies();
  });
  