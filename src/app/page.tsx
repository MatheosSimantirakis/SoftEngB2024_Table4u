"use client";

//this is the log in page

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleLogin = (which: number) => {
    if (which === 0){
      //search x database
      router.push('/consumer');
    }else if (which === 1){
      //search y database
      router.push('/manager');
    }else if (which === 2){
      //search z database
      router.push('/admin');
    }
  };

  return (
    <div>
      <h1>Log in screen</h1>
      <button className='login_button_container' onClick={() => handleLogin(0)}> Consumer </button>
      <button className='login_button_container' onClick={() => handleLogin(1)}> Manager </button>
      <button className='login_button_container' onClick={() => handleLogin(2)}> Admin</button>
      
      <input className='input_container'type="email" id='username' ></input>
      <label>Password</label>
      <input className='input_container' type='password'></input>
    </div>
  );
};

export default HomePage;
