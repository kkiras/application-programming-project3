'use client';
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
import { useState } from 'react';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

export default function Page() {
  const route = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [loginInformation, setLoginInformation] = useState({
    email: '',
    password: '',
  });

  const [signupInformation, setSignupInformation] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSignup = async () => {
    const { username, email, password } = signupInformation;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken(true);
      const uid = userCredential.user.uid
      console.log("Signup success. Token:", idToken);

      const res = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: "",
          email,
          uid,
          idToken
        })
      });

    } catch (error: any) {
      console.error("Signup failed:", error.message);
    }
  }

  const handleSignin = async () => {
    const { email, password } = loginInformation;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      console.log("Signin success. Token:", idToken);

      const res = await fetch('http://localhost:8000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: idToken })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Response from backend:", data);

        route.push('/dashboard');
      }
      else {
        const errorData = await res.json();
        console.error("Backend error:", errorData.detail);
      }

    } catch (error: any) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
            console.error("Email không tồn tại.");
            break;
          case "auth/wrong-password":
            console.error("Sai mật khẩu.");
            break;
          case "auth/invalid-email":
            console.error("Email không hợp lệ.");
            break;
          default:
            console.error("Email hoặc mật khẩu không đúng:", error.message);
        }
      } else {
        console.error("Lỗi không xác định:", error.message);
      }
    }
  }

  return (
    <main className='bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 flex items-center justify-center min-h-screen p-4'>
      <Card className="w-full max-w-sm bg-gray-800/50 border-purple-500/30">
        {isLogin ? (
          <div>
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
                      value={loginInformation.email}
                      onChange={(e) =>
                        setLoginInformation((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
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
                      value={loginInformation.password}
                      onChange={(e) =>
                        setLoginInformation((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
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
                onClick={handleSignin}
              >
                Login
              </Button>
              <Button
                variant="outline"
                className="w-full hover:bg-gray-700 hover:text-white"
                onClick={() => setIsLogin(false)}
              >
                Sign up
              </Button>
            </CardFooter>
          </div>
        ) : (
          <div>
            <CardHeader>
              <CardTitle className='text-white text-xl'>Create a new account</CardTitle>
              <CardDescription className='text-gray-400/60'>
                Enter your information below to create a new account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6 text-white">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={signupInformation.username}
                      onChange={(e) =>
                        setSignupInformation((prev) => ({
                          ...prev,
                          username: e.target.value
                        }))
                      }
                      className='bg-gray-700 border-gray-600 text-white'
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signupInformation.email}
                      onChange={(e) =>
                        setSignupInformation((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                      required
                      className='bg-gray-700 border-gray-600 text-white'
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signupInformation.password}
                      onChange={(e) =>
                        setSignupInformation((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
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
                onClick={handleSignup}
              >
                Sign up
              </Button>
              <Button variant="outline" className="w-full hover:bg-gray-700 hover:text-white" onClick={() => setIsLogin(true)}>
                Back to Login
              </Button>
            </CardFooter>
          </div>
        )}
      </Card>
    </main>
  );
}
