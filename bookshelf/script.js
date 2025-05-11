// Adds a responsive sidebar / overlay that shows book details when a spine is clicked.
// – On desktop/tablet (> 600 px) it behaves as a right–hand sidebar.
// – On small screens it takes the whole viewport and can be left via the browser’s Back
//   button or the × icon.

document.addEventListener('DOMContentLoaded', () => {
  let booksData = null;

  /* ---------------------------------------------------------------------
     1 ▸ prepare the overlay element once, append it to <body>
  --------------------------------------------------------------------- */
  const overlay = document.createElement('aside');
  overlay.id = 'book-detail';
  overlay.className = 'book-detail';     // styles live in styles.css
  overlay.innerHTML = /* html */`
    <button class="detail-close" aria-label="Close book detail">&times;</button>
    <div class="detail-content" tabindex="0"></div>`;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.detail-close');
  closeBtn.addEventListener('click', () => history.back());

  /* Browser Back button – close overlay instead of leaving the page */
  window.addEventListener('popstate', () => {
    if (overlay.classList.contains('open')) {
      hideOverlay();
    }
  });

  /* ---------------------------------------------------------------------
     2 ▸ fetch the metadata once so we have title/author/year ready
  --------------------------------------------------------------------- */
  fetch('./books.json')
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(json => { booksData = json; })
    .catch(err => console.error('Could not load books.json:', err));

  /* ---------------------------------------------------------------------
     3 ▸ make every spine interactive
  --------------------------------------------------------------------- */
  document.querySelectorAll('.spine').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const slug = img.src.split('/').pop().split('.').shift();   // e.g. postman_teaching
      const book = booksData?.find(b => b.slug === slug) ?? null;
      showOverlay(book, img.src.replace('.jpeg', '_cover.jpeg'));
    });
  });

  /* ---------------------------------------------------------------------
     4 ▸ helper functions
  --------------------------------------------------------------------- */
  function showOverlay(book, imgSrc) {
    const html = book
      ? `
        <h2>${book.title}</h2>
        <p class="author">${book.author}</p>
        <p class="year">${book.year_published}</p>
        <img src="${imgSrc}" alt="Cover of ${book.title}" class="cover">
      `
      : '<p>Details not available.</p>';

    overlay.querySelector('.detail-content').innerHTML = html;

    /* push at most one extra history entry to trap the Back button
       (don’t pile them up if user keeps switching between books) */
    if (!history.state || !history.state.bookDetail) {
      history.pushState({ bookDetail: true }, '', '#' + (book?.slug ?? 'detail'));
    }

    requestAnimationFrame(() => overlay.classList.add('open'));
  }

  function hideOverlay() {
    overlay.classList.remove('open');
    /* housekeeping: clear contents after the closing animation */
    overlay.addEventListener('transitionend', () => {
      overlay.querySelector('.detail-content').innerHTML = '';
    }, { once: true });
  }
});
