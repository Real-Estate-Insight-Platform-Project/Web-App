// lib/propertyRecommender.ts
import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';
import { 
  UserPreferences, 
  ProcessedProperty, 
  RawProperty, 
  ScrapingResult, 
  RecommendationResult,
  PropertyType,
  SortOption
} from '../types/property';

export class PropertyRecommender {
  private browser: Browser | null = null;
  private readonly baseUrl = 'https://www.realtor.com/realestateandhomes-search/';

  constructor() {}

  /**
   * Initialize browser instance
   */
  async init(): Promise<void> {
    if (this.browser) {
      return; // Already initialized
    }

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-blink-features=AutomationControlled'
      ]
    });
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Build URL based on user preferences
   */
  buildSearchUrl(preferences: UserPreferences): string {
    const {
      location = 'Miami_FL',
      propertyType = 'single-family-home',
      minBeds = 2,
      maxBeds = 4,
      minBaths = 2,
      minPrice = 150000,
      maxPrice = 250000,
      sortBy = 1
    } = preferences;

    let url = `${this.baseUrl}${location}/type-${propertyType}`;
    
    if (minBeds || maxBeds) {
      const bedsParam = minBeds && maxBeds ? `${minBeds}-${maxBeds}` : `${minBeds || maxBeds}`;
      url += `/beds-${bedsParam}`;
    }
    
    if (minBaths) {
      url += `/baths-${minBaths}`;
    }
    
    if (minPrice || maxPrice) {
      const priceParam = minPrice && maxPrice ? `${minPrice}-${maxPrice}` : `${minPrice || maxPrice}`;
      url += `/price-${priceParam}`;
    }
    
    url += `/sby-${sortBy}`;
    
    return url;
  }

  /**
   * Wait for elements to load with timeout
   */
  private async waitForElements(page: Page, selector: string, timeout = 10000): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.warn(`Element ${selector} not found within ${timeout}ms`);
      return false;
    }
  }

  /**
   * Extract property data from a single property card
   */
  private async extractPropertyData(
    propertyElement: ElementHandle<Element>, 
    page: Page
  ): Promise<ProcessedProperty | null> {
    try {
      const property = await page.evaluate((element) => {
        // Helper function to safely get text content
        const getTextContent = (selector: string, parent: Element = element): string | null => {
          const el = parent.querySelector(selector);
          return el ? el.textContent?.trim() || null : null;
        };

        // Helper function to safely get attribute
        const getAttribute = (selector: string, attribute: string, parent: Element = element): string | null => {
          const el = parent.querySelector(selector);
          return el ? el.getAttribute(attribute) : null;
        };

        // Extract basic property information with multiple selector fallbacks
        const price = getTextContent('[data-testid="property-price"]') || 
                     getTextContent('.price') ||
                     getTextContent('[class*="price"]') ||
                     getTextContent('[class*="Price"]');

        const address = getTextContent('[data-testid="property-address"]') ||
                       getTextContent('.address') ||
                       getTextContent('[class*="address"]') ||
                       getTextContent('[class*="Address"]');

        const beds = getTextContent('[data-testid="property-bed"]') ||
                    getTextContent('[class*="bed"]') ||
                    getTextContent('[class*="Bed"]');

        const baths = getTextContent('[data-testid="property-bath"]') ||
                     getTextContent('[class*="bath"]') ||
                     getTextContent('[class*="Bath"]');

        const sqft = getTextContent('[data-testid="property-sqft"]') ||
                    getTextContent('[class*="sqft"]') ||
                    getTextContent('[class*="Sqft"]');

        const lotSize = getTextContent('[data-testid="property-lot-size"]') ||
                       getTextContent('[class*="lot"]') ||
                       getTextContent('[class*="Lot"]');

        // Extract image URL
        const imageUrl = getAttribute('img', 'src') ||
                        getAttribute('[class*="photo"] img', 'src') ||
                        getAttribute('[class*="Photo"] img', 'src');

        // Extract property URL
        const propertyUrl = getAttribute('a[href*="/realestateandhomes-detail/"]', 'href') ||
                           getAttribute('a[href*="/property-detail/"]', 'href');

        // Extract additional details
        const propertyType = getTextContent('[data-testid="property-type"]') ||
                           getTextContent('[class*="property-type"]') ||
                           getTextContent('[class*="PropertyType"]');

        const daysOnMarket = getTextContent('[class*="days-on-market"]') ||
                           getTextContent('[class*="dom"]') ||
                           getTextContent('[class*="DOM"]');

        const mlsId = getTextContent('[class*="mls"]') ||
                     getTextContent('[class*="MLS"]');

        return {
          price,
          address,
          beds,
          baths,
          sqft,
          lotSize,
          imageUrl,
          propertyUrl,
          propertyType,
          daysOnMarket,
          mlsId,
          scrapedAt: new Date().toISOString()
        } as RawProperty;
      }, propertyElement);

      // Clean and normalize the data
      return this.normalizePropertyData(property);
    } catch (error) {
      console.error('Error extracting property data:', error);
      return null;
    }
  }

  /**
   * Normalize and clean property data
   */
  private normalizePropertyData(property: RawProperty): ProcessedProperty {
    const processed: ProcessedProperty = { ...property };

    // Clean price
    if (property.price) {
      const priceMatch = property.price.replace(/[^\d]/g, '');
      processed.priceNumeric = priceMatch ? parseInt(priceMatch, 10) : null;
    }

    // Clean beds and baths
    if (property.beds) {
      const bedsMatch = property.beds.replace(/[^\d]/g, '');
      processed.bedsNumeric = bedsMatch ? parseInt(bedsMatch, 10) : null;
    }

    if (property.baths) {
      const bathsMatch = property.baths.replace(/[^\d.]/g, '');
      processed.bathsNumeric = bathsMatch ? parseFloat(bathsMatch) : null;
    }

    // Clean square footage
    if (property.sqft) {
      const sqftMatch = property.sqft.replace(/[^\d]/g, '');
      processed.sqftNumeric = sqftMatch ? parseInt(sqftMatch, 10) : null;
    }

    // Ensure URLs are absolute
    if (processed.propertyUrl && !processed.propertyUrl.startsWith('http')) {
      processed.propertyUrl = `https://www.realtor.com${processed.propertyUrl}`;
    }

    if (processed.imageUrl && !processed.imageUrl.startsWith('http')) {
      processed.imageUrl = processed.imageUrl.startsWith('//') 
        ? `https:${processed.imageUrl}` 
        : `https://${processed.imageUrl}`;
    }

    // Generate unique ID
    processed.id = `${processed.address || 'unknown'}_${processed.priceNumeric || 'unknown'}_${Date.now()}`;

    return processed;
  }

  /**
   * Apply ranking logic based on user preferences
   */
  private rankProperties(properties: ProcessedProperty[], preferences: UserPreferences): ProcessedProperty[] {
    const {
      budget,
      preferredBeds,
      preferredBaths,
      maxDaysOnMarket,
      minSqft,
      maxSqft
    } = preferences;

    return properties
      .filter((property): property is ProcessedProperty => {
        // Filter out invalid properties
        if (!property || !property.priceNumeric) return false;
        
        // Apply filters
        if (budget && property.priceNumeric > budget) return false;
        if (preferredBeds && property.bedsNumeric && property.bedsNumeric < preferredBeds) return false;
        if (preferredBaths && property.bathsNumeric && property.bathsNumeric < preferredBaths) return false;
        if (minSqft && property.sqftNumeric && property.sqftNumeric < minSqft) return false;
        if (maxSqft && property.sqftNumeric && property.sqftNumeric > maxSqft) return false;
        if (maxDaysOnMarket && property.daysOnMarket) {
          const dom = parseInt(property.daysOnMarket.replace(/[^\d]/g, ''), 10);
          if (dom && dom > maxDaysOnMarket) return false;
        }
        
        return true;
      })
      .map(property => {
        let score = 0;
        
        // Price scoring (closer to budget is better)
        if (budget && property.priceNumeric) {
          const priceRatio = property.priceNumeric / budget;
          if (priceRatio <= 1) {
            score += (1 - Math.abs(1 - priceRatio)) * 30;
          } else {
            // Penalty for over budget
            score -= (priceRatio - 1) * 10;
          }
        }
        
        // Days on market scoring (fewer days is better for buyers)
        if (property.daysOnMarket) {
          const dom = parseInt(property.daysOnMarket.replace(/[^\d]/g, ''), 10);
          if (dom) {
            score += Math.max(0, 20 - (dom / 10)); // Max 20 points, decreasing with days
          }
        }
        
        // Square footage scoring
        if (minSqft && property.sqftNumeric) {
          const sqftBonus = Math.max(0, property.sqftNumeric - minSqft);
          score += Math.min(20, sqftBonus / 100);
        }
        
        // Beds/baths preference scoring
        if (preferredBeds && property.bedsNumeric) {
          if (property.bedsNumeric === preferredBeds) {
            score += 15; // Perfect match
          } else if (property.bedsNumeric > preferredBeds) {
            score += 10; // More than preferred is good
          }
        }
        
        if (preferredBaths && property.bathsNumeric) {
          if (property.bathsNumeric >= preferredBaths) {
            score += 10;
          }
        }
        
        return { ...property, score: Math.max(0, score) };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * Main scraping function
   */
  async scrapeProperties(preferences: UserPreferences, maxProperties = 20): Promise<ScrapingResult> {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      // Set extra headers to avoid detection
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
      });

      // Build search URL
      const searchUrl = this.buildSearchUrl(preferences);
      console.log('Searching URL:', searchUrl);

      // Navigate to search page
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait a bit for dynamic content
      await page.waitForTimeout(3000);

      // Try multiple selectors for property listings
      const selectors = [
        '[data-testid="property-card"]',
        '.property-card',
        '[class*="property"]:not([class*="header"]):not([class*="nav"]):not([class*="footer"])',
        '[class*="PropertyCard"]',
        '.result-card'
      ];

      let listingsLoaded = false;
      let finalSelector = '';

      for (const selector of selectors) {
        if (await this.waitForElements(page, selector, 5000)) {
          listingsLoaded = true;
          finalSelector = selector;
          break;
        }
      }
      
      if (!listingsLoaded) {
        throw new Error('Property listings failed to load - page might have changed structure');
      }

      // Get all property elements
      const propertyElements = await page.$$(finalSelector);
      console.log(`Found ${propertyElements.length} property elements using selector: ${finalSelector}`);

      if (propertyElements.length === 0) {
        throw new Error('No properties found on the page');
      }

      const properties: ProcessedProperty[] = [];
      const maxToProcess = Math.min(propertyElements.length, maxProperties);

      // Extract data from each property
      for (let i = 0; i < maxToProcess; i++) {
        try {
          const propertyData = await this.extractPropertyData(propertyElements[i], page);
          if (propertyData && (propertyData.price || propertyData.priceNumeric)) {
            properties.push(propertyData);
          }
        } catch (error) {
          console.error(`Error processing property ${i}:`, error);
        }
      }

      console.log(`Successfully extracted ${properties.length} valid properties`);

      // Apply ranking logic
      const rankedProperties = this.rankProperties(properties, preferences);

      return {
        success: true,
        totalFound: properties.length,
        properties: rankedProperties,
        searchUrl,
        preferences
      };

    } catch (error) {
      console.error('Scraping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        totalFound: 0,
        properties: [],
        searchUrl: this.buildSearchUrl(preferences),
        preferences
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Get property recommendations based on user input
   */
  async getRecommendations(userPreferences: UserPreferences): Promise<RecommendationResult> {
    try {
      const result = await this.scrapeProperties(userPreferences);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Additional filtering and personalization can be added here
      const recommendations = result.properties.slice(0, 10); // Top 10 recommendations

      return {
        success: true,
        recommendations,
        totalFound: result.totalFound,
        searchCriteria: result.preferences,
        searchUrl: result.searchUrl,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        recommendations: [],
        generatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Get browser status
   */
  get isInitialized(): boolean {
    return this.browser !== null;
  }
}

// Singleton instance for reuse
let recommenderInstance: PropertyRecommender | null = null;

export const getPropertyRecommender = (): PropertyRecommender => {
  if (!recommenderInstance) {
    recommenderInstance = new PropertyRecommender();
  }
  return recommenderInstance;
};

// Example usage function
export async function example(): Promise<void> {
  const recommender = new PropertyRecommender();
  
  try {
    const userPreferences: UserPreferences = {
      location: 'Miami_FL',
      propertyType: 'single-family-home',
      minBeds: 2,
      maxBeds: 4,
      minBaths: 2,
      minPrice: 150000,
      maxPrice: 250000,
      sortBy: 1,
      budget: 200000,
      preferredBeds: 3,
      minSqft: 1200
    };

    const recommendations = await recommender.getRecommendations(userPreferences);
    console.log('Recommendations:', JSON.stringify(recommendations, null, 2));
    
  } finally {
    await recommender.close();
  }
}

// Export the class as default
export default PropertyRecommender;