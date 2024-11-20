"use client";

//this is the log in page

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleLogin = (which: number) => {
    if (which === 0){
      router.push('/consumer');
    }else if (which === 1){
      router.push('/manager');
    }else if (which === 2){
      router.push('/admin');
    }
  };

  return (
    <div>
      <h1>Log in screen</h1>
      <button onClick={() => handleLogin(0)}>Go to Consumer button </button>
      <button onClick={() => handleLogin(1)}>Go to Manager button </button>
      <button onClick={() => handleLogin(2)}>Go to Admin button </button>
    </div>
  );
};

export default HomePage;
