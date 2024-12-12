// Define the URL for fetching and interacting with the films database
let url = "http://localhost:3000/films/";    

// Reference to various HTML elements where data will be displayed or updated
let ulFilms = document.getElementById("films");
let idBuyticket = document.getElementById("buy-ticket");
let movieImg = document.getElementById("poster");
let idTitle = document.getElementById("title");
let idRuntime = document.getElementById("runtime");
let idFilmInfo = document.getElementById("film-info");
let idShowtime = document.getElementById("showtime");
let idTicketnum = document.getElementById("ticket-num");

// Function to fetch movies from the database and update the DOM
function grabMovies(updateDesc = true) {
    ulFilms.innerHTML = ""; // Clear the current list of movies
    fetch(url) // Fetch the list of movies from the server
        .then(res => res.json()) // Parse the response as JSON
        .then(data => {
            if (data.length > 0) {
                // If `updateDesc` is true, set the details of the first movie in the list
                if (updateDesc) {
                    updateMovieDesc(data[0]);
                }
                // Add each movie to the list
                data.map(movie => {
                    addMovie(movie);
                });
            } else {
                // If no movies are available, display a "no data" message
                let liNoData = document.createElement("li");
                liNoData.innerText = "No movies available at the moment. Please check back later.";
                liNoData.style.color = "red";
                ulFilms.appendChild(liNoData);
            }
        })
        .catch(e => {
            // Handle errors during the fetch operation
            console.log(e.message);
            let liNoData = document.createElement("li");
            liNoData.style.color = "red";
            liNoData.innerText = "Unable to fetch movies at the moment. Please try again later.";
            ulFilms.appendChild(liNoData);
        });
}

// Automatically call `grabMovies` when the site loads
grabMovies(true);

// Function to add a movie to the movie list in the DOM
function addMovie(movies) {
    // Calculate the number of tickets remaining for the movie
    let remaining = movies.capacity - movies.tickets_sold;

    let movieTitle = movies.title; // Movie title
    let movieId = movies.id; // Movie ID

    // Create a new list item for the movie
    let liFilm = document.createElement("li");
    if (!(remaining > 0)) { // If no tickets remain, mark the movie as sold out
        liFilm.className = "sold-out";
        liFilm.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    }
    ulFilms.appendChild(liFilm); // Add the list item to the list

    // Add the movie title to the list item
    let movieSpan = document.createElement("span");
    movieSpan.innerText = movieTitle;
    liFilm.appendChild(movieSpan);

    // Add a delete button for the movie
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.className = "movieDelete";
    liFilm.appendChild(deleteButton);

    // Attach an event listener to the delete button
    deleteButton.addEventListener('click', () => {
        deleteMovie(movies); // Call `deleteMovie` when clicked
    });

    // Attach an event listener to the movie title
    movieSpan.addEventListener('click', () => {
        updateMovieDesc(movies); // Call `updateMovieDesc` when clicked
    });
}

// Function to update the details of a movie in the main display
function updateMovieDesc(movies) {
    let remaining = movies.capacity - movies.tickets_sold; // Calculate remaining tickets
    let movieId = movies.id; // Get the movie ID
    let availability = remaining > 0 ? "Buy Ticket" : "Sold Out"; // Determine ticket availability

    // Update the movie details in the DOM
    movieImg.src = movies.poster;
    movieImg.alt = movies.title;
    idTitle.innerText = movies.title;
    idRuntime.innerText = movies.runtime + " minutes";
    idFilmInfo.innerText = movies.description;
    idShowtime.innerText = movies.showtime;
    idTicketnum.innerText = remaining;

    // Attach a click event to the "Buy Ticket" button
    idBuyticket.onclick = () => {
        if (remaining > 0) {
            buyTicket(movies); // Call `buyTicket` if tickets are available
        } else {
            alert("Oops! Tickets are sold out."); // Show an alert if sold out
        }
    };
    idBuyticket.dataset.movieId = movies.id;

    // Update the button text based on ticket availability
    let button = document.querySelector(`[data-movie-id="${movieId}"]`);
    button.innerText = availability;
}

// Function to handle ticket purchase
function buyTicket(movies) {
    movies.tickets_sold++; // Increment the number of tickets sold
    let requestHeaders = { "Content-Type": "application/json" };
    let requestBody = { "tickets_sold": movies.tickets_sold };

    // Send a PATCH request to update ticket data on the server
    fetch(url + movies.id, {
        method: "PATCH",
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(data => {
        updateMovieDesc(data); // Update the movie details after purchase
        if (!(data.capacity - data.tickets_sold > 0)) {
            ulFilms.innerHTML = ""; // Clear the list if tickets are sold out
            grabMovies(false); // Refresh the movie list
        }
    })
    .catch(e => console.log(e.message));
}

// Function to delete a movie from the database
function deleteMovie(movie) {
    let requestHeaders = { "Content-Type": "application/json" };
    fetch(url + movie.id, {
        method: "DELETE",
        headers: requestHeaders
    })
    .then(res => res.json())
    .then(() => grabMovies()) // Refresh the movie list after deletion
    .catch(e => console.log(e.message));
}
