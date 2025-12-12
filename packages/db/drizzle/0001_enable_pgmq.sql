-- CREATE EXTENSION を実行した際に search_path がクリアされてしまうので
-- 事前に保存して復元する
DO $$
BEGIN
  PERFORM set_config('app.saved_search_path', current_setting('search_path'), false);
END $$;

-- pgmq 拡張の有効化
CREATE EXTENSION IF NOT EXISTS pgmq;

DO $$
BEGIN
  PERFORM set_config('search_path', current_setting('app.saved_search_path'), false);
END $$;
