import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import {AuthProvider} from './auth/AuthContext';
import Home from './home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import './styles.css';
import './polish.css';

function App(){
  return <AuthProvider><BrowserRouter><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/></Routes></BrowserRouter></AuthProvider>;
}

createRoot(document.getElementById('root')).render(<App/>);
