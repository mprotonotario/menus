# 🍲 Guía de Configuración: `products.json`

Este archivo contiene el **catálogo completo de platillos, bebidas, precios, fotografías y modificadores personalizables** del Menú Digital.

---

## 📋 Estructura de Cada Platillo

Cada producto en el arreglo contiene los siguientes atributos:

```json
{
  "id": "huev-1",
  "category": "huevos",
  "name": "Huevos con Jamón de Pavo",
  "shortDescription": "Dos huevos revueltos con jamón de pavo selecto...",
  "description": "Huevos frescos de rancho revueltos suavemente...",
  "price": 85,
  "badge": "Favorito",
  "tags": ["Favorito", "Desayuno", "Huevos"],
  "image": "https://images.unsplash.com/...",
  "calories": "340 kcal",
  "prepTime": "8 min",
  "customizable": true,
  "options": {
    "preparacion": ["Revueltos tiernos", "Estrellados"],
    "tortillas": ["Tortillas de Maíz", "Pan Tostado"],
    "extras": [
      { "name": "Porción de aguacate hass fresco", "price": 18 }
    ]
  }
}
```

### Parámetros Principales:

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`id`** | `string` | `"huev-1"`, `"burg-2"` | Identificador único del producto en el catálogo. |
| **`category`** | `string` | `"huevos"` | Categoría a la que pertenece. Debe coincidir con el `id` en `categories.json`. |
| **`name`** | `string` | `"Huevos con Jamón"` | Nombre del platillo mostrado en la tarjeta y en la comanda. |
| **`price`** | `number` | `85` | **Precio base en pesos** del platillo. |
| **`shortDescription`** | `string` | `"Dos huevos revueltos..."` | Descripción corta visible en la tarjeta del catálogo. |
| **`description`** | `string` | `"Huevos frescos de rancho..."` | Descripción extendida visible en el modal de detalle del platillo. |
| **`image`** | `string` | `"https://..."` o `"assets/..."` | URL o ruta de la fotografía del platillo. |
| **`badge`** | `string` | `"Favorito"`, `"Nuevo"`, `null` | Insignia destacada en la esquina superior de la foto. |
| **`tags`** | `array` | `["Desayuno", "Huevos"]` | Etiquetas para búsquedas y filtros rápidos. |
| **`prepTime`** | `string` | `"8 min"` | Tiempo estimado de preparación mostrado en el modal. |
| **`calories`** | `string` | `"340 kcal"` | Información calórica opcional. |
| **`customizable`**| `boolean` | `true` / `false` | `true` si el platillo tiene opciones seleccionables antes de agregar al carrito. |

---

## 🛠️ Modificadores y Opciones (`options`)

Permite que el comensal elija términos de cocción, complementos o ingredientes con costo extra:
- **Listas de selección simple:** (ej. `"preparacion"`, `"tortillas"`, `"leche"`). El comensal elige una opción.
- **`extras` con precio:** Arreglo de objetos con `"name"` y `"price"`. Si el cliente los marca, el precio extra se suma automáticamente al precio del platillo en el carrito.
