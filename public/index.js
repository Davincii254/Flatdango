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

// Function to fetch the movies
function grabMovies(updateDesc = true){
    ulFilms.innerHtml = "";   // Clear the current list of movies
    fetch(url)
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            if(updateDesc) {
                updateMovieDesc(data[0])
            }
            // Add the movie to the list
            data.map(movie =>{
                addMovie(movie)
            });
        } else {
            // If no movie is available in the array
            let liNoData = document.createElement("li");
            liNoData.innerText = "No movies available at the moment, please check back later";
            liNoData.style.color = "red";
            ulFilms.appendChild(liNoData)
        }
    })
     .catch(e => {
        // Handle errors during fetch operatopn
        console.log(e.message);
        let liNoData = document.createElement("li");
        liNoData.innerText = "Unable to fetch moveis at the moment, please check again later.";
        liNoData.style.color = "red";
        ulFilms.appendChild(liNoData)
    });
}

grabMovies(true)     // Atamatically call grabMovies when the site loads

// Function to add a movie to tthe movei list in the DOM
function addMovie(movies){
    // Calculate the number of tickets remaining for the movie
    let remaining = movies.capacity - movies.tickets_sold;

    let movieTittle = movies.title;
    let movieId = movies.id;

    // CReate a list of the movies
    let liFilm = document.createElement("li");

    if (!(remaining > 0)) {
        liFilm.className = "sold out";
        liFilm.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
    }

    ulFilms.appendChild(liFilm);

    // Add the movie tittle to the list item
    let movieSpan = document.createElement("span")
    movieSpan.innerText = movieTittle;
    liFilm.appendChild(movieSpan);

    // add a delete button to each movie
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete Movie";
    deleteButton.className = "movieDelete";
    liFilm.appendChild(deleteButton);

    // Attch an event listener to the delete button
    deleteButton.addEventListener('click', () =>{
        deleteMovies(movies);   //call deletMovie when clicked
    });

    // Attach an event to the movie tittle
    movieSpan.addEventListener('click', () =>{
        updateMovieDesc(movies)   // Call updateMovieDesc when clicked
    })
}


// Function to update the details of the movie on the main display
function updateMovieDesc(movies) {
    let remaining = movies.capacity - movies.tickets_sold;
    let movieId = movies.id;
    let availability = remaining > 0 ? "Buy Ticket" : "Sold Out";


    // Update the movie detals on the DOM
    movieImg.src = movies.poster;
    movieImg.alt = movies.title;
    idTitle.innerText = movies.title;
    idRuntime.innerText = movies.runtime + "minutes";
    idFilmInfo.innerText = movies.description;
    idShowtime.innerText = movies.showtime;
    idTicketnum.innerText = remaining;

    // Attach a click event to the Buy Ticket if tickets are availabe
    idBuyticket.onclick = () => {
        if(remaining > 0) {
            buyticket(movies)
        } else {
            alert("oooPPPS!! Tickets are sold out.");
        }
    };

    idBuyticket.dataset.movieId = movies.id;

    // Update the button based on the ticket availability
    let button = document.querySelector(`[data-movie-id="${movieId}"]`);
    button.innerText = availability;
}

// Function to handle the puechase of a ticket
function buyticket(movies){
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