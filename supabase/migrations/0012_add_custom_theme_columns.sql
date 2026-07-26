ALTER TABLE catalogs
  ADD COLUMN IF NOT EXISTS custom_theme_mode TEXT,
  ADD COLUMN IF NOT EXISTS custom_theme_color TEXT;

ALTER TABLE catalogs
  ADD CONSTRAINT catalogs_custom_theme_mode_check
  CHECK (custom_theme_mode IS NULL OR custom_theme_mode IN ('light', 'dark'));

ALTER TABLE catalogs
  ADD CONSTRAINT catalogs_custom_theme_color_check
  CHECK (custom_theme_color IS NULL OR custom_theme_color ~ '^#[0-9A-Fa-f]{6}$');
