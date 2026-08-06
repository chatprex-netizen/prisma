import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Contracts } from './pages/Contracts';
import { Pipeline } from './pages/Pipeline';
import { Projects } from './pages/Projects';
import { Units } from './pages/Units';
import { Contacts } from './pages/Contacts';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { Campaigns } from './pages/Campaigns';
import { Users } from './pages/Users';
import { Finances } from './pages/Finances';
import { Clients } from './pages/Clients';
import { AIAssistants } from './pages/AIAssistants';
import { Conversations } from './pages/Conversations';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes wrapped in MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/contracts" element={<MainLayout><Contracts /></MainLayout>} />
            <Route path="/pipeline" element={<MainLayout><Pipeline /></MainLayout>} />
            <Route path="/projects" element={<MainLayout><Projects /></MainLayout>} />
            <Route path="/units" element={<MainLayout><Units /></MainLayout>} />
            <Route path="/contacts" element={<MainLayout><Contacts /></MainLayout>} />
            <Route path="/calendar" element={<MainLayout><Calendar /></MainLayout>} />
            <Route path="/conversations" element={<MainLayout><Conversations /></MainLayout>} />
            <Route path="/campaigns" element={<MainLayout><Campaigns /></MainLayout>} />
            <Route path="/clients" element={<MainLayout><Clients /></MainLayout>} />
            <Route path="/finances" element={<MainLayout><Finances /></MainLayout>} />
            <Route path="/finances/incomes" element={<MainLayout><Finances /></MainLayout>} />
            <Route path="/finances/expenses" element={<MainLayout><Finances /></MainLayout>} />
            <Route path="/finances/accounts" element={<MainLayout><Finances /></MainLayout>} />
            <Route path="/ai-assistants" element={<MainLayout><AIAssistants /></MainLayout>} />
            <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
