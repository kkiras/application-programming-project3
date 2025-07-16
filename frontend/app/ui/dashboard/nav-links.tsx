'use client';
import { Button } from '@/components/ui/button';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  WrenchIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { List } from 'lucide-react';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Take Quiz',
    href: '/dashboard/ready-to-do',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Create Quiz', href: '/dashboard/create-quiz', icon: UserGroupIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: WrenchIcon },
  { name: 'Danh sách câu hỏi', href: '/dashboard/questions-list', icon: List }
];

export default function NavLinks() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link key={link.name} href={link.href}>
              <Button
                variant="ghost"
                className={clsx(
                  'w-full justify-start text-left h-12 text-gray-300 hover:bg-gray-700/50 hover:text-white',
                  {
                    'bg-purple-600 text-white hover:bg-purple-700': isActive,
                  }
                )}
              >
                <LinkIcon className="w-5 h-5 mr-3" />
                <p className="hidden md:block">{link.name}</p>
              </Button>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-left h-12 text-red-400 hover:bg-red-700/50 hover:text-white"
          onClick={handleLogout}
        >
          <HomeIcon className="w-5 h-5 mr-3" />
          <p className="hidden md:block">Logout</p>
        </Button>
      </div>
    </div>
  );
}
