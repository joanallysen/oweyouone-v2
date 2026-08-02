'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function SignupPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent){
        e.preventDefault();
        setError('');

        const res = await fetch ('api/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
        })

        if (!res.ok){
            const data = await res.json()
            setError(data.error || 'Something went wrong');
            return;
        }

        router.push('/');
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '300px' }}>
                <h1>Sign Up</h1>
                <input type="email" placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                <input type="password" placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} required />

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Sign Up</button>
                <a href="/login">Already have an account? Log in</a>
            </form>
        </div>
    )
}