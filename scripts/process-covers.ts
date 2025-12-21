// scripts/process-covers.js
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const CSV_PATH = path.join(process.cwd(), 'librería-cantaribeña.csv');
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/bookCovers.json');

// Función para validar y formatear ISBN
function formatISBN(isbn: any) {
    if (!isbn) return null;
    const cleaned = isbn.toString().trim().replace(/-/g, '');
    return cleaned.length === 13 ? cleaned : null;
}

// Generar URL de portada de Open Library
function generateCoverURL(isbn13: string | null) {
    if (!isbn13) return null;
    return `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
}

// Imagen por defecto (base64 de un libro simple)
const DEFAULT_COVER = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="600" fill="#8ECAE6" rx="8"/>
  <rect x="20" y="40" width="360" height="520" fill="#FFFCF2" rx="4"/>
  <rect x="0" y="60" width="20" height="480" fill="#219EBC"/>
  <text x="200" y="300" font-family="Arial" font-size="24" fill="#2D3142" text-anchor="middle">
    Cantaribeña
  </text>
  <text x="200" y="340" font-family="Arial" font-size="16" fill="#5B8E5F" text-anchor="middle">
    Biblioteca Infantil
  </text>
</svg>
`).toString('base64')}`;

async function processCSV() {
    try {
        console.log('📖 Procesando CSV de libros...');

        // Leer y parsear CSV
        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            bom: true
        });

        console.log(`📚 Encontrados ${records.length} registros en el CSV`);

        // Procesar cada libro
        const bookCovers = [];
        let processedCount = 0;

        for (const book of records) {
            const isbn13 = formatISBN(book.ean_isbn13);
            const title = book.title || 'Libro sin título';

            if (isbn13) {
                bookCovers.push({
                    isbn: isbn13,
                    title: title,
                    coverUrl: generateCoverURL(isbn13),
                    hasCover: true,
                    fallbackTitle: title.substring(0, 30)
                });
                processedCount++;
            } else {
                // Si no hay ISBN válido, usar portada por defecto
                bookCovers.push({
                    isbn: null,
                    title: title,
                    coverUrl: DEFAULT_COVER,
                    hasCover: false,
                    fallbackTitle: title.substring(0, 30)
                });
            }
        }

        console.log(`✅ ISBNs válidos procesados: ${processedCount}/${records.length}`);
        console.log(`🎨 Portadas totales en lista: ${bookCovers.length}`);

        // Asegurar que el directorio existe
        const outputDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Guardar JSON
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(bookCovers, null, 2));
        console.log(`💾 Archivo guardado en: ${OUTPUT_PATH}`);

        // Mostrar resumen
        console.log('\n📊 RESUMEN:');
        console.log(`   Libros con portada real: ${bookCovers.filter(b => b.hasCover).length}`);
        console.log(`   Libros con portada por defecto: ${bookCovers.filter(b => !b.hasCover).length}`);
        console.log(`   Primer libro: ${bookCovers[0]?.title}`);
        console.log(`   Último libro: ${bookCovers[bookCovers.length - 1]?.title}`);

    } catch (error: any) {
        console.error('❌ Error procesando CSV:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Ejecutar
processCSV();