// pages/api/recommendations.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getPropertyRecommender } from '../../lib/propertyRecommender';
import { UserPreferences, RecommendationResult } from '../../types/property';

interface ApiRequest extends NextApiRequest {
  body: UserPreferences;
}

interface ApiResponse {
  success: boolean;
  data?: RecommendationResult & { processingTime?: number };
  error?: string;
  message?: string;
}

export default async function handler(
  req: ApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  const startTime = Date.now();
  const recommender = getPropertyRecommender();
  
  try {
    const userPreferences: UserPreferences = req.body;
    
    // Validate input
    if (!userPreferences) {
      return res.status(400).json({ 
        success: false, 
        error: 'Request body is required' 
      });
    }

    if (!userPreferences.location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Location is required' 
      });
    }

    // Validate numeric fields
    const numericFields: (keyof UserPreferences)[] = [
      'minBeds', 'maxBeds', 'minBaths', 'maxBaths', 
      'minPrice', 'maxPrice', 'budget', 'preferredBeds', 
      'preferredBaths', 'minSqft', 'maxSqft', 'maxDaysOnMarket'
    ];

    for (const field of numericFields) {
      const value = userPreferences[field];
      if (value !== undefined && value !== null && (typeof value !== 'number' || value < 0)) {
        return res.status(400).json({ 
          success: false, 
          error: `${field} must be a positive number` 
        });
      }
    }

    // Validate property type
    const validPropertyTypes = [
      'single-family-home', 'condo', 'townhome', 
      'multi-family', 'manufactured', 'land', 'farm'
    ];
    
    if (userPreferences.propertyType && !validPropertyTypes.includes(userPreferences.propertyType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid property type' 
      });
    }

    // Validate sort option
    if (userPreferences.sortBy && ![1, 2, 3, 4, 5].includes(userPreferences.sortBy)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sort option must be between 1 and 5' 
      });
    }

    console.log('Getting recommendations for:', userPreferences);
    
    // Get recommendations
    const recommendations = await recommender.getRecommendations(userPreferences);
    
    if (!recommendations.success) {
      return res.status(500).json({ 
        success: false,
        error: 'Failed to get recommendations',
        message: recommendations.error
      });
    }

    const processingTime = Date.now() - startTime;
    console.log(`Recommendations processed in ${processingTime}ms`);

    // Add processing time to response
    const responseData = {
      ...recommendations,
      processingTime
    };

    res.status(200).json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: errorMessage
    });
  }
  // Note: We don't close the recommender here as it's a singleton
}

// Export configuration for larger payloads and longer timeouts
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    // Increase timeout for scraping operations
    externalResolver: true,
  },
};