// 1. Configuracion de la API
const API_KEY = 'e8351fedf872a5de8e6614d8f166a260';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const CATALOG_LIMIT = 20;

const state = {
    currentStep: 1,
    selectedMovie: null,
    activeCatalogTab: 'recent'
};

const stepSections = {
    1: document.getElementById('step-catalog'),
    2: document.getElementById('step-summary'),
    3: document.getElementById('step-payment')
};

const selectedCountElement = document.getElementById('selected-count');
const selectedMovieCard = document.getElementById('selected-movie-card');
const paymentMoviePreview = document.getElementById('payment-movie-preview');
const checkoutTotal = document.getElementById('checkout-total');
const purchaseSuccess = document.getElementById('purchase-success');
const successMessage = document.getElementById('success-message');
const paymentForm = document.getElementById('payment-form');

const catalogPanels = {
    recent: document.getElementById('panel-recent'),
    popular: document.getElementById('panel-popular'),
    top: document.getElementById('panel-top')
};

function getRandomPrice() {
    const min = 4.99;
    const max = 19.99;
    return Number((Math.random() * (max - min) + min).toFixed(2));
}

function formatPrice(value) {
    return `$${value.toFixed(2)}`;
}

function updateStepUI() {
    Object.entries(stepSections).forEach(([step, section]) => {
        section.classList.toggle('hidden', Number(step) !== state.currentStep);
    });

    document.querySelectorAll('.step-item').forEach(button => {
        const step = Number(button.dataset.step);
        button.classList.toggle('active', step === state.currentStep);
    });
}

function updateCatalogTabs() {
    Object.entries(catalogPanels).forEach(([tab, panel]) => {
        panel.classList.toggle('hidden', tab !== state.activeCatalogTab);
    });

    document.querySelectorAll('.catalog-tab').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === state.activeCatalogTab);
    });
}

function goToStep(step) {
    if (step > 1 && !state.selectedMovie) {
        alert('Primero selecciona una pelicula desde el catalogo.');
        return;
    }

    state.currentStep = step;
    updateStepUI();

    if (step === 2) {
        renderSelectedMovie();
    }

    if (step === 3) {
        renderPaymentPreview();
    }

    if (step === 1) {
        updateCatalogTabs();
    }
}

function selectMovie(movie) {
    state.selectedMovie = movie;
    selectedCountElement.innerText = '1';
    selectedCountElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        selectedCountElement.style.transform = 'scale(1)';
    }, 200);

    purchaseSuccess.classList.add('hidden');
    paymentForm.classList.remove('hidden');
    goToStep(2);
}

function renderSelectedMovie() {
    if (!state.selectedMovie) {
        selectedMovieCard.innerHTML = '<p>No hay pelicula seleccionada.</p>';
        return;
    }

    selectedMovieCard.innerHTML = `
        <img src="${IMG_URL}${state.selectedMovie.posterPath}" alt="Poster de ${state.selectedMovie.title}">
        <div class="selected-movie-info">
            <h3>${state.selectedMovie.title}</h3>
            <p>Precio digital: <strong>${formatPrice(state.selectedMovie.price)}</strong></p>
            <p>Listo para completar tu compra.</p>
        </div>
    `;
}

function renderPaymentPreview() {
    if (!state.selectedMovie) {
        return;
    }

    paymentMoviePreview.innerHTML = `
        <h3>Tu compra</h3>
        <img src="${IMG_URL}${state.selectedMovie.posterPath}" alt="Poster de ${state.selectedMovie.title}">
        <p>${state.selectedMovie.title}</p>
        <p class="price">${formatPrice(state.selectedMovie.price)}</p>
    `;

    checkoutTotal.innerText = formatPrice(state.selectedMovie.price);
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
                    <button type="button" class="btn-buy-now">Comprar Ahora</button>
                </div>
            `;

            const buyButton = card.querySelector('.btn-buy-now');
            buyButton.addEventListener('click', () => selectMovie(movieData));
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Hubo un error cargando las peliculas:', error);
        container.innerHTML = '<p style="padding-left: 50px; color: red;">Error al cargar el catalogo. Verifica tu API Key.</p>';
    }
}

function resetPurchaseFlow() {
    state.selectedMovie = null;
    selectedCountElement.innerText = '0';
    paymentForm.reset();
    paymentForm.classList.remove('hidden');
    purchaseSuccess.classList.add('hidden');
    successMessage.innerText = '';
    selectedMovieCard.innerHTML = '';
    paymentMoviePreview.innerHTML = '';
    checkoutTotal.innerText = '$0.00';
    goToStep(1);
}

paymentForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!state.selectedMovie) {
        alert('No hay pelicula seleccionada para pagar.');
        goToStep(1);
        return;
    }

    const buyerName = document.getElementById('buyer-name').value.trim();
    successMessage.innerText = `Gracias ${buyerName || 'cliente'}, tu compra de "${state.selectedMovie.title}" fue procesada correctamente.`;
    paymentForm.classList.add('hidden');
    purchaseSuccess.classList.remove('hidden');
});

document.querySelectorAll('.step-item').forEach(button => {
    button.addEventListener('click', () => {
        const step = Number(button.dataset.step);
        goToStep(step);
    });
});

document.querySelectorAll('.catalog-tab').forEach(button => {
    button.addEventListener('click', () => {
        state.activeCatalogTab = button.dataset.tab;
        updateCatalogTabs();
    });
});

document.getElementById('btn-back-to-catalog').addEventListener('click', () => goToStep(1));
document.getElementById('btn-go-to-payment').addEventListener('click', () => goToStep(3));
document.getElementById('btn-back-to-summary').addEventListener('click', () => goToStep(2));
document.getElementById('btn-new-purchase').addEventListener('click', resetPurchaseFlow);

// Inicializacion de catalogos
fetchAndRenderMovies('/movie/now_playing', 'recent-catalog');
fetchAndRenderMovies('/movie/popular', 'popular-catalog');
fetchAndRenderMovies('/movie/top_rated', 'top-catalog');
updateStepUI();
updateCatalogTabs();
