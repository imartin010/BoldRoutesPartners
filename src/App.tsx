import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDataStore } from './store/data';
import { SidebarProvider } from './contexts/SidebarContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { NotificationPopupProvider } from './contexts/NotificationPopupContext';
import { ToastProvider } from './contexts/ToastContext';
import { DealsProvider } from './contexts/DealsContext';
import Layout from './components/Layout';
import NotificationPopup from './components/NotificationPopup';
import ToastContainer from './components/ToastContainer';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';
import { RequireAuth, RequireGuest } from './components/AuthGuard';
import ProfileGuard from './components/ProfileGuard';
import AuthLanding from './pages/AuthLanding';

// Critical pages loaded immediately
import Home from './pages/Home';
import More from './pages/More';

// Lazy load non-critical pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Projects = lazy(() => import('./pages/Projects'));
const Launches = lazy(() => import('./pages/Launches'));
const Commissions = lazy(() => import('./pages/Commissions'));
const CloseDeal = lazy(() => import('./pages/CloseDeal'));
const Apply = lazy(() => import('./pages/Apply'));

const About = lazy(() => import('./pages/About'));
const Notifications = lazy(() => import('./pages/Notifications'));
// Removed unused SignUp and SignIn imports - now using AuthLanding for both
const Deals = lazy(() => import('./pages/Deals'));
const CreateDeal = lazy(() => import('./pages/CreateDeal'));
const DealDetail = lazy(() => import('./pages/DealDetail'));
const EditDeal = lazy(() => import('./pages/EditDeal'));
const MyCommissions = lazy(() => import('./pages/MyCommissions'));
const Settings = lazy(() => import('./pages/Settings'));
const LanguageSelection = lazy(() => import('./pages/LanguageSelection'));
const MyCompany = lazy(() => import('./pages/MyCompany'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/AdminEnhanced'));

function AppContent() {
  const { loadFromLocalStorage } = useDataStore();

  useEffect(() => {
    // Load data from localStorage on app start
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return (
    <Router>
      <NetworkProvider>
        <ToastProvider>
          <NotificationPopupProvider>
            <DealsProvider>
              <SidebarProvider>
              <ScrollToTop />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public authentication routes - only accessible when NOT logged in */}
                  <Route path="/signin" element={
                    <RequireGuest>
                      <AuthLanding />
                    </RequireGuest>
                  } />
                  <Route path="/signup" element={
                    <RequireGuest>
                      <AuthLanding />
                    </RequireGuest>
                  } />
                  <Route path="/auth" element={
                    <RequireGuest>
                      <AuthLanding />
                    </RequireGuest>
                  } />

                  {/* Protected application routes - only accessible when logged in */}
                  <Route path="/" element={
                    <RequireAuth>
                      <ProfileGuard>
                        <Layout />
                      </ProfileGuard>
                    </RequireAuth>
                  }>
                    <Route index element={<Dashboard />} />
                    <Route path="home" element={<Home />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="launches" element={<Launches />} />
                    <Route path="commissions" element={<Commissions />} />
                    <Route path="close-deal" element={<CloseDeal />} />
                    <Route path="apply" element={<Apply />} />
                    <Route path="about" element={<About />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="deals" element={<Deals />} />
                    <Route path="my-commissions" element={<MyCommissions />} />
                    <Route path="more" element={<More />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="language-selection" element={<LanguageSelection />} />
                    <Route path="my-company" element={<MyCompany />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                  
                  {/* Protected standalone routes */}
                  <Route path="deals/create" element={
                    <RequireAuth>
                      <ProfileGuard>
                        <CreateDeal />
                      </ProfileGuard>
                    </RequireAuth>
                  } />
                  <Route path="deals/:id" element={
                    <RequireAuth>
                      <ProfileGuard>
                        <DealDetail />
                      </ProfileGuard>
                    </RequireAuth>
                  } />
                  <Route path="deals/:id/edit" element={
                    <RequireAuth>
                      <ProfileGuard>
                        <EditDeal />
                      </ProfileGuard>
                    </RequireAuth>
                  } />
                  <Route path="admin" element={
                    <RequireAuth>
                      <ProfileGuard>
                        <Admin />
                      </ProfileGuard>
                    </RequireAuth>
                  } />

                  {/* Fallback route - redirect to auth if not authenticated, home if authenticated */}
                  <Route path="*" element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  } />
                </Routes>
              </Suspense>
            <NotificationPopup />
            <ToastContainer position="bottom-right" />
              </SidebarProvider>
            </DealsProvider>
          </NotificationPopupProvider>
        </ToastProvider>
      </NetworkProvider>
    </Router>
  );
}

function App() {
  return <AppContent />;
}

export default App;
