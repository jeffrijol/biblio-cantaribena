// scripts/process-library-data.ts - VERSIÓN CORREGIDA
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import slugifyPackage from 'slugify';

interface Book {
    id: string;
    slug: string;
    title: string;
    authors: string[];
    isbn: string | null;
    publisher: string;
    publishDate: string;
    pageCount: number | null;
    ageRange: { min: number | null; max: number | null };
    personalTags: string[];
    rating: number | null;
    price: number | null;
    personalNotes: string;
    readStatus: { isRead: boolean; readByAll: boolean; familyNotes: string };
    addedDate: string;
    coverUrl: string | null;
    searchKeywords: string;
    isTraveler: boolean;
    isArtBook: boolean;
    isRecent: boolean;
    isFavorite: boolean;
}

interface AgeGroup {
    age: string;
    booksInCollection: Array<{ title: string; slug?: string; inCollection: boolean }>;
}

interface PichuCorner {
    featuredBookId: string;
    anecdote: string;
    lastUpdated: string;
}

interface ProcessedData {
    books: Book[];
    ageGroups: AgeGroup[];
    frequentAuthors: Array<{ name: string; count: number; books: string[] }>;
    pichuCorner: PichuCorner;
    stats: {
        totalBooks: number;
        totalAuthors: number;
        booksWithNotes: number;
        averageRating: number;
        booksByCountry: Record<string, number>;
        poeticCategories: {
            recentArrivals: number;
            favorites: number;
            travelers: number;
            artBooks: number;
        };
    };
}

const parseAgeGroup = (group: string): { min: number | null; max: number | null } => {
    if (!group || typeof group !== 'string') return { min: null, max: null };

    const match = group.match(/(\d+)[-–](\d+)/);
    if (match) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }

    const singleMatch = group.match(/(\d+)\s*años/);
    if (singleMatch) {
        const age = parseInt(singleMatch[1]);
        return { min: age, max: age + 1 };
    }

    return { min: null, max: null };
};

const parseRecommendations = (content: string): AgeGroup[] => {
    const lines = content.split('\n');
    const ageGroups: AgeGroup[] = [];
    let currentAge = '';
    let currentBooks: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('Recomendaciones') || trimmed.startsWith('Este es el de')) {
            if (currentAge && currentBooks.length > 0) {
                ageGroups.push({
                    age: currentAge,
                    booksInCollection: currentBooks.map(title => ({ title, inCollection: false }))
                });
            }

            const ageMatch = trimmed.match(/(\d+)\s*años/);
            currentAge = ageMatch ? `${ageMatch[1]} años` : '4 años';
            currentBooks = [];
        } else if (trimmed.startsWith('- ')) {
            const bookTitle = trimmed.substring(2).replace(/"/g, '').trim();
            if (bookTitle && !currentBooks.includes(bookTitle)) {
                currentBooks.push(bookTitle);
            }
        }
    }

    if (currentAge && currentBooks.length > 0) {
        ageGroups.push({
            age: currentAge,
            booksInCollection: currentBooks.map(title => ({ title, inCollection: false }))
        });
    }

    return ageGroups;
};

async function processLibraryData(): Promise<void> {
    try {
        const CSV_PATH = path.join(process.cwd(), 'librería-cantaribeña.csv');
        const RECOMMENDATIONS_PATH = path.join(process.cwd(), 'recomendaciones.txt');
        const OUTPUT_DIR = path.join(process.cwd(), 'src/data/processed');

        console.log('📖 Procesando datos de la biblioteca...');
        console.log(`📂 CSV: ${CSV_PATH}`);
        console.log(`📂 Recomendaciones: ${RECOMMENDATIONS_PATH}`);

        // Leer CSV
        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            bom: true,
        });

        console.log(`📚 Encontrados ${records.length} registros en el CSV`);

        // Procesar libros
        const books: Book[] = [];
        for (let index = 0; index < records.length; index++) {
            const record = records[index];

            try {
                const isbn = record.ean_isbn13?.toString().trim() || null;
                const title = record.title || 'Libro sin título';
                const authors = record.creators
                    ? record.creators.split(',').map((a: string) => a.trim()).filter(Boolean)
                    : [];

                const ageRange = parseAgeGroup(record.group || '');
                const personalTags = record.tags
                    ? record.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                    : [];

                const rating = record.rating ? parseFloat(record.rating) : null;
                const pageCount = record.length ? parseInt(record.length) : null;
                const price = record.price ? parseFloat(record.price) : null;

                const slug = slugifyPackage(`${title} ${isbn?.slice(-4) || index}`, {
                    lower: true,
                    strict: true,
                    locale: 'es',
                });

                const coverUrl = isbn
                    ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
                    : null;

                const personalNotes = record.notes || '';
                const isTraveler = /comprado|viaje|costa rica|maliaño/i.test(personalNotes);
                const isArtBook = personalTags.some(tag => tag.toLowerCase().includes('ilustración'));
                const addedDate = record.added || new Date().toISOString().split('T')[0];
                const isRecent = new Date(addedDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Últimos 90 días
                const isFavorite = rating !== null && rating >= 4;

                books.push({
                    id: `book-${isbn || Date.now() + index}`,
                    slug,
                    title,
                    authors,
                    isbn,
                    publisher: record.publisher || '',
                    publishDate: record.publish_date || '',
                    pageCount,
                    ageRange,
                    personalTags,
                    rating,
                    price,
                    personalNotes,
                    readStatus: {
                        isRead: true,
                        readByAll: personalNotes.toLowerCase().includes('leido por todos'),
                        familyNotes: personalNotes,
                    },
                    addedDate,
                    coverUrl,
                    searchKeywords: `${title} ${authors.join(' ')} ${personalTags.join(' ')}`.toLowerCase(),
                    isTraveler,
                    isArtBook,
                    isRecent,
                    isFavorite,
                });
            } catch (error) {
                console.error(`❌ Error procesando libro ${index}:`, error);
            }
        }

        // Procesar recomendaciones
        const recommendationsContent = fs.readFileSync(RECOMMENDATIONS_PATH, 'utf-8');
        let ageGroups = parseRecommendations(recommendationsContent);

        // Marcar libros que ya están en la colección
        ageGroups = ageGroups.map(group => ({
            ...group,
            booksInCollection: group.booksInCollection.map(book => {
                const foundBook = books.find(b =>
                    b.title.toLowerCase().includes(book.title.toLowerCase()) ||
                    book.title.toLowerCase().includes(b.title.toLowerCase())
                );

                return {
                    ...book,
                    inCollection: !!foundBook,
                    slug: foundBook?.slug,
                };
            }),
        }));

        // Calcular autores frecuentes (más de 1 libro)
        const authorMap = new Map<string, { count: number; books: string[] }>();
        books.forEach(book => {
            book.authors.forEach(author => {
                if (!authorMap.has(author)) {
                    authorMap.set(author, { count: 0, books: [] });
                }
                const data = authorMap.get(author)!;
                data.count += 1;
                data.books.push(book.title);
            });
        });

        const frequentAuthors = Array.from(authorMap.entries())
            .filter(([_, data]) => data.count > 1)
            .map(([name, data]) => ({
                name,
                count: data.count,
                books: data.books.slice(0, 3),
            }))
            .sort((a, b) => b.count - a.count);

        // Crear o cargar configuración del Rincón de Pichu
        const pichuCornerPath = path.join(OUTPUT_DIR, 'pichu-corner.json');
        let pichuCorner: PichuCorner;

        if (fs.existsSync(pichuCornerPath)) {
            pichuCorner = JSON.parse(fs.readFileSync(pichuCornerPath, 'utf-8'));
            console.log('📝 Rincón de Pichu cargado desde archivo existente');
        } else {
            pichuCorner = {
                featuredBookId: books[0]?.id || '',
                anecdote: 'Este libro tiene una historia especial en nuestra familia...',
                lastUpdated: new Date().toISOString().split('T')[0],
            };
            console.log('📝 Nuevo Rincón de Pichu creado');
        }

        // Estadísticas
        const poeticCategories = {
            recentArrivals: books.filter(b => b.isRecent).length,
            favorites: books.filter(b => b.isFavorite).length,
            travelers: books.filter(b => b.isTraveler).length,
            artBooks: books.filter(b => b.isArtBook).length,
        };

        const stats = {
            totalBooks: books.length,
            totalAuthors: new Set(books.flatMap(b => b.authors)).size,
            booksWithNotes: books.filter(b => b.personalNotes.trim()).length,
            averageRating: books.filter(b => b.rating).length > 0
                ? books.filter(b => b.rating).reduce((acc, b) => acc + (b.rating || 0), 0) /
                books.filter(b => b.rating).length
                : 0,
            booksByCountry: {
                'España': books.filter(b =>
                    b.publisher?.includes('España') ||
                    b.publisher?.match(/Madrid|Barcelona|Santillana|Alfaguara|Kalandraka/i)
                ).length,
                'Costa Rica': books.filter(b =>
                    b.personalNotes.includes('Costa Rica') ||
                    b.publisher?.includes('Costa Rica')
                ).length,
                'Internacional': books.filter(b =>
                    !b.publisher?.match(/España|Madrid|Barcelona|Santillana|Alfaguara|Kalandraka/i)
                ).length,
            },
            poeticCategories,
        };

        // Crear directorio de salida
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
            console.log(`📁 Directorio creado: ${OUTPUT_DIR}`);
        }

        // Guardar archivos
        const processedData: ProcessedData = {
            books,
            ageGroups,
            frequentAuthors,
            pichuCorner,
            stats,
        };

        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'library.json'),
            JSON.stringify(processedData, null, 2)
        );

        fs.writeFileSync(
            pichuCornerPath,
            JSON.stringify(pichuCorner, null, 2)
        );

        console.log('\n✅ DATOS PROCESADOS CORRECTAMENTE');
        console.log('══════════════════════════════════════');
        console.log(`📚 Libros procesados: ${books.length}`);
        console.log(`👥 Autores únicos: ${stats.totalAuthors}`);
        console.log(`🎯 Grupos de edad: ${ageGroups.length}`);
        console.log(`🏆 Autores frecuentes: ${frequentAuthors.length}`);
        console.log('\n📊 CATEGORÍAS POÉTICAS:');
        console.log(`   📦 Recién llegados: ${poeticCategories.recentArrivals}`);
        console.log(`   ⭐ Favoritos: ${poeticCategories.favorites}`);
        console.log(`   ✈️  Viajeros: ${poeticCategories.travelers}`);
        console.log(`   🎨 Libros de arte: ${poeticCategories.artBooks}`);
        console.log(`\n💾 Archivos guardados en: ${OUTPUT_DIR}`);
        console.log('══════════════════════════════════════');

    } catch (error) {
        console.error('❌ ERROR CRÍTICO EN EL PROCESAMIENTO:');
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar
processLibraryData();