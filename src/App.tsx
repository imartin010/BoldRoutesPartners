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

// Critical pages loaded immediately
import Home from './pages/Home';
import More from './pages/More';

// Lazy load non-critical pages
const Inventory = lazy(() => import('./pages/Inventory'));
const Launches = lazy(() => import('./pages/Launches'));
const Commissions = lazy(() => import('./pages/Commissions'));
const CloseDeal = lazy(() => import('./pages/CloseDeal'));
const Apply = lazy(() => import('./pages/Apply'));
const Submissions = lazy(() => import('./pages/Submissions'));
const About = lazy(() => import('./pages/About'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SignUp = lazy(() => import('./pages/SignUp'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Deals = lazy(() => import('./pages/Deals'));
const CreateDeal = lazy(() => import('./pages/CreateDeal'));
const DealDetail = lazy(() => import('./pages/DealDetail'));
const EditDeal = lazy(() => import('./pages/EditDeal'));
const MyCommissions = lazy(() => import('./pages/MyCommissions'));
const Settings = lazy(() => import('./pages/Settings'));
const LanguageSelection = lazy(() => import('./pages/LanguageSelection'));
const MyCompany = lazy(() => import('./pages/MyCompany'));
const Profile = lazy(() => import('./pages/Profile'));

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
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="launches" element={<Launches />} />
                    <Route path="commissions" element={<Commissions />} />
                    <Route path="close-deal" element={<CloseDeal />} />
                    <Route path="apply" element={<Apply />} />
                    <Route path="submissions" element={<Submissions />} />
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
                  <Route path="deals/create" element={<CreateDeal />} />
                  <Route path="deals/:id" element={<DealDetail />} />
                  <Route path="deals/:id/edit" element={<EditDeal />} />
                  <Route path="signup" element={<SignUp />} />
                  <Route path="signin" element={<SignIn />} />
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
