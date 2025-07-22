
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './sidebar';
import AppHeader from './header';
import { useAuth } from '@/hooks/use-auth';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  if (loading) {
     return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Don't render the main layout on the login page
  if (pathname === '/login') {
    return <main>{children}</main>;
  }
  
  // This should be handled by AuthProvider, but as a fallback
  if (!user) {
    return null; 
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
