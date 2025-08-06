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
    this.maxWords = 42; // Límite máximo de palabras
    
    this.init();
  }

  init() {
    this.createInitialWords();
    this.setupEventListeners();
    this.startAnimation();
  }

  createInitialWords() {
    // Crear menos palabras iniciales
    for (let i = 0; i < 40; i++) {
      this.createWord();
    }
  }

  createWord() {
    const word = document.createElement('div');
    word.className = 'word fade-in';
    word.textContent = 'Te amo';
    
    // Tamaño aleatorio
    const fontSize = Math.random() * 30 + 20;
    word.style.fontSize = `${fontSize}px`;
    
    // Posición aleatoria inicial
    let startX, startY, isOverlapping;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      startX = Math.random() * (window.innerWidth + 400) - 200;
      startY = Math.random() * (window.innerHeight + 400) - 200;
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
        oldWord.remove();
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
        
        this.velocityX += deltaX * 0.1;
        this.velocityY += deltaY * 0.1;
        
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
        
        this.velocityX += deltaX * 0.1;
        this.velocityY += deltaY * 0.1;
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    });

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
        word.remove();
        this.words.splice(i, 1);
      }
    }
    this.handleWordCollisions();
  }

  generateNewWords() {
    // Generar nuevas palabras con menos frecuencia
    if (Math.random() < 0.5 && this.words.length < this.maxWords) { // 10% de probabilidad
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
    this.maxImages = 10;
    this.recentlyUsedImages = [];
    this.init();
  }

  init() {
    this.preloadImages();
    this.createInitialImages();
  }

  preloadImages() {
    for (let i = 1; i <= 11; i++) {
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
    
    const baseSize = 250;
    const sizeFactors = [0.8, 1.0, 1.2];
    const randomFactor = sizeFactors[Math.floor(Math.random() * sizeFactors.length)];
    const size = baseSize * randomFactor;
    
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    let startX, startY, isOverlapping;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      startX = Math.random() * (window.innerWidth + 400) - 200;
      startY = Math.random() * (window.innerHeight + 400) - 200;
      isOverlapping = false;

      const margin = 50;
      const newRect = {
        left: startX - margin,
        right: startX + size + margin,
        top: startY - margin,
        bottom: startY + (size * (img.naturalHeight / img.naturalWidth) || size) + margin
      };

      for (const existingImage of this.images) {
        const existingRect = existingImage.getBoundingClientRect();
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
    
    img.style.left = `${startX}px`;
    img.style.top = `${startY}px`;

    const speed = Math.random() * 2 + 0.5;
    const angle = Math.random() * Math.PI * 2;
    
    img.velocityX = Math.cos(angle) * speed;
    img.velocityY = Math.sin(angle) * speed;
    
    img.life = Math.random() * 10000 + 8000;
    img.maxLife = img.life;
    
    this.container.appendChild(img);
    this.images.push(img);
    
    return img;
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
        img.remove();
        this.images.splice(i, 1);
      }
    }
    this.handleCollisions();
  }

  generateNewImages() {
    if (Math.random() < 0.3 && this.images.length < this.maxImages) {
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
}

// Variable global para la instancia
let teAmoInstance;
let imageBackgroundInstance;
let heartsInstance;

class InfiniteHearts {
  constructor() {
    this.container = document.getElementById('words-container'); // Reuse the same container
    this.hearts = [];
    this.maxHearts = 200;
    this.init();
  }

  init() {
    // No initial hearts needed, they are created on click
  }

  createHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤️';
    
    const size = Math.random() * 20 + 10;
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
  teAmoInstance = new InfiniteTeAmo();
  imageBackgroundInstance = new InfiniteImageBackground();
  heartsInstance = new InfiniteHearts();
});

// Agregar palabras al hacer clic con control de límite
document.addEventListener('click', (e) => {
  if (heartsInstance) {
    heartsInstance.addHeartsAtPosition(e.clientX, e.clientY, 5);
  }
});