// src/components/AuthSignupForm.tsx

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function AuthSignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://www.nakurucountychiefnursingofficer.site/login',
      },
    });

    if (error) {
      setStatus(`❌ ${error.message}`);
    } else {
      setStatus('✅ A confirmation email has been sent. Please check your inbox.');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded">
      <h2 className="text-lg font-bold">Sign Up</h2>
      <input
        type="email"
        className="w-full border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full border p-2"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup} className="bg-blue-600 text-white px-4 py-2 rounded">
        Sign Up
      </button>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}

export default AuthSignupForm;

