ALTER TABLE "customers" ADD COLUMN "full_name" text GENERATED ALWAYS AS ("customers"."last_name" || "customers"."first_name") STORED;
ALTER TABLE "customers" ADD COLUMN "full_name_kana" text GENERATED ALWAYS AS ("customers"."last_name_kana" || "customers"."first_name_kana") STORED;

-- インデックス設計: 1,000〜10,000件を想定

-- 前方一致検索用インデックス（text_pattern_ops）
CREATE INDEX idx_customers_last_name_search ON "customers" (last_name text_pattern_ops);
CREATE INDEX idx_customers_first_name_search ON "customers" (first_name text_pattern_ops);
CREATE INDEX idx_customers_last_name_kana_search ON "customers" (last_name_kana text_pattern_ops);
CREATE INDEX idx_customers_first_name_kana_search ON "customers" (first_name_kana text_pattern_ops);
CREATE INDEX idx_customers_full_name_search ON "customers" (full_name text_pattern_ops);
CREATE INDEX idx_customers_full_name_kana_search ON "customers" (full_name_kana text_pattern_ops);
CREATE INDEX idx_customers_phone_search ON "customers" (phone text_pattern_ops);
CREATE INDEX idx_customers_email_search ON "customers" (email text_pattern_ops);

-- ソート用インデックス（通常B-tree）※キーワードなし全件取得時に有効
CREATE INDEX idx_customers_sort ON "customers" (full_name, customer_id);
