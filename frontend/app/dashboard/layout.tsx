'use client';
import { usePathname } from 'next/navigation';
import SideNav from '@/app/ui/dashboard/sidenav';
import BackgroundMusic from '@/components/music/BackgroundMusic';
import { UserSettingsProvider } from '../context/UserSettingContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathName = usePathname();
    const isTakeQuizPage = pathName.startsWith('/dashboard/ready-to-do/take-quiz');
    return (
        <UserSettingsProvider>
            <BackgroundMusic />
            {!isTakeQuizPage ? (
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800">
                    <div className="w-full flex-none md:w-64">
                        <SideNav />
                    </div>
                    <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>

                </div>
            ) : (
                <div>
                    {children}
                </div>

            )}
        </UserSettingsProvider>

    );
}