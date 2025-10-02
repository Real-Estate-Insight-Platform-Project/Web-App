const RECOMMENDATION_API_URL = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL || 'http://localhost:8000';

export interface RecommendationRequest {
  property_id: string;
  filters?: {
    city?: string;
    property_type?: string;
    min_price?: string;
    max_price?: string;
    min_bedrooms?: string;
    min_bathrooms?: string;
  };
  limit?: number;
}

export interface RecommendationResponse {
  target_property: any;
  similar_properties: any[];
  total_recommendations: number;
}

export async function getSimilarProperties(
  propertyId: string, 
  filters?: any, 
  limit: number = 6
): Promise<RecommendationResponse> {
  try {
    const request: RecommendationRequest = {
      property_id: propertyId,
      filters: filters,
      limit: limit
    };

    const response = await fetch(`${RECOMMENDATION_API_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    throw error;
  }
}