import '@rainbow-me/rainbowkit/styles.css';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers.jsx';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
