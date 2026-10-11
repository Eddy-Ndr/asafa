import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
  onOpenBadge?: () => void;
  onOpenVerify?: () => void;
  onOpenDiagnostics?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-800">
      {/* Seamless Modern Mobile Container matching the screenshot */}
      <main className="w-full max-w-md flex-1 flex flex-col bg-white shadow-xl sm:border-x sm:border-slate-200 min-h-screen relative overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          {children}
        </div>
      </main>
    </div>
  );
};
