const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

// Example image updates
const imageUpdates = [
  { id: 1, image: 'https://example.com/water.png' },
  { id: 2, image: 'https://example.com/methane.png' },
  // Add more as needed
];

async function updateImages() {
  console.log('Updating compound images...');
  
  for (const update of imageUpdates) {
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE compounds SET image = ? WHERE id = ?',
        [update.image, update.id],
        function(err) {
          if (err) {
            console.error(`Error updating compound ${update.id}:`, err);
            reject(err);
          } else {
            console.log(`Updated compound ${update.id} with image URL`);
            resolve();
          }
        }
      );
    });
  }
  
  console.log('Image updates complete!');
  db.close();
}

updateImages().catch(console.error);