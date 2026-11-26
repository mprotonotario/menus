# 📂 Guía de Configuración: `categories.json`

Este archivo define las **categorías de navegación y filtros** del menú digital (barra horizontal de categorías con iconos).

---

## 📋 Estructura de Cada Categoría

El archivo contiene un arreglo de objetos JSON:

```json
[
  {
    "id": "todos",
    "name": "Todos los Platillos",
    "icon": "✨",
    "description": "Explora nuestra carta completa de cocina tradicional..."
  },
  {
    "id": "huevos",
    "name": "Huevos al Gusto",
    "icon": "🍳",
    "description": "Preparados al momento con huevos de libre pastoreo..."
  }
]
```

### Parámetros de cada categoría:

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`id`** | `string` | `"huevos"`, `"hamburguesas"` | **Identificador único** (en minúsculas, sin espacios ni caracteres especiales). Debe coincidir exactamente con el campo `category` de los platillos en `products.json`.<br>*Nota:* `"todos"` es el filtro universal reservado. |
| **`name`** | `string` | `"Huevos al Gusto"` | Nombre visible en el botón de la barra de categorías. |
| **`icon`** | `string` | `"🍳"`, `"☕"`, `"🍔"` | Emoji representativo mostrado junto al nombre de la categoría. |
| **`description`** | `string` | `"Preparados al momento con..."` | Texto descriptivo que se muestra en el encabezado cuando el usuario selecciona esta categoría. |

---

## 💡 Cómo vincular categorías con productos:
Si creas una nueva categoría con `"id": "pizzas"`, asegúrate de asignar `"category": "pizzas"` a los platillos correspondientes en [data/products.json](file:///c:/Users/Eva%20S%C3%A1mano/Documents/proyectos/menus/data/products.json).
