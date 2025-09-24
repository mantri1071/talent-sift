import React from 'react';
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Existing from './components/existing';
import JobFormStep1 from './components/JobFormStep1';
import ResumeList from './components/ResumeList';

ReactDOM.createRoot(document.getElementById('root')).render(

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/resumes" element={<ResumeList />} />
        <Route path="/jobform" element={<JobFormStep1 />} />
        <Route path="/resumes" element={<Existing />} />
      </Routes>
    </BrowserRouter>

);
