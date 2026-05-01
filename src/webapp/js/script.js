const API_KEY = 'e8351fedf872a5de8e6614d8f166a260';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const CATALOG_LIMIT = 20; // Reducido a 20 para la grilla

const state = {
    activeCatalogTab: 'recent'
};

const catalogPanels = {
    recent: document.getElementById('panel-recent'),
    popular: document.getElementById('panel-popular'),
    top: document.getElementById('panel-top')
};

// --- Animated Starfield ---
const starsContainer = document.getElementById('stars-container');
if (starsContainer) {
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
        let star = document.createElement('div');
        star.className = 'star';
        let x = Math.random() * 100;
        let y = Math.random() * 100;
        let size = Math.random() * 2;
        let duration = Math.random() * 2 + 1;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${Math.random() * 2}s`;

        starsContainer.appendChild(star);
    }
}

// --- Sistema de Modo Claro/Oscuro ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const icon = themeToggleBtn.querySelector('i');

        if (currentTheme === 'dark') {
            htmlElement.setAttribute('data-bs-theme', 'light');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            htmlElement.setAttribute('data-bs-theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    });
}

// --- Lógica del Catálogo ---
function updateCatalogTabs() {
    Object.entries(catalogPanels).forEach(([tab, panel]) => {
        if (panel) {
            panel.classList.toggle('hidden', tab !== state.activeCatalogTab);
        }
    });

    document.querySelectorAll('.catalog-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === state.activeCatalogTab);
    });
}

// Generador de estrellas aleatorias para el diseño
function getRandomStars() {
    const starsHtml = '<i class="fas fa-star"></i>'.repeat(4) + '<i class="fas fa-star-half-alt"></i>';
    return starsHtml;
}

// Populate the main carousel with trending movies
async function fetchAndRenderCarousel() {
    const carouselInner = document.getElementById('carousel-inner-content');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    
    if (!carouselInner || !carouselIndicators) return;

    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`);
        const data = await response.json();
        // Get the top 10 trending movies
        const movies = data.results.filter(movie => movie.backdrop_path).slice(0, 10);

        if (movies.length === 0) return;

        carouselInner.innerHTML = ''; // Clear fallback content
        carouselIndicators.innerHTML = ''; // Clear fallback indicators

        movies.forEach((movie, index) => {
            const isActive = index === 0 ? 'active' : '';
            const overview = movie.overview ? (movie.overview.substring(0, 150) + '...') : 'Disfruta de esta increíble película en CineStore.';
            
            // Generate Indicators
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
            
            // Generate Carousel Item
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${isActive}`;
            carouselItem.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original${movie.backdrop_path}" class="d-block w-100 object-fit-cover" alt="${movie.title}" style="min-height: 400px; max-height: 500px; filter: brightness(0.5); cursor: pointer;" onclick="openMovieDetail(${movie.id})">
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

// Function to open movie details
function openMovieDetail(movieId) {
    // You can redirect to a new page or open a modal
    // For this example, let's redirect to a detail page with the movie ID in the URL
    window.location.href = `pages/detalle.html?id=${movieId}`;
}

async function fetchAndRenderMovies(endpoint, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=es-ES&page=1`);
        const data = await response.json();
        const movies = data.results
            .filter(movie => movie.poster_path)
            .slice(0, CATALOG_LIMIT);

        container.innerHTML = '';

        if (!movies.length) {
            container.innerHTML = '<p class="text-warning">No hay películas disponibles por ahora.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieData = {
                id: movie.id,
                title: movie.title,
                posterPath: movie.poster_path,
                date: movie.release_date ? movie.release_date.split('-')[0] : '2024'
            };

            // Estructura de la tarjeta adaptada al mockup
            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <div class="movie-card h-100 d-flex flex-column" style="cursor: pointer;" onclick="openMovieDetail(${movieData.id})">
                    <img src="${IMG_URL}${movieData.posterPath}" alt="${movieData.title}">
                    <div class="movie-info d-flex flex-column flex-grow-1">
                        <h3 class="movie-title">${movieData.title}</h3>
                        <div class="movie-meta">Género · Acción de ${movieData.date}</div>
                        <div class="stars mb-3">${getRandomStars()}</div>
                        
                        <div class="card-actions d-flex gap-2 mt-auto" onclick="event.stopPropagation();">
                            <button class="btn btn-card-comprar flex-grow-1">COMPRAR</button>
                            <button class="btn btn-card-alquilar flex-grow-1">ALQUILAR</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        console.error('Hubo un error cargando las películas:', error);
        container.innerHTML = '<p class="text-danger">Error al cargar el catálogo. Verifica tu conexión.</p>';
    }
}

document.querySelectorAll('.catalog-tab').forEach(button => {
    button.addEventListener('click', () => {
        state.activeCatalogTab = button.dataset.tab;
        updateCatalogTabs();
    });
});

// Inicialización de catálogos y carrusel (solo si los contenedores existen)
if (document.getElementById('recent-catalog')) {
    fetchAndRenderCarousel();
    fetchAndRenderMovies('/movie/now_playing', 'recent-catalog');
    fetchAndRenderMovies('/movie/popular', 'popular-catalog');
    fetchAndRenderMovies('/movie/top_rated', 'top-catalog');
    updateCatalogTabs();
}

// --- Login / Registro (solo UI demo) ---
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            // Demo: evita recargar la página.
            event.preventDefault();
            // Redirige al index después del login simulado
            window.location.href = '../index.html';
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    const successAlert = document.getElementById('signupSuccess');
    const passwordEl = document.getElementById('signupPassword');
    const confirmEl = document.getElementById('signupPasswordConfirm');
    const termsEl = document.getElementById('signupTerms');

    const markControl = (el) => {
        if (!el) return;
        el.classList.remove('is-valid', 'is-invalid');
        el.classList.add(el.checkValidity() ? 'is-valid' : 'is-invalid');
    };

    const validatePasswordMatch = () => {
        if (!passwordEl || !confirmEl) return true;
        const matches = passwordEl.value === confirmEl.value;
        confirmEl.setCustomValidity(matches ? '' : 'password-mismatch');
        return matches;
    };

    signupForm.addEventListener('input', (event) => {
        if (successAlert) successAlert.classList.add('d-none');

        if (event.target === passwordEl || event.target === confirmEl) {
            validatePasswordMatch();
        }

        markControl(event.target);
        if (termsEl && event.target === termsEl) {
            markControl(termsEl);
        }
    });

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (successAlert) successAlert.classList.add('d-none');

        // Ajusta validez personalizada antes de validar.
        validatePasswordMatch();

        signupForm.classList.add('was-validated');

        // Marca controles explícitamente para que se note visualmente.
        signupForm.querySelectorAll('input').forEach(markControl);

        if (!signupForm.checkValidity()) {
            return;
        }

        // Demo OK: muestra mensaje, resetea y redirige al login.
        if (successAlert) {
            successAlert.classList.remove('d-none');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
             window.location.href = 'login.html';
        }

        signupForm.reset();
        signupForm.classList.remove('was-validated');
        signupForm.querySelectorAll('input').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
    });
}

setupAuthForms();