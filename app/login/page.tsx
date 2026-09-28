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

    try{
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
    } catch (err) {
        setError('Network error, please try again');
    } finally {
        setLoading(false);
    }
    
}

return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-bg text-text px-6 py-10'>
        <div className='min-w-full flex flex-col items-center flex-1 justify-center'>
            <div className='flex items-center justify-center w-40 h-40 text-text'>
                <svg width="362" height="330" viewBox="0 0 362 330" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="102" cy="50" r="49" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="102" cy="227" r="59" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="262" cy="230" r="59" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="262" cy="230" r="99" stroke="currentColor" strokeWidth="2"/>
                    <path d="M102 125C135.861 125 165.868 141.5 184.42 166.898C183.983 167.435 183.552 167.976 183.126 168.521C164.964 143.37 135.394 127 102 127C46.7715 127 2 171.772 2 227C2 282.228 46.7715 327 102 327C134.047 327 162.572 311.923 180.873 288.478C181.278 289.039 181.689 289.596 182.105 290.148C163.426 313.811 134.487 329 102 329C45.667 329 0 283.333 0 227C0 170.667 45.667 125 102 125Z" fill="currentColor"/>
                    <circle cx="262" cy="53" r="49" stroke="currentColor" strokeWidth="2"/>
                </svg>
            </div>

            <h1 className='font-extrabold text-3xl mt-3'>OweYouOne</h1>

            <form onSubmit={handleSubmit} className='flex flex-col w-[80%] mt-8 gap-2'>
                <div className="relative mb-4">
                    <input
                        id="email"
                        autoFocus
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

                    <div className="relative mb-12">
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
                    className="text-white bg-accent-bg p-3 rounded-4xl disabled:opacity-60"
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
        </div>

        <a href="/signup" className="pb-4 text-sec hover:text-text">
            Need an account? <span className='underline'>Sign up</span>
        </a>

    </div>
);
}