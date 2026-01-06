# Guía para Probar el Portal de Transición

## 📍 Acceso Rápido

### Método 1: Página de Prueba (Recomendado)
Navega a: **http://localhost:4321/test-portal**

Esta página te permite:
- ✨ Mostrar el portal instantáneamente (botón "Mostrar Portal")
- 🔄 Resetear el estado para verlo múltiples veces (botón "Resetear Estado")
- Sin necesidad de manipular fechas ni localStorage manualmente

### Método 2: Usar la Consola del Navegador
Si estás en la página principal (http://localhost:4321):

1. Abre la consola del navegador (F12 o Ctrl+Shift+I)
2. Ejecuta este comando para limpiar el localStorage:
   ```javascript
   localStorage.removeItem('portalShown')
   ```
3. Cambia temporalmente la fecha de revelación en `/src/lib/constants.ts`:
   ```typescript
   // Cambiar de:
   export const REVEAL_DATE = new Date('2026-01-06T00:00:00');
   
   // A una fecha en el pasado, por ejemplo:
   export const REVEAL_DATE = new Date('2025-01-01T00:00:00');
   ```
4. El portal debería aparecer automáticamente
5. **IMPORTANTE**: Recuerda restaurar la fecha correcta después de las pruebas

### Método 3: Forzar Aparición Manual
En cualquier página que incluya el portal, ejecuta en la consola:
```javascript
const portal = document.getElementById('transitionPortal');
portal.style.display = 'block';
setTimeout(() => portal.classList.add('visible'), 100);
```

## ✅ Cambios Realizados

### Diseño del Libro-Regalo
- ✅ Ahora usa la imagen `library-cover.svg` en lugar del diseño con cintas y moño
- ✅ El libro tiene un efecto de brillo (glow) dorado que pulsa suavemente
- ✅ Mantiene la animación de flotación

### Mensaje
- ✅ Actualizado a: "¡Sus Majestades han llegado con una sorpresa increíble! Han dejado estos cuentos cantaribeños para que los disfrutes."

### Audio
- ✅ Eliminado completamente el efecto de sonido

### Efectos Visuales que Permanecen
- ⭐ Estrella de Oriente parpadeante
- 🌟 Campo de estrellas de fondo
- 💫 Estrella fugaz ocasional
- ✨ Partículas de brillo mágico alrededor del libro
- 📚 Portadas flotantes de libros
- 🎊 Explosión de confetti al aparecer
- 👑 Imagen de fondo de los Reyes Magos

## 🎨 Personalización Adicional

Si quieres ajustar algo más:

### Cambiar la fecha de revelación oficial
Editar: `src/lib/constants.ts`
```typescript
export const REVEAL_DATE = new Date('2026-01-06T00:00:00');
```

### Modificar el tamaño del libro
Editar: `src/components/TransitionPortal.astro` (sección CSS)
```css
.magic-book-gift {
    width: 280px;  /* Ajustar aquí */
    height: 420px; /* Ajustar aquí */
}
```

### Cambiar el color del brillo
Editar: `src/components/TransitionPortal.astro` (sección CSS)
```css
.gift-glow {
    background: radial-gradient(
        circle, 
        rgba(255, 183, 3, 0.4) 0%,  /* Color dorado, cambiar aquí */
        transparent 70%
    );
}
```

## 🐛 Solución de Problemas

**El portal no aparece:**
- Revisa que el servidor esté corriendo (`pnpm run dev`)
- Limpia el caché del navegador (Ctrl+Shift+Delete)
- Verifica la consola del navegador por errores
- Asegúrate de que `localStorage.getItem('portalShown')` no sea `'true'`

**El portal aparece pero no se ve bien:**
- Asegúrate de que el archivo `library-cover.svg` existe en `/public/images/`
- Verifica que no haya errores de CSS en la consola
- Prueba en otro navegador

**Quiero resetear todo:**
```javascript
localStorage.clear();
location.reload();
```
