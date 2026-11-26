# 🎨 Guía de Configuración: `brand.json`

Este archivo define la **identidad visual, nombres comerciales, textos de portada (Hero), logo y títulos principales** de la plataforma.

---

## 📋 Parámetros de Marca (`brand`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`name`** | `string` | `"Cafetería Demo"` | Nombre principal del establecimiento mostrado en la barra superior, encabezados y mensajes. |
| **`title`** | `string` | `"Café Demo"` | Título corto de la marca. |
| **`subtitle`** | `string` | `"Menú Digital & Pedidos Online"` | Subtítulo visible en la cabecera del sitio. |
| **`footerSubtitle`** | `string` | `"Demostración de Menú Digital"` | Leyenda descriptiva ubicada en el pie de página. |
| **`logo`** | `string` | `"assets/config/cafeteria.png"` | Ruta relativa de la imagen del logotipo. Soporta formatos `.png`, `.jpg`, `.jpeg`, `.webp` y `.svg`. |

---

## 🌟 Parámetros del Banner Principal (`hero`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`badgeIcon`** | `string` | `"✨"` | Emoji o icono de la píldora superior del hero. |
| **`badgeText`** | `string` | `"Demostración Interactiva • Menú Digital"` | Texto de bienvenida en la píldora superior. |
| **`titleHtml`** | `string` | `"Sabor de hogar, <br>aroma a <span class=\"highlight\">recién molido</span>."` | Título del banner con soporte para saltos `<br>` y destacados con clase CSS `highlight`. |
| **`title`** | `string` | `"Sabor de hogar..."` | Versión en texto plano del título principal (usado en lectores de pantalla y meta tags). |
| **`subtitle`** | `string` | `"Demostración en vivo de pedidos por WhatsApp..."` | Párrafo introductorio bajo el título principal. |
| **`btnPrimaryText`** | `string` | `"Explorar Menú Demo"` | Texto del botón primario que desplaza hacia el catálogo de platillos. |
| **`btnSecondaryText`** | `string` | `"Especialidades del Día"` | Texto del botón secundario que abre la sección de especiales. |
| **`luxuryPills`** | `array` | `[{ "icon": "☕", "title": "Café de Finca", "subtitle": "Chiapas & Oaxaca" }]` | Píldoras flotantes con iconos, títulos y subtítulos promocionales. |

---

## 🍽️ Sección del Catálogo (`menuSection`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`pretitle`** | `string` | `"— NUESTRO MENÚ DEMO"` | Etiqueta pequeña superior sobre el catálogo. |
| **`titleHtml`** | `string` | `"Sabores para disfrutar <br /><em>en cada</em> momento."` | Título estilizado del catálogo con etiquetas HTML. |
| **`title`** | `string` | `"Sabores para disfrutar en cada momento."` | Título plano alternativo. |
| **`description`** | `string` | `"Café, bebidas y alimentos preparados..."` | Párrafo explicativo debajo del título del menú. |
| **`menuSubtitle`** | `string` | `"Café, bebidas y alimentos preparados..."` | Subtítulo configurable del menú. |
