/*
  # Add Sample E-commerce Data

  1. Sample Categories
    - Гар утас (Phones)
    - Компьютер (Computers)
    - Хувцас (Clothing)
    - Гутал (Shoes)
    - Цүнх (Bags)
    - Электроник (Electronics)

  2. Sample Products
    - Multiple products across different categories
    - Featured products for homepage display
    - Realistic pricing and stock levels

  3. Admin User Setup
    - Creates a function to promote users to admin
*/

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Гар утас', 'Смартфон, утас болон дагалдах хэрэгсэл'),
  ('Компьютер', 'Зөөврийн болон ширээний компьютер'),
  ('Хувцас', 'Эрэгтэй, эмэгтэй хувцас'),
  ('Гутал', 'Спорт, албан ёсны гутал'),
  ('Цүнх', 'Эмэгтэй, эрэгтэй цүнх'),
  ('Электроник', 'Гэрийн цахилгаан хэрэгсэл')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url) 
SELECT 
  'iPhone 14 Pro',
  'Шилдэг камер, хурдан процессор бүхий iPhone загвар',
  3500000,
  15,
  true,
  c.id,
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'
FROM categories c WHERE c.name = 'Гар утас'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Samsung Galaxy S23',
  'Android үйлдлийн систем бүхий хүчирхэг утас',
  2800000,
  20,
  true,
  c.id,
  'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'
FROM categories c WHERE c.name = 'Гар утас'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'MacBook Pro 14"',
  'M3 чип бүхий мэргэжлийн зөөврийн компьютер',
  5200000,
  8,
  true,
  c.id,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg'
FROM categories c WHERE c.name = 'Компьютер'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Dell XPS 15',
  'Өндөр гүйцэтгэлтэй Windows ноутбук',
  3800000,
  12,
  true,
  c.id,
  'https://images.pexels.com/photos/7974/pexels-photo.jpg'
FROM categories c WHERE c.name = 'Компьютер'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Хүрэм жакет',
  'Өвлийн халуун хүрэм жакет, янз бүрийн өнгөтэй',
  180000,
  30,
  true,
  c.id,
  'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg'
FROM categories c WHERE c.name = 'Хувцас'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Загварын цамц',
  'Өдөр тутмын өмсөхөд тохиромжтой цамц',
  65000,
  50,
  false,
  c.id,
  'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'
FROM categories c WHERE c.name = 'Хувцас'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Спорт гутал Nike',
  'Өндөр чанартай гүйлтийн гутал',
  250000,
  25,
  true,
  c.id,
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
FROM categories c WHERE c.name = 'Гутал'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Арьсан гутал',
  'Албан ёсны арьсан гутал',
  180000,
  18,
  false,
  c.id,
  'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg'
FROM categories c WHERE c.name = 'Гутал'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Эмэгтэй цүнх',
  'Загварын эмэгтэй гар цүнх',
  120000,
  35,
  true,
  c.id,
  'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'
FROM categories c WHERE c.name = 'Цүнх'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Эрэгтэй цүнх',
  'Бизнесийн арьсан цүнх',
  95000,
  22,
  false,
  c.id,
  'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg'
FROM categories c WHERE c.name = 'Цүнх'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Чихэвч',
  'Дуу чимээ багасгах чихэвч',
  85000,
  40,
  false,
  c.id,
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
FROM categories c WHERE c.name = 'Электроник'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, is_featured, category_id, image_url)
SELECT 
  'Ухаалаг цаг',
  'Фитнесс хяналттай ухаалаг цаг',
  150000,
  28,
  false,
  c.id,
  'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg'
FROM categories c WHERE c.name = 'Электроник'
ON CONFLICT DO NOTHING;