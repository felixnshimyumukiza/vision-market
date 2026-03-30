const db = require("../config/db");

const run = (client, text, params) =>
  client ? client.query(text, params) : db.query(text, params);

exports.listByUser = async (userId) => {
  const result = await db.query(
    `
    SELECT id, user_id, country, city, district, street, postal_code, is_default, created_at
    FROM marketplace.user_addresses
    WHERE user_id = $1
    ORDER BY is_default DESC, created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

exports.getById = async (id) => {
  const result = await db.query(
    `
    SELECT id, user_id, country, city, district, street, postal_code, is_default, created_at
    FROM marketplace.user_addresses
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

exports.clearDefault = async (client, userId) => {
  await run(
    client,
    `
    UPDATE marketplace.user_addresses
    SET is_default = FALSE
    WHERE user_id = $1
    `,
    [userId]
  );
};

exports.createAddress = async (client, payload) => {
  const result = await run(
    client,
    `
    INSERT INTO marketplace.user_addresses
      (user_id, country, city, district, street, postal_code, is_default)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, user_id, country, city, district, street, postal_code, is_default, created_at
    `,
    [
      payload.userId,
      payload.country,
      payload.city,
      payload.district,
      payload.street,
      payload.postal_code,
      payload.is_default,
    ]
  );

  return result.rows[0];
};

exports.updateAddress = async (client, id, fields) => {
  const updates = Object.entries(fields || {}).filter(
    ([, value]) => value !== undefined
  );

  if (updates.length === 0) {
    return exports.getById(id);
  }

  const setClauses = updates.map(
    ([key], index) => `${key} = $${index + 2}`
  );
  const values = updates.map(([, value]) => value);

  const result = await run(
    client,
    `
    UPDATE marketplace.user_addresses
    SET ${setClauses.join(", ")}
    WHERE id = $1
    RETURNING id, user_id, country, city, district, street, postal_code, is_default, created_at
    `,
    [id, ...values]
  );

  return result.rows[0];
};

exports.deleteAddress = async (id) => {
  const result = await db.query(
    `
    DELETE FROM marketplace.user_addresses
    WHERE id = $1
    RETURNING id
    `,
    [id]
  );

  return result.rows[0];
};
