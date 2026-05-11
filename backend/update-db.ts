import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("ALTER TABLE search_queries ADD COLUMN status VARCHAR(255) DEFAULT 'pending';", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column status already exists.');
      } else {
        console.error('Error adding column:', err.message);
      }
    } else {
      console.log('Successfully added status column to search_queries table.');
    }
  });
});

db.close();
