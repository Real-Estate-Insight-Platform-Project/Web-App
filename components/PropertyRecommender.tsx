// components/PropertyRecommender.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { UserPreferences, ProcessedProperty, PropertyType, SortOption } from '../types/property';

interface ApiResponse {
  success: boolean;
  data?: {
    recommendations: ProcessedProperty[];
    totalFound: number;
    searchUrl: string;
    generatedAt: string;
    processingTime?: number;
  };
  error?: string;
  message?: string;
}

const PropertyRecommender: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    location: 'Miami_FL',
    propertyType: 'single-family-home',
    minBeds: 2,
    maxBeds: 4,
    minBaths: 2,
    minPrice: 150000,
    maxPrice: 250000,
    budget: 200000,
    preferredBeds: 3,
    minSqft: 1200,
    sortBy: 1
  });

  const [recommendations, setRecommendations] = useState<ProcessedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<{
    totalFound: number;
    searchUrl: string;
    processingTime?: number;
  } | null>(null);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? (value === '' ? undefined : parseFloat(value)) 
        : value
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await getRecommendations();
  }, [preferences]);

  const getRecommendations = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending preferences:', preferences);
      
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Failed to get recommendations');
      }

      if (result.data) {
        setRecommendations(result.data.recommendations);
        setSearchInfo({
          totalFound: result.data.totalFound,
          searchUrl: result.data.searchUrl,
          processingTime: result.data.processingTime
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error:', err);
      setRecommendations([]);
      setSearchInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  const formatNumber = (num: number | string | null | undefined): string => {
    if (!num) return 'N/A';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return 'N/A';
    
    return new Intl.NumberFormat('en-US').format(numValue);
  };

  const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: 'single-family-home', label: 'Single Family Home' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhome', label: 'Townhome' },
    { value: 'multi-family', label: 'Multi Family' },
    { value: 'manufactured', label: 'Manufactured' },
    { value: 'land', label: 'Land' },
    { value: 'farm', label: 'Farm' }
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 1, label: 'Newest' },
    { value: 2, label: 'Price Low to High' },
    { value: 3, label: 'Price High to Low' },
    { value: 4, label: 'Largest Sqft' },
    { value: 5, label: 'Most Bedrooms' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smart