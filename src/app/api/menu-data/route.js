import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function readJsonFile(filename, fallback) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error al leer data/${filename}:`, err.message);
  }
  return fallback;
}

export async function GET() {
  try {
    const categories = readJsonFile('categories.json', []);
    const products = readJsonFile('products.json', []);
    const brand = readJsonFile('brand.json', {});
    const location = readJsonFile('location.json', {});
    const contact = readJsonFile('contact.json', {});
    const about = readJsonFile('about.json', {});
    const billing = readJsonFile('billing.json', {});

    // Reconstruir BUSINESS_DATA modularizado
    const businessData = {
      brand: brand.brand || {},
      logo: brand.logo || brand.brand?.logo || '',
      hero: brand.hero || {},
      name: brand.name || brand.brand?.name || 'Cafetería Demo',
      tradeName: brand.tradeName || brand.brand?.tradeName || 'Cafetería Demo • Menú Digital',
      slogan: brand.slogan || brand.brand?.slogan || '',
      subheadline: brand.subheadline || brand.brand?.subheadline || '',
      location: location.location || {},
      mapPin: location.mapPin || {},
      hours: location.hours || [],
      scheduleStatus: location.scheduleStatus || { mode: 'auto' },
      topNotice: location.topNotice || {},
      contact: contact.contact || {},
      socials: contact.socials || {},
      paymentConfig: contact.paymentConfig || { allowTransfer: true, allowCash: true },
      deliveryConfig: contact.deliveryConfig || location.deliveryConfig || { deliveryFee: 35, enabled: true },
      menuSection: brand.menuSection || {
        pretitle: '— NUESTRO MENÚ',
        titleHtml: 'Sabores para disfrutar <br /><em>en cada</em> momento.',
        title: 'Sabores para disfrutar en cada momento.',
        description: brand.menuSubtitle || 'Café, bebidas y alimentos preparados para acompañar cada visita a María Bonita.',
      },
      menuSubtitle: brand.menuSubtitle || brand.menuSection?.description || 'Café, bebidas y alimentos preparados para acompañar cada visita a María Bonita.',
      stats: about.stats || [],
      platformBilling: billing,
    };

    const cafeInfo = {
      ...businessData,
      phone: businessData.contact?.phoneDisplay,
      whatsapp: businessData.contact?.whatsappNumber,
      whatsappDisplay: businessData.contact?.phoneDisplay,
      email: businessData.contact?.email,
      address: businessData.location?.address,
      reference: businessData.location?.reference,
      hours: businessData.hours,
      stats: businessData.stats,
      socials: businessData.socials,
    };

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        categories,
        products,
        businessData,
        cafeInfo,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al cargar datos dinámicos del menú',
      },
      { status: 500 }
    );
  }
}
