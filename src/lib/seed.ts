import { getDb } from './db';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // In a real app, this should come from environment variables
const ADMIN_NAME = 'Administrator';

export async function seedDatabase() {
  console.log('Starting database seeding...');
  const db = await getDb();
  
  try {
    // Check if any users exist
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    
    if (userCount && userCount.count > 0) {
      console.log('Users already exist, skipping seeding');
      return;
    }
    
    console.log('No users found, creating admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Insert the admin user
    const result = await db.run(
      'INSERT INTO users (username, password, name, role, apartmentId, forcePasswordChange) VALUES (?, ?, ?, ?, ?, ?)',
      [ADMIN_USERNAME, hashedPassword, ADMIN_NAME, 'admin', 'admin', 1]
    );
    
    if (result.lastID) {
      console.log(`Created admin user with ID: ${result.lastID}`);
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Please change this password after first login!');
    } else {
      console.error('Failed to create admin user');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
