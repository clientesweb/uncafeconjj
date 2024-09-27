const API_KEY = 'AIzaSyB4HGg2WVC-Sq3Qyj9T9Z9aBBGbET1oGs0';
const PLAYLIST_ID = 'PLZ_v3bWMqpjEYZDAFLI-0GuAH4BpA5PiL'; // Reemplaza con tu ID de playlist
const MAX_RESULTS = 5; // Número de videos a obtener
const CACHE_KEY = 'playlistData1'; // Cambiado para distinguir caché de la playlist 1
const CACHE_EXPIRY = 10 * 60 * 1000; // Caché expira en 10 minutos

const playlistSlider1 = document.getElementById('playlist-slider-1'); // Actualizado a playlist-slider-1

// Función para obtener datos de la caché
function getCachedData() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const data = JSON.parse(cached);
        const now = new Date().getTime();
        if (now - data.timestamp < CACHE_EXPIRY) {
            return data.items;
        }
    }
    return null;
}

// Función para guardar datos en caché
function setCachedData(items) {
    const data = {
        items: items,
        timestamp: new Date().getTime()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

// Función para obtener videos de la playlist
async function fetchPlaylistItems() {
    const cachedData = getCachedData();
    if (cachedData) {
        return cachedData;
    }

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&key=${API_KEY}&maxResults=${MAX_RESULTS}`;
    const response = await fetch(url);
    const data = await response.json();
    const items = data.items;

    // Guardar en caché
    setCachedData(items);

    return items;
}

// Función para crear el elemento de iframe del video
function createVideoElement(video) {
    const videoId = video.snippet.resourceId.videoId;
    const iframe = document.createElement('iframe');
    iframe.dataset.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.className = 'playlist-item lazy'; // Clase lazy para la carga diferida

    return iframe;
}

// Función para cargar los videos
async function loadVideos() {
    const videos = await fetchPlaylistItems();
    playlistSlider1.innerHTML = ''; // Limpiar el slider antes de cargar nuevos videos
    videos.forEach(video => {
        const videoElement = createVideoElement(video);
        playlistSlider1.appendChild(videoElement);
    });

    // Carga diferida
    lazyLoadIframes();
}

// Función para cargar iframes cuando están en el viewport
function lazyLoadIframes() {
    const iframes = document.querySelectorAll('iframe.lazy');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                iframe.src = iframe.dataset.src; // Carga el iframe cuando está visible
                iframe.classList.remove('lazy');
                observer.unobserve(iframe); // Deja de observar el iframe una vez cargado
            }
        });
    });

    iframes.forEach(iframe => observer.observe(iframe));
}

window.onload = loadVideos;
