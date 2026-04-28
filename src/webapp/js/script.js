// 1. Configuración de la API
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

// --- Sistema de Modo Claro/Oscuro ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

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

// --- Lógica del Catálogo ---
function updateCatalogTabs() {
    Object.entries(catalogPanels).forEach(([tab, panel]) => {
        panel.classList.toggle('hidden', tab !== state.activeCatalogTab);
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

async function fetchAndRenderMovies(endpoint, containerId) {
    const container = document.getElementById(containerId);

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
                <div class="movie-card h-100 d-flex flex-column">
                    <img src="${IMG_URL}${movieData.posterPath}" alt="${movieData.title}">
                    <div class="movie-info d-flex flex-column flex-grow-1">
                        <h3 class="movie-title">${movieData.title}</h3>
                        <div class="movie-meta">Género · Acción de ${movieData.date}</div>
                        <div class="stars mb-3">${getRandomStars()}</div>
                        
                        <div class="card-actions d-flex gap-2 mt-auto">
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

// Inicialización de catálogos
fetchAndRenderMovies('/movie/now_playing', 'recent-catalog');
fetchAndRenderMovies('/movie/popular', 'popular-catalog');
fetchAndRenderMovies('/movie/top_rated', 'top-catalog');
updateCatalogTabs();