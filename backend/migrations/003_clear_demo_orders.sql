-- Optional: Run this in Neon SQL Editor ONLY if you want to wipe the seeded demo orders
-- and start with a completely clean order board (keeps users & menus intact).
TRUNCATE TABLE delivery_verifications, order_items, orders RESTART IDENTITY CASCADE;
