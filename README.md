# ☕ Cafetería María Bonita — Menú Digital Interactivo (Next.js + Docker)

Una aplicación web moderna, accesible y modular desarrollada en **Next.js 14**, **React** y empaquetada con **Docker**, diseñada para **Cafetería María Bonita** (*"Sabor de hogar, aroma a recién molido"*).

---

## 🚀 Inicio Rápido

### Opción 1: Ejecutar con Docker (Recomendado)

Asegúrate de tener Docker instalado y ejecutándose:

```bash
# Construir e iniciar el contenedor en segundo plano
docker compose up -d --build

# Ver logs del contenedor
docker compose logs -f

# Detener el contenedor
docker compose down
```

La aplicación estará disponible inmediatamente en: **`http://localhost:3000`**

---

### Opción 2: Ejecutar en Desarrollo Local con Node.js

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción localmente
npm run build
npm start
```

---

## 🏗️ Arquitectura Modular en Next.js

La aplicación está dividida en componentes limpios y reutilizables dentro de `src/`:

```
menus/
├── Dockerfile                   # Construcción multi-stage ligera en Node.js 20 Alpine
├── docker-compose.yml           # Orquestación lista para producción (Puerto 3000)
├── .dockerignore                # Archivos omitidos del build de Docker
├── next.config.js               # Standalone output optimizado para contenedores
├── package.json                 # Dependencias (Next.js 14, React 18)
├── public/                      # Archivos estáticos y branding
│   └── assets/
│       └── redaysoft-badge.png  # Badge de la empresa desarrolladora
└── src/
    ├── app/
    │   ├── layout.jsx           # Layout raíz con metadata, viewport y Google Fonts
    │   ├── page.jsx             # Vista principal que orquesta los componentes
    │   └── globals.css          # Sistema de diseño, animaciones y CSS responsivo
    ├── components/
    │   ├── Header.jsx           # Barra de aviso en vivo, logo, navegación y drawer móvil
    │   ├── Hero.jsx             # Portada editorial con escenario 3D flotante dinámico
    │   ├── Specials.jsx         # Especialidades destacadas del día
    │   ├── MenuCatalog.jsx      # Catálogo interactivo agrupado por subcategorías
    │   ├── DishCard.jsx         # Tarjeta de platillo gourmet con estilo editorial (4 columnas)
    │   ├── DishDetailModal.jsx  # Modal de personalización de ingredientes y notas
    │   ├── CartDrawer.jsx       # Drawer de comanda, propina y generador de pedido a WhatsApp
    │   ├── AboutSection.jsx     # Historia y métricas de la cafetería
    │   ├── LocationSection.jsx  # Ubicación, mapa Google y horario en vivo
    │   ├── Footer.jsx           # Pie de página y enlace a https://redaysoft.com
    │   └── Toast.jsx            # Notificaciones flotantes
    ├── context/
    │   └── CartContext.jsx      # Estado global del carrito y sincronización con localStorage
    └── data/
        └── menuData.js          # Base de datos local: BUSINESS_DATA, MENU_CATEGORIES y MENU_ITEMS
```

---

## 📦 Base de Datos Dinámica (`src/data/menuData.js`)

Todos los datos se administran de manera centralizada desde `src/data/menuData.js`:
- **Subcategorías:**
  - 🍳 *Huevos al Gusto*
  - 🍔 *Hamburguesas & Sandwiches*
  - 🥤 *Jugos & Bebidas Naturales*
  - ☕ *Café (Caliente)*
  - 🧊 *Bebidas Frías & Frappés*
  - 🥗 *Crepas & Antojos Salados*
  - 🥐 *Panadería Artesanal & Waffles*
  - 🍰 *Postres & Dulce Tradición*
  - 🎁 *Combos & Paquetes*
- **Configuración del Negocio (`BUSINESS_DATA`):**
  - Horarios con cálculo automático en vivo de *Abierto/Cerrado* (`computeLiveBusinessStatus`).
  - Teléfono, WhatsApp, enlaces de redes sociales y dirección en Chetumal, Quintana Roo.
  - Textos de portada e información de marca.

---

## 💻 Desarrollado por
Plataforma creada y diseñada por [RedaySoft.com](https://redaysoft.com).
