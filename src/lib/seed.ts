import { getDb } from './db';
import bcrypt from 'bcryptjs';
import { hardcodedUsers } from './auth';

export async function seedDatabase(): Promise<void> {
  const db = await getDb();
  
  try {
    // Check if we have any users
    const userCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    
    if (userCount && userCount.count === 0) {
      console.log('No users found, seeding hardcoded users...');
      
      for (const user of hardcodedUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await db.run(
          'INSERT INTO users (id, username, password, name, apartmentId, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)',
          user.id,
          user.username,
          hashedPassword,
          user.name,
          user.apartmentId,
          user.forcePasswordChange ? 1 : 0
        );
        
        console.log(`✅ Created user: ${user.username}`);
      }
      
      console.log('⚠️  Users must change their passwords on first login!');
    }
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}
