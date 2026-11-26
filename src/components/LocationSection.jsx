'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';
import { isScheduleForDay } from '../utils/scheduleUtils';

export default function LocationSection() {
  const { businessData: BUSINESS_DATA } = useMenuData();
  const brand = BUSINESS_DATA.brand || {};
  const location = BUSINESS_DATA.location || {};
  const contact = BUSINESS_DATA.contact || {};
  const hours = BUSINESS_DATA.hours || [];
  const mapData = BUSINESS_DATA.mapPin || BUSINESS_DATA.map || {};

  const currentDayOfWeek = new Date().getDay();

  return (
    <section className="contact-section" id="contacto">
      <div className="container">
        <div className="location-layout-grid">
          {/* Columna Izquierda: Información Editorial, Datos y Botones */}
          <div className="location-info-col">
            <span className="location-pretitle" id="locationPretitle">— NUESTRA UBICACIÓN</span>
            <h2 className="location-heading" id="locationHeading">
              Ven a disfrutar<br />
              <em>un momento bonito.</em>
            </h2>
            <p className="location-lead" id="locationLead">
              {brand.name || 'María Bonita'} te espera en {location.cityZone || 'el Centro de Chetumal, Quintana Roo'}.
            </p>
            <p className="location-desc" id="locationDesc">
              Visítanos, conoce nuestro espacio, descubre nuestros rincones y disfruta una taza de café en un ambiente
              cálido y lleno de encanto.
            </p>

            <div className="location-feature-list">
              {/* Item 1: Dirección */}
              <div className="location-feature-item">
                <div className="location-feature-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="location-feature-content">
                  <h4 id="contactAddressTitle">{location.addressTitle || 'Dirección'}</h4>
                  <p id="locationAddressLine1">{location.address || 'Av. Álvaro Obregón #168, Col. Centro'}</p>
                  <p id="locationAddressLine2">{location.cityZone || '77000 Chetumal, Quintana Roo'}</p>
                </div>
              </div>

              {/* Item 2: Horario */}
              <div className="location-feature-item">
                <div className="location-feature-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="location-feature-content">
                  <h4 id="contactHoursTitle">{location.hoursTitle || 'Horario'}</h4>
                  <div className="location-hours-rows" id="locationHoursRows">
                    {hours.map((h, idx) => {
                      const isToday = isScheduleForDay(h, currentDayOfWeek);
                      return (
                        <div key={idx} className={`location-hour-row ${isToday ? 'is-today' : ''}`}>
                          <span>{h.days}:</span> <strong>{h.time}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Item 3: Pedidos y Contacto */}
              <div className="location-feature-item">
                <div className="location-feature-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <div className="location-feature-content">
                  <h4 id="contactSectionTitle">Pedidos y contacto</h4>
                  <p id="locationContactPrompt">
                    {location.contactPrompt || 'Escríbenos por WhatsApp para realizar tu pedido.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="location-actions">
              <a
                id="locationDirectionsBtn"
                href={
                  mapData.directionsUrl ||
                  'https://www.google.com/maps/dir/?api=1&destination=Av.+Alvaro+Obregon+168,+Centro,+Chetumal,+Quintana+Roo'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-location-directions"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                <span>Cómo llegar</span>
              </a>
              <a
                id="locationContactBtn"
                href={`https://wa.me/${contact.whatsappRaw || '529831226847'}?text=Hola%20María%20Bonita,%20quisiera%20hacer%20un%20pedido`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-location-contact"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Contáctanos</span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta con Mapa Profesional e Insignia Flotante */}
          <div className="location-map-col">
            <div className="location-map-wrapper">
              {/* Mapa Interactivo de Google Maps */}
              <iframe
                id="locationMapIframe"
                className="location-map-iframe"
                src={
                  mapData.embedUrl ||
                  'https://maps.google.com/maps?q=Av.+Alvaro+Obregon+168,+Centro,+Chetumal,+Quintana+Roo&t=&z=16&ie=UTF8&iwloc=&output=embed'
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Cafetería María Bonita en Google Maps"
              ></iframe>

              {/* Insignia Flotante Estilo María Bonita */}
              <div className="map-floating-store-card">
                <div className="store-card-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <div className="store-card-text">
                  <span className="store-card-kicker" id="mapCardStoreKicker">TE ESPERAMOS EN</span>
                  <strong className="store-card-name" id="mapCardStoreName">{brand.name || 'María Bonita'}</strong>
                  <span className="store-card-desc" id="mapCardStoreDesc">Café · Historia · Experiencia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
