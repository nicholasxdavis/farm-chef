
import { useState } from 'react';
import Header from '@/components/Header';
import MenuDisplay from '@/components/MenuDisplay';
import AuthModal from '@/components/AuthModal';
import ChefDashboard from '@/components/ChefDashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  console.log('Index component loaded');
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { user, loading } = useAuth();

  console.log('Auth state:', { user: !!user, loading });

  const handleAuthClick = () => {
    if (user) {
      setShowDashboard(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  if (loading) {
    console.log('Still loading auth...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  console.log('Rendering main app');
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onAuthClick={handleAuthClick}
        onDashboardClick={handleDashboardClick}
      />
      <main>
        <MenuDisplay />
      </main>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      {user && (
        <ChefDashboard 
          isOpen={showDashboard} 
          onClose={() => setShowDashboard(false)} 
        />
      )}
    </div>
  );
};

export default Index;
