import React, { useEffect } from 'react';
import App from './App';
import { AuthProvider, useAuth } from './lib/auth';
import { navigate, usePath } from './lib/router';
import { loadLab } from './lib/labContext';
import { LoginPage } from './pages/LoginPage';
import { QRLanding } from './pages/QRLanding';
import { TeacherApp } from './teacher/TeacherApp';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Memuat…</div>
);

const Router: React.FC = () => {
  const { user, loading } = useAuth();
  const path = usePath();

  const qrMatch = path.match(/^\/q\/([^/]+)\/?$/);
  const isTeacherPath = path === '/guru' || path.startsWith('/guru/');

  // Arahkan pengguna ke area yang sesuai dengan perannya.
  useEffect(() => {
    if (loading || !user) return;
    if (qrMatch) return;
    if (user.role === 'GURU' && !isTeacherPath) navigate('/guru', true);
    if (user.role !== 'GURU' && isTeacherPath) navigate('/', true);
  }, [loading, user, isTeacherPath, qrMatch]);

  if (loading) return <Spinner />;

  // 1) QR → identifikasi lab (publik, tanpa data inventaris)
  if (qrMatch) return <QRLanding token={decodeURIComponent(qrMatch[1])} />;

  // 2) Belum login
  if (!user) return <LoginPage teacherMode={isTeacherPath} lab={isTeacherPath ? loadLab() : null} />;

  // 3) Sudah login
  if (user.role === 'GURU') return isTeacherPath ? <TeacherApp /> : <Spinner />;
  return isTeacherPath ? <Spinner /> : <App />;
};

export const Root: React.FC = () => (
  <AuthProvider>
    <Router />
  </AuthProvider>
);
