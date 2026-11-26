import './globals.css';
import { MenuDataProvider } from '../context/MenuDataContext';
import { CartProvider } from '../context/CartContext';
import VisitorTracker from '../components/VisitorTracker';
import brandData from '../../data/brand.json';

export const metadata = {
  title: `${brandData.brand?.name || brandData.name || 'Cafetería Demo'} | Menú Digital & Pedidos Online`,
  description:
    brandData.hero?.subtitle ||
    brandData.subheadline ||
    'Disfruta de café de especialidad, bebidas y platillos preparados con pedidos por WhatsApp.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <VisitorTracker />
        <MenuDataProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </MenuDataProvider>
      </body>
    </html>
  );
}
