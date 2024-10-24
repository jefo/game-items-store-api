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
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    username: { type: 'varchar(255)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    balance: { type: 'numeric(10, 2)', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createTable('items', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    price: { type: 'numeric(10, 2)', notNull: true },
    stock: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

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
    purchase_date: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  pgm.createIndex('purchases', 'user_id');
  pgm.createIndex('purchases', 'item_id');

  pgm.sql(`ALTER SEQUENCE users_id_seq RESTART WITH 1000`);
  pgm.sql(`ALTER SEQUENCE items_id_seq RESTART WITH 1000`);

  pgm.sql(`
    INSERT INTO users (id, username, email, balance) VALUES
    (1, 'testuser1', 'test1@example.com', 5000.00),
    (2, 'testuser2', 'test2@example.com', 3000.00)
  `);

  pgm.sql(`
    INSERT INTO items (id, name, description, price, stock) VALUES
    (1, 'AWP | Dragon Lore', 'Factory New condition, rare AWP skin', 500.00, 100),
    (2, 'AK-47 | Fire Serpent', 'Field-Tested condition, popular AK-47 skin', 200.00, 100),
    (3, 'M4A4 | Howl', 'Minimal Wear condition, contraband grade skin', 1000.00, 0),
    (4, 'Butterfly Knife | Fade', 'Factory New condition, rare knife skin', 400.00, 100),
    (5, 'Glock-18 | Fade', 'Factory New condition, classic pistol skin', 150.00, 100),
    (6, 'USP-S | Kill Confirmed', 'Minimal Wear condition, popular pistol skin', 50.00, 100),
    (7, 'Karambit | Crimson Web', 'Field-Tested condition, popular knife skin', 300.00, 100),
    (8, 'Desert Eagle | Blaze', 'Factory New condition, classic pistol skin', 100.00, 100)
  `);
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
