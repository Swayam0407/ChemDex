const { sequelize } = require('../src/config/database');

/**
 * Recreate compounds table with new schema
 */
async function recreateTable() {
  try {
    console.log('Recreating compounds table with new schema...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    // Drop existing table
    await sequelize.query('DROP TABLE IF EXISTS compounds');
    console.log('✓ Dropped existing compounds table');
    
    // Create new table with all required columns
    const createTableSQL = `
      CREATE TABLE compounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(500) NOT NULL,
        description TEXT,
        image_source VARCHAR(500),
        image_attribution VARCHAR(500),
        date_modified DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sequelize.query(createTableSQL);
    console.log('✓ Created new compounds table with extended schema');
    
    // Create indexes
    await sequelize.query('CREATE INDEX idx_compounds_name ON compounds(name)');
    await sequelize.query('CREATE INDEX idx_compounds_created_at ON compounds(created_at)');
    console.log('✓ Created indexes');
    
    console.log('✓ Table recreation completed successfully!');
    
  } catch (error) {
    console.error('Table recreation failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  recreateTable()
    .then(() => {
      console.log('Table recreation process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Table recreation process failed:', error);
      process.exit(1);
    });
}

module.exports = { recreateTable };