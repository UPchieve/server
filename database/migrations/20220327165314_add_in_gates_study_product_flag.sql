-- migrate:up
ALTER TABLE upchieve.user_product_flags
  ADD COLUMN in_gates_study boolean NOT NULL DEFAULT false;

-- migrate:down
ALTER TABLE upchieve.user_product_flags
  DROP COLUMN in_gates_study;
