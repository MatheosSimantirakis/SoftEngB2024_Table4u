'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Manager: React.FC = () => {
  // State variables to control the visibility of forms
  const [showCreateForm, setShowCreateForm] = useState(false); // Toggles Create Restaurant form
  const [showEditForm, setShowEditForm] = useState(false); // Toggles Edit Restaurant form
  const [showOpenForm, setShowOpenForm] = useState(false); // Toggles Open Future Day form
  const [showCloseForm, setShowCloseForm] = useState(false); // Toggles Close Future Day form
  const [showReviewForm, setShowReviewForm] = useState(false); // Toggles Review Days Availability form
  const [isActivated, setIsActivated] = useState(false); // Tracks Activate/Deactivate state

  const router = useRouter();

  // Handlers for toggling forms; ensure only one form is active at a time
  const handleCreateToggle = () => {
    setShowCreateForm((prevState) => !prevState);
    resetOtherForms('create');
  };

  const handleEditToggle = () => {
    setShowEditForm((prevState) => !prevState);
    resetOtherForms('edit');
  };

  const handleOpenToggle = () => {
    setShowOpenForm((prevState) => !prevState);
    resetOtherForms('open');
  };

  const handleCloseToggle = () => {
    setShowCloseForm((prevState) => !prevState);
    resetOtherForms('close');
  };

  const handleReviewToggle = () => {
    setShowReviewForm((prevState) => !prevState);
    resetOtherForms('review');
  };

  const resetOtherForms = (current: string) => {
    if (current !== 'create') setShowCreateForm(false);
    if (current !== 'edit') setShowEditForm(false);
    if (current !== 'open') setShowOpenForm(false);
    if (current !== 'close') setShowCloseForm(false);
    if (current !== 'review') setShowReviewForm(false);
  };

  const handleActivateToggle = () => {
    setIsActivated((prevState) => !prevState); // Toggle activation state
  };

  const handleGoBack = () => router.push('/consumer');

  return (
    <div className="manager-view">
      {/* Left Panel */}
      <div className="left-panel-manager">
        <div className="left-panel-header-manager">
          <img src="/logo.svg" alt="Tables4U Logo" className="logo-manager" />
          <h2 className="subtitle-manager">Manager View</h2>
        </div>
        <div className="left-panel-buttons-manager">
          <button className="create-restaurant-button-manager" onClick={handleCreateToggle}>
            {showCreateForm ? 'Close Create Form' : 'Create Restaurant'}
          </button>
          <button className="action-button-manager" onClick={handleEditToggle}>
            {showEditForm ? 'Close Edit Form' : 'Edit Restaurant'}
          </button>
          <button className="action-button-manager" onClick={handleOpenToggle}>
            {showOpenForm ? 'Close Open Form' : 'Open Future Day'}
          </button>
          <button className="action-button-manager" onClick={handleCloseToggle}>
            {showCloseForm ? 'Close Close Form' : 'Close Future Day'}
          </button>
          <button className="action-button-manager" onClick={handleReviewToggle}>
            {showReviewForm ? 'Close Review Form' : 'Review Days Availability'}
          </button>
          <button className="action-button-manager" onClick={handleActivateToggle}>
            {isActivated ? 'Deactivate Restaurant' : 'Activate Restaurant'}
          </button>
          <button className="back-button-manager" onClick={handleGoBack}>
            Back to Consumer View
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-manager">
        {/* Create Restaurant Form */}
        {showCreateForm && (
          <div className="create-restaurant-form">
            <h1 className="title-create-restaurant">Create Restaurant</h1>
            <form>
              <div className="form-group-create-restaurant">
                <label className="label-create-restaurant" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter restaurant name"
                  className="input-create-restaurant"
                />
              </div>
              <div className="form-group-create-restaurant">
                <label className="label-create-restaurant" htmlFor="address">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="Enter restaurant address"
                  className="input-create-restaurant"
                />
              </div>
              <button
                type="submit"
                className="submit-button-create-restaurant"
              >
                Create Restaurant
              </button>
            </form>
          </div>
        )}

        {/* Edit Restaurant Form */}
        {showEditForm && (
          <div className="edit-restaurant-form">
            <h1 className="title-edit-restaurant">Edit Restaurant</h1>
            <form>
              <div className="form-group-edit-restaurant">
                <label className="label-edit-restaurant" htmlFor="edit-name">
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  placeholder="Existing Name"
                  className="input-edit-restaurant"
                />
              </div>
              <div className="form-group-edit-restaurant">
                <label className="label-edit-restaurant" htmlFor="edit-address">
                  Address
                </label>
                <input
                  id="edit-address"
                  type="text"
                  placeholder="Existing Address"
                  className="input-edit-restaurant"
                />
              </div>
              <button
                type="submit"
                className="submit-button-edit-restaurant"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Open Future Day Form */}
        {showOpenForm && (
          <div className="open-future-day-form">
            <h1 className="title-open-future-day">Open Future Day</h1>
            <form>
              <div className="form-group-open-future-day">
                <label className="label-open-future-day" htmlFor="open-date">
                  Select Date
                </label>
                <input
                  id="open-date"
                  type="date"
                  className="input-open-future-day"
                />
              </div>
              <button type="submit" className="submit-button-open-future-day">
                Open Day
              </button>
            </form>
          </div>
        )}

        {/* Close Future Day Form */}
        {showCloseForm && (
          <div className="close-future-day-form">
            <h1 className="title-close-future-day">Close Future Day</h1>
            <form>
              <div className="form-group-close-future-day">
                <label className="label-close-future-day" htmlFor="close-date">
                  Select Date
                </label>
                <input
                  id="close-date"
                  type="date"
                  className="input-close-future-day"
                />
              </div>
              <button type="submit" className="submit-button-close-future-day">
                Close Day
              </button>
            </form>
          </div>
        )}

        {/* Review Days Availability Form */}
        {showReviewForm && (
          <div className="review-days-availability-form">
            <h1 className="title-review-days">Review Days Availability</h1>
          </div>
        )}

        {/* Placeholder */}
        {!showCreateForm &&
          !showEditForm &&
          !showOpenForm &&
          !showCloseForm &&
          !showReviewForm && (
            <div className="placeholder-manager">
              <p>Select an option from the left panel to get started.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Manager;