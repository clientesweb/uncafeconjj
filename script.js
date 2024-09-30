document.addEventListener('DOMContentLoaded', () => {
    // Configuración general
    const API_KEY = 'AIzaSyDm96WQoeg4AfeyYwjmXfn76eGDV8b_OOc';
    const CHANNEL_ID = 'UCc4fHgV3zRgjHxYZJkQdxhw';
    const PLAYLIST_ID = 'PLSwBXxeopk-y2adJzE7kpjvEBR2BPsTCq';
    const MAX_RESULTS = 10;
    const CACHE_KEY = 'pastLiveStreamData';
    const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutos

    const playlistSlider = document.getElementById('playlist-slider');
    const liveStreamContainer = document.getElementById('live-stream-container');
    const shortsSection = document.getElementById('shorts-section');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Funciones de caché
    function getCachedData() {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            if (new Date().getTime() - data.timestamp < CACHE_EXPIRY) {
                return data.items;
            }
        }
        return null;
    }

    function setCachedData(items) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            items: items,
            timestamp: new Date().getTime()
        }));
    }

    // Función para obtener videos pasados
    async function fetchPastLiveStreams() {
        const cachedData = getCachedData();
        if (cachedData) return cachedData;

        try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=completed&channelId=${CHANNEL_ID}&key=${API_KEY}&maxResults=${MAX_RESULTS}&order=date`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener videos pasados');
            
            const data = await response.json();
            const items = data.items.filter(video => video.snippet.liveBroadcastContent === 'none');
            
            setCachedData(items);
            return items;
        } catch (error) {
            console.error('Error fetching past live streams:', error);
            return [];
        }
    }

    // Función para obtener el video en vivo actual
    async function fetchLiveStream() {
        try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&channelId=${CHANNEL_ID}&key=${API_KEY}&maxResults=1`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener video en vivo');

            const data = await response.json();
            return data.items.length ? data.items[0] : null;
        } catch (error) {
            console.error('Error fetching live stream:', error);
            return null;
        }
    }

    // Función para crear el elemento de iframe del video
    function createVideoElement(video) {
        const iframe = document.createElement('iframe');
        iframe.dataset.src = `https://www.youtube.com/embed/${video.id.videoId}`;
        iframe.className = 'playlist-item lazy';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        return iframe;
    }

    // Función para cargar los videos pasados y el video en vivo
    async function loadLiveAndPastStreams() {
        if (liveStreamContainer) {
            const liveStream = await fetchLiveStream();
            liveStreamContainer.innerHTML = liveStream
                ? ''
                : '<p>No hay transmisión en vivo actualmente.</p>';
            if (liveStream) {
                liveStreamContainer.appendChild(createVideoElement(liveStream));
            }
        }

        if (playlistSlider) {
            const pastVideos = await fetchPastLiveStreams();
            playlistSlider.innerHTML = '';
            pastVideos.forEach(video => {
                playlistSlider.appendChild(createVideoElement(video));
            });
        }

        lazyLoadIframes();
    }

    // Función para cargar shorts
    async function loadShorts() {
        if (!shortsSection) {
            console.warn('Elemento shorts-section no encontrado');
            return;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=${PLAYLIST_ID}&key=${API_KEY}`);
            if (!response.ok) throw new Error('Error al obtener shorts');
            
            const data = await response.json();
            shortsSection.innerHTML = '';
            
            data.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const shortElement = createShortElement(videoId);
                shortsSection.appendChild(shortElement);
            });
        } catch (error) {
            console.error('Error al cargar shorts:', error);
            shortsSection.innerHTML = '<p>Error al cargar shorts. Por favor, intenta más tarde.</p>';
        }
    }

    // Función para crear elemento de Short
    function createShortElement(videoId) {
        const shortItem = document.createElement('div');
        shortItem.className = 'short-item';
        shortItem.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0"
                    loading="lazy"
                    frameborder="0"
                    allowfullscreen>
            </iframe>
        `;
        return shortItem;
    }

    // Función para cargar iframes cuando están en el viewport
    function lazyLoadIframes() {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const iframe = entry.target;
                    iframe.src = iframe.dataset.src;
                    iframe.classList.remove('lazy');
                    observer.unobserve(iframe);
                }
            });
        });

        document.querySelectorAll('iframe.lazy').forEach(iframe => observer.observe(iframe));
    }

    // Iniciar carga de videos
    loadLiveAndPastStreams();
    loadShorts();

    // Actualizar cada 10 minutos
    setInterval(() => {
        loadLiveAndPastStreams();
        loadShorts();
    }, CACHE_EXPIRY);

    // Funcionalidad del menú de navegación
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    } else {
        console.warn('Elementos de navegación no encontrados.');
    }

    // Slider de patrocinadores
    const sponsorsSlider = document.querySelector('.sponsors-slider');
    if (sponsorsSlider) {
        const items = sponsorsSlider.children;
        const totalItems = items.length;
        
        // Clonar los primeros elementos para el efecto infinito
        for (let i = 0; i < totalItems; i++) {
            const clone = items[i].cloneNode(true);
            sponsorsSlider.appendChild(clone);
        }

        let itemWidth = items[0].offsetWidth;
        let totalWidth = itemWidth * totalItems;
        sponsorsSlider.style.width = `${totalWidth * 2}px`;

        let currentIndex = 0;
        const transitionDuration = 2;
        const slideInterval = 5000;
        
        sponsorsSlider.style.transition = `transform ${transitionDuration}s ease-in-out`;

        const slideToNext = () => {
            currentIndex++;
            if (currentIndex >= totalItems) {
                currentIndex = 0;
                sponsorsSlider.style.transition = 'none';
                sponsorsSlider.style.transform = `translateX(0px)`;
                setTimeout(() => {
                    sponsorsSlider.style.transition = `transform ${transitionDuration}s ease-in-out`;
                    currentIndex = totalItems;
                    sponsorsSlider.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
                }, 20);
            } else {
                sponsorsSlider.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            }
        };

        setInterval(slideToNext, slideInterval);

        // Experiencia táctil para dispositivos móviles
        sponsorsSlider.addEventListener('touchstart', (e) => {
            const touchStartX = e.touches[0].clientX;
            sponsorsSlider.addEventListener('touchmove', (e) => {
                const touchMoveX = e.touches[0].clientX;
                if (touchMoveX - touchStartX < -50) {
                    slideToNext();
                    sponsorsSlider.removeEventListener('touchmove', arguments.callee);
                }
            }, { passive: true });
        }, { passive: true });

        // Reajustar el ancho del slider cuando se cambia el tamaño de la ventana
        const updateItemWidth = () => {
            itemWidth = items[0].offsetWidth;
            totalWidth = itemWidth * totalItems;
            sponsorsSlider.style.width = `${totalWidth * 2}px`;
        };
        window.addEventListener('resize', updateItemWidth);
        updateItemWidth();
    }

    // Carrusel de imágenes
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const carouselImages = document.querySelector('.carousel-images');
    if (prevButton && nextButton && carouselImages) {
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

        // Auto-slide cada 5 segundos
        setInterval(() => {
            nextButton.click();
        }, 5000);
    }

    // Funcionalidad de WhatsApp
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const whatsappClose = document.querySelector('.whatsapp-close');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const whatsappMessage = document.getElementById('whatsappMessage');

    if (whatsappBtn && whatsappModal && whatsappClose && sendMessageBtn && whatsappMessage) {
        whatsappBtn.addEventListener('click', function() {
            whatsappModal.classList.add('show');
        });

        whatsappClose.addEventListener('click', function() {
            whatsappModal.classList.remove('show');
        });

        sendMessageBtn.addEventListener('click', function() {
            const message = whatsappMessage.value.trim();
            if (message) {
                const phoneNumber = '+593999472777';
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
                whatsappModal.classList.remove('show');
                whatsappMessage.value = '';
            } else {
                alert('Por favor, escribe un mensaje antes de enviar.');
            }
        });

        window.addEventListener('click', function(event) {
            if (event.target == whatsappModal) {
                whatsappModal.classList.remove('show');
            }
        });
    }

    // Funcionalidad de instalación de la app
    const installButton = document.getElementById('install-button');
    if (installButton) {
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
        const isInstagram = /Instagram/.test(navigator.userAgent);

        if (!isInstalled || isInstagram) {
            installButton.style.display = 'block';
        }

        installButton.addEventListener('click', function() {
            // Lógica para instalar la app
            this.style.display = 'none';
        });
    }

    // Contadores
    const counters = document.querySelectorAll('.counter-number');
    if (counters.length > 0) {
        let baseVisitas = 4870;
        let baseDescargas = 110;
        let baseInteracciones = 2340;

        function updateCountersByTime() {
            const now = new Date().getTime();
            const newVisitas = baseVisitas + Math.floor((now / 100000) % 250);
            const newDescargas = baseDescargas + Math.floor((now / 100000) % 25);
            const newInteracciones = baseInteracciones + Math.floor((now / 100000) % 150);

            counters.forEach(counter => {
                const type = counter.getAttribute('data-type');
                let newValue;
                if (type === 'visitas') newValue = newVisitas;
                if (type === 'descargas') newValue = newDescargas;
                if (type === 'interacciones') newValue = newInteracciones;

                counter.setAttribute('data-count', newValue);
                animateCounter(counter);
            });
        }

        function animateCounter(counter) {
            const target = +counter.getAttribute('data-count');
            let count = +counter.innerText;
            const increment = Math.ceil((target - count) / 400);

            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    counter.innerText = count;
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        }

        updateCountersByTime();
        setInterval(updateCountersByTime, 900000);
    }
});