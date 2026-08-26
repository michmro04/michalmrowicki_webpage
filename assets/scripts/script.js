document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicjalizacja ikon Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Rok w stopce
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // 3. Obsługa Motywu Dark / Light
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (!prefersDark) {
    htmlElement.setAttribute('data-theme', 'light');
  }

  themeToggle?.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // 4. Menu Mobilne
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  menuToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('open');
    });
  });

  // 5. Dynamiczne wczytywanie technologii i gwiazdek z assets/technologies.json
  async function loadTechnologies() {
    const container = document.getElementById('tech-container');
    if (!container) return;

    try {
      const response = await fetch('assets/technologies.json');
      if (!response.ok) throw new Error('Błąd odczytu pliku JSON');
      
      const techList = await response.json();
      container.innerHTML = '';

      techList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'tech-card';

        let starsHtml = '';
        const maxStars = 5;
        const currentLevel = Math.min(Math.max(item.level, 0), maxStars);

        for (let i = 1; i <= maxStars; i++) {
          if (i <= currentLevel) {
            starsHtml += `<span class="star filled" title="${currentLevel}/5">★</span>`;
          } else {
            starsHtml += `<span class="star empty">★</span>`;
          }
        }

        card.innerHTML = `
          <div>
            <div class="tech-card-header">
              <span class="tech-name">${item.name}</span>
            </div>
            <span class="tech-tag">${item.category}</span>
          </div>
          <p class="tech-desc">${item.description || ''}</p>
          <div class="tech-stars" aria-label="Poziom: ${currentLevel} na 5">
            ${starsHtml}
          </div>
        `;

        container.appendChild(card);
      });

    } catch (error) {
      console.error('Błąd ładowania technologii:', error);
      container.innerHTML = '<p class="text-muted">Nie udało się załadować listy technologii.</p>';
    }
  }

  loadTechnologies();

  // 6. Obsługa formularza kontaktowego przez AJAX FormSubmit.co
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const targetEmail = contactForm.getAttribute('data-email');
    if (!targetEmail || targetEmail.includes('twoj_email')) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Uwaga: Uzupełnij właściwy adres e-mail w pliku index.html.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Wysyłanie...';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    const formData = new FormData(contactForm);
    const formJson = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formJson)
      });

      if (response.ok) {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Dziękuję! Twoja wiadomość została pomyślnie wysłana.';
        contactForm.reset();
      } else {
        throw new Error('Błąd odpowiedzi serwera');
      }
    } catch (err) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie za chwilę.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send"></i> Wyślij wiadomość';
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // 7. Obsługa przycisku Scroll To Top
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn?.classList.add('visible');
    } else {
      scrollToTopBtn?.classList.remove('visible');
    }
  });

  scrollToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 8. Obsługa 3D Karuzeli projektów
  const cards = Array.from(document.querySelectorAll('.carousel-card'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  const stage = document.getElementById('carousel-stage');

  if (cards.length > 0) {
    let currentIndex = 0;
    const totalCards = cards.length;

    // Generowanie kropek
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('span');
        dot.className = `dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => updateCarousel(idx));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    // Aktualizacja pozycji kart 3D
    function updateCarousel(newIndex) {
      currentIndex = (newIndex + totalCards) % totalCards;

      cards.forEach((card, index) => {
        let diff = index - currentIndex;
        
        if (diff > totalCards / 2) diff -= totalCards;
        if (diff < -totalCards / 2) diff += totalCards;

        // Reset klas bazowych z zachowaniem wyróżnienia featured
        const isFeatured = card.classList.contains('featured');
        card.className = `glass-card project-card carousel-card ${isFeatured ? 'featured' : ''}`;

        if (diff === 0) {
          card.classList.add('active');
        } else if (diff === 1) {
          card.classList.add('next');
        } else if (diff === -1) {
          card.classList.add('prev');
        } else if (diff > 1) {
          card.classList.add('hidden-right');
        } else {
          card.classList.add('hidden-left');
        }
      });

      // Aktualizacja kropek
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    // Kliknięcie w boczny kafelek (lub dowolny element bocznego kafelka)
    cards.forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Jeśli kliknięto w aktywny kafelek i cel to link -> pozwól otworzyć link
        if (index === currentIndex) {
          return;
        }

        // Jeśli kliknięto w boczny kafelek -> przełącz widok na niego
        e.preventDefault();
        e.stopPropagation();
        updateCarousel(index);
      });
    });

    // Przyciski strzałek
    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCarousel(currentIndex - 1);
    });

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCarousel(currentIndex + 1);
    });

    // Obsługa strzałek na klawiaturze (Lewo / Prawo)
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        updateCarousel(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        updateCarousel(currentIndex + 1);
      }
    });

    // Przesuwanie gestem na telefonie
    let touchStartX = 0;
    let isSwiping = false;

    stage?.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      isSwiping = false;
    }, { passive: true });

    stage?.addEventListener('touchmove', () => {
      isSwiping = true;
    }, { passive: true });

    stage?.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;

      if (diffX > 40) {
        updateCarousel(currentIndex - 1);
      } else if (diffX < -40) {
        updateCarousel(currentIndex + 1);
      }
    }, { passive: true });

    // Start od 1. kafelka
    updateCarousel(0);
  }
});