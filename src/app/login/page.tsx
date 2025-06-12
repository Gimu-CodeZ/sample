'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export default function Login() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (user) {
    return (
      <div>
        <h2>Welcome {user.name}!</h2>
        <Link href="/api/auth/logout">Logout</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Please log in</h2>
      <Link href="/api/auth/login">Login</Link>
    </div>
  );
} 