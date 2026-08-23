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

        // Generowanie 5 gwiazdek
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
      formStatus.textContent = 'Uwaga: Uzupełnij właściwy adres e-mail w pliku index.html (atrybut data-email).';
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
});

// ==========================================
  // OBSŁUGA PRZYCISKU SCROLL TO TOP
  // ==========================================
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  window.addEventListener('scroll', () => {
    // Przycisk pojawia się po przewinięciu o 300px w dół
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