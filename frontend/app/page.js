'use client';

import { AuthContextProvider } from '@/components/auth/AuthContext';
import { Header } from '@/components/ui/Header';
import PrivateSection from '@/components/ui/Private';

export default function Home() {
    return (
        <AuthContextProvider>
            <main className='flex flex-col justify-center items-center min-h-[100svh] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'>
                <Header />
                <PrivateSection />
            </main>
        </AuthContextProvider>
    );
}
