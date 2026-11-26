# 📖 Guía de Configuración: `about.json`

Este archivo contiene las métricas, estadísticas e historia de la cafetería que se muestran en la sección **"Sobre Nosotros / Historia"** del Menú Digital.

---

## 📊 Estructura de `stats`

El archivo define un arreglo de objetos en la propiedad `stats`. Cada tarjeta representa un logro o métrica destacada:

```json
{
  "stats": [
    {
      "number": "+12",
      "label": "Años de Tradición",
      "desc": "Conservando las recetas de la abuela"
    }
  ]
}
```

### Parámetros de cada métrica:

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`number`** | `string` | `"+12"`, `"100%"`, `"4.9★"` | Cifra o porcentaje en tipografía grande destacada. |
| **`label`** | `string` | `"Años de Tradición"` | Título corto de la estadística. |
| **`desc`** | `string` | `"Conservando las recetas..."` | Breve explicación o subtítulo descriptivo debajo de la cifra. |

---

## 💡 Recomendaciones
- Puedes agregar 3 o 4 tarjetas para mantener el balance visual en la cuadrícula tanto en móvil como en escritorio.
