'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const router = useRouter();

async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
    const data = await res.json();
    setError(data.error || 'Something went wrong');
    return;
    }

    router.push('/');
}

return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-bg text-text px-6 py-10'>
        <div className='min-w-full flex flex-col items-center flex-1 justify-center'>
            <Image src="/icons/icon.svg" alt="icon" width={250} height={250} priority/>
            <h1 className='font-extrabold text-3xl mt-3'>OweYouOne</h1>

            <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm mt-8 gap-8'>
                <div className="relative mb-4">
                    <input
                        id="email"
                        className="peer w-full p-3 pt-4 rounded-md border border-border text-text placeholder-transparent focus:outline-none focus:border-accent-bg"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-2 -top-2 text-xs text-accent-bg bg-bg px-1 rounded transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
                        peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent-bg peer-focus:bg-bg peer-focus:px-1"
                    >
                        Email
                    </label>
                    </div>

                    <div className="relative mb-4">
                    <input
                        id="password"
                        className="peer w-full p-3 pt-4 rounded-md border border-border text-text placeholder-transparent focus:outline-none focus:border-accent-bg"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-2 -top-2 text-xs text-accent-bg bg-bg px-1 rounded transition-all
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0
                        peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-accent-bg peer-focus:bg-bg peer-focus:px-1"
                    >
                        Password
                    </label>
                </div>


                {error && <p className="text-owe text-sm">{error}</p>}


                <button
                    type="submit"
                    disabled={loading}
                    className="font-bold text-white bg-accent-bg p-3 rounded-4xl disabled:opacity-60"
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
        </div>

        <a href="/signup" className="pb-4 text-sec hover:text-text">
            Need an account? Sign up
        </a>

    </div>
);
}