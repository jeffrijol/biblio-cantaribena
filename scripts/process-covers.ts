// scripts/process-covers.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import https from 'https';

const CSV_PATH = path.join(process.cwd(), 'librería-cantaribeña.csv');
const COVERS_DIR = path.join(process.cwd(), 'public', 'covers');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'bookCovers.json');
const EXTERIOR_COVER = '/images/library-cover.svg';

interface BookCover {
    isbn: string | null;
    title: string;
    originalUrl: string;
    localUrl: string;
    hasCover: boolean;
}

// Función para descargar imágenes
async function downloadImage(url: string, filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        }).on('error', () => resolve(false));
    });
}

async function processCovers() {
    try {
        console.log('📖 Procesando CSV de libros y descargando portadas...');

        // Crear directorios si no existen
        if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
        if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
            fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
        }

        // Leer CSV
        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            bom: true
        });

        const bookCovers: BookCover[] = [];
        let downloaded = 0;

        for (const book of records) {
            const isbn = book.ean_isbn13?.toString().trim().replace(/-/g, '');
            const title = book.title || 'Libro sin título';

            if (isbn && isbn.length === 13) {
                const originalUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
                const localFilename = `${isbn}.jpg`;
                const localPath = path.join(COVERS_DIR, localFilename);
                const localUrl = `/covers/${localFilename}`;

                // Intentar descargar si no existe ya
                let success = fs.existsSync(localPath);
                if (!success) {
                    success = await downloadImage(originalUrl, localPath);
                }

                if (success) {
                    downloaded++;
                    bookCovers.push({
                        isbn,
                        title,
                        originalUrl,
                        localUrl,
                        hasCover: true
                    });
                    console.log(`✅ Procesada: ${title}`);
                } else {
                    // Si falla la descarga, usar la portada genérica local
                    bookCovers.push({
                        isbn,
                        title,
                        originalUrl,
                        localUrl: EXTERIOR_COVER,
                        hasCover: false
                    });
                    console.log(`⚠️  Usando diseño por defecto (falló descarga): ${title}`);
                }
            } else {
                // Sin ISBN válido, usar la portada fija de la biblioteca
                bookCovers.push({
                    isbn: null,
                    title,
                    originalUrl: '',
                    localUrl: EXTERIOR_COVER,
                    hasCover: false
                });
                console.log(`📄 Sin ISBN (usando defecto): ${title}`);
            }
        }

        // Guardar JSON
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(bookCovers, null, 2));

        console.log('\n📊 RESUMEN FINAL:');
        console.log(`   Total libros procesados: ${records.length}`);
        console.log(`   Portadas con archivo local: ${downloaded}`);
        console.log(`   Portadas remotas: ${bookCovers.filter(b => !b.hasCover && b.isbn).length}`);
        console.log(`   Libros con diseño por defecto: ${bookCovers.filter(b => !b.isbn).length}`);
        console.log(`\n💾 JSON guardado en: ${OUTPUT_PATH}`);

    } catch (error: any) {
        console.error('❌ Error fatal:', error.message);
        process.exit(1);
    }
}

processCovers();