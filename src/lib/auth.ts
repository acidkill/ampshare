import type { User } from '@/types';

export const hardcodedUsers: User[] = [
  { id: 'user1', username: 'alice_apt1', password: 'password1', apartmentId: 'apartment1', name: 'Alice (Apt 1)' },
  { id: 'user2', username: 'bob_apt1', password: 'password1', apartmentId: 'apartment1', name: 'Bob (Apt 1)' },
  { id: 'user3', username: 'charlie_apt2', password: 'password2', apartmentId: 'apartment2', name: 'Charlie (Apt 2)' },
  { id: 'user4', username: 'dana_apt2', password: 'password2', apartmentId: 'apartment2', name: 'Dana (Apt 2)' },
];

export const findUserByUsername = (username: string): User | undefined => {
  return hardcodedUsers.find(user => user.username === username);
};

export const getUserById = (userId: string): User | undefined => {
  return hardcodedUsers.find(user => user.id === userId);
};
