
const currentPageURL = window.location.pathname;
// Get all the <a> elements within the #menu
const menuLinks = document.querySelectorAll('#menu a');

// Loop through the links and compare their href attributes with the current URL
menuLinks.forEach(link => {
    const linkURL = new URL(link.href).pathname;
    if (linkURL === currentPageURL) {
        link.classList.add('active'); // Add the active class to the parent <li>
    }
});
