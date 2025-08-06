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
    word.className = 'word';
    word.textContent = 'Te amo';
    
    // Tamaño aleatorio
    const fontSize = Math.random() * 30 + 20;
    word.style.fontSize = `${fontSize}px`;
    
    // Posición aleatoria inicial
    const startX = Math.random() * (window.innerWidth + 400) - 200;
    const startY = Math.random() * (window.innerHeight + 400) - 200;
    
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
    
    // Agregar nuevas palabras en la posición especificada
    for (let i = 0; i < count; i++) {
      const word = this.createWord();
      word.style.left = `${x + (Math.random() - 0.5) * 100}px`;
      word.style.top = `${y + (Math.random() - 0.5) * 100}px`;
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

  updateWords() {
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
      
      // Efecto de desvanecimiento
      const opacity = Math.min(0.8, word.life / word.maxLife);
      word.style.opacity = opacity;
      
      // Remover palabras que han salido de la pantalla o han expirado
      if (word.life <= 0 || 
          newX < -200 || newX > window.innerWidth + 200 ||
          newY < -200 || newY > window.innerHeight + 200) {
        word.remove();
        this.words.splice(i, 1);
      }
    }
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
      this.updateWords();
      this.generateNewWords();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
}

class InfiniteImageBackground {
  constructor() {
    this.container = document.getElementById('background-images-container');
    this.images = [];
    this.imageUrls = [];
    this.maxImages = 4;
    this.init();
  }

  init() {
    this.preloadImages();
    this.start();
  }

  preloadImages() {
    for (let i = 1; i <= 12; i++) {
      this.imageUrls.push(`img/Cami(${i}).jpg`);
    }
    this.imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  createImage() {
    const img = document.createElement('img');
    img.className = 'background-image';
    img.src = this.imageUrls[Math.floor(Math.random() * this.imageUrls.length)];
    
    const size = Math.random() * 150 + 50;
    img.style.width = `${size}px`;
    img.style.height = 'auto';

    img.style.left = `${Math.random() * window.innerWidth}px`;
    img.style.top = `${Math.random() * window.innerHeight}px`;

    img.style.opacity = 0;
    
    this.container.appendChild(img);
    this.images.push(img);

    // Fade in
    setTimeout(() => {
      img.style.opacity = Math.random() * 0.3 + 0.1;
    }, 100);

    // Fade out and remove
    setTimeout(() => {
      img.style.opacity = 0;
      setTimeout(() => {
        img.remove();
        this.images = this.images.filter(i => i !== img);
      }, 2000);
    }, 5000 + Math.random() * 5000);
  }

  start() {
    setInterval(() => {
      if (this.images.length < this.maxImages) {
        this.createImage();
      }
    }, 2000);
  }
}

// Variable global para la instancia
let teAmoInstance;
let imageBackgroundInstance;

// Inicializar cuando la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
  teAmoInstance = new InfiniteTeAmo();
  imageBackgroundInstance = new InfiniteImageBackground();
});

// Agregar palabras al hacer clic con control de límite
document.addEventListener('click', (e) => {
  if (teAmoInstance) {
    teAmoInstance.addWordsAtPosition(e.clientX, e.clientY, 3); // Solo 3 palabras por clic
  }
});