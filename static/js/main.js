document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initSearch();
    initDropdowns();
    initCartDrawer();
    initAuthModal();
    initHeroVideo();
    initStatsCounter();
    initToast();
    initCollectionBar();
});

/* =========================================
   Navbar Behavior
   ========================================= */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    // If navbar doesn't exist, skip
    if (!navbar) return;

    const isHomePage = window.location.pathname === '/';

    if (isHomePage) {
        navbar.classList.add('navbar-transparent', 'navbar-visible');
        let lastScrollTop = 0;

        window.addEventListener('scroll', function () {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Hide on scroll down (> 100px), show on scroll up
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.classList.remove('navbar-visible');
            } else if (scrollTop < lastScrollTop) {
                navbar.classList.add('navbar-visible');
            }

            // Always show at top
            if (scrollTop <= 10) {
                navbar.classList.add('navbar-visible');
            }
            lastScrollTop = scrollTop;
        });

        // Initial check
        if (window.pageYOffset <= 10) {
            navbar.classList.add('navbar-visible');
        }
    } else {
        // Other pages always sticky
        navbar.classList.add('navbar-sticky');
    }

    // Dynamic color updates based on state
    function updateNavbarColors() {
        const isSticky = navbar.classList.contains('navbar-sticky');
        const isHovered = navbar.matches(':hover') && navbar.classList.contains('navbar-transparent');
        const darkText = '#000000';
        const lightText = '#ffffff';

        const color = (isSticky || isHovered) ? darkText : lightText;

        const elements = navbar.querySelectorAll('.nav-links a, .brand-name a, .dropdown-toggle, .cart-icon, .search-icon-btn, .auth-icon-btn');
        elements.forEach(el => el.style.color = color);
    }

    navbar.addEventListener('mouseenter', updateNavbarColors);
    navbar.addEventListener('mouseleave', updateNavbarColors);
    // Initial call
    updateNavbarColors();
}

/* =========================================
   Search Functionality
   ========================================= */
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchBtn || !searchBar) return;

    // Toggle
    searchBtn.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) searchInput?.focus();
    });

    // Close
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', () => {
            searchBar.classList.remove('active');
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.innerHTML = '';
        });
    }

    // Close on click outside
    document.addEventListener('click', (event) => {
        if (!searchBar.contains(event.target) && !searchBtn.contains(event.target)) {
            searchBar.classList.remove('active');
        }
    });

    // Live Search
    if (searchInput && searchResults) {
        let searchTimeout;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const query = this.value.trim();

            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            searchTimeout = setTimeout(() => {
                fetch(`/search/?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => displaySearchResults(data, searchResults))
                    .catch(err => {
                        console.error('Search error:', err);
                        searchResults.innerHTML = '<div class="no-results">Error searching products</div>';
                    });
            }, 300);
        });
    }
}

function displaySearchResults(products, container) {
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    const html = products.map(p => `
        <a href="/product/${p.id}/" class="search-result-item">
            <img src="${p.image || ''}" alt="${p.name}">
            <div class="search-result-info">
                <h4>${p.name}</h4>
                <p>₹ ${p.price}</p>
            </div>
        </a>
    `).join('');
    container.innerHTML = html;
}

/* =========================================
   Dropdowns (Collections)
   ========================================= */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-item.dropdown'); // Adjust selector if needed, currently .nav-item-dropdown in HTML but script used .nav-item.dropdown? 
    // Wait, earlier base.html showed <div class="nav-item-dropdown">. Let's fix selector.
    // Actually, looking at base.html, it is `<div class="nav-item-dropdown">`.
    // The previous script used `.nav-item.dropdown`. Let's support both or fix selector.
    // I'll stick to the class actually present in base.html: .nav-item-dropdown

    const dropdownWrappers = document.querySelectorAll('.collections-dropdown');

    dropdownWrappers.forEach(dd => {
        const toggle = dd.querySelector('.dropdown-toggle');
        const menu = dd.querySelector('.dropdown-menu'); // Not used directly but good to know

        if (!toggle) return;

        // Desktop Hover
        dd.addEventListener('mouseenter', () => {
            dd.classList.add('hover');
            toggle.setAttribute('aria-expanded', 'true');
        });
        dd.addEventListener('mouseleave', () => {
            dd.classList.remove('hover');
            toggle.setAttribute('aria-expanded', 'false');
        });

        // Mobile/Click Toggle
        toggle.addEventListener('click', (e) => {
            // Only prevent default navigation if it's NOT a link
            if (toggle.tagName.toLowerCase() !== 'a') {
                e.preventDefault();
            }

            // Still toggle class for mobile accordion style if needed, 
            // but for links, the page will reload anyway.
            const isOpen = dd.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen);
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        dropdownWrappers.forEach(dd => {
            if (!dd.contains(e.target)) {
                dd.classList.remove('open', 'hover');
                const t = dd.querySelector('.dropdown-toggle');
                if (t) t.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

/* =========================================
   Cart Drawer
   ========================================= */
function initCartDrawer() {
    const cartBtn = document.getElementById('cartBtn');
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    const closeBtn = document.getElementById('cartDrawerClose');

    if (!cartBtn || !drawer) return;

    const openDrawer = () => {
        drawer.classList.add('active');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('drawer-open');
    };

    const closeDrawer = () => {
        drawer.classList.remove('active');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('drawer-open');
    };

    cartBtn.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openDrawer();
    });

    if (backdrop) backdrop.addEventListener('click', closeDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });
}

/* =========================================
   Auth Modal
   ========================================= */
function initAuthModal() {
    const authBtn = document.getElementById('authBtn');
    const authModal = document.getElementById('authModal');
    if (!authBtn || !authModal) return;

    const authBackdrop = document.getElementById('authBackdrop');
    const authClose = document.getElementById('authClose');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');

    const openModal = () => {
        authModal.classList.add('active');
        authModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('loginUsername')?.focus();
    };

    const closeModal = () => {
        authModal.classList.remove('active');
        authModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (loginError) loginError.textContent = '';
        if (signupError) signupError.textContent = '';
    };

    authBtn.addEventListener('click', openModal);
    if (authClose) authClose.addEventListener('click', closeModal);
    if (authBackdrop) authBackdrop.addEventListener('click', closeModal);

    // Toggle Forms
    if (showSignup) {
        showSignup.addEventListener('click', () => {
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = '';
        });
    }
    if (showLogin) {
        showLogin.addEventListener('click', () => {
            if (signupForm) signupForm.style.display = 'none';
            if (loginForm) loginForm.style.display = '';
        });
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) closeModal();
    });

    // Form Submissions
    handleAuthForm(loginForm, '/auth/login/', loginError);
    handleAuthForm(signupForm, '/auth/signup/', signupError);
}

function handleAuthForm(form, url, errorDisplay) {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorDisplay) errorDisplay.textContent = '';

        const inputs = form.querySelectorAll('input');
        const data = {};
        inputs.forEach(input => data[input.name] = input.value); // Simple serialization

        // In a real app, use the actual postJson helper
        try {
            const res = await postJson(url, data);
            if (res.status === 200 && res.body.success) {
                // Set flag for toast on reload
                localStorage.setItem('authSuccess', 'true');
                window.location.reload();
            } else {
                if (errorDisplay) errorDisplay.textContent = res.body.error || 'Action failed';
            }
        } catch (err) {
            console.error(err);
            if (errorDisplay) errorDisplay.textContent = 'An error occurred';
        }
    });
}

// Helper: CSRF + Fetch
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function postJson(url, data) {
    const csrftoken = getCookie('csrftoken');
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
    });
    return res.json().then(j => ({ status: res.status, body: j }));
}

/* =========================================
   Hero Video Control (Home)
   ========================================= */
function initHeroVideo() {
    const video = document.querySelector('.hero-video');
    const videoControlBtn = document.getElementById('videoControlBtn');

    if (!video || !videoControlBtn) return;

    function updateButtonState() {
        if (video.paused) {
            videoControlBtn.classList.remove('playing');
        } else {
            videoControlBtn.classList.add('playing');
        }
    }

    videoControlBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            videoControlBtn.classList.add('playing');
        } else {
            video.pause();
            videoControlBtn.classList.remove('playing');
        }
    });

    video.addEventListener('play', updateButtonState);
    video.addEventListener('pause', updateButtonState);
    updateButtonState();
}

/* =========================================
   Stats Counter (Home)
   ========================================= */
function initStatsCounter() {
    const statsSection = document.querySelector('.stats-counter-section');
    if (!statsSection) return;

    const counters = document.querySelectorAll('.stat-count');
    let started = false;

    const countUp = (counter) => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.innerText = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.innerText = Math.ceil(current).toLocaleString();
            }
        }, stepTime);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                counters.forEach(c => countUp(c));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
}


/* =========================================
   Toast Notifications
   ========================================= */
function initToast() {
    // Check for auth success flag
    if (localStorage.getItem('authSuccess')) {
        showToast('Logged in successfully', 'success');
        localStorage.removeItem('authSuccess');
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Icon based on type
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
        iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon">
            ${iconSvg}
        </div>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        });
    }, 3000);
}

/* =========================================
   Collection Bar (Sticky)
   ========================================= */
function initCollectionBar() {
    const grid3Btn = document.getElementById("grid3Btn");
    const grid4Btn = document.getElementById("grid4Btn");
    const productGrid = document.querySelector(".editorial-grid");
    const sortBtn = document.getElementById("sortBtn");
    const sortDropdown = document.getElementById("sortDropdown");
    const sortOptions = document.querySelectorAll(".sort-option");

    // Layout Toggle
    if (grid3Btn && grid4Btn && productGrid) {
        grid3Btn.addEventListener("click", () => {
            productGrid.classList.remove("grid-4");
            grid3Btn.classList.add("active");
            grid4Btn.classList.remove("active");
        });

        grid4Btn.addEventListener("click", () => {
            productGrid.classList.add("grid-4");
            grid4Btn.classList.add("active");
            grid3Btn.classList.remove("active");
        });
    }

    // Sort Dropdown Toggle
    if (sortBtn && sortDropdown) {
        sortBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle("active");
        });

        // Close on click outside
        document.addEventListener("click", (e) => {
            if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
                sortDropdown.classList.remove("active");
            }
        });
    }

    // Sort Logic
    if (sortOptions.length > 0 && productGrid) {
        sortOptions.forEach(option => {
            option.addEventListener("click", () => {
                const sortType = option.getAttribute("data-sort");
                sortProducts(sortType, productGrid);
                sortDropdown.classList.remove("active");
            });
        });
    }
}

function sortProducts(type, grid) {
    const cards = Array.from(grid.querySelectorAll(".product-card"));

    cards.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute("data-price"));
        const priceB = parseFloat(b.getAttribute("data-price"));
        const nameA = a.getAttribute("data-name").toLowerCase();
        const nameB = b.getAttribute("data-name").toLowerCase();

        if (type === "price-asc") return priceA - priceB;
        if (type === "price-desc") return priceB - priceA;
        if (type === "name-asc") return nameA.localeCompare(nameB);
        return 0;
    });

    // Re-append to grid
    grid.innerHTML = "";
    cards.forEach(card => grid.appendChild(card));
}
