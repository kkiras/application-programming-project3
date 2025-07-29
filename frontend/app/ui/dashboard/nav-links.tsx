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
import { List, User } from 'lucide-react';
import { useUserSettings } from '@/app/context/UserSettingContext';
import { Card } from '@/components/ui/card';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

const links = [
  { name: 'Trang chủ', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Làm bài',
    href: '/dashboard/ready-to-do',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Tạo câu hỏi', href: '/dashboard/create-quiz', icon: UserGroupIcon },
  { name: 'Cài đặt', href: '/dashboard/settings', icon: WrenchIcon },
  { name: 'Danh sách câu hỏi', href: '/dashboard/questions-list', icon: List }
];

export default function NavLinks() {
  const pathname = usePathname();
  const emptyAvatar = null

  const { settings: userSettings, setSettings } = useUserSettings();

  const handleLogout = async () => {
    // setSettings(null);
    localStorage.removeItem('userSettings');
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center mb-6 mt-4">
        <img src="/web-logo.png" alt="" style={{ width: '84px', height: '84px' }} />
        <p className="text-white font-medium text-3xl mt-1">Q u i z z e r</p>

      </div>
      <div className='bg-gray-700 h-0.5 ml-4 mr-4 mb-6'></div>
      <Card className='mr-4 ml-4 mb-6 p-3 bg-gray-700/50 border-purple-500/30'>
        <div className='flex items-center gap-4'>
          {(userSettings?.personal_inf.avatar_url) ? (
            <Avatar className="w-16 h-16 rounded-full overflow-hidden">
              <AvatarImage
                src={userSettings?.personal_inf.avatar_url}
                key={userSettings?.personal_inf.avatar_url}
                alt=""
              />
              <AvatarFallback>

              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center">
              <User color="#ffffff" className="w-8 h-8 object-cover color-white" />
            </div>
          )}
          <div>
            <h2 className="text-white font-medium mb-2 text-lg">User</h2>
            <p className="text-white text-sm truncate max-w-[100px]">
              {typeof window !== "undefined" && userSettings?.email}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex-1">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link key={link.name} href={link.href}>
              <Button
                variant="ghost"
                className={clsx(
                  'w-full px-6 justify-start text-left h-12 text-gray-300 hover:bg-gray-700/50 hover:text-white',
                  {
                    'bg-purple-600 text-white hover:bg-purple-700': isActive,
                  }
                )}
              >
                <LinkIcon className="w-5 h-5 mr-2" />
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
          <HomeIcon className="w-5 h-5 mr-2" />
          <p className="hidden md:block">Đăng xuất</p>
        </Button>
      </div>
    </div>
  );
}
