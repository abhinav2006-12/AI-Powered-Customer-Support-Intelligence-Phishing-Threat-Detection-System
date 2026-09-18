import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Assistant } from './pages/Assistant';
import { AnalyzeConversation } from './pages/AnalyzeConversation';
import { Conversations } from './pages/Conversations';
import { ConversationDetails } from './pages/ConversationDetails';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { Analytics } from './pages/Analytics';
import { Dataset } from './pages/Dataset';
import { Settings } from './pages/Settings';
import { PublicScamChecker } from './pages/PublicScamChecker';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes (Accessible without login) */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<PublicScamChecker />} />
          <Route path="/check" element={<PublicScamChecker />} />
          <Route path="/scam-checker" element={<PublicScamChecker />} />
          <Route path="/check-scam" element={<PublicScamChecker />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <AnalyzeConversation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <Conversations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations/:id"
            element={
              <ProtectedRoute>
                <ConversationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/threats"
            element={
              <ProtectedRoute>
                <ThreatIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dataset"
            element={
              <ProtectedRoute>
                <Dataset />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
