# 📍 Guía de Configuración: `location.json`

Este archivo controla la **dirección física, mapa interactivo de Google, horarios comerciales y el estado automático/manual de Abierto o Cerrado**.

---

## 🗺️ Dirección y Textos de Ubicación (`location`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`address`** | `string` | `"Av. Álvaro Obregón #168, Col. Centro..."` | Dirección completa mostrada en la barra de recolección y encabezado. |
| **`reference`** | `string` | `"A dos cuadras del Boulevard Bahía..."` | Referencia física para orientar al cliente. |
| **`directionsUrl`** | `string` | `"https://www.google.com/maps/dir/..."` | Enlace que abre Google Maps con la ruta GPS calculada hacia el establecimiento. |
| **`mapEmbedQuery`** | `string` | `"Av. Álvaro Obregón 168, Centro, Chetumal"` | Búsqueda usada para renderizar el mapa interactivo en la web. |

---

## ⏰ Horarios Comerciales (`hours`)

Lista de bloques de horarios semanales:

```json
{
  "days": "Lunes a Jueves",
  "time": "06:00 am - 10:00 pm",
  "open": "06:00",
  "close": "22:00",
  "dayIndices": [1, 2, 3, 4]
}
```

- **`days`**: Texto legible para el cliente (ej. `"Lunes a Jueves"`).
- **`time`**: Rango de horario en formato am/pm legible (ej. `"06:00 am - 10:00 pm"`).
- **`open`** / **`close`**: Horas en formato 24 horas (`"HH:MM"`) para el cálculo automático en vivo.
- **`dayIndices`**: Días de la semana que aplica este horario (`0` = Domingo, `1` = Lunes, `2` = Martes, ..., `6` = Sábado).

---

## 🟢 Modo Abierto / Cerrado (`scheduleStatus`)

| Parámetro | Valores | Descripción |
| :--- | :---: | :--- |
| **`mode`** | `"auto"` \| `"open"` \| `"closed"` | • `"auto"`: Calcula automáticamente el estado según la hora y día actual.<br>• `"open"`: Fuerza el estado a **Abierto Ahora** sin importar el reloj.<br>• `"closed"`: Fuerza el estado a **Cerrado Temporalmente**. |
| **`openBadgePrefix`** | `string` | Prefijo de la píldora verde cuando está abierto (ej. `"Abierto Hoy:"`). |
| **`closedBadgePrefix`** | `string` | Prefijo de la píldora cuando está cerrado (ej. `"Cerrado Ahora"`). |
