// script.js – persistent sidebar on ≥ 600 px, overlay on narrow screens
// • ≥ 600 px: 420 px‑wide sidebar is always visible; no close button, no history.
// • < 600 px: sidebar covers the full viewport, dismissable via Back or ×.
// • Clicking a spine only updates the content; image of the spine is *not* shown.

document.addEventListener('DOMContentLoaded', () => {
  let booksData = null;

  /* ------------------------------------------------------------------
     1 ▸ build the sidebar once and add to <body>
  ------------------------------------------------------------------ */
  const detail = document.createElement('aside');
  detail.id = 'book-detail';
  detail.className = 'book-detail';
  detail.innerHTML = /* html */`
    <button class="detail-close" aria-label="Close book detail">&times;</button>
    <div class="detail-content" tabindex="0"></div>`;
  document.body.appendChild(detail);

  const closeBtn = detail.querySelector('.detail-close');
  closeBtn.addEventListener('click', () => history.back());

  /* ------------------------------------------------------------------
     2 ▸ set up history handling for mobile overlay only
  ------------------------------------------------------------------ */
  window.addEventListener('popstate', () => {
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
    const html = book
      ? `<h2>${book.title}</h2>
         <p class="author">${book.author}</p>
         <p class="year">${book.year_published}</p>`
      : '<p>Details not available.</p>';

    detail.querySelector('.detail-content').innerHTML = html;

    if (window.innerWidth < 600) {
      // For mobile, push a history entry so Back closes the overlay first
      if (!history.state || !history.state.bookDetail) {
        history.pushState({ bookDetail: true }, '', '#' + (book?.slug ?? 'detail'));
      }
      detail.classList.add('open');
    }
  }

  function hideDetail() {
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
      closeBtn.style.display = 'none';   // hide × button
    } else {
      closeBtn.style.display = '';
    }
  }
});
