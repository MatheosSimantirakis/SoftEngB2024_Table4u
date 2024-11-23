'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleLogin = (which: number) => {
    if (which === 0) {
      router.push('/consumer');
    } else if (which === 1) {
      router.push('/manager');
    } else if (which === 2) {
      router.push('/admin');
    }
  };

  return (
    <div className="login-page">
      {/* Logo */}
      <img src="/logo.svg" alt="Tables4U Logo" className="login-logo" />

      {/* Title */}
      <h1 className="login-title">Welcome to Tables4U</h1>
      <p className="login-subtitle">Choose your role to continue</p>

      {/* Buttons */}
      <div className="login-buttons">
        <button className="login-button" onClick={() => handleLogin(0)}>
          Consumer
        </button>
        <button className="login-button" onClick={() => handleLogin(1)}>
          Manager
        </button>
        <button className="login-button" onClick={() => handleLogin(2)}>
          Admin
        </button>
      </div>
    </div>
  );
};

export default HomePage;
