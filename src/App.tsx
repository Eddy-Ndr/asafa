import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AudioPlayerProvider, useAudioPlayer } from './context/AudioPlayerContext.tsx';
import { AndroidFrame } from './components/AndroidFrame.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { BadgeModal } from './components/BadgeModal.tsx';
import { VerificationModal } from './components/VerificationModal.tsx';
import { DiagnosticsModal } from './components/DiagnosticsModal.tsx';
import { MenuDrawer } from './components/MenuDrawer.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { PendingApprovalsModal } from './components/PendingApprovalsModal.tsx';
import { MusicChampModal } from './components/MusicChampModal.tsx';
import { FloatingMusicButton } from './components/FloatingMusicButton.tsx';

import { AuthScreen } from './screens/AuthScreen.tsx';
import { DashboardScreen } from './screens/DashboardScreen.tsx';
import { ChantsScreen } from './screens/ChantsScreen.tsx';
import { ProgrammeScreen } from './screens/ProgrammeScreen.tsx';
import { GalerieScreen } from './screens/GalerieScreen.tsx';
import { ResadresakaScreen } from './screens/ResadresakaScreen.tsx';
import { FinancesScreen } from './screens/FinancesScreen.tsx';

import { api } from './services/api.ts';

const AppContent: React.FC = () => {
  const { user, role, loading } = useAuth();
  const { t } = useLanguage();
  const { currentSong, isMusicChampOpen, closeMusicChamp } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals & Drawer states
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isPendingApprovalsOpen, setIsPendingApprovalsOpen] = useState<boolean>(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState<boolean>(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
  const [verifyTokenToTest, setVerifyTokenToTest] = useState<string>('');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  const [pendingCount, setPendingCount] = useState<number>(0);

  // Check URL pathname for direct QR verification links like /verify/<token>
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const token = path.replace('/verify/', '').trim();
      if (token) {
        setVerifyTokenToTest(token);
        setIsVerifyOpen(true);
      }
    }
  }, []);

  // Fetch pending count for Admin
  const refreshPendingCount = async () => {
    if (role === 'admin') {
      try {
        const pending = await api.getPendingMembers();
        setPendingCount(pending.length);
      } catch (e) {
        // Ignore
      }
    }
  };

  useEffect(() => {
    refreshPendingCount();
  }, [role]);

  const handleTestVerifyFromBadge = (token: string) => {
    setIsBadgeOpen(false);
    setVerifyTokenToTest(token);
    setIsVerifyOpen(true);
  };

  const handleOpenVerifyModal = () => {
    setVerifyTokenToTest(user?.qrCodeToken || 'v-tok-admin-001-sec');
    setIsVerifyOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-600 gap-3 min-h-screen">
        <div className="w-10 h-10 border-4 border-[#0D4194] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold tracking-wide">ASAFA...</p>
      </div>
    );
  }

  // Not authenticated -> Login Screen (styled matching the image)
  if (!user) {
    return (
      <AndroidFrame
        onOpenVerify={handleOpenVerifyModal}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      >
        <AuthScreen />
        <VerificationModal
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          initialToken={verifyTokenToTest}
        />
        <DiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
        />
      </AndroidFrame>
    );
  }

  // Titles for secondary screens
  const getScreenTitle = () => {
    switch (activeTab) {
      case 'chants':
        return t('chants_title');
      case 'programme':
        return t('programme_title');
      case 'galerie':
        return t('galerie_title');
      case 'resadresaka':
        return t('resadresaka_title');
      case 'finances':
        return t('finances_title');
      default:
        return 'ASAFA';
    }
  };

  // Render main screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={setActiveTab}
            onOpenMenu={() => setIsMenuOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenPendingApprovals={() => setIsPendingApprovalsOpen(true)}
            pendingCount={pendingCount}
          />
        );
      case 'chants':
        return <ChantsScreen />;
      case 'programme':
        return <ProgrammeScreen />;
      case 'galerie':
        return <GalerieScreen />;
      case 'resadresaka':
        return <ResadresakaScreen />;
      case 'finances':
        return <FinancesScreen />;
      default:
        return (
          <DashboardScreen
            onNavigate={setActiveTab}
            onOpenMenu={() => setIsMenuOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenPendingApprovals={() => setIsPendingApprovalsOpen(true)}
            pendingCount={pendingCount}
          />
        );
    }
  };

  return (
    <AndroidFrame
      onOpenBadge={() => setIsBadgeOpen(true)}
      onOpenVerify={handleOpenVerifyModal}
      onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
    >
      {/* Show header on secondary screens (Chants, Resadresaka, and Programme have their own dedicated headers) */}
      {activeTab !== 'dashboard' && activeTab !== 'chants' && activeTab !== 'resadresaka' && activeTab !== 'programme' && (
        <Header
          title={getScreenTitle()}
          onBack={() => setActiveTab('dashboard')}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenBadge={() => setIsBadgeOpen(true)}
        />
      )}

      {/* Screen Body */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {renderScreen()}
      </main>

      {/* 5-Item Bottom Navigation matching image */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Menu / Paramètres & Profil Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenBadge={() => setIsBadgeOpen(true)}
        onOpenVerify={handleOpenVerifyModal}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onNavigate={setActiveTab}
        pendingCount={pendingCount}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToProgramme={() => {
          setIsNotificationsOpen(false);
          setActiveTab('programme');
        }}
      />

      {/* Admin Pending Member Approvals Modal */}
      <PendingApprovalsModal
        isOpen={isPendingApprovalsOpen}
        onClose={() => setIsPendingApprovalsOpen(false)}
        onApprovalSuccess={refreshPendingCount}
      />

      {/* Digital Membership Badge & QR Code */}
      <BadgeModal
        user={user}
        isOpen={isBadgeOpen}
        onClose={() => setIsBadgeOpen(false)}
        onTestVerify={handleTestVerifyFromBadge}
      />

      {/* QR Code Verification Modal */}
      <VerificationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        initialToken={verifyTokenToTest}
      />

      {/* Automated Diagnostics / System Verification Test Runner */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* Floating Music Action Button on other tabs when song is playing */}
      {activeTab !== 'chants' && <FloatingMusicButton />}

      {/* Global Music Champ Modal */}
      <MusicChampModal
        song={currentSong}
        isOpen={isMusicChampOpen}
        onClose={closeMusicChamp}
      />
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AudioPlayerProvider>
          <AppContent />
        </AudioPlayerProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
