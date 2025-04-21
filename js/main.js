/**
 * main.js
 * Main functionality for the Kenya COVID-19 Vaccination Coverage website
 */

// Global variables
let darkModeEnabled = false;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website
    initializeSite();
    
    // Setup theme toggle
    setupThemeToggle();
    
    // Setup any page-specific functionality
    setupPageSpecific();
});

/**
 * Initialize site-wide functionality
 */
function initializeSite() {
    // Check for user's preferred color scheme
    checkPreferredColorScheme();
    
    // Set up navigation highlighting
    highlightCurrentPageNav();
    
    // Set up smooth scroll behavior for anchor links
    setupSmoothScroll();
    
    // Initialize tooltip functionality
    setupTooltips();
}

/**
 * Check user's preferred color scheme and apply appropriate theme
 */
function checkPreferredColorScheme() {
    // Check if user has previously set a preference
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
        // Apply stored preference
        if (storedTheme === 'dark') {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    } else {
        // Check system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDarkMode) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    }
}

/**
 * Enable dark mode
 */
function enableDarkMode() {
    document.body.classList.add('dark-theme');
    darkModeEnabled = true;
    localStorage.setItem('theme', 'dark');
    
    // Update Mapbox style if map exists
    if (typeof map !== 'undefined' && map) {
        map.setStyle('mapbox://styles/mapbox/dark-v11');
    }
}

/**
 * Disable dark mode
 */
function disableDarkMode() {
    document.body.classList.remove('dark-theme');
    darkModeEnabled = false;
    localStorage.setItem('theme', 'light');
    
    // Update Mapbox style if map exists
    if (typeof map !== 'undefined' && map) {
        map.setStyle('mapbox://styles/mapbox/light-v11');
    }
}

/**
 * Setup theme toggle button
 */
function setupThemeToggle() {
    const themeToggle = document.querySelector('.toggle-theme');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (darkModeEnabled) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    }
}

/**
 * Highlight current page in navigation
 */
function highlightCurrentPageNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        // Get the link path
        const linkPath = link.getAttribute('href');
        
        // Check if this link corresponds to the current page
        if ((currentPath.endsWith('/') && linkPath === 'index.html') || 
            currentPath.endsWith(linkPath)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize tooltips
 */
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        // Show tooltip on hover
        element.addEventListener('mouseenter', e => {
            const rect = element.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10 + window.scrollY}px`;
            tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + window.scrollX}px`;
            tooltip.style.opacity = '1';
        });
        
        // Hide tooltip when not hovering
        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    });
}

/**
 * Set up page-specific functionality based on current page
 */
function setupPageSpecific() {
    const currentPath = window.location.pathname;
    
    // Index page (landing page)
    if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
        setupCounterAnimation();
    }
    
    // Results page
    if (currentPath.endsWith('results.html')) {
        setupGalleryFilters();
        setupModalFunctionality();
    }
    
    // Data page
    if (currentPath.endsWith('data.html')) {
        setupTabFunctionality();
        setupCopyButtons();
    }
    
    // Team page
    if (currentPath.endsWith('team.html')) {
        setupContactForm();
    }
}

/**
 * Set up counter animation for stats
 */
function setupCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    const counterSpeed = 500; // Time in ms to complete animation
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const increment = target / counterSpeed * 10; // Update every 10ms
        
        let currentCount = 0;
        const counterInterval = setInterval(() => {
            currentCount += increment;
            
            // Stop at target value
            if (currentCount >= target) {
                counter.textContent = target.toFixed(target % 1 === 0 ? 0 : 2);
                clearInterval(counterInterval);
                return;
            }
            
            // Update counter with current value
            counter.textContent = currentCount.toFixed(target % 1 === 0 ? 0 : 2);
        }, 10);
    });
}

/**
 * Set up gallery filters for results page
 */
function setupGalleryFilters() {
    const filterButtons = document.querySelectorAll('.gallery-control');
    const galleryItems = document.querySelectorAll('[data-categories]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filter = button.getAttribute('data-filter');
            
            // Show/hide items based on filter
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-categories').includes(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Set up modal functionality for results page
 */
function setupModalFunctionality() {
    const modal = document.getElementById('result-modal');
    const modalClose = document.getElementById('modal-close');
    const resultCards = document.querySelectorAll('.result-card');
    
    if (!modal || !modalClose) return;
    
    // Open modal when clicking on a result card
    resultCards.forEach(card => {
        card.addEventListener('click', () => {
            // Get data from card
            const title = card.querySelector('.result-title').textContent;
            const image = card.querySelector('.result-image').innerHTML;
            
            // Get figure number from tags
            let figureNumber = '';
            const tags = card.querySelectorAll('.result-tag');
            tags.forEach(tag => {
                if (tag.textContent.includes('Figure')) {
                    figureNumber = tag.textContent;
                }
            });
            
            // Update modal content
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-figure').textContent = figureNumber;
            document.getElementById('modal-image').innerHTML = image;
            
            // Show modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal when clicking close button
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

/**
 * Set up tab functionality for data page
 */
function setupTabFunctionality() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Set up copy buttons for citation on data page
 */
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-button');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get the text to copy
            const textElement = button.previousElementSibling;
            const text = textElement.textContent;
            
            // Create a temporary textarea element
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            
            // Select and copy the text
            textarea.select();
            document.execCommand('copy');
            
            // Remove the textarea
            document.body.removeChild(textarea);
            
            // Update button text temporarily
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#4caf50';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 2000);
        });
    });
}

/**
 * Set up contact form on team page
 */
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            // Prevent actual form submission
            e.preventDefault();
            
            // Simple client-side validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill out all required fields.');
                return;
            }
            
            // In a real implementation, you would send the form data to a server
            // For this demo, just show a success message
            alert('Thank you for your message! In a real implementation, this would be sent to the research team.');
            
            // Reset the form
            contactForm.reset();
        });
    }
}

// Export functions for use in other scripts
window.siteUtils = {
    enableDarkMode,
    disableDarkMode,
    isDarkMode: () => darkModeEnabled
};
