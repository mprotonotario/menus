# 💳 Guía de Parámetros de Facturación (`data/billing.json`)

Este archivo documenta cada uno de los parámetros que controlan el modelo de negocio, suscripción, cortesías y cobros por adelantado de la plataforma.

---

## 📋 Parámetros Generales de Facturación

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`monthlyFee`** | `number` | `300` | Cuota fija mensual en pesos por el uso de la plataforma y recepción de pedidos. |
| **`currency`** | `string` | `"MXN"` | Moneda de liquidación (ej. `MXN`, `USD`). |
| **`commissionPerOrder`** | `number` | `0` | Comisión por comanda recibida (`0` significa sin comisiones). |
| **`isSuspended`** | `boolean` | `false` | Si es `true`, pausa manualmente los pedidos por WhatsApp y pone la app en modo solo lectura. |
| **`cycleDays`** | `number` | `30` | Duración del ciclo en días (usualmente 30 días). |
| **`graceDays`** | `number` | `5` | Días de tolerancia tras la fecha de apertura antes de pasar a modo solo lectura. |
| **`reminderDaysBefore`** | `number` | `5` | Días de anticipación para activar la ventana de aviso y recordatorio de pago. |
| **`paymentTiming`** | `string` | `"advance"` | `"advance"`: Pagos por adelantado para aperturar el mes de uso de servicio. |

---

## 🎁 Control de Cortesía y Antigüedad en la Plataforma

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`firstMonthFree`** | `boolean` | `true` | `true` si el cliente recibió su primer mes de cortesía gratuito. |
| **`serviceStartDate`** | `string` | `"2026-11-01"` | Fecha inicial en que el cliente se dio de alta en la plataforma (YYYY-MM-DD). |
| **`billingCycleNumber`** | `number` | `2` | Número de mes/ciclo que cursa el cliente (Mes 1 = Cortesía, Mes 2 = 1er Cobro formal con bienvenida, etc.). |
| **`paidMonthsCount`** | `number` | `0` | Contador de meses formalmente cobrados y pagados a la fecha (excluye cortesías). |
| **`nextBillingDate`** | `string` | `"2026-12-01"` | Fecha límite / apertura del próximo ciclo mensual (YYYY-MM-DD). |

---

## 📱 Notificaciones y Contacto

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`billingPhone`** | `string` | `"529831226847"` | Teléfono con código de país del cliente para enviarle el mensaje de WhatsApp. |
| **`whatsappRecipient`** | `string` | `"529831226847"` | Receptor principal de comandas y avisos. |
| **`ownerPin`** | `string` | `"2026"` | PIN numérico para autenticar al dueño en `/admin` y autorizar renovaciones. |
| **`companyName`** | `string` | `"RedaySoft..."` | Nombre de la empresa emisora del software y los recibos. |
| **`supportEmail`** | `string` | `"soporte@..."` | Correo de atención al cliente. |

---

## 🏦 Datos Bancarios SPEI (`paymentInfo`)

| Parámetro | Tipo | Ejemplo | Descripción |
| :--- | :---: | :--- | :--- |
| **`bank`** | `string` | `"BBVA México"` | Banco receptor para las transferencias. |
| **`clabe`** | `string` | `"012180001234567890"` | Cuenta CLABE interbancaria de 18 dígitos. |
| **`beneficiary`** | `string` | `"RedaySoft..."` | Titular de la cuenta. |
| **`reference`** | `string` | `"CAFETERIA-DEMO-01"` | Concepto único para identificar el pago del establecimiento. |
| **`paymentLink`** | `string` | `"https://..."` | Enlace opcional a pasarela de pagos en línea (Stripe/Mercado Pago). |
| **`enablePaymentLink`** | `boolean` | `false` | `false` = Solo transferencia SPEI; `true` = Muestra botón de pago con tarjeta. |
