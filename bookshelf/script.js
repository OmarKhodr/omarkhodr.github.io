// script.js – persistent sidebar on ≥ 600 px, overlay on narrow screens
// • ≥ 600 px: 420 px‑wide sidebar is always visible; no close button, no history.
// • < 600 px: sidebar covers the full viewport, dismissable via Back or ×.
// • Clicking a spine only updates the content; image of the spine is *not* shown.

document.addEventListener('DOMContentLoaded', () => {
  let booksData = null;
  let selectedBook = null;

  /* ------------------------------------------------------------------
     1 ▸ build the sidebar once and add to <body>
  ------------------------------------------------------------------ */
  const detail = document.createElement('aside');
  detail.id = 'book-detail';
  detail.className = 'book-detail';
  detail.innerHTML = /* html */`
    <div class="detail-content" tabindex="0"></div>`;
  document.body.appendChild(detail);

  /* ------------------------------------------------------------------
     2 ▸ set up history handling for mobile overlay only
  ------------------------------------------------------------------ */
  window.addEventListener('popstate', (event) => {
    if (event.state?.bookSlug) {
      const book = booksData?.find(b => b.slug === event.state.bookSlug) ?? null;
      showDetail(book);
    } else if (window.innerWidth >= 600) {
      history.back();  // if no previous state, go back in history
    }
    if (window.innerWidth < 600 && detail.classList.contains('open')) {
      hideDetail();
    }
  });

  /* ------------------------------------------------------------------
     3 ▸ fetch book metadata once
  ------------------------------------------------------------------ */
  fetch('./books.json')
    .then(r => r.ok ? r.json() : Promise.reject(r))
    .then(json => (booksData = json))
    .catch(err => console.error('Could not load books.json:', err));

  /* ------------------------------------------------------------------
     4 ▸ make each spine interactive
  ------------------------------------------------------------------ */
  document.querySelectorAll('.spine').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const slug = img.src.split('/').pop().replace(/\.[a-z]+$/, '');
      const book = booksData?.find(b => b.slug === slug) ?? null;
      showDetail(book);
    });
  });

  /* ------------------------------------------------------------------
     5 ▸ helper functions
  ------------------------------------------------------------------ */
  function showDetail(book) {
    selectedBook = book;
    const html = book
      ? `<h2 class="title">${book.title}</h2>
         <p class="author">${book.author}</p>
         <p class="year">${book.year_published}</p>`
      : '<h2>Details not available.</h2>';

    detail.querySelector('.detail-content').innerHTML = html;

    const slug = book?.slug ?? 'detail';
    history.pushState({ bookSlug: slug }, '', '#' + slug);
    if (window.innerWidth < 600) {
      // For mobile, push a history entry so Back closes the overlay first
      detail.classList.add('open');
    }
  }

  function hideDetail() {
    selectedBook = null;
    detail.classList.remove('open');
    detail.querySelector('.detail-content').innerHTML = '';
  }

  /* ------------------------------------------------------------------
     6 ▸ respond to viewport changes
  ------------------------------------------------------------------ */
  window.addEventListener('resize', syncLayout);
  syncLayout();  // run once on load

  function syncLayout() {
    if (window.innerWidth >= 600) {
      detail.classList.add('open');      // keep sidebar visible
    } else {
      if (selectedBook === null) {
        detail.classList.remove('open');  // hide sidebar
      }
    }
  }
});
