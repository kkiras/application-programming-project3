'use client';
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function Page() {
  const route = useRouter();
  const handleLogin = () => {
    route.push('/dashboard');
  }
  return (
    <main className='bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 flex items-center justify-center min-h-screen p-4'>
      <Card className="w-full max-w-sm bg-gray-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className='text-white text-xl'>Login to your account</CardTitle>
          <CardDescription className='text-gray-400/60'>
            Enter your information below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6 text-white">
              <div className="grid gap-2">
                <Label htmlFor="email">Account name</Label>
                <Input
                  id="email"
                  type="email"
                  // placeholder="m@example.com"
                  required
                  className='bg-gray-700 border-gray-600 text-white'
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm text-gray-400/60 underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className='bg-gray-700 border-gray-600 text-white'
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button variant="outline" className="w-full hover:bg-gray-700 hover:text-white">
            Sign up
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
