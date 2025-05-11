/** Generates index.html from template.html + books.json. */

interface Book {
  slug: string;
  title: string;
  author: string;
  year_published: number;
  spine_h_mm: number;
}

const read = (path: string) => Bun.file(path).text();

const write = (path: string, data: string | Uint8Array) => Bun.write(path, data);

(async () => {
  const books: Book[] = await Bun.file('./bookshelf/books.json').json();

  const shelf = books
    .map(
      ({ slug, title, spine_h_mm }) => `
        <img class="spine"
             src="./static/${slug}.jpeg"
             alt="${title}"
             style="--h-mm:${spine_h_mm}">`
    )
    .join('\n');

  const template = await read('./bookshelf/template.html');
  const out = template.replace('<!-- render:BOOKS -->', shelf);

  await write('./bookshelf/index.html', out);

  console.log(`✓ index.html regenerated (${books.length} books)`);
})();
