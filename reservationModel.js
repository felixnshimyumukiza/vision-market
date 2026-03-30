const db = require("../config/db");

const run = (client, text, params) =>
  client ? client.query(text, params) : db.query(text, params);

exports.createReservation = async (client, payload) => {
  const result = await run(
    client,
    `
    INSERT INTO marketplace.reservations
      (user_id, product_id, quantity, expires_at, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, product_id, quantity, expires_at, status, notes, created_at
    `,
    [
      payload.userId,
      payload.productId,
      payload.quantity,
      payload.expiresAt,
      payload.status,
      payload.notes,
    ]
  );

  return result.rows[0];
};

exports.listReservationsByUser = async (userId) => {
  const result = await db.query(
    `
    SELECT id, user_id, product_id, quantity, expires_at, status, notes, created_at
    FROM marketplace.reservations
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

exports.listAllReservations = async () => {
  const result = await db.query(
    `
    SELECT id, user_id, product_id, quantity, expires_at, status, notes, created_at
    FROM marketplace.reservations
    ORDER BY created_at DESC
    `
  );

  return result.rows;
};

exports.getReservationById = async (id, client) => {
  const result = await run(
    client,
    `
    SELECT id, user_id, product_id, quantity, expires_at, status, notes, created_at
    FROM marketplace.reservations
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

exports.updateReservation = async (id, fields, client) => {
  const updates = Object.entries(fields || {}).filter(
    ([, value]) => value !== undefined
  );

  if (updates.length === 0) {
    return exports.getReservationById(id, client);
  }

  const setClauses = updates.map(
    ([key], index) => `${key} = $${index + 2}`
  );
  const values = updates.map(([, value]) => value);

  const result = await run(
    client,
    `
    UPDATE marketplace.reservations
    SET ${setClauses.join(", ")}
    WHERE id = $1
    RETURNING id, user_id, product_id, quantity, expires_at, status, notes, created_at
    `,
    [id, ...values]
  );

  return result.rows[0];
};

exports.deleteReservation = async (id, client) => {
  const result = await run(
    client,
    `
    DELETE FROM marketplace.reservations
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};
