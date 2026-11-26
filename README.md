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

La aplicación estará disponible inmediatamente en: **`http://localhost:3003`**

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
├── data/                        # Configuración y datos desacoplados en archivos JSON
│   ├── brand.json               # Identidad de marca, logo, hero, títulos
│   ├── products.json            # Catálogo de platillos, precios, imágenes, opciones
│   ├── categories.json          # Categorías y filtros del menú
│   ├── billing.json             # Suscripción mensual, cuota, cortesía, pagos por adelantado
│   ├── location.json            # Horarios, estado abierto/cerrado, dirección, mapas
│   ├── contact.json             # WhatsApp, teléfonos, delivery y métodos de pago
│   └── about.json               # Historia, valores y estadísticas
└── src/
    ├── app/
    │   ├── layout.jsx           # Layout raíz con metadata, viewport y Google Fonts
    │   ├── page.jsx             # Vista principal que orquesta los componentes
    │   ├── admin/page.jsx       # Panel de control de facturación y comandas
    │   └── globals.css          # Sistema de diseño, animaciones y CSS responsivo
    ├── components/              # Componentes de UI (Header, Hero, Specials, etc.)
    ├── context/                 # Contextos de React (MenuDataContext, CartContext)
    └── utils/                   # Utilidades puras (formatUtils, scheduleUtils, orderStorage)
```

---

## 📦 Base de Datos y Configuración Modular (`/data/*.json`)

Todos los datos se administran de manera directa y desacoplada desde los archivos JSON en `/data`:
- **`data/brand.json`**: Nombre del negocio, logo, título, subtítulos y copy del banner principal.
- **`data/products.json`**: Catálogo completo de platillos, precios, imágenes y modificadores.
- **`data/categories.json`**: Categorías del menú y etiquetas.
- **`data/billing.json`**: Configuración de facturación (cuota mensual, primer mes gratis, ciclo de cobro por adelantado, cuenta SPEI).
- **`data/location.json`**: Horarios comerciales, modo manual/automático y ubicación.
- **`data/contact.json`**: Costo de envío a domicilio, número de WhatsApp para comandas y formas de pago.
- **`data/about.json`**: Métricas y datos de la empresa.

---

## 💻 Desarrollado por
Plataforma creada y diseñada por [RedaySoft.com](https://redaysoft.com).
