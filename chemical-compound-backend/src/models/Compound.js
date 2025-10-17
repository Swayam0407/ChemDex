const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Compound model representing chemical compounds in the database
 * Requirements: 4.4, 5.4
 */
class Compound extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // Define associations here if needed in the future
  }

  /**
   * Convert model instance to JSON with clean field names
   */
  toJSON() {
    const values = Object.assign({}, this.get());
    return {
      id: values.id,
      name: values.name,
      image: values.image,
      description: values.description,
      createdAt: values.created_at,
      updatedAt: values.updated_at
    };
  }
}

Compound.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Compound name cannot be empty'
      },
      len: {
        args: [1, 255],
        msg: 'Compound name must be between 1 and 255 characters'
      }
    }
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Image URL cannot be empty'
      },
      len: {
        args: [1, 500],
        msg: 'Image URL must be between 1 and 500 characters'
      },
      isUrl: {
        msg: 'Image must be a valid URL'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 65535],
        msg: 'Description cannot exceed 65535 characters'
      }
    }
  }
}, {
  sequelize,
  modelName: 'Compound',
  tableName: 'compounds',
  underscored: true, // Use snake_case for database columns
  timestamps: true, // Enable created_at and updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Compound;