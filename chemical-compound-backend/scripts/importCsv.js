const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { initializeDatabase, Compound } = require('../src/models');

/**
 * CSV Import functionality for chemical compounds
 * Requirements: 5.3
 */

/**
 * Validate compound data from CSV
 * @param {Object} compound - Compound data object
 * @returns {Object} - Validation result with isValid flag and errors array
 */
function validateCompoundData(compound) {
  const errors = [];
  
  // Validate name
  if (!compound.name || typeof compound.name !== 'string' || compound.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  } else if (compound.name.length > 255) {
    errors.push('Name must not exceed 255 characters');
  }
  
  // Validate image URL
  if (!compound.image || typeof compound.image !== 'string' || compound.image.trim().length === 0) {
    errors.push('Image URL is required and must be a non-empty string');
  } else if (compound.image.length > 500) {
    errors.push('Image URL must not exceed 500 characters');
  } else {
    // Basic URL validation
    try {
      new URL(compound.image);
    } catch (e) {
      errors.push('Image must be a valid URL');
    }
  }
  
  // Validate description (optional)
  if (compound.description && compound.description.length > 65535) {
    errors.push('Description must not exceed 65535 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Parse CSV file and extract compound data
 * @param {string} csvFilePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of compound objects
 */
function parseCsvFile(csvFilePath) {
  return new Promise((resolve, reject) => {
    const compounds = [];
    const errors = [];
    let rowIndex = 0;
    
    if (!fs.existsSync(csvFilePath)) {
      reject(new Error(`CSV file not found: ${csvFilePath}`));
      return;
    }
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        rowIndex++;
        
        // Clean and prepare compound data
        const compound = {
          name: row.name ? row.name.trim() : '',
          image: row.image ? row.image.trim() : '',
          description: row.description ? row.description.trim() : null
        };
        
        // Validate compound data
        const validation = validateCompoundData(compound);
        if (validation.isValid) {
          compounds.push(compound);
        } else {
          errors.push({
            row: rowIndex,
            compound: compound.name || 'Unknown',
            errors: validation.errors
          });
        }
      })
      .on('end', () => {
        if (errors.length > 0) {
          console.warn(`Found ${errors.length} validation errors:`);
          errors.forEach(error => {
            console.warn(`Row ${error.row} (${error.compound}): ${error.errors.join(', ')}`);
          });
        }
        
        console.log(`Successfully parsed ${compounds.length} valid compounds from CSV`);
        resolve({ compounds, errors });
      })
      .on('error', (error) => {
        reject(new Error(`Error reading CSV file: ${error.message}`));
      });
  });
}

/**
 * Seed database with compound data
 * @param {Array} compounds - Array of compound objects
 * @returns {Promise<Array>} - Array of created compound instances
 */
async function seedDatabase(compounds) {
  try {
    console.log(`Starting database seeding with ${compounds.length} compounds...`);
    
    // Clear existing data (optional - remove this in production)
    const existingCount = await Compound.count();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing compounds. Clearing database...`);
      await Compound.destroy({ where: {}, truncate: true });
    }
    
    // Insert compounds in batches for better performance
    const batchSize = 10;
    const createdCompounds = [];
    
    for (let i = 0; i < compounds.length; i += batchSize) {
      const batch = compounds.slice(i, i + batchSize);
      
      try {
        const batchResults = await Compound.bulkCreate(batch, {
          validate: true,
          returning: true
        });
        
        createdCompounds.push(...batchResults);
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(compounds.length / batchSize)} (${batchResults.length} compounds)`);
      } catch (error) {
        console.error(`✗ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        
        // Try inserting individually to identify problematic records
        for (const compound of batch) {
          try {
            const result = await Compound.create(compound);
            createdCompounds.push(result);
            console.log(`✓ Individually inserted: ${compound.name}`);
          } catch (individualError) {
            console.error(`✗ Failed to insert ${compound.name}:`, individualError.message);
          }
        }
      }
    }
    
    console.log(`✓ Database seeding completed. ${createdCompounds.length} compounds inserted successfully.`);
    return createdCompounds;
    
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

/**
 * Main import function
 * @param {string} csvFilePath - Path to the CSV file (optional, defaults to data/compounds.csv)
 */
async function importCompoundsFromCsv(csvFilePath = null) {
  try {
    // Default CSV file path
    const defaultCsvPath = path.join(__dirname, '../data/compounds.csv');
    const filePath = csvFilePath || defaultCsvPath;
    
    console.log('=== Chemical Compounds CSV Import ===');
    console.log(`CSV file: ${filePath}`);
    
    // Initialize database connection
    console.log('Initializing database connection...');
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      throw new Error('Failed to initialize database connection');
    }
    
    // Parse CSV file
    console.log('Parsing CSV file...');
    const { compounds, errors } = await parseCsvFile(filePath);
    
    if (compounds.length === 0) {
      throw new Error('No valid compounds found in CSV file');
    }
    
    // Seed database
    const createdCompounds = await seedDatabase(compounds);
    
    // Summary
    console.log('\n=== Import Summary ===');
    console.log(`Total rows processed: ${compounds.length + errors.length}`);
    console.log(`Valid compounds: ${compounds.length}`);
    console.log(`Validation errors: ${errors.length}`);
    console.log(`Successfully imported: ${createdCompounds.length}`);
    
    if (errors.length > 0) {
      console.log('\nValidation errors occurred. Check the logs above for details.');
    }
    
    return {
      success: true,
      imported: createdCompounds.length,
      errors: errors.length,
      compounds: createdCompounds
    };
    
  } catch (error) {
    console.error('\n=== Import Failed ===');
    console.error('Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run import if this script is executed directly
if (require.main === module) {
  importCompoundsFromCsv()
    .then((result) => {
      if (result.success) {
        console.log('\n✓ CSV import completed successfully!');
        process.exit(0);
      } else {
        console.log('\n✗ CSV import failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = {
  importCompoundsFromCsv,
  parseCsvFile,
  seedDatabase,
  validateCompoundData
};