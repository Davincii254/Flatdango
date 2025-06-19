// Await the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  const filmsList = document.querySelector("#films");
  const moviePoster = document.querySelector("#movie-poster");
  const movieTitle = document.querySelector("#title");
  const movieRuntime = document.querySelector("#runtime");
  const movieInfo = document.querySelector("#film-info");
  const movieShowtime = document.querySelector("#showtime");
  const ticketCount = document.querySelector("#ticket-num");
  const buyTicketBtn = document.querySelector("#buy-ticket");
  const addMovieForm = document.querySelector("#add-movie-form");

  // --- Global Variables ---
  const BASE_URL = "http://localhost:3000/films";
  let currentMovie;
  let allMovies = []; 



  const getMovie = (id) => {
    fetch(`${BASE_URL}/${id}`)
      .then((res) => res.json())
      .then(renderMovieDetails)
      .catch((error) => console.error("Error fetching movie details:", error));
  };


  const renderMovieDetails = (movie) => {
    currentMovie = movie; 
    const availableTickets = movie.capacity - movie.tickets_sold;

    moviePoster.src = movie.poster;
    moviePoster.alt = `${movie.title} poster`;
    movieTitle.textContent = movie.title;
    movieRuntime.textContent = `${movie.runtime} minutes`;
    movieInfo.textContent = movie.description;
    movieShowtime.textContent = movie.showtime;
    ticketCount.textContent = availableTickets;

    if (availableTickets <= 0) {
      buyTicketBtn.textContent = "Sold Out";
      buyTicketBtn.disabled = true;
    } else {
      buyTicketBtn.textContent = "Buy Ticket";
      buyTicketBtn.disabled = false;
    }

    const filmItem = document.querySelector(`#film-${movie.id}`);
    if (filmItem) {
      if (availableTickets <= 0) {
        filmItem.classList.add("sold-out");
      } else {
        filmItem.classList.remove("sold-out");
      }
    }
  };

  const renderMovieList = (movies) => {
    filmsList.innerHTML = ""; 
    movies.forEach((movie) => {
      const li = document.createElement("li");
      li.id = `film-${movie.id}`;
      li.className = "film item";
      if (movie.capacity - movie.tickets_sold <= 0) {
        li.classList.add("sold-out");
      }

      // Movie Title Span
      const titleSpan = document.createElement("span");
      titleSpan.textContent = movie.title;
      li.appendChild(titleSpan);

      // Delete Button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("ui", "tiny", "red", "button", "delete", "right", "floated");
      li.appendChild(deleteBtn);

      // Add event listeners
      titleSpan.addEventListener("click", () => getMovie(movie.id));
      deleteBtn.addEventListener("click", (e) => handleDeleteMovie(e, movie.id));

      filmsList.appendChild(li);
    });
  };

  const initialize = () => {
    fetch(BASE_URL)
      .then((res) => res.json())
      .then((movies) => {
        allMovies = movies;
        if (allMovies && allMovies.length > 0) {
          renderMovieList(allMovies); 
          getMovie(allMovies[0].id); 
        } else {
          filmsList.innerHTML = "<div class='item'>No movies found. Add one using the form below!</div>";
          document.getElementById('movie-details').style.display = 'none';
        }
      })
      .catch((error) => console.error("Error initializing page:", error));
  };

  // --- Event Handlers ---

  const handleBuyTicket = (e) => {
    e.preventDefault();
    
    if (currentMovie && currentMovie.tickets_sold < currentMovie.capacity) {
      const newTicketsSold = currentMovie.tickets_sold + 1;

      fetch(`${BASE_URL}/${currentMovie.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          tickets_sold: newTicketsSold,
        }),
      })
        .then((res) => res.json())
        .then(updatedMovie => {
          const movieIndex = allMovies.findIndex(m => m.id === updatedMovie.id);
          if (movieIndex !== -1) {
            allMovies[movieIndex] = updatedMovie;
          }
          renderMovieDetails(updatedMovie);
        })
        .catch((error) => console.error("Error purchasing ticket:", error));
    }
  };

  const handleDeleteMovie = (e, id) => {
    e.stopPropagation(); 

    fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    })
    .then(response => {
      if (response.ok) {
        allMovies = allMovies.filter(movie => movie.id !== id);
        renderMovieList(allMovies);

        // If the deleted movie was the one being displayed, reset the display
        if (currentMovie && currentMovie.id.toString() === id.toString()) {
          if (allMovies.length > 0) {
            getMovie(allMovies[0].id);
          } else {
            // If no movies are left, hide the details section
            document.getElementById('movie-details').style.display = 'none';
          }
        }
      } else {
        throw new Error('Failed to delete the movie.');
      }
    })
    .catch(error => console.error('Error deleting movie:', error));
  };


  const handleAddMovie = (e) => {
    e.preventDefault(); 

    const newMovie = {
      title: e.target.title.value,
      runtime: e.target.runtime.value,
      capacity: parseInt(e.target.capacity.value, 10),
      showtime: e.target.showtime.value,
      tickets_sold: 0, // New movies start with 0 tickets sold
      description: e.target.description.value,
      poster: e.target.poster.value,
    };

    // POST request to add the new movie to the server
    fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(newMovie),
    })
    .then(res => res.json())
    .then(movieFromServer => {
        allMovies.push(movieFromServer);
        renderMovieList(allMovies);
        e.target.reset(); 
    })
    .catch(error => console.error('Error adding movie:', error));
  };

  buyTicketBtn.addEventListener("click", handleBuyTicket);
  addMovieForm.addEventListener("submit", handleAddMovie);

  initialize();
});