CREATE TABLE IF NOT EXISTS marketplace.analytics_events (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES marketplace.users(id),
  event_type VARCHAR(40) NOT NULL,
  product_id INT REFERENCES marketplace.products(id),
  store_id INT REFERENCES marketplace.stores(id),
  query TEXT,
  metadata JSONB,
  session_id VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON marketplace.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_product ON marketplace.analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_store ON marketplace.analytics_events(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON marketplace.analytics_events(created_at DESC);
