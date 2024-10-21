/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create users table
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    username: { type: 'varchar(255)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Create items table
  pgm.createTable('items', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    price: { type: 'numeric(10, 2)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Create purchases table
  pgm.createTable('purchases', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    item_id: {
      type: 'integer',
      notNull: true,
      references: '"items"',
      onDelete: 'CASCADE'
    },
    quantity: { type: 'integer', notNull: true, default: 1 },
    total_price: { type: 'numeric(10, 2)', notNull: true },
    purchase_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Add indexes for better query performance
  pgm.createIndex('purchases', 'user_id');
  pgm.createIndex('purchases', 'item_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop tables in reverse order
  pgm.dropTable('purchases');
  pgm.dropTable('items');
  pgm.dropTable('users');
};
