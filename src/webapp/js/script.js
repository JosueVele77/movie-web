// 1. Configuracion de la API
const API_KEY = 'e8351fedf872a5de8e6614d8f166a260';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const CATALOG_LIMIT = 50;

const state = {
    activeCatalogTab: 'recent'
};

const catalogPanels = {
    recent: document.getElementById('panel-recent'),
    popular: document.getElementById('panel-popular'),
    top: document.getElementById('panel-top')
};

// --- Slideshow ---
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}

// Automatic slideshow
setInterval(() => {
    plusSlides(1);
}, 8000); // Change image every 8 seconds


function getRandomPrice() {
    const min = 4.99;
    const max = 19.99;
    return Number((Math.random() * (max - min) + min).toFixed(2));
}

function formatPrice(value) {
    return `$${value.toFixed(2)}`;
}

function updateCatalogTabs() {
    Object.entries(catalogPanels).forEach(([tab, panel]) => {
        panel.classList.toggle('hidden', tab !== state.activeCatalogTab);
    });

    document.querySelectorAll('.catalog-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === state.activeCatalogTab);
    });
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
            container.innerHTML = '<p style="padding-left: 50px; color: #f7c04a;">No hay peliculas disponibles por ahora.</p>';
            return;
        }

        movies.forEach(movie => {
            const movieData = {
                id: movie.id,
                title: movie.title,
                posterPath: movie.poster_path,
                price: getRandomPrice()
            };

            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${IMG_URL}${movieData.posterPath}" alt="Poster de ${movieData.title}">
                <div class="movie-info">
                    <h3>${movieData.title}</h3>
                    <p class="price">${formatPrice(movieData.price)}</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Hubo un error cargando las peliculas:', error);
        container.innerHTML = '<p style="padding-left: 50px; color: red;">Error al cargar el catalogo. Verifica tu API Key.</p>';
    }
}

document.querySelectorAll('.catalog-tab').forEach(button => {
    button.addEventListener('click', () => {
        state.activeCatalogTab = button.dataset.tab;
        updateCatalogTabs();
    });
});

// Inicializacion de catalogos
fetchAndRenderMovies('/movie/now_playing', 'recent-catalog');
fetchAndRenderMovies('/movie/popular', 'popular-catalog');
fetchAndRenderMovies('/movie/top_rated', 'top-catalog');
updateCatalogTabs();