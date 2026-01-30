import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export const DashboardLayout = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex">
        {sidebar && (
          <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-border bg-card/50 overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className={`flex-1 ${sidebar ? 'lg:ml-64' : ''}`}>{children}</main>
      </div>
    </div>
  );
};
