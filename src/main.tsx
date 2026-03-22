import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/index.css'; // Make sure this points to your Tailwind CSS file

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);