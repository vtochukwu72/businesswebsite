'use server';

import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { User } from '@/lib/types';

const db = getFirestore(app);

export async function getUsers(count?: number): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = count 
      ? query(usersCol, orderBy('createdAt', 'desc'), limit(count))
      : query(usersCol, orderBy('createdAt', 'desc'));
    
    const userSnapshot = await getDocs(q);
    const userList = userSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as User;
    });
    return userList;
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
}
