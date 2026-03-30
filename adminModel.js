const db = require("../config/db");

exports.listUsers = async ({ limit, offset }) => {
  const result = await db.query(
    `
    SELECT id, name, email, role, created_at
    FROM marketplace.users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows;
};

exports.listOrders = async ({ limit, offset }) => {
  const result = await db.query(
    `
    SELECT id, user_id, total, status, notes, created_at
    FROM marketplace.orders
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows;
};

exports.listStores = async ({ limit, offset }) => {
  const result = await db.query(
    `
    SELECT id, name, description, owner_id, created_at
    FROM marketplace.stores
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  return result.rows;
};

exports.getReports = async () => {
  const [users, orders, stores, products, revenue] = await Promise.all([
    db.query("SELECT COUNT(*) AS total FROM marketplace.users"),
    db.query("SELECT COUNT(*) AS total FROM marketplace.orders"),
    db.query("SELECT COUNT(*) AS total FROM marketplace.stores"),
    db.query("SELECT COUNT(*) AS total FROM marketplace.products"),
    db.query("SELECT COALESCE(SUM(total), 0) AS total FROM marketplace.orders"),
  ]);

  return {
    users: Number(users.rows[0].total || 0),
    orders: Number(orders.rows[0].total || 0),
    stores: Number(stores.rows[0].total || 0),
    products: Number(products.rows[0].total || 0),
    revenue: Number(revenue.rows[0].total || 0),
  };
};
