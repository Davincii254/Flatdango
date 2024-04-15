// Your code here
let url = "http://localhost:3000/films/";
let ulFilms = document.getElementById("films");
let idBuyticket = document.getElementById("buy-ticket")

let movieImg = document.getElementById("poster");
let idTitle = document.getElementById("title")
let idRuntime = document.getElementById("runtime")
let idFilmInfo = document.getElementById("film-info")
let idShowtime = document.getElementById("showtime")
let idTicketnum = document.getElementById("ticket-num")


// when this function is called it grabes all the movies from the db.json endpoint and updates the DOM
function grabMovies(updateDesc = true){
    ulFilms.innerHTML = "";
    fetch(url)
    .then(res => res.json())
    .then(data => { 
        if(data.length > 0){
            if(updateDesc){
                updateMovieDesc(data[0]);
            }

            data.map(movie => {
                addMovie(movie);
            })
        }else{
            let liNoData = document.createElement("li");
            liNoData.innerText = "Seems Have no Movies at the Moment please Come back Later";
            liNoData.style.color="red";
            ulFilms.appendChild(liNoData);
        }
        }
    )
    .catch(e => {
        console.log(e.message)
        let liNoData = document.createElement("li");
        liNoData.style.color="red";
        liNoData.innerText = "We couldnt fetch Movies at the moment please try again later";
        ulFilms.appendChild(liNoData);
    });
}
// this funcxtion is called by default when the site is opened 
grabMovies(true);

//this funcion updates the title of the movies in left list ul parent
function addMovie(movies){
    
    let remaining = movies.capacity - movies.tickets_sold;

    movieTitle = movies.title
    movieId = movies.id
    let liFilm = document.createElement("li");
    if(!remaining > 0)
    {  liFilm.className = "sold-out"
        liFilm.style.backgroundColor = "rgba(255, 0, 0, 0.2";
    }
    ulFilms.appendChild(liFilm);

    let movieSpan = document.createElement("span");
    movieSpan.innerText = movieTitle;
    liFilm.appendChild(movieSpan);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete"
    deleteButton.className = "movieDelete"
    liFilm.appendChild(deleteButton); 

    deleteButton.addEventListener('click', () => {
        deleteMovie(movies)
    })
    movieSpan.addEventListener('click', () => {
        updateMovieDesc(movies);
    })
}


// when this function is called it updates the image div and more information on the next div 
function updateMovieDesc(movies){
    let remaining = movies.capacity - movies.tickets_sold;
    let movieId = movies.id;
    let availabiity;

    if(remaining > 0){
        availabiity = "Buy Ticket"
    }else{
        availabiity = "Sold out"
    }

    movieImg.src = movies.poster; 
    movieImg.alt = movies.title; 
    idTitle.innerText = movies.title;
    idRuntime.innerText = movies.runtime + " minutes";
    idFilmInfo.innerText = movies.description;
    idShowtime.innerText = movies.showtime;
    idTicketnum.innerText = remaining;

    idBuyticket.onclick = () => {
        if(remaining > 0)
        { 
             buyTicket(movies)
        }else{
            alert("Opps Ticket is Sold Out already !!")
        }
    };
    idBuyticket.dataset.movieId = movies.id;
    let button = document.querySelector(`[data-movie-id="${movieId}"]`);
    button.innerText = availabiity;
}

// when the buyTicket function is called is met to confirm if the are remaining tickets and if the tickets are available it can purchase ad take records of the tickets also
function buyTicket(movies){
    movies.tickets_sold++
    let ticketsSold = movies.tickets_sold;
    let requestHeaders = {
        "Content-Type": "application/json"
    }
    let requestBody = {
        "tickets_sold": ticketsSold
    }
    fetch(url+movies.id,{
        method: "PATCH",
        headers: requestHeaders,    
        body: JSON.stringify(requestBody)
    })
    .then (res => res.json())
    .then (data => {
        updateMovieDesc(data);

        let numberOfTickets = (data.capacity - data.tickets_sold)

        if(!numberOfTickets > 0)
        { 
            ulFilms.innerHTML = "";
            grabMovies(false)
        }

        let  RequestBodyTickets =  {
            "film_id": data.id,
            "number_of_tickets": numberOfTickets
         }

        fetch("http://localhost:3000/tickets",{
            method: "POST",
            headers: requestHeaders,    
            body: JSON.stringify(RequestBodyTickets)
        })
        .then (res => res.json())
        .then(data => data)
        .catch (e => console.log(e.message));

    })
    .catch (e => console.log(e.message));
}

//this function will delete  movie when clicked 
function deleteMovie(movie){
    let requestHeaders = {
        "Content-Type": "application/json"
    }
    let requestBody = {
        "id": movie.id
    }
    fetch(url+movie.id, {
        method: "DELETE",
        headers: requestHeaders,    
        body: JSON.stringify(requestBody)
    })
    .then (res => res.json())
    .then (data => grabMovies())
    .catch (e => console.log(e.message));
}