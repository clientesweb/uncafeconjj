document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    } else {
        console.warn('Elementos de navegación no encontrados.');
    }

    // Resto de tu código...
});

const API_KEY = 'AIzaSyBcNo4pMTbFhTs8RKujYFfNSo_HbIP9f7E'; // Reemplaza con tu clave de API
const PLAYLIST_ID = 'PLSwBXxeopk-wzps96LvzkMKyy-YSxD2r5'; // Reemplaza con el ID de tu lista de reproducción

async function fetchPlaylistItems() {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=30&key=${API_KEY}`);
    const data = await response.json();
    return data.items;
}

function displayLiveVideo(video) {
    const liveContainer = document.getElementById('live-video-container');
    liveContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="315" 
            src="https://www.youtube.com/embed/${video.snippet.resourceId.videoId}?autoplay=1" 
            frameborder="0" 
            allow="autoplay; encrypted-media" 
            allowfullscreen>
        </iframe>
    `;
}

function displayPlaylist(videos) {
    const playlistContainer = document.getElementById('playlist-container');
    playlistContainer.innerHTML = ''; // Limpiar contenedor

    // Mostrar los últimos 4 videos (excluyendo el más reciente)
    videos.slice(1, 5).forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');
        videoItem.innerHTML = `
            <h3>${video.snippet.title}</h3>
            <iframe 
                width="100%" 
                height="200" 
                src="https://www.youtube.com/embed/${video.snippet.resourceId.videoId}" 
                frameborder="0" 
                allow="encrypted-media" 
                allowfullscreen>
            </iframe>
        `;
        playlistContainer.appendChild(videoItem);
    });
}

async function loadVideos() {
    const videos = await fetchPlaylistItems();
    if (videos.length > 0) {
        const latestVideos = videos.slice(0, 5); // Obtener los últimos 5 videos
        const liveVideo = latestVideos[0]; // El primer video es el más reciente
        displayLiveVideo(liveVideo);
        displayPlaylist(latestVideos);
    } else {
        console.warn('No se encontraron videos en la playlist.');
    }
}

// Cargar videos al inicio
loadVideos();

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.sponsors-slider');
    const items = slider.children;
    const totalItems = items.length;
    
    // Clonar los primeros elementos para el efecto infinito
    for (let i = 0; i < totalItems; i++) {
        const clone = items[i].cloneNode(true);
        slider.appendChild(clone);
    }

    let itemWidth = items[0].offsetWidth;
    let totalWidth = itemWidth * totalItems;
    slider.style.width = `${totalWidth * 2}px`;

    let currentIndex = 0;
    const transitionDuration = 2; // Duración de la transición en segundos (más lenta)
    const slideInterval = 5000; // Intervalo entre slides en milisegundos (5 segundos)
    
    slider.style.transition = `transform ${transitionDuration}s ease-in-out`;

    const slideToNext = () => {
        currentIndex++;
        if (currentIndex >= totalItems) {
            currentIndex = 0;
            slider.style.transition = 'none';
            slider.style.transform = `translateX(0px)`;
            setTimeout(() => {
                slider.style.transition = `transform ${transitionDuration}s ease-in-out`;
                currentIndex = totalItems;
                slider.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            }, 20);
        } else {
            slider.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        }
    };

    // Cambiar el slide cada 5 segundos
    setInterval(slideToNext, slideInterval);

    // Asegurar la experiencia táctil para dispositivos móviles
    slider.addEventListener('touchstart', (e) => {
        const touchStartX = e.touches[0].clientX;
        slider.addEventListener('touchmove', (e) => {
            const touchMoveX = e.touches[0].clientX;
            if (touchMoveX - touchStartX < -50) { // Desplazar a la izquierda
                slideToNext();
                slider.removeEventListener('touchmove', arguments.callee);
            }
        }, { passive: true });
    }, { passive: true });

    // Reajustar el ancho del slider cuando se cambia el tamaño de la ventana
    const updateItemWidth = () => {
        itemWidth = items[0].offsetWidth;
        totalWidth = itemWidth * totalItems;
        slider.style.width = `${totalWidth * 2}px`;
    };
    window.addEventListener('resize', updateItemWidth);
    updateItemWidth();
});

document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const carouselImages = document.querySelector('.carousel-images');
    let index = 0;
    const imageCount = document.querySelectorAll('.carousel-images img').length;

    function updateCarousel() {
        const offset = -index * 100;
        carouselImages.style.transform = `translateX(${offset}%)`;
    }

    prevButton.addEventListener('click', () => {
        index = (index > 0) ? index - 1 : imageCount - 1;
        updateCarousel();
    });

    nextButton.addEventListener('click', () => {
        index = (index < imageCount - 1) ? index + 1 : 0;
        updateCarousel();
    });

    // Optional: Auto-slide every 5 seconds
    setInterval(() => {
        nextButton.click();
    }, 5000);
});


// Seleccionar elementos
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappModal = document.getElementById('whatsappModal');
const whatsappClose = document.querySelector('.whatsapp-close');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const whatsappMessage = document.getElementById('whatsappMessage');

// Mostrar el modal cuando se hace clic en el botón de WhatsApp
whatsappBtn.addEventListener('click', function() {
    whatsappModal.classList.add('show');
});

// Cerrar el modal cuando se hace clic en el botón de cerrar
whatsappClose.addEventListener('click', function() {
    whatsappModal.classList.remove('show');
});

// Enviar el mensaje a WhatsApp cuando se hace clic en el botón "Enviar"
sendMessageBtn.addEventListener('click', function() {
    const message = whatsappMessage.value.trim();
    if (message) {
        // Formatear el mensaje para enviar a WhatsApp
        const phoneNumber = '+593999472777'; // Cambia este número por el de CaféClubTV
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Abrir el enlace en una nueva ventana/pestaña
        window.open(url, '_blank');

        // Cerrar el modal
        whatsappModal.classList.remove('show');

        // Limpiar el campo de texto
        whatsappMessage.value = '';
    } else {
        alert('Por favor, escribe un mensaje antes de enviar.');
    }
});

// Cerrar el modal si el usuario hace clic fuera del contenido del modal
window.addEventListener('click', function(event) {
    if (event.target == whatsappModal) {
        whatsappModal.classList.remove('show');
    }
});
// Siempre mostrar el botón al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verifica si la app ya está instalada
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    // Verifica si se accede desde Instagram
    const isInstagram = /Instagram/.test(navigator.userAgent);

    const installButton = document.getElementById('install-button');

    // Muestra el botón si no está instalada y se accede desde Instagram
    if (!isInstalled || isInstagram) {
        installButton.style.display = 'block'; // Muestra el botón
    }

    installButton.addEventListener('click', function() {
        // Lógica para instalar la app
        this.style.display = 'none'; // Oculta el botón después de la instalación
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const counters = document.querySelectorAll('.counter-number');

    // Valores base iniciales
    let baseVisitas = 4870;
    let baseDescargas = 110;
    let baseInteracciones = 2340;

    // Función para actualizar los contadores
    function updateCountersByTime() {
        const now = new Date().getTime();

        // Modificar estos valores según el tiempo
        const newVisitas = baseVisitas + Math.floor((now / 100000) % 250); // Aumento más rápido para visitas
        const newDescargas = baseDescargas + Math.floor((now / 100000) % 25); // Aumento más lento para descargas
        const newInteracciones = baseInteracciones + Math.floor((now / 100000) % 150); // Aumento más rápido para interacciones

        counters.forEach(counter => {
            const type = counter.getAttribute('data-type');

            // Asignar nuevo valor basado en el tipo de contador
            let newValue;
            if (type === 'visitas') newValue = newVisitas;
            if (type === 'descargas') newValue = newDescargas;
            if (type === 'interacciones') newValue = newInteracciones;

            counter.setAttribute('data-count', newValue);
            animateCounter(counter);
        });
    }

    // Función para animar el contador
    function animateCounter(counter) {
        const target = +counter.getAttribute('data-count');
        let count = +counter.innerText;
        const increment = Math.ceil((target - count) / 400); // Reduce la velocidad general del conteo

        const updateCount = () => {
            if (count < target) {
                count += increment;
                counter.innerText = count;
                setTimeout(updateCount, 10); // Ajusta el tiempo de actualización
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    }

    // Inicializar contadores al cargar la página
    updateCountersByTime();

    // Actualizar automáticamente cada 15 minutos
    setInterval(updateCountersByTime, 900000); // 15 minutos en milisegundos
});