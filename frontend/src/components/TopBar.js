import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TopBar = () => {
  const [message, setMessage] = useState('🚚 Kargo Ücretsizdir!');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      if (response.data.topbar_message) {
        setMessage(response.data.topbar_message);
      }
    } catch (error) {
      console.error('Error fetching topbar settings:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#78BE20] text-black py-2 text-center text-sm font-medium">
      {message}
    </div>
  );
};

export default TopBar;
