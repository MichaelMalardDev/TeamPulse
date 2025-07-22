
import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import type { TeamMember, WorkStatus } from './data';
import { startOfDay } from 'date-fns';

function fromTimestamp(timestamp: Timestamp | Date): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
}

export async function getTeamMember(userId: string): Promise<TeamMember | null> {
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      id: userSnap.id,
      history: (data.history || []).map((h: any) => ({
        ...h,
        date: fromTimestamp(h.date),
      })),
    } as TeamMember;
  }
  return null;
}

export async function createTeamMember(user: User): Promise<TeamMember> {
  const newUser: TeamMember = {
    id: user.uid,
    name: user.displayName || 'New User',
    role: 'New User',
    avatarUrl: user.photoURL || 'https://placehold.co/100x100',
    status: 'In Office',
    history: [],
  };
  await setDoc(doc(db, 'users', user.uid), newUser);
  return newUser;
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const usersCollectionRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersCollectionRef);
  return querySnapshot.docs.map(docSnap => {
     const data = docSnap.data();
     return {
        ...data,
        id: docSnap.id,
        history: (data.history || []).map((h: any) => ({
          ...h,
          date: fromTimestamp(h.date),
        })),
      } as TeamMember;
  });
}

export async function updateUserStatus(userId: string, newStatus: WorkStatus) {
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as TeamMember;
    const today = startOfDay(new Date());

    const historyIndex = userData.history.findIndex(h => startOfDay(fromTimestamp(h.date)).getTime() === today.getTime());
    
    const newHistory = [...userData.history];

    if (historyIndex > -1) {
      newHistory[historyIndex] = { date: today, status: newStatus };
    } else {
      newHistory.push({ date: today, status: newStatus });
    }

    await updateDoc(userDocRef, {
      status: newStatus,
      history: newHistory,
    });
  }
}

export async function updateFutureStatus(userId: string, date: Date, newStatus: WorkStatus) {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
        const userData = userSnap.data() as TeamMember;
        const targetDay = startOfDay(date);
        
        const historyIndex = userData.history.findIndex(h => startOfDay(fromTimestamp(h.date)).getTime() === targetDay.getTime());
        const newHistory = [...userData.history];

        if (historyIndex > -1) {
            newHistory[historyIndex] = { date: targetDay, status: newStatus };
        } else {
            newHistory.push({ date: targetDay, status: newStatus });
        }

        const updateData: any = { history: newHistory };
        
        const today = startOfDay(new Date());
        if (targetDay.getTime() === today.getTime()) {
          updateData.status = newStatus;
        }

        await updateDoc(userDocRef, updateData);
    }
}

export async function batchUpdateUserStatus(userId: string, dates: Date[], newStatus: WorkStatus) {
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const userData = userSnap.data() as TeamMember;
    const newHistory = [...userData.history];

    dates.forEach(date => {
      const targetDay = startOfDay(date);
      const historyIndex = newHistory.findIndex(h => startOfDay(fromTimestamp(h.date)).getTime() === targetDay.getTime());
      
      if (historyIndex > -1) {
        newHistory[historyIndex].status = newStatus;
      } else {
        newHistory.push({ date: targetDay, status: newStatus });
      }
    });

    const updateData: any = { history: newHistory };

    // Check if one of the updated dates is today
    const today = startOfDay(new Date());
    if (dates.some(d => startOfDay(d).getTime() === today.getTime())) {
      updateData.status = newStatus;
    }

    await updateDoc(userDocRef, updateData);
  }
}


export async function getRemoteTeamMembers(): Promise<TeamMember[]> {
  const usersCollectionRef = collection(db, 'users');
  const q = query(usersCollectionRef, where("status", "==", "Remote"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => {
     const data = docSnap.data();
     return {
        ...data,
        id: docSnap.id,
        history: (data.history || []).map((h: any) => ({
          ...h,
          date: fromTimestamp(h.date),
        })),
      } as TeamMember;
  });
}
