-- Seed data for development / demo

INSERT INTO users (id, email, role, avatar_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@neogallery.ru', 'admin', '/avatars/admin.jpg'),
  ('a0000000-0000-0000-0000-000000000002', 'artist1@neogallery.ru', 'artist', '/avatars/artist1.jpg'),
  ('a0000000-0000-0000-0000-000000000003', 'artist2@neogallery.ru', 'artist', '/avatars/artist2.jpg'),
  ('a0000000-0000-0000-0000-000000000004', 'visitor@neogallery.ru', 'visitor', '/avatars/visitor.jpg');

INSERT INTO artists (user_id, bio, tier) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Цифровой скульптор, работающий с формой и светом', 'pro'),
  ('a0000000-0000-0000-0000-000000000003', 'Генеративный художник, исследующий алгоритмы природы', 'premium');

INSERT INTO exhibitions (id, title, slug, status, start_date, end_date, cover_url, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Свет и Тень', 'svet-i-ten', 'published', '2024-03-01', '2024-06-30', '/covers/svet.jpg', 'Исследование цифрового света в виртуальном пространстве'),
  ('b0000000-0000-0000-0000-000000000002', 'Генезис Форм', 'genezis-form', 'published', '2024-04-15', '2024-08-15', '/covers/genezis.jpg', 'Генеративное искусство и эволюция формы'),
  ('b0000000-0000-0000-0000-000000000003', 'Незавершённое', 'nezavershennoe', 'draft', '2024-06-01', NULL, '/covers/nezav.jpg', 'Работа в процессе — выставка в разработке');

INSERT INTO artworks (exhibition_id, artist_id, title, media_type, file_url, thumb_url, price, license_type, polygon_count, lod_levels, position_x, position_y, position_z) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Луч сквозь тьму', 'image', '/artworks/ray.jpg', '/artworks/ray_thumb.jpg', 1500.00, 'personal', NULL, NULL, -3, 1.5, -5),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Преломление', '3d', '/artworks/refraction.glb', '/artworks/refraction_thumb.jpg', 3500.00, 'commercial', 45000, 3, 0, 0, -8),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Пульсация', 'video', '/artworks/pulse.mp4', '/artworks/pulse_thumb.jpg', 2000.00, 'personal', NULL, NULL, 3, 1.5, -5),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Алгоритм роста', '3d', '/artworks/growth.glb', '/artworks/growth_thumb.jpg', 5000.00, 'commercial', 62000, 3, 0, 0, -10),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Эрозия', 'image', '/artworks/erosion.jpg', '/artworks/erosion_thumb.jpg', 800.00, 'personal', NULL, NULL, -4, 1.5, -10),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Фрактальный дождь', 'audio', '/artworks/fractal.mp3', '/artworks/fractal_thumb.jpg', 1200.00, 'personal', NULL, NULL, 4, 1.5, -10);

INSERT INTO tickets (exhibition_id, type, price, max_qty, perks_json) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'single', 299.00, 500, '{"access": "full", "guide": true}'),
  ('b0000000-0000-0000-0000-000000000001', 'season', 999.00, 100, '{"access": "full", "guide": true, "merch_discount": 10, "early_access": true}'),
  ('b0000000-0000-0000-0000-000000000002', 'single', 199.00, 300, '{"access": "full", "guide": true}'),
  ('b0000000-0000-0000-0000-000000000002', 'season', 799.00, 50, '{"access": "full", "guide": true, "merch_discount": 15}');
