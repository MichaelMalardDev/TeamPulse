
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/firestore';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ProfileCalendar from './profile-calendar';

export default function ProfilePage() {
  const { teamMember, loading } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (teamMember) {
      setName(teamMember.name);
      setRole(teamMember.role);
    }
  }, [teamMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamMember) return;
    setIsSaving(true);
    try {
      await updateUserProfile(teamMember.id, { name, role });
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been successfully updated.',
      });
      // Note: useAuth will need to be refreshed to see changes in the header immediately.
      // For now, we assume a page reload or re-login would show the updated data.
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !teamMember) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Your Profile
        </h1>
        <p className="text-muted-foreground">
          View and edit your personal information and presence history.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                    <AvatarImage src={teamMember.avatarUrl} alt={teamMember.name} data-ai-hint="profile avatar" />
                    <AvatarFallback>{teamMember.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                    <CardTitle className="text-2xl">{teamMember.name}</CardTitle>
                    <CardDescription>{teamMember.role}</CardDescription>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                        id="role" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required 
                    />
                    </div>
                    <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Presence Calendar</CardTitle>
                    <CardDescription>Your historical and planned presence. Click on a day to see details.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-2 md:p-4">
                    <ProfileCalendar member={teamMember} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
