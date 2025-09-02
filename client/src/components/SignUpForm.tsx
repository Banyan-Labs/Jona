// client\src\components\SignUpForm.tsx
'use client';

import Link from 'next/link';
import { signup } from '@/lib/auth-actions';

export function SignUpForm() {
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Sign Up</h2>
        <p className="text-sm text-gray-600">
          Enter your information to create an account
        </p>
      </div>

      <form action="" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="first-name" className="text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="first-name"
              name="first-name"
              placeholder="Max"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="last-name" className="text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="last-name"
              name="last-name"
              placeholder="Robinson"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          formAction={signup}
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create an account
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 underline hover:text-blue-800">
          Sign in
        </Link>
      </div>
    </div>
  );
}