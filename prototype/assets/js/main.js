/**
 * KONTFEEL - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    const subNav = document.getElementById('subNav');
    const sections = document.querySelectorAll('section[id], article[id]');
    const subNavLinks = document.querySelectorAll('.sub-nav-links a');

    // Show/Hide sub-nav on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            subNav.classList.add('is-visible');
        } else {
            subNav.classList.remove('is-visible');
        }

        // Active link on scroll
        let current = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        subNavLinks.forEach((a) => {
            a.classList.remove("active");
            if (a.getAttribute("href").includes(current)) {
                a.classList.add("active");
            }
        });
    });
    
    console.log('KONTFEEL: Navigation initialized.');
});
