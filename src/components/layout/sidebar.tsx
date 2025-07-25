
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LayoutDashboard, GanttChartSquare, Users } from 'lucide-react';
import React from 'react';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <GanttChartSquare className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">TeamPulse</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Dashboard">
                <div>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/summary" passHref>
              <SidebarMenuButton asChild isActive={pathname === '/summary'} tooltip="AI Scheduler">
                <div>
                  <Users />
                  <span>AI Scheduler</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-muted-foreground p-2">
          &copy; {new Date().getFullYear()} TeamPulse Inc.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
