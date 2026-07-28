import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp();
  }

  const db = getFirestore();
  const filePath = path.join(__dirname, 'data.json');
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    console.log(`Starting migration of ${data.users.length} users...`);

    for (const user of data.users) {
      const userRef = db.collection('users').doc(user.name.toLowerCase());
      await userRef.set(user);
      console.log(`Migrated user: ${user.name}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
