// Model
model = {
	movieList: [],
	likedList: [],
	totalPages: undefined,
	currentPage: 1,
	currentFilter: 'popular',
	currentMovie: undefined,
	currentNavTab: 'HOME',
};

// Information
const API_KEY = '086c910202652de21534ad0fdc77f576';
const categoryList = ['now_playing', 'popular', 'top_rated', 'upcoming'];

// Load movie data
// Resources:
// Movie details: https://developers.themoviedb.org/3/movies/get-movie-details
// Now playing movies: https://developers.themoviedb.org/3/movies/get-now-playing
// Popular movies: https://developers.themoviedb.org/3/movies/get-popular-movies
// Top rated movies: https://developers.themoviedb.org/3/movies/get-top-rated-movies
// Up coming movies: https://developers.themoviedb.org/3/movies/get-upcoming
// logo & colors: https://www.themoviedb.org/about/logos-attribution

// Controller
// Get movie data by category and page
function getMovieDataByCatePage(category, page) {
	const url = `https://api.themoviedb.org/3/movie/${category}?page=${page}&api_key=${API_KEY}`;
	return fetch(url)
		.then((response) => response.json())
		.then((response) => {
			model.totalPages = response.total_pages;
			model.movieList = response.results;
		})
		.catch((err) => console.error(err));
}

// Get movie data by movie ID
function getMovieById(movieId) {
	const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
	return fetch(url)
		.then((response) => response.json())
		.then((response) => {
			model.currentMovie = response;
		})
		.catch((err) => console.error(err));
}

// Creating movie cards
function createMovieCards(movie) {
	const movieCardContainer = document.createElement('div');
	// Determine whether this movie is liked
	const liked = model.likedList.some(
		(likedMovie) => likedMovie.id === movie.id
	);
	movieCardContainer.id = movie.id;
	movieCardContainer.className = 'movie-card';
	const imageURL = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
	movieCardContainer.innerHTML = `		
    <div class="card-img">
        <img src=${imageURL} alt="${movie.title}" />
    </div>
    <h1 class="movie-title">${movie.title}</h1>
    <div class = "rating-container">
        <div class="rating">
            <i class="icon ion-md-star rating-icon"></i>
            <span class="rating-number">${movie.vote_average}</span>
        </div>
        <div class="heart-icon">
        <i class="like-icon icon ${
			liked ? 'ion-md-heart' : 'ion-md-heart-empty'
		}"></i>
        </div>
    </div>
    `;
	return movieCardContainer;
}

// Creating movie detail
function createMovieDetail() {
	const modalContentContainer = document.querySelector(
		'.modal-content-container'
	);
	const currentMovie = model.currentMovie;
	const moiveDetailHtml = `   
    <div class="modal-img-container">
        <img src="https://image.tmdb.org/t/p/w500/${
			currentMovie.poster_path
		}" />
    </div>
    <div class="modal-info">
        <h2>${currentMovie.title}</h2>
        <br />
        <h3>Overview</h3>
        <p class="modal-overview">
        ${currentMovie.overview}
        </p>
        <h3>Genres</h3>
        <div class="genre-container">
            ${currentMovie.genres.map((genre) => {
				return `<div class="genre-item">${genre.name}</div>`;
			})}
        </div>
            <h3>Rating</h3>
            <p>${currentMovie.vote_average}</p>
            <h3>Production companies</h3>
            <div class="production-container">
        
            ${currentMovie.production_companies.map((company) => {
                return `
            <div class="production-item">
                <img src="https://image.tmdb.org/t/p/w500/${company.logo_path}" />
                </div>`;
            })}
        </div>
    </div>
    `;
	modalContentContainer.innerHTML = moiveDetailHtml;
}

// Logo event listener
const logo = document.querySelector('#websiet-logo-icon');
logo.addEventListener('click', reloadHandel);
function reloadHandel() {
	location.reload();
}

// Tabs event listener
const navBarClicked = document.querySelector('.nav-bar');
navBarClicked.addEventListener('click', navBarHandle);
// Tabs event handle
function navBarHandle(e) {
	const tabName = e.target.getAttribute('name');
	if (tabName === 'HOME' || tabName === 'LIKED') {
		model.currentNavTab = tabName;
		updateTabs();
		updateMoviesContainer();
	} else {
		return;
	}
}
// Update Tabs
function updateTabs() {
	const currentNavTab = model.currentNavTab;
	const navBarItems = document.querySelectorAll('.nav-bar .tab-item');
	navBarItems.forEach((navBarItem) => {
		if (navBarItem.getAttribute('name') === currentNavTab) {
			navBarItem.className = 'tab-item active';
		} else {
			navBarItem.className = 'tab-item';
		}
	});
}
// Update movies container(home and liked)
function updateMoviesContainer() {
	const currentNavTab = model.currentNavTab;
	const homeContainer = document.querySelector('#home-container');
	const likedContainer = document.querySelector('#liked-container');
	if (currentNavTab === 'HOME') {
		homeContainer.className = 'tab-view tab-view-active';
		likedContainer.className = 'tab-view';
	} else {
		homeContainer.className = 'tab-view ';
		likedContainer.className = 'tab-view tab-view-active';
	}
}

// Submit event listener
// Search movie by title
const input = document.querySelector('#search-input');
const SubmitBtn = document.querySelector('#submit-btn');
SubmitBtn.addEventListener('click', searchMovieHandle);
function searchMovieHandle() {
	const inputValue = input.value;
	input.value = '';
	if (model.currentNavTab === 'HOME') {
		model.movieList = model.movieList.filter((movie) => {
			return movie.title === inputValue;
		});
		renderMovies();
	} else {
		model.likedList = model.movieList.filter((movie) => {
			return movie.title === inputValue;
		});
		renderMovies();
	}
}

// Clear event listener
const ClearBtn = document.querySelector('#clear-btn');
ClearBtn.addEventListener('click', reloadHandel);
// Filter event listener
const filterContainer = document.querySelector('.filter-select');
filterContainer.addEventListener('change', filterChangeHandle);

// Filter change handle
function filterChangeHandle(e) {
	model.currentFilter = e.target.value;
	getMovieDataByCatePage(model.currentFilter, 1).then(() => {
		renderMovies();
		updatePages();
	});
}

// Pages event listener
const pageContainer = document.querySelector('.page-container');
pageContainer.addEventListener('click', pagesChangeHandle);
// Next and Prev clicked handle
function pagesChangeHandle(e) {
	const currentPage = model.currentPage;
	const totalPages = model.totalPages;
	if (e.target.getAttribute('id') === 'next-btn') {
		if (currentPage === totalPages) {
			return;
		}
		const nextPage = currentPage + 1;
		getMovieDataByCatePage(model.currentFilter, nextPage).then(() => {
			model.currentPage = nextPage;
			renderMovies();
			updatePages();
		});
	}

	if (e.target.getAttribute('id') === 'prev-btn') {
		if (currentPage === 1) {
			return;
		}
		const prevPage = currentPage - 1;
		getMovieDataByCatePage(model.currentFilter, prevPage).then(() => {
			model.currentPage = prevPage;
			renderMovies();
			updatePages();
		});
	}
}

// Update pages
function updatePages() {
	const pageNumber = document.querySelector('.page-container .current-page');
	const currentPage = model.currentPage;
	const totalPages = model.totalPages;
	pageNumber.innerHTML = `${currentPage}/${totalPages}`;
}

// Movie card event listener
const listContainer = document.querySelectorAll('.list-container');
listContainer.forEach((list) => {
	list.addEventListener('click', (e) => {
		heartIconHandle(e);
		titleHandle(e);
	});
});
// Heart clicked handle
function heartIconHandle(e) {
	const movieCard = e.target.closest('.movie-card');
	if (!movieCard) {
		return;
	}
	const movieId = Number(movieCard.id);

	if (e.target.classList.contains('like-icon')) {
		// Finding the movie clicked is liked or not, if liked, remove from the model.likedList,
		// if not, push into the model.movieList
		const clickedMovie = model.movieList.find(
			(movie) => movie.id === movieId
		);

		const likedMovie = model.likedList.some(
			(movie) => movie.id === movieId
		);

		if (likedMovie) {
			model.likedList = model.likedList.filter((movie) => {
				return movie.id !== movieId;
			});
			removeLocalLikedMovie(movieId);
		} else {
			model.likedList.push(clickedMovie);
			saveLocalLikedMovie(clickedMovie);
		}
		renderMovies();
	}
}

// Title clicked Handle
function titleHandle(e) {
	const movieCard = e.target.closest('.movie-card');
	if (!movieCard) {
		return;
	}
	const movieId = Number(e.target.closest('.movie-card').id);
	if (e.target.classList.contains('movie-title')) {
		getMovieById(movieId).then(() => {
			modal.style.display = 'block';
			createMovieDetail();
		});
	}
}

// Closing modal
const modal = document.querySelector('.modal');
const modalCloseBtn = document.querySelector('#close-modal');
modalCloseBtn.addEventListener('click', () => {
	modal.style.display = 'none';
});

// View
// Rendering movies list
function renderMovies() {
	// Rendering all movies
	pageContainer.style.visibility = 'visible';
	const movieList = model.movieList;
	const allMovieContainer = document.querySelector('#all-movies');
	allMovieContainer.innerHTML = '';
	movieList.forEach((movie) => {
		const movieCard = createMovieCards(movie);
		allMovieContainer.append(movieCard);
	});

	// Rendering liked movies
	const likedMovieList = model.likedList;
	const likedMovieContainer = document.querySelector('#liked-movies');
	likedMovieContainer.innerHTML = '';
	likedMovieList.forEach((likedMovie) => {
		const likedMovieCard = createMovieCards(likedMovie);
		likedMovieContainer.append(likedMovieCard);
	});
}

// Save liked movie to local
function saveLocalLikedMovie(clickedMovie) {
	// Check if there is already a liked movie.
	let likedMovies;
	if (localStorage.getItem('likedMovies') === null) {
		likedMovies = [];
	} else {
		// Change to js objects
		likedMovies = JSON.parse(localStorage.getItem('likedMovies'));
	}

	likedMovies.push(clickedMovie);
	// save the data:localStorage.setItem("key", "value");
	localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
}
// Remove liked movie from local
function removeLocalLikedMovie(movieId) {
	let likedMovies;
	if (localStorage.getItem('likedMovies') === null) {
		likedMovies = [];
	} else {
		// Change to js objects
		likedMovies = JSON.parse(localStorage.getItem('likedMovies'));
	}
	likedMovies = likedMovies.filter((likedMovie) => {
		return likedMovie.id !== movieId;
	});
	localStorage.setItem('likedMovies', JSON.stringify(likedMovies));
}

// Get local liked movies
function getLocalLikedMovies() {
	let likedMovies;
	if (localStorage.getItem('likedMovies') === null) {
		likedMovies = [];
	} else {
		// Change to js objects
		likedMovies = JSON.parse(localStorage.getItem('likedMovies'));
	}
	model.likedList = likedMovies;
}

function renderView() {
	// Waiting for data and then rendering all the things
	getMovieDataByCatePage(model.currentFilter, 1).then(() => {
		getLocalLikedMovies();
		renderMovies();
		updatePages();
	});
}

renderView();
