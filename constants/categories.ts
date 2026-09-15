import {
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Footprints,
  Sparkles,
  Sofa,
  Car,
  Home,
  Briefcase,
  Wheat,
  ShoppingBasket,
  Baby,
  Dumbbell,
  Package,
  type LucideIcon,
} from 'lucide-react-native';

export interface LocalCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: LocalCategory[] = [
  { id: 'phones-tablets', name: 'Phones & Tablets', icon: 'Smartphone', description: 'Smartphones, tablets, and accessories' },
  { id: 'computers', name: 'Computers & Accessories', icon: 'Laptop', description: 'Laptops, desktops, and peripherals' },
  { id: 'electronics', name: 'Electronics', icon: 'Tv', description: 'TVs, audio, and electronic gadgets' },
  { id: 'fashion', name: 'Fashion', icon: 'Shirt', description: 'Clothing for men and women' },
  { id: 'shoes', name: 'Shoes', icon: 'Footprints', description: 'Footwear for all occasions' },
  { id: 'beauty', name: 'Beauty & Personal Care', icon: 'Sparkles', description: 'Cosmetics, skincare, and grooming' },
  { id: 'home-furniture', name: 'Home & Furniture', icon: 'Sofa', description: 'Furniture and home items' },
  { id: 'vehicles', name: 'Vehicles', icon: 'Car', description: 'Cars, motorcycles, and auto parts' },
  { id: 'property', name: 'Property', icon: 'Home', description: 'Houses, apartments, and land' },
  { id: 'jobs-services', name: 'Jobs & Services', icon: 'Briefcase', description: 'Job postings and professional services' },
  { id: 'agriculture', name: 'Agriculture', icon: 'Wheat', description: 'Farm produce, tools, and livestock' },
  { id: 'food-groceries', name: 'Food & Groceries', icon: 'ShoppingBasket', description: 'Fresh food and grocery items' },
  { id: 'baby-kids', name: 'Baby & Kids', icon: 'Baby', description: 'Items for babies and children' },
  { id: 'sports-fitness', name: 'Sports & Fitness', icon: 'Dumbbell', description: 'Sports equipment and fitness gear' },
  { id: 'other', name: 'Other', icon: 'Package', description: 'Miscellaneous items' },
];

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Footprints,
  Sparkles,
  Sofa,
  Car,
  Home,
  Briefcase,
  Wheat,
  ShoppingBasket,
  Baby,
  Dumbbell,
  Package,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return CATEGORY_ICON_MAP[iconName] ?? Package;
}

export function getCategoryById(id: string): LocalCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
