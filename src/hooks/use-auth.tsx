
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { teamData, TeamMember } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  teamMember: TeamMember | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let member = teamData.find(m => m.name.split(' ')[0] === firebaseUser.displayName?.split(' ')[0]);
        if (!member && firebaseUser.displayName) {
          const newId = Math.max(...teamData.map(m => m.id)) + 1;
          member = {
            id: newId,
            name: firebaseUser.displayName,
            role: 'New User',
            avatarUrl: firebaseUser.photoURL || 'https://placehold.co/100x100',
            status: 'In Office',
            history: [] // Start with empty history for new users
          };
          teamData.push(member);
        }
        setTeamMember(member || null);
      } else {
        setTeamMember(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
    if (!loading && user && pathname === '/login') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);


  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, teamMember, loading, signInWithGoogle, logout };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user && pathname !== '/login') {
    return null; // Don't render children if not logged in and not on login page
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
