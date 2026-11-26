# 📞 Guía de Configuración: `contact.json`

Este archivo centraliza los **teléfonos de recepción de pedidos, botón flotante de WhatsApp, redes sociales, métodos de pago y costo de envío a domicilio**.

---

## 📱 Contacto y Recepción de Pedidos (`contact`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`phoneDisplay`** | `string` | `"+52 983 122 6847"` | Número formateado visible para humanos en la web. |
| **`phoneCall`** | `string` | `"+529831226847"` | Número telefónico para el enlace `tel:` de llamadas directas. |
| **`whatsappNumber`** | `string` | `"529831226847"` | **Número de WhatsApp de la cafetería** (código de país + número, sin signos `+` ni espacios). Aquí es a donde **llegan las comandas estructuradas** del carrito. |
| **`whatsappButtonText`** | `string` | `"Probar Pedido por WhatsApp"` | Texto del botón de contacto directo por WhatsApp. |
| **`whatsappDefaultMessage`** | `string` | `"Hola, me gustaría solicitar información..."` | Mensaje inicial precargado cuando un cliente presiona el botón general de WhatsApp. |
| **`email`** | `string` | `"demo@menudigital.com"` | Correo electrónico de contacto del establecimiento. |

---

## 🌐 Redes Sociales (`socials`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`instagram`** | `string` | `"https://instagram.com/..."` | URL del perfil de Instagram del negocio. |
| **`facebook`** | `string` | `"https://facebook.com/..."` | URL de la página de Facebook. |
| **`tiktok`** | `string` | `"https://tiktok.com/@..."` | URL del canal de TikTok. |

---

## 💳 Formas de Pago Permitidas (`paymentConfig`)

Opciones que el cliente puede seleccionar al finalizar su orden en el carrito:
- **`allowCash`** (`boolean`): Habilita la opción de pago en **Efectivo** (al recoger o contra entrega).
- **`allowTransfer`** (`boolean`): Habilita la opción de pago vía **Transferencia SPEI**.

---

## 🛵 Costo y Configuración de Envío a Domicilio (`deliveryConfig`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`enabled`** | `boolean` | `true` | Habilita o deshabilita la modalidad "A Domicilio" en el carrito. |
| **`deliveryFee`** | `number` | `50` | **Monto extra en pesos por el costo de envío**. Cuando el cliente selecciona "A Domicilio", este monto se suma automáticamente al desglose del total a pagar. |
| **`label`** | `string` | `"Envío a domicilio"` | Etiqueta visible del concepto en el desglose del total. |
