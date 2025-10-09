import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ResumeList from './components/ResumeList';
import JobFormStep1 from './components/JobFormStep1';
import Existing from './components/existing';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/resumes" element={<ResumeList />} />
      <Route path="/jobform" element={<JobFormStep1 />} />
      <Route path="/existing" element={<Existing />} />
    </Routes>
  </BrowserRouter>
);
