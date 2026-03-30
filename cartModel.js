const db = require("../config/db");

exports.getCartByUser = async (userId) => {
  const result = await db.query(
    `
    SELECT
      c.id,
      c.user_id,
      c.product_id,
      c.quantity,
      c.created_at,
      p.name,
      p.price,
      p.image_url
    FROM marketplace.cart_items c
    JOIN marketplace.products p ON p.id = c.product_id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

exports.getCartItemById = async (id) => {
  const result = await db.query(
    `
    SELECT id, user_id, product_id, quantity
    FROM marketplace.cart_items
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

exports.getCartItemByUserAndProduct = async (userId, productId) => {
  const result = await db.query(
    `
    SELECT id, user_id, product_id, quantity
    FROM marketplace.cart_items
    WHERE user_id = $1 AND product_id = $2
    `,
    [userId, productId]
  );

  return result.rows[0];
};

exports.addOrIncrementItem = async ({ userId, productId, quantity }) => {
  const result = await db.query(
    `
    INSERT INTO marketplace.cart_items (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET quantity = marketplace.cart_items.quantity + EXCLUDED.quantity
    RETURNING id, user_id, product_id, quantity, created_at
    `,
    [userId, productId, quantity]
  );

  return result.rows[0];
};

exports.updateCartItem = async (id, quantity) => {
  const result = await db.query(
    `
    UPDATE marketplace.cart_items
    SET quantity = $2
    WHERE id = $1
    RETURNING id, user_id, product_id, quantity, created_at
    `,
    [id, quantity]
  );

  return result.rows[0];
};

exports.removeCartItem = async (id) => {
  const result = await db.query(
    `
    DELETE FROM marketplace.cart_items
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};

exports.clearCartByUser = async (userId) => {
  await db.query(
    `
    DELETE FROM marketplace.cart_items
    WHERE user_id = $1
    `,
    [userId]
  );
};
