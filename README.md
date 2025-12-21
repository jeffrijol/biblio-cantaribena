# 🎄 Biblioteca Cantaribeña - Cuenta Atrás

Este es el proyecto de cuenta atrás para la **Biblioteca Cantaribeña**, un regalo especial que se construye con historias y se revelará el Día de Reyes (6 de enero).

## ✨ Características

- **Diseño Premium**: Estética cuidada con tipografía elegante (`Playfair Display`, `Inter`, `Cormorant Garamond`).
- **Interactividad**: Efecto de nieve dinámico, animaciones de paso de página y pistas que se revelan al interactuar con el temporizador.
- **Pistas Pixeladas**: Libros secretos que se van "enfocando" a medida que se acerca la fecha de revelación.
- **Astro 5**: Construido con las últimas tecnologías de Astro para un rendimiento óptimo.

## 🚀 Estructura del Proyecto

```text
/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes UI y específicos de la cuenta atrás
│   ├── data/            # Contenido y configuración de pistas (JSON)
│   ├── layouts/         # Estructuras de página base
│   ├── lib/             # Utilidades y constantes (lógica del tiempo)
│   ├── pages/           # Páginas y endpoints de API
│   └── styles/          # Hojas de estilo globales
├── astro.config.mjs     # Configuración de Astro
└── package.json         # Dependencias y scripts
```

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto usando `pnpm`:

| Comando | Acción |
| :--- | :--- |
| `pnpm install` | Instala las dependencias necesarias |
| `pnpm dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Construye el sitio para producción en `./dist/` |
| `pnpm preview` | Previsualiza la construcción localmente |
| `pnpm astro check` | Verifica los tipos y el estado del código |
| `pnpm format` | Formatea el código usando Prettier |

## 🛠️ Tecnologías

- **Framework**: [Astro 5](https://astro.build/)
- **Iconos**: [@lucide/astro](https://lucide.dev/)
- **Estilos**: CSS nativo con variables y animaciones modernas.
- **Fuentes**: Google Fonts (Playfair Display, Inter, Cormorant Garamond).

---
Con cariño, para la familia Cantaribeña. ✨
