document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 1000);
    });

    // Top Banner with rotating messages and call-to-action buttons
    const bannerMessages = [
        {
            text: "Últimas noticias: Manténgase informado con Un Café Con JJ - El noticiero digital más escuchado de Guayaquil",
            cta: "Ver Noticias",
            link: "#noticias"
        },
        {
            text: "Sintonízanos de lunes a viernes a las 7:00 AM",
            cta: "Ver Programación",
            link: "#playlists"
        },
        {
            text: "Descarga nuestra app para estar siempre conectado",
            cta: "Descargar App",
            link: "#descargar-app"
        },
        {
            text: "Sigue a Jimmy Jairala en todas nuestras redes sociales",
            cta: "Seguir",
            link: "https://www.instagram.com/uncafeconjj"
        }
    ];
    const bannerElement = document.getElementById('banner-messages');
    let currentMessageIndex = 0;

    function setupBannerMessages() {
        bannerElement.innerHTML = bannerMessages.map(message => `
            <div class="flex-shrink-0 w-full flex justify-between items-center">
                <span>${message.text}</span>
                <a href="${message.link}" class="ml-4 bg-white text-primary px-3 py-1 rounded-full text-sm font-bold hover:bg-opacity-90 transition-colors duration-300">${message.cta}</a>
            </div>
        `).join('');
    }

    function rotateBannerMessage() {
        currentMessageIndex = (currentMessageIndex + 1) % bannerMessages.length;
        bannerElement.style.transform = `translateX(-${currentMessageIndex * 100}%)`;
    }

    setupBannerMessages();
    setInterval(rotateBannerMessage, 5000); // Rotate message every 5 seconds

    // Carrusel de imágenes
    const carousel = document.getElementById('carousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;

    function showSlide(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + carousel.children.length) % carousel.children.length;
        showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % carousel.children.length;
        showSlide(currentIndex);
    });

    // Cambiar slide automáticamente cada 5 segundos
    setInterval(() => {
        currentIndex = (currentIndex + 1) % carousel.children.length;
        showSlide(currentIndex);
    }, 5000);

    // Funcionalidad de YouTube
    const API_KEY = 'AIzaSyBcNo4pMTbFhTs8RKujYFfNSo_HbIP9f7E';
    const PLAYLIST_ID = 'PLSwBXxeopk-xySzecvVbfGTqnCTi8QhtE';

    async function fetchPlaylistItems() {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=50&key=${API_KEY}&order=date`);
        const data = await response.json();
        return data.items.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
    }

    function displayLiveVideo(video) {
        const liveContainer = document.getElementById('live-video-container');
        liveContainer.innerHTML = `
            <iframe 
                class="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/${video.snippet.resourceId.videoId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
            </iframe>
        `;
    }

    function displayPlaylist(videos) {
        const playlistContainer = document.getElementById('playlist-container');
        playlistContainer.innerHTML = '';

        videos.slice(1).forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.classList.add('flex-shrink-0', 'w-72', 'h-40');
            videoItem.innerHTML = `
                <iframe 
                    class="w-full h-full rounded-xl"
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
            const latestVideos = videos.slice(0, 5);
            displayLiveVideo(latestVideos[0]);
            displayPlaylist(latestVideos);
        } else {
            console.warn('No se encontraron videos en la playlist.');
        }
    }

    loadVideos();

    // Funcionalidad de WhatsApp
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappModal = document.getElementById('whatsappModal');
    const closeModal = document.getElementById('closeModal');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const whatsappMessage = document.getElementById('whatsappMessage');

    whatsappBtn.addEventListener('click', () => {
        whatsappModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        whatsappModal.classList.add('hidden');
    });

    sendMessageBtn.addEventListener('click', () => {
        const message = whatsappMessage.value.trim();
        if (message) {
            const phoneNumber = '+593999472777';
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            whatsappModal.classList.add('hidden');
            whatsappMessage.value = '';
        } else {
            alert('Por favor, escribe un mensaje antes de enviar.');
        }
    });

    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === whatsappModal) {
            whatsappModal.classList.add('hidden');
        }
    });

    // Funcionalidad de instalación de PWA
    let deferredPrompt;
    const installButton = document.getElementById('install-button');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.classList.remove('hidden');
    });

    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        }
    });

    // Formulario de contacto
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const whatsappMessage = `Nombre: ${name}%0AEmail: ${email}%0AMensaje: ${message}`;
        const phoneNumber = '+593999472777';
        const url = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
        window.open(url, '_blank');
        contactForm.reset();
    });

    // Boletín informativo
    const newsletterForm = document.getElementById('newsletter-form');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = newsletterForm.querySelector('input[type="text"]').value;
        const whatsapp = newsletterForm.querySelector('input[type="tel"]').value;
        const message = `Nuevo suscriptor al boletín:%0ANombre: ${name}%0AWhatsApp: ${whatsapp}`;
        const phoneNumber = '+593999472777';
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank');
        newsletterForm.reset();
    });

    // Reviews Section
    const reviews = [
        { name: "María L.", rating: 5, text: "Un Café Con JJ es mi fuente confiable de noticias cada mañana. ¡Excelente programa!" },
        { name: "Carlos R.", rating: 4, text: "Jimmy Jairala ofrece una perspectiva única sobre los eventos actuales. Muy recomendado." },
        { name: "Ana S.", rating: 5, text: "Informativo, entretenido y siempre al día. No me pierdo ningún episodio." },
        { name: "Pedro M.", rating: 4, text: "La mejor manera de comenzar el día es con Un Café Con JJ. Noticias frescas y análisis profundo." },
        { name: "Lucía T.", rating: 5, text: "Un programa que realmente se preocupa por mantener a la comunidad informada. ¡Gracias por su dedicación!" }
    ];

    const reviewsContainer = document.getElementById('reviews-container');
    const prevReviewBtn = document.getElementById('prevReview');
    const nextReviewBtn = document.getElementById('nextReview');
    let currentReviewIndex = 0;

    function setupReviews() {
        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="flex-shrink-0 w-full px-4">
                <div class="bg-gray-100 p-6 rounded-lg shadow">
                    <div class="flex items-center mb-4">
                        <div class="text-yellow-400">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        </div>
                        <div class="ml-2 font-bold">${review.name}</div>
                    </div>
                    <p class="text-gray-600">${review.text}</p>
                </div>
            </div>
        `).join('');
    }

    function showReview(index) {
        reviewsContainer.style.transform = `translateX(-${index * 100}%)`;
    }

    prevReviewBtn.addEventListener('click', () => {
        currentReviewIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
        showReview(currentReviewIndex);
    });

    nextReviewBtn.addEventListener('click', () => {
        currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
        showReview(currentReviewIndex);
    });

    setupReviews();
    setInterval(() => {
        currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
        showReview(currentReviewIndex);
    }, 5000); // Auto-rotate reviews every 5 seconds

    // Fade-in effect for sections
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(element => {
        observer.observe(element);
    });
});

