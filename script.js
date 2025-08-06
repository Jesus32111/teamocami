// Enhanced Loading Screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1500); // Show loading for 1.5 seconds
    }
}

let audioPlayer;

function playMusic(musicSrc) {
    if (!audioPlayer) {
        audioPlayer = document.getElementById('audio-player');
    }

    if (audioPlayer.src.endsWith(musicSrc) && !audioPlayer.paused) {
        return; // No hacer nada si la misma canción ya se está reproduciendo
    }
    
    audioPlayer.src = musicSrc;
    audioPlayer.play().catch(error => console.error("Error al reproducir audio:", error));
}

let notificationTimeout;
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('.notification-text');
    if (!notification) return;

    // Si hay una notificación anterior, la limpiamos para reiniciar la animación
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    if (notificationText) {
        notificationText.textContent = message;
    } else {
        notification.textContent = message;
    }
    notification.classList.remove('hidden');
    notification.classList.add('show');

    // Ocultar la notificación después de 3 segundos
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('show');
        // Opcional: añadir un pequeño retraso antes de ocultarla para que la animación de salida se complete
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 500); // 0.5s para la transición de 'top'
    }, 3000);
}

class InfiniteTeAmo {
  constructor() {
    this.container = document.getElementById('words-container');
    this.words = [];
    this.cameraX = 0;
    this.cameraY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    const isMobile = window.innerWidth <= 768;
    this.maxWords = isMobile ? 10 : 26; // Límite máximo de palabras
    
    this.init();
  }

  init() {
    this.createInitialWords();
    this.setupEventListeners();
    this.startAnimation();
  }

  createInitialWords() {
    // Crear menos palabras iniciales
    for (let i = 0; i < 25; i++) {
      this.createWord();
    }
  }

  createWord() {
    const word = document.createElement('div');
    word.className = 'word fade-in';
    word.textContent = 'Te amo';
    
    // Tamaño aleatorio
    const isMobile = window.innerWidth <= 768;
    const fontSizeMultiplier = isMobile ? 0.7 : 1;
    const fontSize = (Math.random() * 30 + 20) * fontSizeMultiplier;
    word.style.fontSize = `${fontSize}px`;
    
    // Posición aleatoria inicial
    let startX, startY, isOverlapping;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        startX = Math.random() * (window.innerWidth + 200) - 100;
        startY = Math.random() * (window.innerHeight + 200) - 100;
      } else {
        startX = Math.random() * (window.innerWidth + 400) - 200;
        startY = Math.random() * (window.innerHeight + 400) - 200;
      }
      isOverlapping = false;

      const margin = 20;
      const newRect = {
        left: startX - margin,
        right: startX + (fontSize * 4) + margin, // Approximate width
        top: startY - margin,
        bottom: startY + fontSize + margin
      };

      for (const existingWord of this.words) {
        const existingRect = existingWord.getBoundingClientRect();
        if (newRect.left < existingRect.right &&
            newRect.right > existingRect.left &&
            newRect.top < existingRect.bottom &&
            newRect.bottom > existingRect.top) {
          isOverlapping = true;
          break;
        }
      }
      attempts++;
    } while (isOverlapping && attempts < maxAttempts);
    
    word.style.left = `${startX}px`;
    word.style.top = `${startY}px`;
    
    // Velocidad y dirección aleatoria
    const speed = Math.random() * 3 + 1;
    const angle = Math.random() * Math.PI * 2;
    
    word.velocityX = Math.cos(angle) * speed;
    word.velocityY = Math.sin(angle) * speed;
    
    // Duración de vida aleatoria
    word.life = Math.random() * 10000 + 5000;
    word.maxLife = word.life;
    word.createdAt = Date.now(); // Timestamp para control de eliminación
    
    this.container.appendChild(word);
    this.words.push(word);
    
    return word;
  }

  removeOldestWords(count) {
    // Ordenar palabras por tiempo de creación (más antiguas primero)
    this.words.sort((a, b) => a.createdAt - b.createdAt);
    
    // Eliminar las más antiguas
    for (let i = 0; i < count && this.words.length > 0; i++) {
      const oldWord = this.words.shift();
      if (oldWord && oldWord.parentNode) {
        oldWord.classList.add('fade-out');
        setTimeout(() => {
          oldWord.remove();
        }, 1000); // Coincide con la duración de la animación CSS
      }
    }
  }

  addWordsAtPosition(x, y, count) {
    // Si agregar nuevas palabras excede el límite, eliminar las más antiguas
    const wordsToRemove = Math.max(0, (this.words.length + count) - this.maxWords);
    if (wordsToRemove > 0) {
      this.removeOldestWords(wordsToRemove);
    }
    
    // Agregar nuevas palabras en la posición especificada con un retraso
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const word = this.createWord();
        word.style.left = `${x + (Math.random() - 0.5) * 100}px`;
        word.style.top = `${y + (Math.random() - 0.5) * 100}px`;
      }, i * 50);
    }
  }

  setupEventListeners() {
    // Controles de teclado
    document.addEventListener('keydown', (e) => {
      const speed = 5;
      switch(e.key) {
        case 'ArrowUp':
          this.velocityY = speed;
          break;
        case 'ArrowDown':
          this.velocityY = -speed;
          break;
        case 'ArrowLeft':
          this.velocityX = speed;
          break;
        case 'ArrowRight':
          this.velocityX = -speed;
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          this.velocityY *= 0.9;
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          this.velocityX *= 0.9;
          break;
      }
    });

    // Controles de mouse/touch
    document.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.velocityX += deltaX * 0.3;
        this.velocityY += deltaY * 0.3;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch events para móviles
    document.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isDragging) {
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        const deltaY = e.touches[0].clientY - this.lastMouseY;
        
        this.velocityX -= deltaX * 0.3;
        this.velocityY -= deltaY * 0.3;
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Wheel para zoom/movimiento
    document.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.velocityX += e.deltaX * 0.1;
      this.velocityY += e.deltaY * 0.1;
    });
  }

  updateCamera() {
    // Actualizar posición de la cámara
    this.cameraX += this.velocityX;
    this.cameraY += this.velocityY;
    
    // Aplicar fricción
    this.velocityX *= 0.95;
    this.velocityY *= 0.95;
  }

  updateWords(imageBackground) {
    // Actualizar palabras existentes
    for (let i = this.words.length - 1; i >= 0; i--) {
      const word = this.words[i];
      
      // Actualizar posición
      const currentX = parseFloat(word.style.left);
      const currentY = parseFloat(word.style.top);
      
      const newX = currentX + word.velocityX - this.velocityX;
      const newY = currentY + word.velocityY - this.velocityY;
      
      word.style.left = `${newX}px`;
      word.style.top = `${newY}px`;
      
      // Actualizar vida
      word.life -= 16; // ~60fps
      
      // Check for collision with images
      let isCollidingWithImage = false;
      if (imageBackground) {
        const wordRect = word.getBoundingClientRect();
        for (const img of imageBackground.images) {
          const imgRect = img.getBoundingClientRect();
          // console.log("Word rect:", wordRect, "Image rect:", imgRect);
          if (wordRect.left < imgRect.right &&
              wordRect.right > imgRect.left &&
              wordRect.top < imgRect.bottom &&
              wordRect.bottom > imgRect.top) {
            // console.log("Collision detected!");
            isCollidingWithImage = true;
            break;
          }
        }
      }

      if (isCollidingWithImage) {
        word.style.opacity = 0.5;
      } else {
        word.style.opacity = 1;
      }
      
      // Remover palabras que han salido de la pantalla o han expirado
      if (word.life <= 0 || 
          newX < -200 || newX > window.innerWidth + 200 ||
          newY < -200 || newY > window.innerHeight + 200) {
        word.classList.add('fade-out');
        this.words.splice(i, 1);
        setTimeout(() => {
            word.remove();
        }, 1000); // Coincide con la duración de la animación CSS
      }
    }
    this.handleWordCollisions();
  }

  generateNewWords() {
    // Generar nuevas palabras con menos frecuencia
    const isMobile = window.innerWidth <= 768;
    const generationChance = isMobile ? 0.2 : 0.5;
    if (Math.random() < generationChance && this.words.length < this.maxWords) { // 10% de probabilidad
      this.createWord();
    }
    
    // Mantener un número mínimo de palabras (reducido)
    while (this.words.length < 30) {
      this.createWord();
    }
  }

  startAnimation() {
    const animate = () => {
      this.updateCamera();
      this.updateWords(imageBackgroundInstance);
      this.generateNewWords();

      if (imageBackgroundInstance) {
        imageBackgroundInstance.updateImages(this.velocityX, this.velocityY);
        imageBackgroundInstance.generateNewImages();
      }

      if (heartsInstance) {
        heartsInstance.updateHearts();
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  handleWordCollisions() {
    for (let i = 0; i < this.words.length; i++) {
      for (let j = i + 1; j < this.words.length; j++) {
        const word1 = this.words[i];
        const word2 = this.words[j];

        const rect1 = word1.getBoundingClientRect();
        const rect2 = word2.getBoundingClientRect();

        if (rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top) {
          // Collision detected
          const tempVx = word1.velocityX;
          const tempVy = word1.velocityY;
          word1.velocityX = word2.velocityX;
          word1.velocityY = word2.velocityY;
          word2.velocityX = tempVx;
          word2.velocityY = tempVy;
        }
      }
    }
  }
}

class InfiniteImageBackground {
  constructor() {
    this.container = document.getElementById('background-images-container');
    this.images = [];
    this.imageUrls = [];
    const isMobile = window.innerWidth <= 768;
    this.maxImages = isMobile ? 3 : 10;
    this.recentlyUsedImages = [];
    this.init();
  }

  init() {
    this.preloadImages();
    this.createInitialImages();
  }

  preloadImages() {
    for (let i = 1; i <= 24; i++) {
      this.imageUrls.push(`img/Cami (${i}).jpg`);
    }
    this.imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  createInitialImages() {
    for (let i = 0; i < 5; i++) {
      this.createImage();
    }
  }

  createImage() {
    // Create a container for the image and shine effect
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    let availableImages = this.imageUrls.filter(url => !this.recentlyUsedImages.includes(url));
    if (availableImages.length === 0) {
      this.recentlyUsedImages.shift();
      availableImages = this.imageUrls.filter(url => !this.recentlyUsedImages.includes(url));
    }

    const img = document.createElement('img');
    img.className = 'background-image fade-in';
    const randomImageUrl = availableImages[Math.floor(Math.random() * availableImages.length)];
    img.src = randomImageUrl;
    
    this.recentlyUsedImages.push(randomImageUrl);
    if (this.recentlyUsedImages.length > 5) {
      this.recentlyUsedImages.shift();
    }
    
    const isMobile = window.innerWidth <= 768;
    const baseSize = isMobile ? 175 : 250; // 30% reduction for mobile
    const sizeFactors = [0.8, 1.0, 1.2];
    const randomFactor = sizeFactors[Math.floor(Math.random() * sizeFactors.length)];
    const size = baseSize * randomFactor;
    
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    // Add glow effect with a certain probability
    if (Math.random() < 0.2) { // 20% chance of having a glow
      img.classList.add('glowing-image');

      // Define glow styles
      const glowStyles = {
        'white': { class: 'glow-white', message: '🤩 Eres el amor de mi vida, todo lo que siempre he buscado, mi ideal...🤩 ', music: 'mp3/music1.mp3', songName: 'Enamorado Tuyo - Cuarteto de Nos' },
        'yellow': { class: 'glow-yellow', message: '❤️ Te amo más de lo que te puedas imaginar mi Cami hermosa❤️ ', music: 'mp3/music2.mp3', songName: 'Enchanted - Taylor Swift' },
        'red': { class: 'glow-red', message: '⭐ Desde que llegaste a mi vida, todo tiene más sentido. No se trata solo de lo que haces por mí, sino de cómo me haces sentir: en paz, feliz y completamente yo. Gracias por existir y por enseñarme lo que es el amor de verdad ⭐', music: 'mp3/music3.mp3', songName: 'Can´t take my eyes of you - Morten Harket' },
        'green': { class: 'glow-green', message: 'Contigo entendí que el amor no se busca, se encuentra… y yo te encontré a ti. Eres mi lugar favorito 💏', music: 'mp3/music4.mp3', songName: 'Only - Lee Hi' },
        'blue': { class: 'glow-blue', message: 'No sé qué hice para merecerte, pero no pienso dejar de cuidarte nunca. Eres lo mejor que me ha pasado. 💖', music: 'mp3/music5.mp3', songName: 'Preso - Jose Jose' }
      };
      const glowKeys = Object.keys(glowStyles);
      const randomGlowKey = glowKeys[Math.floor(Math.random() * glowKeys.length)];
      const selectedGlow = glowStyles[randomGlowKey];

      // Add glow class to the container
      imageContainer.classList.add(selectedGlow.class);

      // Add "CLICKEAME" text
      const clickMeText = document.createElement('div');
      clickMeText.className = 'click-me-text';
      clickMeText.textContent = 'CLICKEAME';
      imageContainer.appendChild(clickMeText);

      // Add click listener to the image to show the modal
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showModal(img.src, selectedGlow.message, selectedGlow.music, selectedGlow.songName);
      });
    }

    imageContainer.appendChild(img);

    let startX, startY, isOverlapping;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        startX = Math.random() * (window.innerWidth + 200) - 100;
        startY = Math.random() * (window.innerHeight + 200) - 100;
      } else {
        startX = Math.random() * (window.innerWidth + 400) - 200;
        startY = Math.random() * (window.innerHeight + 400) - 200;
      }
      isOverlapping = false;

      const margin = 50;
      const newRect = {
        left: startX - margin,
        right: startX + size + margin,
        top: startY - margin,
        bottom: startY + (size * (img.naturalHeight / img.naturalWidth) || size) + margin
      };

      for (const existingImage of this.images) {
        const existingRect = {
            left: parseFloat(existingImage.style.left),
            top: parseFloat(existingImage.style.top),
            width: existingImage.offsetWidth,
            height: existingImage.offsetHeight
        };
        existingRect.right = existingRect.left + existingRect.width;
        existingRect.bottom = existingRect.top + existingRect.height;

        if (newRect.left < existingRect.right &&
            newRect.right > existingRect.left &&
            newRect.top < existingRect.bottom &&
            newRect.bottom > existingRect.top) {
          isOverlapping = true;
          break;
        }
      }
      attempts++;
    } while (isOverlapping && attempts < maxAttempts);
    
    imageContainer.style.left = `${startX}px`;
    imageContainer.style.top = `${startY}px`;

    const speed = Math.random() * 2 + 0.5;
    const angle = Math.random() * Math.PI * 2;
    
    imageContainer.velocityX = Math.cos(angle) * speed;
    imageContainer.velocityY = Math.sin(angle) * speed;
    
    imageContainer.life = Math.random() * 10000 + 8000;
    imageContainer.maxLife = imageContainer.life;
    
    this.container.appendChild(imageContainer);
    this.images.push(imageContainer);
    
    return imageContainer;
  }

  updateImages(cameraVelocityX, cameraVelocityY) {
    for (let i = this.images.length - 1; i >= 0; i--) {
      const img = this.images[i];
      
      const currentX = parseFloat(img.style.left);
      const currentY = parseFloat(img.style.top);
      
      const newX = currentX + img.velocityX - cameraVelocityX;
      const newY = currentY + img.velocityY - cameraVelocityY;
      
      img.style.left = `${newX}px`;
      img.style.top = `${newY}px`;
      
      img.life -= 16;
      
      if (img.life <= 0 || 
          newX < -400 || newX > window.innerWidth + 400 ||
          newY < -400 || newY > window.innerHeight + 400) {
        img.classList.add('fade-out');
        this.images.splice(i, 1);
        setTimeout(() => {
            img.remove();
        }, 1000); // Coincide con la duración de la animación CSS
      }
    }
    this.handleCollisions();
  }

  generateNewImages() {
    const isMobile = window.innerWidth <= 768;
    const generationChance = isMobile ? 0.1 : 0.3;
    if (Math.random() < generationChance && this.images.length < this.maxImages) {
      this.createImage();
    }
    while (this.images.length < 5) {
      this.createImage();
    }
  }

  handleCollisions() {
    for (let i = 0; i < this.images.length; i++) {
      for (let j = i + 1; j < this.images.length; j++) {
        const img1 = this.images[i];
        const img2 = this.images[j];

        const rect1 = img1.getBoundingClientRect();
        const rect2 = img2.getBoundingClientRect();

        if (rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top) {
          // Collision detected
          const tempVx = img1.velocityX;
          const tempVy = img1.velocityY;
          img1.velocityX = img2.velocityX;
          img1.velocityY = img2.velocityY;
          img2.velocityX = tempVx;
          img2.velocityY = tempVy;
        }
      }
    }
  }

  showModal(imageSrc, message, musicSrc, songName) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const modalMessage = document.getElementById('modal-message');
    const flipCard = document.getElementById('flip-card');
    const flipCardBack = document.getElementById('flip-card-back');

    modalImage.src = imageSrc;
    modalMessage.textContent = message;

    // Limpiar ícono de reproducción anterior si existe
    const existingPlayIcon = flipCardBack.querySelector('.play-icon');
    if (existingPlayIcon) {
        existingPlayIcon.remove();
    }

    // Crear y agregar el ícono de reproducción
    const playIcon = document.createElement('div');
    playIcon.className = 'play-icon';
    playIcon.textContent = '▶';
    
    playIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que la tarjeta se voltee
        playMusic(musicSrc);
        showNotification(`Ahora suena: ${songName}`);
    });

    flipCardBack.appendChild(playIcon);
    
    modalOverlay.classList.remove('hidden');
    
    // Restablecer el estado de la tarjeta flip
    flipCard.classList.remove('flipped');
  }
}

// Variable global para la instancia
let teAmoInstance;
let imageBackgroundInstance;
let heartsInstance;

class InfiniteHearts {
  constructor() {
    this.container = document.getElementById('words-container'); // Reuse the same container
    this.hearts = [];
    const isMobile = window.innerWidth <= 768;
    this.maxHearts = isMobile ? 100 : 200;
    this.init();
  }

  init() {
    // No initial hearts needed, they are created on click
  }

  createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤️';
    
    const isMobile = window.innerWidth <= 768;
    const sizeMultiplier = isMobile ? 0.7 : 1;
    const size = (Math.random() * 20 + 10) * sizeMultiplier;
    heart.style.fontSize = `${size}px`;
    
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    
    const speed = Math.random() * 2 + 1;
    const angle = Math.random() * Math.PI * 2;
    
    heart.velocityX = Math.cos(angle) * speed;
    heart.velocityY = Math.sin(angle) * speed;
    
    heart.createdAt = Date.now();
    
    this.container.appendChild(heart);
    this.hearts.push(heart);
    
    return heart;
  }

  removeOldestHearts(count) {
    this.hearts.sort((a, b) => a.createdAt - b.createdAt);
    
    for (let i = 0; i < count && this.hearts.length > 0; i++) {
      const oldHeart = this.hearts.shift();
      if (oldHeart && oldHeart.parentNode) {
        oldHeart.remove();
      }
    }
  }

  addHeartsAtPosition(x, y, count) {
    const heartsToRemove = Math.max(0, (this.hearts.length + count) - this.maxHearts);
    if (heartsToRemove > 0) {
      this.removeOldestHearts(heartsToRemove);
    }
    
    for (let i = 0; i < count; i++) {
      this.createHeart(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50);
    }
  }

  updateHearts() {
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const heart = this.hearts[i];
      
      let currentX = parseFloat(heart.style.left);
      let currentY = parseFloat(heart.style.top);
      
      currentX += heart.velocityX;
      currentY += heart.velocityY;
      
      // Bounce off the walls
      if (currentX < 0 || currentX > window.innerWidth) {
        heart.velocityX *= -1;
      }
      if (currentY < 0 || currentY > window.innerHeight) {
        heart.velocityY *= -1;
      }
      
      heart.style.left = `${currentX}px`;
      heart.style.top = `${currentY}px`;
    }
  }
}

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
  // Hide loading screen
  hideLoadingScreen();
  
  audioPlayer = document.getElementById('audio-player');
  teAmoInstance = new InfiniteTeAmo();
  imageBackgroundInstance = new InfiniteImageBackground();
  heartsInstance = new InfiniteHearts();

  const modalOverlay = document.getElementById('modal-overlay');
  const flipCard = document.getElementById('flip-card');

  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('flipped');
  });

  // Enhanced FAB functionality
  const fab = document.getElementById('fab');
  if (fab) {
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      // Create a burst of hearts and words at random positions
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        if (heartsInstance) {
          heartsInstance.addHeartsAtPosition(x, y, 3);
        }
        if (teAmoInstance) {
          teAmoInstance.addWordsAtPosition(x, y, 2);
        }
      }
      
      // Add visual feedback
      fab.style.transform = 'scale(0.9) rotate(180deg)';
      setTimeout(() => {
        fab.style.transform = '';
      }, 200);
      
      showNotification('💕 ¡Más amor generado! 💕');
    });
  }
});

// Agregar palabras al hacer clic con control de límite
document.addEventListener('click', (e) => {
  if (heartsInstance) {
    heartsInstance.addHeartsAtPosition(e.clientX, e.clientY, 5);
  }
});