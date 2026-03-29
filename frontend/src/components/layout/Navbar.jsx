import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Moon,
  Sun,
  Github,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 REAL AUTH DATA
  const {
    isAuthenticated,
    user,
    profile,
    role,
    logout,
  } = useAuth();

  // 🔗 Dynamic nav links
  const navLinks = isAuthenticated
    ? role === 'recruiter'
      ? [
          { href: '/recruiter', label: 'Search' },
          { href: '/shortlist', label: 'Shortlist' },
          { href: '/leaderboard', label: 'Leaderboard' },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/leaderboard', label: 'Leaderboard' },
        ]
    : [
        { href: '/#features', label: 'Features' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/recruiters', label: 'For Recruiters' },
      ];

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SkillHire</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors"
                >
                  <Avatar
                    src={profile?.avatarUrl}
                    name={profile?.username}
                    size="sm"
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-semibold text-foreground">
                          {profile?.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{profile?.username}
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent"
                      >
                        <User className="w-4 h-4" />
                        Dashboard
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-accent"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="gradient"
                    size="sm"
                    icon={<Github className="w-4 h-4" />}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
