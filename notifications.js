// js/auth.js
import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Handle Login
export async function loginUser(username, password) {
  // Direct local check for default admin credentials
  if (username === 'admin' && password === 'admin') {
    localStorage.setItem('currentUser', JSON.stringify({
      username: 'admin',
      role: 'admin',
      isLoggedIn: true
    }));
    window.location.href = 'admin/dashboard.html';
    return { success: true };
  }

  // Firebase Auth for standard users
  try {
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    const user = userCredential.user;
    
    localStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: user.email,
      role: 'user',
      isLoggedIn: true
    }));
    
    window.location.href = 'dashboard.html';
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Route Guard
export function checkAuth(requiredRole = null) {
  const user = JSON.parse(localStorage.getItem('currentUser'));

  if (!user || !user.isLoggedIn) {
    window.location.href = '/login.html';
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    alert('Unauthorized access.');
    window.location.href = '/login.html';
    return null;
  }

  return user;
}

// Logout
export function logoutUser() {
  signOut(auth).finally(() => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
  });
}