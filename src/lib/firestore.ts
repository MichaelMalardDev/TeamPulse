import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import type { TeamMember, WorkStatus } from './data';

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
    const today = new Date();
    const dayString = today.toISOString().split('T')[0];

    const historyIndex = userData.history.findIndex(h => fromTimestamp(h.date).toISOString().startsWith(dayString));
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
        const dayString = date.toISOString().split('T')[0];
        
        const historyIndex = userData.history.findIndex(h => fromTimestamp(h.date).toISOString().startsWith(dayString));
        const newHistory = [...userData.history];

        if (historyIndex > -1) {
            newHistory[historyIndex] = { date: date, status: newStatus };
        } else {
            newHistory.push({ date: date, status: newStatus });
        }

        const updateData: any = { history: newHistory };

        const todayString = new Date().toISOString().split('T')[0];
        if (dayString === todayString) {
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
