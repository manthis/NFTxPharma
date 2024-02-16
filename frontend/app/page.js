'use client';

import { AuthContextProvider } from '@/components/auth/AuthContext';
import Content from '@/components/ui/Content';
import { Header } from '@/components/ui/Header';

export default function Home() {
    return (
        <AuthContextProvider>
            <main className='flex justify-center items-center h-14 bg-gradient-to-r from-violet-500 to-fuchsia-500 min-h-screen text-white'>
                <Header />
                <Content />
            </main>
        </AuthContextProvider>
    );
}
