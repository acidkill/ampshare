
import type { User } from '@/types';

export const hardcodedUsers: User[] = [
  { id: 'user1', username: 'alice_stensvoll', password: 'password1', apartmentId: 'stensvoll', name: 'Alice (Stensvoll)' },
  { id: 'user2', username: 'bob_stensvoll', password: 'password1', apartmentId: 'stensvoll', name: 'Bob (Stensvoll)' },
  { id: 'user3', username: 'charlie_nowak', password: 'password2', apartmentId: 'nowak', name: 'Charlie (Nowak)' },
  { id: 'user4', username: 'dana_nowak', password: 'password2', apartmentId: 'nowak', name: 'Dana (Nowak)' },
];

export const findUserByUsername = (username: string): User | undefined => {
  return hardcodedUsers.find(user => user.username === username);
};

export const getUserById = (userId: string): User | undefined => {
  return hardcodedUsers.find(user => user.id === userId);
};
