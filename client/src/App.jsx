import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { AnalyzeConversation } from './pages/AnalyzeConversation';
import { Conversations } from './pages/Conversations';
import { ConversationDetails } from './pages/ConversationDetails';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { Analytics } from './pages/Analytics';
import { Dataset } from './pages/Dataset';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analyze" element={<AnalyzeConversation />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversations/:id" element={<ConversationDetails />} />
        <Route path="/threats" element={<ThreatIntelligence />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/dataset" element={<Dataset />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
