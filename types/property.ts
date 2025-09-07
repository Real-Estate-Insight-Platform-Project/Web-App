// types/property.ts
export interface UserPreferences {
  location?: string;
  propertyType?: PropertyType;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minPrice?: number;
  maxPrice?: number;
  budget?: number;
  preferredBeds?: number;
  preferredBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  maxDaysOnMarket?: number;
  sortBy?: SortOption;
}

export type PropertyType = 
  | 'single-family-home'
  | 'condo'
  | 'townhome'
  | 'multi-family'
  | 'manufactured'
  | 'land'
  | 'farm';

export type SortOption = 1 | 2 | 3 | 4 | 5; // 1: Newest, 2: Price Low, 3: Price High, etc.

export interface RawProperty {
  price?: string | null;
  address?: string | null;
  beds?: string | null;
  baths?: string | null;
  sqft?: string | null;
  lotSize?: string | null;
  imageUrl?: string | null;
  propertyUrl?: string | null;
  propertyType?: string | null;
  daysOnMarket?: string | null;
  mlsId?: string | null;
  scrapedAt: string;
}

export interface ProcessedProperty extends RawProperty {
  priceNumeric?: number | null;
  bedsNumeric?: number | null;
  bathsNumeric?: number | null;
  sqftNumeric?: number | null;
  score?: number;
  id?: string;
}

export interface ScrapingResult {
  success: boolean;
  totalFound: number;
  properties: ProcessedProperty[];
  searchUrl: string;
  preferences: UserPreferences;
  error?: string;
}

export interface RecommendationResult {
  success: boolean;
  recommendations: ProcessedProperty[];
  totalFound?: number;
  searchCriteria?: UserPreferences;
  searchUrl?: string;
  generatedAt: string;
  error?: string;
}