"use client";

import React, {useState} from 'react';
import { useRouter } from 'next/navigation';

const Manager: React.FC = () => {

  const [activated, setActivated] = useState(false);
  const [created, setCreated] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const router = useRouter();

  const handleCreate = () => {
    router.push('/manager/createRestaurant');
  }

  const handleEdit = () => {
    router.push('/manager/editRestaurant')
  }

  const handleClose = () => {
    router.push('/manager/closeFutureDay')
  }

  const handleOpen = () => {
    router.push('/manager/openFutureDay')
  }

  const handleReview = () => {
    router.push('manager/reviewDaysAvailability')
  }

  const handleActivate = () => {
    setActivated(true);
  }

  const handleDelete = () => {

  }

  const handleLogin = () => {
    //router.push('manager/loginRestaurant')
    setLoggedIn(true);
    console.log(loggedIn);
    console.log(created);
  }

  const pressCreate = () => {
    if(loggedIn && !created){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressEdit = () => {
    if(loggedIn && created){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressActivate = () => {
    if(loggedIn && created && !activated){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressDelete = () => {
    if(loggedIn && created){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressReview = () => {
    if(loggedIn && created){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressClose = () => {
    if(loggedIn && created){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressOpen = () => {
    if(loggedIn && created){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  const pressLog = () => {
    if(1){
      return "manager_button press"
    }
    else{
      return "manager_button no_press"
    }
  }

  return (
    <div className="manager_button_container">
      <h1>Manager View</h1>
      <p>Content below</p>
      <button className={pressCreate()} onClick={() => handleCreate()}>Create Restaurant</button>
      <button className={pressEdit()} onClick={() => handleEdit()}>Edit Restaurant</button>
      <button className={pressActivate()} onClick={() => handleActivate()}>Activate Restaurant</button>
      <button className={pressDelete()} onClick={() => handleDelete()}>Delete Restaurant</button>
      <button className={pressReview()} onClick={() => handleReview()}>Review Day's Availability</button>
      <button className={pressOpen()} onClick={() => handleClose()}>Close Future Day</button>
      <button className={pressClose()} onClick={() => handleOpen()}>Open Future Day</button>
      <button className={pressLog()} onClick={() => handleLogin()}>Login Restaurant</button>
    </div>
  );
};

export default Manager;
