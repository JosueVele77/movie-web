const API_KEY = 'e8351fedf872a5de8e6614d8f166a260';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const CATALOG_LIMIT = 30;
const HOME_CATALOG_LIMIT = 60;
const HOME_CATALOG_PAGES = 3;
const SEARCH_STATE_KEY = 'cinestore.searchState';

// Assets locales (fallback) - ajusta según si estamos en /pages/
const ASSET_BASE = window.location.pathname.includes('/pages/') ? '../' : '';
const FALLBACK_POSTER_URL = `${ASSET_BASE}img/fallback-poster.svg`;
const FALLBACK_BACKDROP_URL = `${ASSET_BASE}img/fallback-backdrop.svg`;

const state = {
    activeCatalogTab: 'recent',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
};

// --- DOM Elements ---
const catalogPanels = {
    recent: document.getElementById('panel-recent'),
    popular: document.getElementById('panel-popular'),
    top: document.getElementById('panel-top')
};
const starsContainer = document.getElementById('stars-container');
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const loginLink = document.getElementById('login-link');
const userMenu = document.getElementById('user-menu');
const myContentLink = document.getElementById('my-content-link');
const favoritesLink = document.getElementById('favorites-link');
const logoutButton = document.getElementById('logout-button');
const categoriesMenu = document.getElementById('categories-menu');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results');
const catalogSection = document.getElementById('catalog-section');
const catalogTabsContainer = document.getElementById('catalog-tabs-container');
const catalogTitle = document.getElementById('catalog-title');
const searchClearButton = document.getElementById('search-clear');
const carouselSection = document.getElementById('mainMovieCarousel')?.closest('section');
const backButtons = document.querySelectorAll('[data-action="go-back"]');
const categoriesToggle = document.getElementById('categories-toggle');
const categoriesOverlay = document.getElementById('categories-overlay');
const categoriesClose = document.getElementById('categories-close');

// --- Authentication ---
function checkLoginStatus() {
    if (state.isLoggedIn) {
        loginLink.classList.add('d-none');
        userMenu.classList.remove('d-none');
        myContentLink.classList.remove('d-none');
        favoritesLink.classList.remove('d-none');
    } else {
        loginLink.classList.remove('d-none');
        userMenu.classList.add('d-none');
        myContentLink.classList.add('d-none');
        favoritesLink.classList.add('d-none');
    }
}

if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        state.isLoggedIn = false;
        checkLoginStatus();
    });
}

if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = '../index.html';
        });
    }
}

// --- General Functions ---
function openMovieDetail(movieId) {
    // Adjust path for category pages
    const path = window.location.pathname.includes('/pages/') ? '' : 'pages/';
    window.location.href = `${path}detalle.html?id=${movieId}`;
}

function updateCatalogTabs() {
    if (!catalogTabsContainer) return;

    const tabs = Array.from(catalogTabsContainer.querySelectorAll('.catalog-tab'));
    tabs.forEach(tab => {
        const isActive = tab.dataset.tab === state.activeCatalogTab;
        tab.classList.toggle('active', isActive);
    });

    Object.entries(catalogPanels).forEach(([key, panel]) => {
        if (!panel) return;
        if (key === state.activeCatalogTab) {
            panel.classList.remove('hidden', 'd-none');
        } else {
            panel.classList.add('hidden');
        }
    });
}

function saveSearchState(isActive, term = '') {
    if (!window.sessionStorage) return;
    sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify({
        isActive,
        term
    }));
}

function getSearchState() {
    if (!window.sessionStorage) return null;
    const raw = sessionStorage.getItem(SEARCH_STATE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        return null;
    }
}

function setCarouselVisibility(isVisible) {
    if (!carouselSection) return;
    carouselSection.classList.toggle('d-none', !isVisible);
}

function showSearchResults(searchTerm) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    catalogTabsContainer.classList.add('d-none');
    Object.values(catalogPanels).forEach(panel => panel.classList.add('d-none'));
    searchResultsContainer.classList.remove('d-none');
    catalogTitle.textContent = `Resultados para: "${searchTerm}"`;
    setCarouselVisibility(false);
    saveSearchState(true, searchTerm);
    return fetchAndRenderMovies(`/search/movie?query=${encodedSearchTerm}`, 'search-results');
}

function resetSearchView() {
    if (searchInput) {
        searchInput.value = '';
    }
    catalogTabsContainer.classList.remove('d-none');
    searchResultsContainer.classList.add('d-none');
    catalogTitle.textContent = 'ESTRENOS ACTUALES';
    setCarouselVisibility(true);
    saveSearchState(false, '');
    updateCatalogTabs();
}

if (catalogTabsContainer) {
    catalogTabsContainer.addEventListener('click', (event) => {
        const tab = event.target.closest('.catalog-tab');
        if (!tab) return;
        state.activeCatalogTab = tab.dataset.tab;
        saveSearchState(false, '');
        updateCatalogTabs();
    });
}

if (backButtons.length > 0) {
    backButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            const fallback = button.getAttribute('data-fallback') || 'index.html';
            window.location.href = fallback;
        });
    });
}

function toggleCategoriesOverlay(isOpen) {
    if (!categoriesOverlay) return;
    categoriesOverlay.classList.toggle('is-open', isOpen);
    categoriesOverlay.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('overlay-open', isOpen);
}

if (categoriesToggle && categoriesOverlay) {
    categoriesToggle.addEventListener('click', (event) => {
        event.preventDefault();
        toggleCategoriesOverlay(true);
    });
}

if (categoriesClose && categoriesOverlay) {
    categoriesClose.addEventListener('click', () => {
        toggleCategoriesOverlay(false);
    });
}

if (categoriesOverlay) {
    categoriesOverlay.addEventListener('click', (event) => {
        if (event.target === categoriesOverlay) {
            toggleCategoriesOverlay(false);
        }
    });
}

// --- API Fetching ---
function buildApiUrl(endpoint, page = 1) {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=es-ES&page=${page}`;
}

async function fetchGenres() {
    try {
        const response = await fetch(buildApiUrl('/genre/movie/list'));
        const data = await response.json();
        populateCategoriesDropdown(data.genres);
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

function populateCategoriesDropdown(genres) {
    if (!categoriesMenu) return;
    const config = {
        accion: { icon: 'bi-lightning-charge-fill', image: 'https://image.tmdb.org/t/p/original/6ELCZlTA5lGUops70hKdB83WJxH.jpg' },
        aventura: { icon: 'bi-compass-fill', image: 'https://image.tmdb.org/t/p/original/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg' },
        animacion: { icon: 'bi-stars', image: 'https://image.tmdb.org/t/p/original/v6mvOKC3GeQ1a8r2P7K1E1Ed1zN.jpg' },
        comedia: { icon: 'bi-emoji-laughing-fill', image: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg' },
        crimen: { icon: 'bi-shield-lock-fill', image: 'https://image.tmdb.org/t/p/original/4q2hz2m8hubgvijz8Ez0T2Os2Yv.jpg' },
        drama: { icon: 'bi-people-fill', image: 'https://image.tmdb.org/t/p/original/70Rm9ItxKuEKN8iu6rNjfwAYUCJ.jpg' },
        fantasia: { icon: 'bi-magic', image: 'https://image.tmdb.org/t/p/original/sg7klpt1xwK1IJirBI9EHaqQwJ5.jpg' },
        historia: { icon: 'bi-hourglass-split', image: 'https://image.tmdb.org/t/p/original/suH5n0Iy1LOXk81C5k3L6G1YQJt.jpg' },
        horror: { icon: 'bi-ghost', image: 'https://image.tmdb.org/t/p/original/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg' },
        misterio: { icon: 'bi-search', image: 'https://image.tmdb.org/t/p/original/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg' },
        romance: { icon: 'bi-heart-fill', image: 'https://image.tmdb.org/t/p/original/qH3Y8N4KeO3GQZcZBf1Vj3ZzH2G.jpg' },
        'ciencia ficcion': { icon: 'bi-cpu-fill', image: 'https://image.tmdb.org/t/p/original/xcXALwBjdHIjrESpGVhghqj8fGT.jpg' },
        suspense: { icon: 'bi-eye-fill', image: 'https://image.tmdb.org/t/p/original/8yPSYhooj8nyBbmV3GVdLDL3U1E.jpg' },
        guerra: { icon: 'bi-shield-fill', image: 'https://image.tmdb.org/t/p/original/mf4V7H4FfZ2lIY9pJMRr4L5BfIY.jpg' },
        western: { icon: 'bi-collection-play-fill', image: 'https://image.tmdb.org/t/p/original/6iUNJZymJBMXXriQyFZfLAKnjO6.jpg' }
    };

    const normalizeKey = (value) => value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

    genres.forEach(genre => {
        const key = normalizeKey(genre.name);
        const entry = config[key] || { icon: 'bi-film', image: 'https://image.tmdb.org/t/p/original/8eihUxjQsJ7WvGySkVMC0EwbPAD.jpg' };
        const card = document.createElement('a');
        card.className = 'category-card';
        card.href = `pages/category.html?id=${genre.id}&name=${encodeURIComponent(genre.name)}`;
        card.style.setProperty('--category-card-image', `url('${entry.image}')`);
        card.innerHTML = `
            <span class="category-card-icon"><i class="bi ${entry.icon}"></i></span>
            <span class="category-card-title">${genre.name}</span>
            <span class="category-card-cta">Ver peliculas</span>
        `;
        card.addEventListener('click', () => toggleCategoriesOverlay(false));
        categoriesMenu.appendChild(card);
    });
}

async function fetchAndRenderCarousel() {
    const carouselInner = document.getElementById('carousel-inner-content');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    
    if (!carouselInner || !carouselIndicators) return;

    try {
        const response = await fetch(buildApiUrl('/trending/movie/week'));
        const data = await response.json();
        const movies = data.results.filter(movie => movie.backdrop_path).slice(0, 10);

        if (movies.length === 0) return;

        carouselInner.innerHTML = '';
        carouselIndicators.innerHTML = '';

        movies.forEach((movie, index) => {
            const isActive = index === 0 ? 'active' : '';
            const overview = movie.overview ? (movie.overview.substring(0, 150) + '...') : 'Disfruta de esta increíble película en CineStore.';
            
            const indicator = document.createElement('button');
            indicator.type = 'button';
            indicator.dataset.bsTarget = '#mainMovieCarousel';
            indicator.dataset.bsSlideTo = index;
            if (index === 0) {
                indicator.className = 'active';
                indicator.ariaCurrent = 'true';
            }
            indicator.ariaLabel = `Slide ${index + 1}`;
            carouselIndicators.appendChild(indicator);
            
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${isActive}`;
            carouselItem.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" class="d-block w-100 object-fit-cover" alt="${movie.title}" style="min-height: 400px; max-height: 500px; filter: brightness(0.5); cursor: pointer;" onerror="this.onerror=null;this.src='${FALLBACK_BACKDROP_URL}'" onclick="openMovieDetail(${movie.id})">
                <div class="carousel-caption d-none d-md-block text-start bottom-0 pb-5">
                    <h1 class="display-4 fw-bold text-white cursor-pointer" onclick="openMovieDetail(${movie.id})">${movie.title}</h1>
                    <p class="lead mb-4 text-white">${overview}</p>
                    <div class="d-flex gap-3">
                        <button class="btn btn-outline-light rounded-pill px-4 py-2" onclick="openMovieDetail(${movie.id})">VER DETALLES</button>
                        <button class="btn btn-primary rounded-pill px-4 py-2">COMPRAR ENTRADAS</button>
                    </div>
                </div>
            `;
            carouselInner.appendChild(carouselItem);
        });

    } catch (error) {
        console.error('Error fetching carousel movies:', error);
    }
}

async function fetchAndRenderMovies(endpoint, containerId, limit = CATALOG_LIMIT, pages = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const pageCount = Math.max(1, pages);
        const results = [];

        for (let page = 1; page <= pageCount; page++) {
            const response = await fetch(buildApiUrl(endpoint, page));
            const data = await response.json();
            if (Array.isArray(data.results)) {
                results.push(...data.results);
            }
        }

        const validResults = results.filter(movie => movie && typeof movie === 'object' && Number.isFinite(movie.id));
        const withPoster = validResults.filter(movie => movie.poster_path);
        const withoutPoster = validResults.filter(movie => !movie.poster_path);
        const movies = [...withPoster, ...withoutPoster].slice(0, limit);

        container.innerHTML = '';
        if (movies.length === 0) {
            container.innerHTML = '<p class="text-warning">No se encontraron películas.</p>';
            return;
        }

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        movies.forEach(movie => {
            const isFavorite = favorites.some(fav => fav.id === movie.id);
            const posterSrc = movie.poster_path ? `${IMG_URL}${movie.poster_path}` : FALLBACK_POSTER_URL;
            const movieData = {
                id: movie.id,
                title: movie.title,
                posterPath: movie.poster_path || null,
                date: movie.release_date ? movie.release_date.split('-')[0] : 'N/D',
                rating: typeof movie.vote_average === 'number' ? movie.vote_average : null
            };
            const ratingText = movieData.rating !== null ? movieData.rating.toFixed(1) : 'N/D';
            const starsHtml = renderRatingStars(movieData.rating);
            
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="movie-card h-100 d-flex flex-column">
                    <div style="position: relative;">
                        <img src="${posterSrc}" alt="${movieData.title}" style="cursor: pointer;" onerror="this.onerror=null;this.src='${FALLBACK_POSTER_URL}'" onclick="openMovieDetail(${movieData.id})">
                        <i class="bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} favorite-icon" onclick="toggleFavorite(this, ${JSON.stringify(movieData).replace(/"/g, '&quot;')})"></i>
                    </div>
                    <div class="movie-info d-flex flex-column flex-grow-1">
                        <h3 class="movie-title">${movieData.title}</h3>
                        <div class="movie-rating">
                            ${starsHtml}
                            <span class="movie-rating-text">${ratingText} · ${movieData.date}</span>
                        </div>
                        <div class="card-actions d-flex gap-2 mt-auto" onclick="event.stopPropagation();">
                            <button class="btn btn-card-comprar flex-grow-1" onclick="purchaseMovie(${JSON.stringify(movieData).replace(/"/g, '&quot;')})">COMPRAR</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        container.innerHTML = '<p class="text-danger">Error al cargar el catálogo.</p>';
    }
}

function renderRatingStars(score) {
    if (typeof score !== 'number') return '';
    const percentage = Math.max(0, Math.min(100, (score / 10) * 100));
    return `
        <span class="rating-stars" aria-label="Rating ${score.toFixed(1)} de 10">
            <span class="rating-stars-fill" style="width: ${percentage}%;"></span>
        </span>
    `;
}

// --- Search ---
let searchDebounceId = null;

if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            await showSearchResults(searchTerm);
        } else {
            resetSearchView();
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim();
        if (searchDebounceId) {
            clearTimeout(searchDebounceId);
        }
        if (!searchTerm) {
            resetSearchView();
            return;
        }
        searchDebounceId = setTimeout(() => {
            showSearchResults(searchTerm);
        }, 350);
    });
}

if (searchClearButton) {
    searchClearButton.addEventListener('click', () => {
        resetSearchView();
    });
}

// --- User Actions ---
function toggleFavorite(icon, movieData) {
    if (!state.isLoggedIn) {
        alert('Debes iniciar sesión para añadir a favoritos.');
        return;
    }
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const movieIndex = favorites.findIndex(fav => fav.id === movieData.id);

    if (movieIndex > -1) {
        favorites.splice(movieIndex, 1);
        icon.classList.replace('bi-heart-fill', 'bi-heart');
    } else {
        favorites.push(movieData);
        icon.classList.replace('bi-heart', 'bi-heart-fill');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function purchaseMovie(movieData) {
    if (!state.isLoggedIn) {
        alert('Debes iniciar sesión para comprar.');
        return;
    }
    let purchased = JSON.parse(localStorage.getItem('purchased')) || [];
    if (!purchased.some(p => p.id === movieData.id)) {
        purchased.push(movieData);
        localStorage.setItem('purchased', JSON.stringify(purchased));
        alert(`¡"${movieData.title}" ha sido añadido a tu contenido!`);
    } else {
        alert(`Ya eres dueño de "${movieData.title}".`);
    }
}

// --- Initializations ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    fetchGenres();
    
    if (document.getElementById('recent-catalog')) {
        fetchAndRenderCarousel();
        setCarouselVisibility(true);
        updateCatalogTabs();
        const savedSearch = getSearchState();
        if (savedSearch && savedSearch.isActive && savedSearch.term) {
            if (searchInput) {
                searchInput.value = savedSearch.term;
            }
            showSearchResults(savedSearch.term);
        }
        fetchAndRenderMovies('/movie/now_playing', 'recent-catalog', HOME_CATALOG_LIMIT, HOME_CATALOG_PAGES);
        fetchAndRenderMovies('/movie/popular', 'popular-catalog', HOME_CATALOG_LIMIT, HOME_CATALOG_PAGES);
        fetchAndRenderMovies('/movie/top_rated', 'top-catalog', HOME_CATALOG_LIMIT, HOME_CATALOG_PAGES);
    }
});