const API_KEY = 'AIzaSyDm96WQoeg4AfeyYwjmXfn76eGDV8b_OOc';
const CHANNEL_ID = 'UCc4fHgV3zRgjHxYZJkQdxhw'; // Reemplaza con tu ID de canal
const MAX_RESULTS = 10; // Número de videos a obtener
const CACHE_KEY = 'pastLiveStreamData';
const CACHE_EXPIRY = 10 * 60 * 1000; // Caché expira en 10 minutos

const playlistSlider = document.getElementById('playlist-slider');

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

// Función para obtener videos pasados de la sección "En Vivo"
async function fetchPastLiveStreams() {
    const cachedData = getCachedData();
    if (cachedData) {
        return cachedData;
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=completed&channelId=${CHANNEL_ID}&key=${API_KEY}&maxResults=${MAX_RESULTS}&order=date`;
    const response = await fetch(url);
    const data = await response.json();
    const items = data.items.filter(video => video.snippet.liveBroadcastContent === 'none'); // Filtrar solo videos no en vivo

    // Guardar en caché
    setCachedData(items);

    return items;
}

// Función para crear el elemento de iframe del video
function createVideoElement(video) {
    const videoId = video.id.videoId;
    const iframe = document.createElement('iframe');
    iframe.dataset.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.className = 'playlist-item lazy'; // Clase lazy para la carga diferida

    return iframe;
}

// Función para cargar los videos
async function loadPastLiveStreams() {
    const videos = await fetchPastLiveStreams();
    playlistSlider.innerHTML = ''; // Limpiar el slider antes de cargar nuevos videos
    videos.forEach(video => {
        const videoElement = createVideoElement(video);
        playlistSlider.appendChild(videoElement);
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

// Cargar videos al iniciar
window.onload = loadPastLiveStreams;

// Opcional: Actualizar cada 10 minutos
setInterval(loadPastLiveStreams, 10 * 60 * 1000);