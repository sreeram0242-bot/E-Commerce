// ============================================================
// DATABASE SEED — Demo data for development
// ============================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Clear existing data ─────────────────────────────────
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.storeSettings.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ───────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const customerPassword = await bcrypt.hash('customer123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@luxecart.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+919876543210',
      role: 'SUPER_ADMIN',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'rahul@example.com',
      password: customerPassword,
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+919876543211',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      password: customerPassword,
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+919876543212',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users created');

  // ── Addresses ───────────────────────────────────────────
  await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'Rahul Sharma',
      phone: '+919876543211',
      addressLine1: '42, MG Road, Koramangala',
      addressLine2: '5th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      isDefault: true,
      label: 'Home',
    },
  });

  console.log('✅ Addresses created');

  // ── Categories ──────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Fashion',
        displayName: 'Fashion & Apparel',
        slug: 'fashion',
        description: 'Trendy clothing, footwear, and accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
        sortOrder: 0,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Electronics',
        displayName: 'Electronics & Gadgets',
        slug: 'electronics',
        description: 'Latest tech gadgets and electronics',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
        sortOrder: 1,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Home & Living',
        displayName: 'Home & Living',
        slug: 'home-living',
        description: 'Furniture, decor, and home essentials',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
        sortOrder: 2,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Beauty',
        displayName: 'Beauty & Personal Care',
        slug: 'beauty',
        description: 'Skincare, makeup, and grooming essentials',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        sortOrder: 3,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sports',
        displayName: 'Sports & Fitness',
        slug: 'sports',
        description: 'Sports equipment and activewear',
        image: 'https://images.unsplash.com/photo-1461896836934-bd45ba2cee14?w=400&h=400&fit=crop',
        sortOrder: 4,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Books',
        displayName: 'Books & Stationery',
        slug: 'books',
        description: 'Bestsellers, novels, and stationery',
        image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=400&fit=crop',
        sortOrder: 5,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        displayName: 'Accessories',
        slug: 'accessories',
        description: 'Watches, bags, sunglasses and more',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
        sortOrder: 6,
        isVisible: true,
        showOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Groceries',
        displayName: 'Groceries & Gourmet',
        slug: 'groceries',
        description: 'Fresh groceries and gourmet food',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop',
        sortOrder: 7,
        isVisible: true,
        showOnHome: true,
      },
    }),
  ]);

  console.log('✅ Categories created');

  // ── Sub-categories ──────────────────────────────────────
  await Promise.all([
    prisma.category.create({ data: { name: 'Men', slug: 'men', parentId: categories[0].id, sortOrder: 0, showOnHome: false } }),
    prisma.category.create({ data: { name: 'Women', slug: 'women', parentId: categories[0].id, sortOrder: 1, showOnHome: false } }),
    prisma.category.create({ data: { name: 'Kids', slug: 'kids', parentId: categories[0].id, sortOrder: 2, showOnHome: false } }),
    prisma.category.create({ data: { name: 'Smartphones', slug: 'smartphones', parentId: categories[1].id, sortOrder: 0, showOnHome: false } }),
    prisma.category.create({ data: { name: 'Laptops', slug: 'laptops', parentId: categories[1].id, sortOrder: 1, showOnHome: false } }),
    prisma.category.create({ data: { name: 'Audio', slug: 'audio', parentId: categories[1].id, sortOrder: 2, showOnHome: false } }),
  ]);

  console.log('✅ Sub-categories created');

  // ── Products ────────────────────────────────────────────
  const products = await Promise.all([
    // Fashion
    prisma.product.create({
      data: {
        name: 'Premium Cotton Slim Fit Shirt',
        slug: 'premium-cotton-slim-fit-shirt',
        description: 'Crafted from 100% premium Egyptian cotton, this slim-fit shirt combines comfort with sophistication. Features mother-of-pearl buttons and a spread collar for a modern look. Perfect for both office wear and casual outings.',
        shortDescription: 'Premium Egyptian cotton slim-fit shirt with mother-of-pearl buttons',
        categoryId: categories[0].id,
        brandName: 'LuxeWear',
        basePrice: 2499,
        compareAtPrice: 3999,
        stock: 150,
        status: 'PUBLISHED',
        isFeatured: true,
        isNewArrival: true,
        isOnSale: true,
        tags: 'shirt,cotton,formal,slim-fit',
        totalSold: 342,
        avgRating: 4.5,
        reviewCount: 89,
        metaTitle: 'Premium Cotton Slim Fit Shirt - LuxeCart',
        metaDescription: 'Shop premium Egyptian cotton slim-fit shirts. Available in multiple colors.',
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', alt: 'Cotton Shirt Front', sortOrder: 0, isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=600&fit=crop', alt: 'Cotton Shirt Back', sortOrder: 1 },
          ],
        },
        variants: {
          create: [
            { name: 'Size', value: 'S', stock: 30, sortOrder: 0 },
            { name: 'Size', value: 'M', stock: 50, sortOrder: 1 },
            { name: 'Size', value: 'L', stock: 40, sortOrder: 2 },
            { name: 'Size', value: 'XL', stock: 30, sortOrder: 3 },
          ],
        },
      },
    }),
    // Electronics
    prisma.product.create({
      data: {
        name: 'ProSound Elite Wireless Earbuds',
        slug: 'prosound-elite-wireless-earbuds',
        description: 'Experience studio-quality sound with our ProSound Elite wireless earbuds. Featuring active noise cancellation, 40-hour battery life with the charging case, and IPX5 water resistance. Premium drivers deliver deep bass and crystal-clear highs.',
        shortDescription: 'ANC wireless earbuds with 40hr battery and IPX5 water resistance',
        categoryId: categories[1].id,
        brandName: 'ProSound',
        basePrice: 4999,
        compareAtPrice: 7999,
        stock: 200,
        status: 'PUBLISHED',
        isFeatured: true,
        isBestSeller: true,
        isOnSale: true,
        tags: 'earbuds,wireless,anc,bluetooth',
        totalSold: 1250,
        avgRating: 4.7,
        reviewCount: 456,
        metaTitle: 'ProSound Elite Wireless Earbuds - LuxeCart',
        metaDescription: 'Shop ProSound Elite ANC earbuds. 40hr battery, IPX5 waterproof.',
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop', alt: 'Earbuds Main', sortOrder: 0, isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop', alt: 'Earbuds Case', sortOrder: 1 },
          ],
        },
        variants: {
          create: [
            { name: 'Color', value: 'Midnight Black', stock: 80, sortOrder: 0 },
            { name: 'Color', value: 'Pearl White', stock: 70, sortOrder: 1 },
            { name: 'Color', value: 'Navy Blue', stock: 50, sortOrder: 2 },
          ],
        },
      },
    }),
    // Home & Living
    prisma.product.create({
      data: {
        name: 'Artisan Handwoven Throw Blanket',
        slug: 'artisan-handwoven-throw-blanket',
        description: 'Hand-woven by skilled artisans using sustainable cotton yarns. This luxurious throw adds warmth and texture to any living space. Features a beautiful herringbone pattern with tasseled edges.',
        shortDescription: 'Handwoven sustainable cotton throw with herringbone pattern',
        categoryId: categories[2].id,
        brandName: 'CasaCraft',
        basePrice: 1899,
        compareAtPrice: 2999,
        stock: 75,
        status: 'PUBLISHED',
        isFeatured: true,
        isNewArrival: true,
        tags: 'blanket,throw,handwoven,cotton,home-decor',
        totalSold: 180,
        avgRating: 4.8,
        reviewCount: 67,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', alt: 'Throw Blanket', sortOrder: 0, isPrimary: true },
          ],
        },
        variants: {
          create: [
            { name: 'Color', value: 'Ivory', stock: 25, sortOrder: 0 },
            { name: 'Color', value: 'Sage Green', stock: 25, sortOrder: 1 },
            { name: 'Color', value: 'Dusty Rose', stock: 25, sortOrder: 2 },
          ],
        },
      },
    }),
    // Beauty
    prisma.product.create({
      data: {
        name: 'Vitamin C Brightening Serum',
        slug: 'vitamin-c-brightening-serum',
        description: 'Clinically proven 20% Vitamin C serum with Hyaluronic Acid and Vitamin E. Reduces dark spots, evens skin tone, and boosts collagen production. Suitable for all skin types. Dermatologist recommended.',
        shortDescription: '20% Vitamin C serum with Hyaluronic Acid for brightening',
        categoryId: categories[3].id,
        brandName: 'GlowLab',
        basePrice: 899,
        compareAtPrice: 1499,
        stock: 300,
        status: 'PUBLISHED',
        isBestSeller: true,
        isOnSale: true,
        tags: 'serum,vitamin-c,skincare,brightening',
        totalSold: 2100,
        avgRating: 4.6,
        reviewCount: 890,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', alt: 'Vitamin C Serum', sortOrder: 0, isPrimary: true },
          ],
        },
      },
    }),
    // Sports
    prisma.product.create({
      data: {
        name: 'UltraFlex Running Shoes',
        slug: 'ultraflex-running-shoes',
        description: 'Engineered for performance, these lightweight running shoes feature responsive cushioning, breathable mesh upper, and a durable rubber outsole. CloudFoam midsole absorbs impact for long-distance comfort.',
        shortDescription: 'Lightweight performance running shoes with CloudFoam cushioning',
        categoryId: categories[4].id,
        brandName: 'StridePro',
        basePrice: 3499,
        compareAtPrice: 5499,
        stock: 120,
        status: 'PUBLISHED',
        isFeatured: true,
        isOnSale: true,
        tags: 'shoes,running,sports,lightweight',
        totalSold: 560,
        avgRating: 4.4,
        reviewCount: 234,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', alt: 'Running Shoes', sortOrder: 0, isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop', alt: 'Running Shoes Side', sortOrder: 1 },
          ],
        },
        variants: {
          create: [
            { name: 'Size', value: 'UK 7', stock: 20, sortOrder: 0 },
            { name: 'Size', value: 'UK 8', stock: 30, sortOrder: 1 },
            { name: 'Size', value: 'UK 9', stock: 35, sortOrder: 2 },
            { name: 'Size', value: 'UK 10', stock: 25, sortOrder: 3 },
            { name: 'Size', value: 'UK 11', stock: 10, sortOrder: 4 },
          ],
        },
      },
    }),
    // Accessories
    prisma.product.create({
      data: {
        name: 'Chronograph Leather Watch',
        slug: 'chronograph-leather-watch',
        description: 'Classic chronograph watch with genuine Italian leather strap. Features a stainless steel case, sapphire crystal glass, and Japanese quartz movement. Water resistant to 50m.',
        shortDescription: 'Classic chronograph with Italian leather strap and sapphire crystal',
        categoryId: categories[6].id,
        brandName: 'TimeVault',
        basePrice: 6999,
        compareAtPrice: 9999,
        stock: 45,
        status: 'PUBLISHED',
        isFeatured: true,
        isOnSale: true,
        tags: 'watch,chronograph,leather,classic',
        totalSold: 290,
        avgRating: 4.9,
        reviewCount: 112,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', alt: 'Chronograph Watch', sortOrder: 0, isPrimary: true },
          ],
        },
        variants: {
          create: [
            { name: 'Strap Color', value: 'Brown', stock: 20, sortOrder: 0 },
            { name: 'Strap Color', value: 'Black', stock: 25, sortOrder: 1 },
          ],
        },
      },
    }),
    // More products
    prisma.product.create({
      data: {
        name: 'Organic Green Tea Collection',
        slug: 'organic-green-tea-collection',
        description: 'Curated collection of 5 premium organic green teas from the hills of Darjeeling and Assam. Includes First Flush, Jasmine, Matcha, Sencha, and Classic varieties.',
        shortDescription: '5 premium organic green teas from Darjeeling & Assam',
        categoryId: categories[7].id,
        brandName: 'TeaCraft',
        basePrice: 1299,
        stock: 200,
        status: 'PUBLISHED',
        isNewArrival: true,
        tags: 'tea,organic,green-tea,gift-set',
        totalSold: 430,
        avgRating: 4.3,
        reviewCount: 178,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop', alt: 'Green Tea Set', sortOrder: 0, isPrimary: true },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Charging Desk Lamp',
        slug: 'wireless-charging-desk-lamp',
        description: 'Modern LED desk lamp with built-in Qi wireless charger. Features 5 brightness levels, 3 color temperatures, and a flexible gooseneck. USB-C port for wired charging.',
        shortDescription: 'LED desk lamp with Qi wireless charger and adjustable brightness',
        categoryId: categories[1].id,
        brandName: 'LumiTech',
        basePrice: 2799,
        compareAtPrice: 3999,
        stock: 85,
        status: 'PUBLISHED',
        isFeatured: true,
        isNewArrival: true,
        isOnSale: true,
        tags: 'lamp,wireless-charger,led,desk',
        totalSold: 195,
        avgRating: 4.5,
        reviewCount: 76,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop', alt: 'Desk Lamp', sortOrder: 0, isPrimary: true },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yoga Mat Premium 6mm',
        slug: 'yoga-mat-premium-6mm',
        description: 'Eco-friendly TPE yoga mat with alignment lines. Non-slip surface on both sides, extra cushioning for joints, and comes with a carrying strap. Free from latex, PVC, and toxic chemicals.',
        shortDescription: 'Eco-friendly TPE yoga mat with alignment lines and carrying strap',
        categoryId: categories[4].id,
        brandName: 'ZenFit',
        basePrice: 1599,
        compareAtPrice: 2499,
        stock: 160,
        status: 'PUBLISHED',
        isNewArrival: true,
        isOnSale: true,
        tags: 'yoga,mat,fitness,eco-friendly',
        totalSold: 380,
        avgRating: 4.6,
        reviewCount: 210,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop', alt: 'Yoga Mat', sortOrder: 0, isPrimary: true },
          ],
        },
        variants: {
          create: [
            { name: 'Color', value: 'Teal', stock: 50, sortOrder: 0 },
            { name: 'Color', value: 'Purple', stock: 55, sortOrder: 1 },
            { name: 'Color', value: 'Coral', stock: 55, sortOrder: 2 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Minimalist Leather Wallet',
        slug: 'minimalist-leather-wallet',
        description: 'Slim bifold wallet crafted from full-grain leather. Features RFID blocking, 6 card slots, a bill compartment, and a coin pocket. Ages beautifully over time.',
        shortDescription: 'Full-grain leather slim wallet with RFID blocking',
        categoryId: categories[6].id,
        brandName: 'LeatherCo',
        basePrice: 1799,
        compareAtPrice: 2499,
        stock: 100,
        status: 'PUBLISHED',
        isBestSeller: true,
        isOnSale: true,
        tags: 'wallet,leather,minimalist,rfid',
        totalSold: 720,
        avgRating: 4.7,
        reviewCount: 305,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop', alt: 'Leather Wallet', sortOrder: 0, isPrimary: true },
          ],
        },
        variants: {
          create: [
            { name: 'Color', value: 'Tan', stock: 40, sortOrder: 0 },
            { name: 'Color', value: 'Black', stock: 35, sortOrder: 1 },
            { name: 'Color', value: 'Dark Brown', stock: 25, sortOrder: 2 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bestselling Fiction Box Set',
        slug: 'bestselling-fiction-box-set',
        description: 'Collection of 5 bestselling fiction novels handpicked by our literary experts. Includes award-winning titles across mystery, literary fiction, and contemporary genres.',
        shortDescription: '5 bestselling fiction novels in a premium box set',
        categoryId: categories[5].id,
        brandName: 'BookBox',
        basePrice: 999,
        compareAtPrice: 1999,
        stock: 50,
        status: 'PUBLISHED',
        isOnSale: true,
        tags: 'books,fiction,box-set,bestseller',
        totalSold: 150,
        avgRating: 4.4,
        reviewCount: 55,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop', alt: 'Book Set', sortOrder: 0, isPrimary: true },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart Home Speaker',
        slug: 'smart-home-speaker',
        description: 'Voice-controlled smart speaker with premium 360° sound. Built-in voice assistant, multi-room audio support, and smart home hub. Stream music, control lights, and more.',
        shortDescription: '360° smart speaker with voice assistant and smart home control',
        categoryId: categories[1].id,
        brandName: 'SoundNest',
        basePrice: 5999,
        compareAtPrice: 8999,
        stock: 65,
        status: 'PUBLISHED',
        isFeatured: true,
        isBestSeller: true,
        isOnSale: true,
        tags: 'speaker,smart-home,voice-assistant,wireless',
        totalSold: 890,
        avgRating: 4.5,
        reviewCount: 420,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&h=600&fit=crop', alt: 'Smart Speaker', sortOrder: 0, isPrimary: true },
          ],
        },
        variants: {
          create: [
            { name: 'Color', value: 'Charcoal', stock: 30, sortOrder: 0 },
            { name: 'Color', value: 'Sandstone', stock: 35, sortOrder: 1 },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ ${products.length} Products created`);

  // ── Reviews ─────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { productId: products[0].id, userId: customer1.id, rating: 5, title: 'Excellent quality!', comment: 'The fabric is amazing and the fit is perfect. Best shirt I have ever bought.', status: 'APPROVED', isVerifiedPurchase: true },
      { productId: products[0].id, userId: customer2.id, rating: 4, title: 'Great shirt', comment: 'Very comfortable. Slightly long in the sleeves for me but otherwise perfect.', status: 'APPROVED', isVerifiedPurchase: true },
      { productId: products[1].id, userId: customer1.id, rating: 5, title: 'Mind-blowing sound!', comment: 'ANC is incredible. Battery lasts forever. Best earbuds under 5000.', status: 'APPROVED', isVerifiedPurchase: true },
      { productId: products[1].id, userId: customer2.id, rating: 5, title: 'Worth every rupee', comment: 'Crystal clear audio and deep bass. The case is so sleek. Highly recommend!', status: 'APPROVED', isVerifiedPurchase: true },
      { productId: products[4].id, userId: customer1.id, rating: 4, title: 'Very comfortable', comment: 'Great for long runs. The cushioning is superb. True to size.', status: 'APPROVED', isVerifiedPurchase: true },
      { productId: products[5].id, userId: customer2.id, rating: 5, title: 'Stunning watch!', comment: 'Looks much more expensive than it is. The leather strap is butter soft.', status: 'APPROVED', isVerifiedPurchase: true },
    ],
  });

  console.log('✅ Reviews created');

  // ── Coupons ─────────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', description: 'Welcome discount for new customers', type: 'PERCENTAGE', value: 10, maxDiscount: 500, isActive: true },
      { code: 'FLAT200', description: 'Flat ₹200 off on orders above ₹1000', type: 'FLAT', value: 200, minOrderValue: 1000, isActive: true },
      { code: 'SUMMER25', description: 'Summer sale 25% off', type: 'PERCENTAGE', value: 25, maxDiscount: 1000, minOrderValue: 1500, isActive: true },
      { code: 'FREESHIP', description: 'Free shipping on all orders', type: 'FLAT', value: 99, isActive: true },
    ],
  });

  console.log('✅ Coupons created');

  // ── Banners ─────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: 'Summer Collection 2026',
        subtitle: 'Up to 70% Off on Premium Fashion',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=600&fit=crop',
        ctaText: 'Shop Now',
        ctaLink: '/shop?category=fashion',
        sortOrder: 0,
        isActive: true,
      },
      {
        title: 'Tech Deals',
        subtitle: 'Latest Gadgets at Unbeatable Prices',
        image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&h=600&fit=crop',
        ctaText: 'Explore',
        ctaLink: '/shop?category=electronics',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'Home Makeover',
        subtitle: 'Transform Your Space — Starting ₹999',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&h=600&fit=crop',
        ctaText: 'View Collection',
        ctaLink: '/shop?category=home-living',
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  console.log('✅ Banners created');

  // ── Homepage Sections ───────────────────────────────────
  await prisma.homepageSection.createMany({
    data: [
      { sectionId: 'hero', name: 'Hero Banner', isVisible: true, sortOrder: 0 },
      { sectionId: 'categories', name: 'Shop by Category', isVisible: true, sortOrder: 1 },
      { sectionId: 'featured', name: 'Featured Products', isVisible: true, sortOrder: 2 },
      { sectionId: 'flashSale', name: 'Flash Sale', isVisible: true, sortOrder: 3 },
      { sectionId: 'bestSellers', name: 'Best Sellers', isVisible: true, sortOrder: 4 },
      { sectionId: 'newArrivals', name: 'New Arrivals', isVisible: true, sortOrder: 5 },
      { sectionId: 'testimonials', name: 'Customer Reviews', isVisible: true, sortOrder: 6 },
      { sectionId: 'newsletter', name: 'Newsletter', isVisible: true, sortOrder: 7 },
    ],
  });

  console.log('✅ Homepage sections created');

  // ── Store Settings ──────────────────────────────────────
  const settingsData: Record<string, any> = {
    siteName: 'LuxeCart',
    siteTagline: 'Premium Shopping Experience',
    currency: '₹',
    currencyCode: 'INR',
    email: 'support@luxecart.com',
    phone: '+91 98765 43210',
    whatsapp: '+919876543210',
    address: '123 Fashion Street, Mumbai, Maharashtra 400001, India',
    taxRate: 18,
    shippingFee: 99,
    freeShippingThreshold: 1499,
    announcementBar: {
      active: true,
      messages: [
        '🎉 Grand Summer Sale — Up to 70% Off!',
        '🚚 Free Shipping on orders above ₹1,499',
        '💳 Extra 10% off on prepaid orders',
      ],
    },
    socialLinks: {
      facebook: 'https://facebook.com/luxecart',
      instagram: 'https://instagram.com/luxecart',
      twitter: 'https://twitter.com/luxecart',
      youtube: 'https://youtube.com/luxecart',
    },
    theme: {
      mode: 'light',
      primaryColor: '#0F6E51',
      accentColor: '#D4A24C',
      fontFamily: 'Inter',
    },
    paymentMethods: { cod: true, upi: true, card: true, netbanking: true },
  };

  await Promise.all(
    Object.entries(settingsData).map(([key, value]) =>
      prisma.storeSettings.create({
        data: { key, value: JSON.stringify(value) },
      })
    )
  );

  console.log('✅ Store settings created');

  // ── Demo Orders ─────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'LC-TEST001',
      userId: customer1.id,
      shippingAddress: JSON.stringify({
        fullName: 'Rahul Sharma',
        phone: '+919876543211',
        addressLine1: '42, MG Road, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
      }),
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      subtotal: 7498,
      discount: 200,
      tax: 1313,
      shippingFee: 0,
      total: 8611,
      deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: products[0].id, name: 'Premium Cotton Slim Fit Shirt', price: 2499, quantity: 1, total: 2499 },
          { productId: products[1].id, name: 'ProSound Elite Wireless Earbuds', price: 4999, quantity: 1, total: 4999 },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PLACED', note: 'Order placed', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { status: 'CONFIRMED', note: 'Payment confirmed', createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
          { status: 'SHIPPED', note: 'Dispatched via BlueDart', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { status: 'DELIVERED', note: 'Delivered successfully', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'LC-TEST002',
      userId: customer2.id,
      shippingAddress: JSON.stringify({
        fullName: 'Priya Patel',
        phone: '+919876543212',
        addressLine1: '15, Park Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      }),
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      subtotal: 3498,
      discount: 0,
      tax: 629,
      shippingFee: 99,
      total: 4226,
      items: {
        create: [
          { productId: products[2].id, name: 'Artisan Handwoven Throw Blanket', price: 1899, quantity: 1, total: 1899 },
          { productId: products[6].id, name: 'Organic Green Tea Collection', price: 1299, quantity: 1, total: 1299 },
        ],
      },
      statusHistory: {
        create: [
          { status: 'PLACED', note: 'Order placed', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'CONFIRMED', note: 'Payment confirmed', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'SHIPPED', note: 'Dispatched via Delhivery', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
      },
    },
  });

  console.log('✅ Demo orders created');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📧 Admin login: admin@luxecart.com / admin123');
  console.log('📧 Customer login: rahul@example.com / customer123\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
