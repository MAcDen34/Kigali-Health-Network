'use client';
import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { DEMO_USERS } from '@/data/roles';
import { clearToken } from '@/lib/api';
import {
  consentGrants, medicalHistory, prescriptions, claims,
  institutions, notifications, platformAudit, serviceHealth,
  clinicPatients, auditLog, patientProfile,
} from '@/data/mockData';

const AppContext = createContext(null);
const STORAGE_KEY = 'kuprin_session';

const initialState = {
  user: null,
  sidebarCollapsed: false,
  // Records & consent
  patientProfile,
  consents: consentGrants,
  medicalHistory,
  auditLog,
  // Clinical
  clinicPatients,
  prescriptions,
  // Insurance
  claims,
  // Admin
  institutions,
  serviceHealth,
  platformAudit,
  // Notifications
  notifications,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_SIDEBAR':
      return { ...state, sidebarCollapsed: action.payload };
    case 'TOGGLE_CONSENT': {
      const consents = state.consents.map(c =>
        c.id === action.payload
          ? { ...c, status: c.status === 'active' ? 'revoked' : 'active' }
          : c
      );
      return { ...state, consents };
    }
    case 'DISPENSE_RX': {
      const prescriptions = state.prescriptions.map(rx =>
        rx.id === action.payload ? { ...rx, status: 'dispensed' } : rx
      );
      return { ...state, prescriptions };
    }
    case 'UPDATE_CLAIM': {
      const claims = state.claims.map(c =>
        c.id === action.payload.id ? { ...c, status: action.payload.status } : c
      );
      return { ...state, claims };
    }
    case 'MARK_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return { ...state, notifications };
    }
    case 'MARK_ALL_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications };
    }
    case 'ADD_DIAGNOSIS': {
      const entry = { id: `M${Date.now()}`, type: 'Diagnosis', ...action.payload };
      return { ...state, medicalHistory: [entry, ...state.medicalHistory] };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved);
        dispatch({ type: 'LOGIN', payload: user });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (state.user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      clearToken(); // demo logins never set one, but this is a safe no-op either way
    }
  }, [state.user, hydrated]);

  return (
    <AppContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};