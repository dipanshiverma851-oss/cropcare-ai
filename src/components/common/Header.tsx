import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  PlusCircle,
  History,
  GitCompare,
  TrendingUp,
  BookOpen,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  UserCheck,
  ArrowRightLeft
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sprout },
    { id: 'new-scan', label: 'New Crop Scan', icon: PlusCircle, highlight: true },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'compare', label: 'Compare Scans', icon: GitCompare },
    { id: 'progression', label: 'Progression', icon: TrendingUp },
    { id: 'library', label: 'Disease Library', icon: BookOpen },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldAlert }] : [])
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleRoleToggle = async () => {
    if (user?.role === 'admin') {
      await quickDemoLogin('user');
    } else {
      await quickDemoLogin('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 focus:outline-hidden group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:bg-emerald-700 transition-colors">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">CropCare</span>
                <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-normal hidden sm:block">Agricultural Leaf Diagnostic Platform</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = currentView === item.id;
                if (item.highlight) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                        active
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* User Profile & Demo Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {/* Role Toggle Switcher for immediate testing */}
                <button
                  onClick={handleRoleToggle}
                  title={`Switch to ${user.role === 'admin' ? 'Farmer' : 'Admin'} Role`}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-full border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 bg-slate-50 text-slate-700 transition-colors"
                >
                  <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                  <span>{user.role === 'admin' ? 'Role: Admin' : 'Role: Farmer'}</span>
                </button>

                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user.fullName}</div>
                  <div className="text-[10px] text-slate-500">{user.farmName || user.email}</div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && (
              <button
                onClick={() => handleNav('new-scan')}
                className="p-2 bg-emerald-600 text-white rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {isAuthenticated && (
            <div className="py-2 border-b border-slate-100 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{user?.fullName}</div>
                  <div className="text-xs text-slate-500">{user?.farmName || user?.email}</div>
                </div>
                <button
                  onClick={handleRoleToggle}
                  className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700"
                >
                  Switch to {user?.role === 'admin' ? 'Farmer' : 'Admin'}
                </button>
              </div>
            </div>
          )}

          {isAuthenticated ? (
            <>
              {navItems.map(item => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-slate-500" />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-600 rounded-lg"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
