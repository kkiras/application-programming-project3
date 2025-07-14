import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';

export default function SideNav() {
  return (
    <div className='fixed top-0 left-0 h-full pb-16 w-64 bg-gray-800/50 border-r border-purple-500/30 backdrop-blur-sm'>
      <div className='mt-6 h-full'>
        <div className=''>

        </div>

        <nav className='h-full'>
          <NavLinks />
        </nav>
      </div>

    </div>
  );
}
