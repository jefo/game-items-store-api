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
  // Drop existing tables in reverse order
  pgm.dropTable('purchases');
  pgm.dropTable('items');
  pgm.dropTable('users');

  // Recreate users table with new schema
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    username: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    balance: { type: 'decimal(10, 2)', notNull: true, default: 0.00 },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Recreate items table as game_items with new schema
  pgm.createTable('game_items', {
    id: { type: 'serial', primaryKey: true },
    skinport_id: { type: 'varchar(255)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    tradable_price: { type: 'decimal(10, 2)' },
    non_tradable_price: { type: 'decimal(10, 2)' },
    updated_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Recreate purchases table with new schema
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
      references: '"game_items"',
      onDelete: 'CASCADE'
    },
    price: { type: 'decimal(10, 2)', notNull: true },
    created_at: { type: 'timestamp with time zone', notNull: true, default: pgm.func('current_timestamp') },
    is_tradable: { type: 'boolean', notNull: true }
  });

  // Create indexes
  pgm.createIndex('purchases', 'user_id');
  pgm.createIndex('purchases', 'item_id');

  // Add trigger to update updated_at timestamp
  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    `
  );

  // Add triggers to tables
  pgm.createTrigger('users', 'update_updated_at_trigger', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'update_updated_at_column',
  });

  pgm.createTrigger('game_items', 'update_updated_at_trigger', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'update_updated_at_column',
  });

  // Insert test data
  pgm.sql(`
    INSERT INTO users (username, password_hash, balance) VALUES
    ('testuser1', '$argon2id$v=19$m=65536,t=3,p=4$UQe6c5XhXkjxLqEDpP2Xfw$2jEN4xcww6eH4LqD+H5LfxBtQqKcpqXPuZqGvn3nFEY', 5000.00),
    ('testuser2', '$argon2id$v=19$m=65536,t=3,p=4$h3vR2FLG7nKbxTh7qnq3Yw$cQj4TfFTgaXG0AqKcx9hm6TWy6tUH9jXqNYqXfHlWyY', 3000.00)
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop triggers
  pgm.dropTrigger('users', 'update_updated_at_trigger');
  pgm.dropTrigger('game_items', 'update_updated_at_trigger');
  
  // Drop function
  pgm.dropFunction('update_updated_at_column', []);
  
  // Drop tables
  pgm.dropTable('purchases');
  pgm.dropTable('game_items');
  pgm.dropTable('users');
};
