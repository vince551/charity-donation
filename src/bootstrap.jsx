import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import {AuthProvider} from './auth/AuthContext';
import Home from './home.jsx';import Login from './pages/Login.jsx';import Register from './pages/Register.jsx';import Dashboard from './pages/Dashboard.jsx';import Admin from './pages/Admin.jsx';import ProtectedRoute from './auth/ProtectedRoute.jsx';
import './styles.css';import './polish.css';import './theme.css';import './admin.css';import './logo.css';
function ThemeManager(){const [theme,setTheme]=useState(()=>{const saved=localStorage.getItem('kvd-theme');if(saved==='dark'||saved==='light')return saved;return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'});useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;localStorage.setItem('kvd-theme',theme)},[theme]);useEffect(()=>{const f=e=>setTheme(e.detail==='dark'?'dark':'light');window.addEventListener('kvd-theme-change',f);return()=>window.removeEventListener('kvd-theme-change',f)},[]);return null}
function App(){return <AuthProvider><ThemeManager/><BrowserRouter><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/><Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin/></ProtectedRoute>}/></Routes></BrowserRouter></AuthProvider>}
createRoot(document.getElementById('root')).render(<App/>);
