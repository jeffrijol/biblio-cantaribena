// src/lib/utils.ts
import { REVEAL_DATE } from './constants';

export function getTimeUntilReveal() {
    const now = new Date();
    const diff = REVEAL_DATE.getTime() - now.getTime();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, hasArrived: true };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        hasArrived: false
    };
}

export function formatTimeUnit(value: number, _unit: string) {
    return `${value.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date, locale = 'es-ES'): string {
    return date.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function getHintForDay(daysLeft: number): string {
    if (daysLeft >= 12) return 'Hay libros que han viajado más que nosotros';
    if (daysLeft >= 6) return 'Algunas ilustraciones guardan secretos en sus trazos';
    if (daysLeft >= 3) return 'Las notas al margen cuentan historias paralelas';
    return 'Cada etiqueta es un recuerdo compartido';
}

export function getPixelLevelForDay(daysLeft: number): number {
    if (daysLeft >= 12) return 8;
    if (daysLeft >= 6) return 6;
    if (daysLeft >= 3) return 4;
    return 2;
}