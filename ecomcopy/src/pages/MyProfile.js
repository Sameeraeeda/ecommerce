import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyProfile = ({ userId }) => {
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/getUserProfile/${userId}`);
        setProfile(response.data);
        setForm(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:5000/updateProfile', {
        userId,
        ...form
      });
      setMessage(response.data.message);
      setProfile(response.data.updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>My Profile</h2>
      {message && <p>{message}</p>}
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" name="username" value={form.username} onChange={handleInputChange} />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={form.email} onChange={handleInputChange} />
          </label>
          <button type="submit">Save</button>
        </form>
      ) : (
        <div>
          <p>Username: {profile.username}</p>
          <p>Email: {profile.email}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
