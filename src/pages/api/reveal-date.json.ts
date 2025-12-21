// src/pages/api/reveal-date.json.ts
import type { APIRoute } from 'astro';
import { REVEAL_DATE } from '../../lib/constants';

export const GET: APIRoute = () => {
    const now = new Date();
    const diff = REVEAL_DATE.getTime() - now.getTime();

    const data = {
        revealDate: REVEAL_DATE.toISOString(),
        now: now.toISOString(),
        timeUntilReveal: {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            totalSeconds: Math.floor(diff / 1000)
        },
        hasArrived: diff <= 0
    };

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
        }
    });
};