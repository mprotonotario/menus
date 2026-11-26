'use client';

import { useEffect, useRef } from 'react';

/**
 * Componente silencioso en segundo plano que notifica la entrada
 * de un visitante para registrar su IP pública, fecha, hora y dispositivo en el archivo .log
 */
export default function VisitorTracker() {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    try {
      const currentPath = window.location.pathname || '/';
      // Despacho no bloqueante
      fetch('/api/visitors/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath }),
        keepalive: true,
      }).catch(() => {
        // Silencioso para no interferir con la navegación del usuario
      });
    } catch (e) {
      // Ignorar errores en cliente
    }
  }, []);

  return null;
}
