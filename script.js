// Menú móvil
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Cerrar menú al hacer click en un enlace
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Animación al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Aplicar animación a las tarjetas de productos
document.querySelectorAll('.product-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Aplicar animación a las tarjetas de características
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `all 0.6s ease ${index * 0.15}s`;
    observer.observe(card);
});

// Cambiar navbar al hacer scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.padding = '1rem 0';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Formulario de contacto
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Aquí puedes agregar la lógica para enviar el formulario
    // Por ahora, solo mostramos un mensaje de éxito
    
    const formData = new FormData(contactForm);
    
    // Simulación de envío exitoso
    alert('¡Gracias por tu mensaje! Te contactaremos pronto. 🌸');
    contactForm.reset();
    
    // En producción, aquí enviarías los datos a un servidor:
    /*
    fetch('tu-servidor.com/contacto', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert('¡Mensaje enviado exitosamente!');
        contactForm.reset();
    })
    .catch(error => {
        alert('Error al enviar el mensaje. Intenta de nuevo.');
    });
    */
});

// Efecto parallax suave en el hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Animación de números en las estadísticas
const animateValue = (element, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (element.dataset.suffix || '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// Observar las estadísticas
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const value = parseInt(entry.target.textContent);
            animateValue(entry.target, 0, value, 2000);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach((stat, index) => {
    // Guardar el valor original
    const originalText = stat.textContent;
    const numbers = originalText.match(/\d+/);
    if (numbers) {
        stat.dataset.value = numbers[0];
        stat.dataset.suffix = originalText.replace(/\d+/, '');
        statsObserver.observe(stat);
    }
});

// Botones de consultar productos
document.querySelectorAll('.product-card .btn-secondary').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const productCard = button.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        
        // Crear mensaje para WhatsApp
        const message = `Hola! Estoy interesado en: ${productTitle} - ${productPrice}`;
        const whatsappUrl = `https://wa.me/34673670920?text=${encodeURIComponent(message)}`;
        
        // Abrir WhatsApp en una nueva ventana
        window.open(whatsappUrl, '_blank');
    });
});

// Efecto hover en las tarjetas de producto
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
    });
});

console.log('🌸 Flores Mary - Website cargado exitosamente!');