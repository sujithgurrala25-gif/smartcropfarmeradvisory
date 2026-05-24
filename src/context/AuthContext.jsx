import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  isFirebaseConfigured 
} from '../utils/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isFirebase, setIsFirebase] = useState(isFirebaseConfigured);

  // Helper to ensure username formatted as email for Firebase Auth
  const getEmail = (username) => {
    return username.includes('@') ? username.trim() : `${username.trim()}@smartfarmer.com`;
  };

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user.displayName || user.email.split('@')[0]);
          setCurrentUserEmail(user.email);
          localStorage.setItem('mock_jwt_token', `firebase-token-${user.uid}`);
          localStorage.setItem('current_username', user.displayName || user.email.split('@')[0]);
          localStorage.setItem('current_email', user.email);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentUserEmail(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local fallback initialization
      const users = localStorage.getItem('registered_users');
      if (!users) {
        const defaultUsers = [
          { username: 'admin', password: 'password123' },
          { username: 'farmer123', password: 'password' }
        ];
        localStorage.setItem('registered_users', JSON.stringify(defaultUsers));
      }

      const token = localStorage.getItem('mock_jwt_token');
      const user = localStorage.getItem('current_username');
      const email = localStorage.getItem('current_email');
      if (token && user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setCurrentUserEmail(email || `${user}@smartfarmer.com`);
      }
      setLoading(false);
    }
  }, []);

  const getUsers = () => {
    const users = localStorage.getItem('registered_users');
    return users ? JSON.parse(users) : [];
  };

  const login = async (username, password) => {
    if (isFirebaseConfigured) {
      try {
        const email = getEmail(username);
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
      } catch (err) {
        const code = err.code;
        if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
          return { success: false, code: 'USER_NOT_FOUND', message: 'No account found. Please switch to Register tab to create your account.' };
        }
        if (code === 'auth/wrong-password') {
          return { success: false, code: 'WRONG_PASSWORD', message: 'Incorrect password.' };
        }
        return { success: false, message: err.message.replace('Firebase:', '').trim() };
      }
    } else {
      // Local fallback login
      const users = getUsers();
      const normalizedUsername = username.trim().toLowerCase();
      const userExists = users.find(u => u.username.toLowerCase() === normalizedUsername);

      if (!userExists) {
        return { success: false, code: 'USER_NOT_FOUND', message: 'User does not exist. Please register first.' };
      }

      if (userExists.password !== password) {
        return { success: false, code: 'WRONG_PASSWORD', message: 'Incorrect password.' };
      }

      localStorage.setItem('mock_jwt_token', `fake-jwt-token-${userExists.username}`);
      localStorage.setItem('current_username', userExists.username);
      localStorage.setItem('current_email', `${userExists.username}@smartfarmer.com`);
      setIsAuthenticated(true);
      setCurrentUser(userExists.username);
      setCurrentUserEmail(`${userExists.username}@smartfarmer.com`);
      return { success: true };
    }
  };

  const register = async (username, password) => {
    if (isFirebaseConfigured) {
      try {
        const email = getEmail(username);
        await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, message: 'Registration successful! Swapping to Sign In.' };
      } catch (err) {
        const code = err.code;
        if (code === 'auth/email-already-in-use') {
          return { success: false, code: 'USER_EXISTS', message: 'An account already exists with this email/username. Please Sign In.' };
        }
        if (code === 'auth/weak-password') {
          return { success: false, message: 'Password is too weak. Must be at least 6 characters.' };
        }
        return { success: false, message: err.message.replace('Firebase:', '').trim() };
      }
    } else {
      // Local fallback register
      const users = getUsers();
      const normalizedUsername = username.trim().toLowerCase();
      const userExists = users.find(u => u.username.toLowerCase() === normalizedUsername);

      if (userExists) {
        return { success: false, code: 'USER_EXISTS', message: 'User already exists. Please log in instead.' };
      }

      const newUsers = [...users, { username: username.trim(), password }];
      localStorage.setItem('registered_users', JSON.stringify(newUsers));
      return { success: true, message: 'Registration successful! You can now log in.' };
    }
  };

  const loginWithGoogle = async (name, email) => {
    if (isFirebaseConfigured) {
      try {
        // In real Firebase login, we prompt Google popup
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        setIsAuthenticated(true);
        setCurrentUser(user.displayName || user.email.split('@')[0]);
        setCurrentUserEmail(user.email);
        return { success: true };
      } catch (err) {
        console.error("Google Sign-In failed:", err);
        return { success: false, message: err.message };
      }
    } else {
      // Local fallback Google login
      const displayName = name || 'Google Farmer';
      const displayEmail = email || 'farmer@gmail.com';
      localStorage.setItem('mock_jwt_token', `fake-google-token-${displayEmail}-${Date.now()}`);
      localStorage.setItem('current_username', displayName);
      localStorage.setItem('current_email', displayEmail);
      setIsAuthenticated(true);
      setCurrentUser(displayName);
      setCurrentUserEmail(displayEmail);
      return { success: true };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase Sign-Out error:", err);
      }
    }
    localStorage.removeItem('mock_jwt_token');
    localStorage.removeItem('current_username');
    localStorage.removeItem('current_email');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, currentUserEmail, isFirebase, login, register, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
