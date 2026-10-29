import '../styles/globals.css';
import { Cairo, Readex_Pro } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  variable: '--font-readex',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata = {
  title: 'نظام الحضور والمكافآت الذكي | Smart Attendance System',
  description: 'منظومة إثبات الحضور بالـ GPS والنقاط المرورية والتحفيز التلقائي',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${readex.variable}`}>
      <body className="bg-slate-50 text-slate-900 font-body min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
