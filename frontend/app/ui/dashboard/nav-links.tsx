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
import { use } from 'react';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Take Quiz',
    href: '/dashboard/ready-to-do',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Create Quiz', href: '/dashboard/create-quiz', icon: UserGroupIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: WrenchIcon }
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
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
                  'bg-purple-600 text-white hover:bg-purple-700': pathname === link.href,
                }
              )}
            >
              <LinkIcon className="w-5 h-5 mr-3" />
              <p className="hidden md:block">{link.name}</p>
            </Button>

          </Link>
        );
      })}
    </>
  );
}
