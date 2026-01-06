import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer archivos
const recomendacionesPath = path.join(__dirname, '../../../recomendaciones.txt');
const libraryPath = path.join(__dirname, '../processed/library.json');

const recomendacionesText = fs.readFileSync(recomendacionesPath, 'utf-8');
const libraryData = JSON.parse(fs.readFileSync(libraryPath, 'utf-8'));

// Función para normalizar títulos y hacer matching
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[""«»]/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

function findBookInCollection(title) {
    const normalized = normalizeTitle(title);

    return libraryData.books.find(book => {
        const bookTitle = normalizeTitle(book.title);

        // Coincidencia exacta
        if (bookTitle === normalized) return true;

        // Uno contiene al otro
        if (bookTitle.includes(normalized) || normalized.includes(bookTitle)) return true;

        // Coincidencia parcial (primeras 3 palabras)
        const titleWords = normalized.split(' ').slice(0, 3).join(' ');
        const bookWords = bookTitle.split(' ').slice(0, 3).join(' ');

        return titleWords === bookWords;
    });
}

// Parsear recomendaciones por edad
function parseRecommendations(text) {
    const lines = text.split('\n');
    const ageGroups = [];
    let currentAge = null;
    let currentBooks = [];

    lines.forEach(line => {
        line = line.trim();

        // Detectar encabezados de edad
        if (line.match(/^Recomendaciones\s+(\d+)\s+años?/i)) {
            // Guardar grupo anterior si existe
            if (currentAge && currentBooks.length > 0) {
                ageGroups.push({
                    age: currentAge,
                    books: [...currentBooks]
                });
            }

            // Iniciar nuevo grupo
            const match = line.match(/(\d+)\s+años?/i);
            currentAge = `${match[1]} años`;
            currentBooks = [];
        }
        // Detectar libros (líneas que empiezan con -)
        else if (line.startsWith('-')) {
            const bookText = line.substring(1).trim();

            // Extraer título (antes de "Ed." o punto o comentario)
            let title = bookText;

            // Buscar título entre comillas
            const quotedMatch = bookText.match(/[""«»]([^""«»]+)[""«»]/);
            if (quotedMatch) {
                title = quotedMatch[1];
            } else {
                // Si no hay comillas, tomar hasta el primer punto o "Ed."
                const parts = bookText.split(/\.|Ed\./i);
                title = parts[0].replace(/^(Cualquiera de|El|La|Los|Las)\s+/i, '').trim();
            }

            // Extraer autor si está presente
            const authorMatch = bookText.match(/^([^:"""«»]+):/);
            const author = authorMatch ? authorMatch[1].trim() : null;

            // Extraer nota (texto después del título)
            let note = bookText.replace(title, '').replace(/^[""«»\-:.\s]+/, '').trim();
            if (note.startsWith('. ')) note = note.substring(2);

            if (title && title.length > 2) {
                currentBooks.push({
                    title: title.trim(),
                    author: author,
                    note: note || null,
                    fullText: bookText
                });
            }
        }
    });

    // Guardar último grupo
    if (currentAge && currentBooks.length > 0) {
        ageGroups.push({
            age: currentAge,
            books: currentBooks
        });
    }

    return ageGroups;
}

// Procesar y relacionar con la colección
const parsedGroups = parseRecommendations(recomendacionesText);

const ageRecommendations = parsedGroups.map(group => {
    const booksWithCollection = group.books.map(book => {
        const collectionBook = findBookInCollection(book.title);

        return {
            title: book.title,
            author: book.author,
            note: book.note,
            inCollection: !!collectionBook,
            slug: collectionBook?.slug || null,
            cover: collectionBook?.cover || null,
            collectionData: collectionBook ? {
                title: collectionBook.title,
                creators: collectionBook.creators,
                publisher: collectionBook.publisher
            } : null
        };
    });

    // Separar por estado
    const inCollection = booksWithCollection.filter(b => b.inCollection);
    const toDiscover = booksWithCollection.filter(b => !b.inCollection);

    return {
        age: group.age,
        ageRange: group.age.match(/\d+/)[0], // Extraer número
        totalBooks: booksWithCollection.length,
        inCollectionCount: inCollection.length,
        toDiscoverCount: toDiscover.length,
        booksInCollection: inCollection,
        booksToDiscover: toDiscover,
        allBooks: booksWithCollection
    };
});

// Guardar resultado
const outputPath = path.join(__dirname, '../processed/age-recommendations.json');
fs.writeFileSync(outputPath, JSON.stringify(ageRecommendations, null, 2), 'utf-8');

console.log('✅ Recomendaciones procesadas exitosamente!');
console.log(`📊 Grupos de edad: ${ageRecommendations.length}`);
ageRecommendations.forEach(group => {
    console.log(`   ${group.age}: ${group.inCollectionCount}/${group.totalBooks} en colección`);
});
console.log(`📁 Guardado en: ${outputPath}`);
