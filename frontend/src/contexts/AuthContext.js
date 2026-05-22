import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { AUTH_TOKEN_KEY } from "../constants/authStorage";
import { authApi } from "../user/api/authApi";

const AuthContext = createContext(null);

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : state.user,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!token) {
        if (!cancelled) dispatch({ type: "SET_LOADING", payload: false });
        return;
      }
      try {
        const { user } = await authApi.me();
        if (!cancelled) {
          dispatch({ type: "LOGIN", payload: { token, user } });
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        if (!cancelled) dispatch({ type: "LOGOUT" });
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithSession = useCallback((token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    dispatch({ type: "LOGIN", payload: { token, user } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    // Clear user-specific data from local storage so guests don't see it
    localStorage.removeItem('cart');
    localStorage.removeItem('mankatha_cart_coupon');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('appNotifications');
    
    // Dispatch events so contexts update their state immediately
    window.dispatchEvent(new Event('userLogout'));
    
    dispatch({ type: "LOGOUT" });
  }, []);

  const updateUser = useCallback((patch) => {
    dispatch({ type: "UPDATE_USER", payload: patch });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        loginWithSession,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

