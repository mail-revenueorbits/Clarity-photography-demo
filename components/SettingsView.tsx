import React, { useState, useEffect } from 'react';
import { Bell, Download } from 'lucide-react';

const SettingsView = () => {
  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const triggerNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Notifications are not supported in this browser.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Clarity PWA', {
        body: 'This is a test notification from the Settings tab!',
      });
      setNotificationStatus('Notification triggered successfully!');
    } else {
      setNotificationStatus('Notification permission denied.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl mx-auto shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Application Settings</h2>
      
      <div className="space-y-6">
        
        {/* PWA Install Section */}
        <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-red-600" />
                Install Application
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Install Clarity as a Progressive Web App (PWA) for native experience.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                deferredPrompt 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {deferredPrompt ? 'Install App' : 'Already Installed / Not Supported'}
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="p-4 border border-slate-100 rounded-lg bg-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                PWA Notifications
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Test the progressive web app notification system.
              </p>
            </div>
            <button
              onClick={triggerNotification}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Trigger Notification
            </button>
          </div>
          {notificationStatus && (
            <p className={`mt-3 text-sm ${notificationStatus.includes('successfully') ? 'text-green-600' : 'text-amber-600'}`}>
              {notificationStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
