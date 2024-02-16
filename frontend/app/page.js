'use client';

import { AuthContextProvider } from '@/components/auth/AuthContext';
import { Doctor } from '@/components/ui/Doctor';
import { Header } from '@/components/ui/Header';
import { Patient } from '@/components/ui/Patient';
import { Pharmacy } from '@/components/ui/Pharmacy';

export default function Home() {
    return (
        <AuthContextProvider>
            <main className='flex flex-col justify-center items-center h-14 bg-gradient-to-r from-violet-500 to-fuchsia-500 min-h-screen text-white'>
                <Header />
                <Patient />
                <Doctor />
                <Pharmacy />
            </main>
        </AuthContextProvider>
    );
}
