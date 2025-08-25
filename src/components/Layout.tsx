import { Outlet } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import Nav from './Nav';
import Sidebar from './Sidebar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function Layout() {
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-brand-bg">
      <Nav />
      <Sidebar />
      <div className={`transition-all duration-300 ease-in-out ${
        isExpanded ? 'lg:pl-64' : 'lg:pl-16'
      }`}>
        <main 
          id="main-content" 
          className="pt-16 sm:pt-20 pb-16 lg:pb-0 min-h-screen"
          role="main"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
