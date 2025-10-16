"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, BarChart3, Home, DollarSign, Calendar, Search } from "lucide-react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Label
} from "recharts"

interface MarketData {
  year: number
  month: number
  median_listing_price: number
  average_listing_price: number
  median_listing_price_per_square_foot: number
  total_listing_count: number
  median_days_on_market: number
  market_trend?: string
}

// For chart data formatting
interface ChartData {
  date: string
  month: string
  monthYear: string
  median_listing_price: number
  average_listing_price: number
  total_listing_count: number
  median_days_on_market: number
  isForecast?: boolean
}

export default function MarketInsightsPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [historicalData, setHistoricalData] = useState<MarketData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedCity, setSelectedCity] = useState("Alaska")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketData()
  }, [selectedCity])

  const fetchMarketData = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/market-insights?city=${encodeURIComponent(selectedCity)}`)
      
      if (!response.ok) {
        console.error("Error fetching market data:", response.statusText)
        setLoading(false)
        return
      }

      const data = await response.json()
      
      setMarketData(data.marketData)
      setHistoricalData(data.historicalData)
      setChartData(data.chartData)
    } catch (error) {
      console.error("Error fetching market data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string | undefined) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTrendColor = (trend: string | undefined) => {
    switch (trend) {
      case "rising":
        return "text-green-600 bg-green-50 border-green-200"
      case "declining":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }
  
  // Helper function to determine market conditions for annotations
  const getMarketCondition = (index: number) => {
    if (index < 1 || index >= chartData.length) return null;
    
    const current = chartData[index];
    const previous = chartData[index - 1];
    
    // Buyer's Advantage: listing count rises, days on market lengthens
    if (
      current.total_listing_count > previous.total_listing_count &&
      current.median_days_on_market > previous.median_days_on_market
    ) {
      return "Buyer's Advantage";
    }
    
    // Seller's Market: listing count drops, days on market shortens
    if (
      current.total_listing_count < previous.total_listing_count &&
      current.median_days_on_market < previous.median_days_on_market
    ) {
      return "Seller's Market";
    }
    
    return null;
  }
  
  // Custom tooltip for price chart
  const PriceChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-md border">
          <p className="font-medium">{label}</p>
          <p className="text-[#8884d8]">Median Price: ${payload[0].value.toLocaleString()}</p>
          <p className="text-[#82ca9d]">Average Price: ${payload[1]?.value.toLocaleString()}</p>
          {payload[0].payload.isForecast && (
            <p className="text-xs font-semibold mt-2 text-blue-600">
              Forecast for {payload[0].payload.monthYear}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Create separate datasets for historical and forecast data
  const historicalChartData = chartData.filter(item => !item.isForecast);
  const forecastChartData = chartData.filter(item => item.isForecast);
  
  // To connect the historical and forecast data, we need to include the last historical point in forecast data
  const lastHistoricalPoint = historicalChartData[historicalChartData.length - 1];
  const forecastWithConnection = lastHistoricalPoint ? [lastHistoricalPoint, ...forecastChartData] : forecastChartData;
  
  // Custom tooltip for supply & demand chart
  const SupplyDemandTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const marketCondition = getMarketCondition(payload[0]?.payload?.index);
      const isForecast = payload[0]?.payload?.isForecast;
      
      return (
        <div className="bg-white p-4 rounded shadow-md border">
          <p className="font-medium">{label}</p>
          <p className="text-[#8884d8]">Listings: {payload[0]?.value.toLocaleString()}</p>
          <p className="text-[#ff7300]">Days on Market: {payload[1]?.value}</p>
          {isForecast && (
            <p className="text-xs font-semibold mt-2 text-blue-600">
              Forecast Data
            </p>
          )}
          {marketCondition && (
            <p className={`text-xs font-semibold mt-2 ${
              marketCondition === "Buyer's Advantage" ? "text-blue-600" : "text-red-600"
            }`}>
              {marketCondition}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Insights</h1>
          <p className="text-muted-foreground mt-2">Real-time market analytics and trends</p>
        </div>

        <div className="w-64">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
                <div className="flex items-center border-b px-3 pb-2">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search state..."
                    onChange={(e) => {
                      const searchBox = e.currentTarget;
                      const items = document.querySelectorAll('[role="option"]');
                      items.forEach((item: any) => {
                        const text = item.textContent || '';
                        const matches = text.toLowerCase().includes(searchBox.value.toLowerCase());
                        item.style.display = matches ? '' : 'none';
                      });
                    }}
                  />
                </div>
                <SelectItem value="Alaska">Alaska</SelectItem>
                <SelectItem value="Alabama">Alabama</SelectItem>
                <SelectItem value="Arkansas">Arkansas</SelectItem>
                <SelectItem value="Arizona">Arizona</SelectItem>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="Colorado">Colorado</SelectItem>
                <SelectItem value="Connecticut">Connecticut</SelectItem>
                <SelectItem value="District of Columbia">District of Columbia</SelectItem>
                <SelectItem value="Delaware">Delaware</SelectItem>
                <SelectItem value="Florida">Florida</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Hawaii">Hawaii</SelectItem>
                <SelectItem value="Iowa">Iowa</SelectItem>
                <SelectItem value="Idaho">Idaho</SelectItem>
                <SelectItem value="Illinois">Illinois</SelectItem>
                <SelectItem value="Indiana">Indiana</SelectItem>
                <SelectItem value="Kansas">Kansas</SelectItem>
                <SelectItem value="Kentucky">Kentucky</SelectItem>
                <SelectItem value="Louisiana">Louisiana</SelectItem>
                <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                <SelectItem value="Maryland">Maryland</SelectItem>
                <SelectItem value="Maine">Maine</SelectItem>
                <SelectItem value="Michigan">Michigan</SelectItem>
                <SelectItem value="Minnesota">Minnesota</SelectItem>
                <SelectItem value="Missouri">Missouri</SelectItem>
                <SelectItem value="Mississippi">Mississippi</SelectItem>
                <SelectItem value="Montana">Montana</SelectItem>
                <SelectItem value="North Carolina">North Carolina</SelectItem>
                <SelectItem value="North Dakota">North Dakota</SelectItem>
                <SelectItem value="Nebraska">Nebraska</SelectItem>
                <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                <SelectItem value="New Jersey">New Jersey</SelectItem>
                <SelectItem value="New Mexico">New Mexico</SelectItem>
                <SelectItem value="Nevada">Nevada</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Ohio">Ohio</SelectItem>
                <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                <SelectItem value="Oregon">Oregon</SelectItem>
                <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                <SelectItem value="South Carolina">South Carolina</SelectItem>
                <SelectItem value="South Dakota">South Dakota</SelectItem>
                <SelectItem value="Tennessee">Tennessee</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
                <SelectItem value="Utah">Utah</SelectItem>
                <SelectItem value="Virginia">Virginia</SelectItem>
                <SelectItem value="Vermont">Vermont</SelectItem>
                <SelectItem value="Washington">Washington</SelectItem>
                <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                <SelectItem value="West Virginia">West Virginia</SelectItem>
                <SelectItem value="Wyoming">Wyoming</SelectItem>
              </SelectContent>
              </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : marketData ? (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.average_listing_price?.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getTrendIcon(marketData.market_trend)}
                  <span className="capitalize">{marketData.market_trend}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Median Price</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.median_listing_price?.toLocaleString()}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Latest prediction for {marketData.month}/{marketData.year}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price per Sq Ft</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${marketData.median_listing_price_per_square_foot}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Median price per square foot</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{marketData.median_days_on_market}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span>Median days on market</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Trend Badge */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Market Trend</h3>
                  <p className="text-muted-foreground">Current market direction in {selectedCity}</p>
                </div>
                <Badge className={`${getTrendColor(marketData.market_trend)} border`}>
                  {getTrendIcon(marketData.market_trend)}
                  <span className="ml-2 capitalize font-medium">{marketData.market_trend}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Chart 1: Median vs. Average Listing Prices */}
          <Card>
            <CardHeader>
              <CardTitle>Median vs. Average Listing Prices (with Forecasts)</CardTitle>
              <CardDescription>Historical and predicted home prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.map((item, index) => ({ ...item, index }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="monthYear" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<PriceChartTooltip />} />
                    <Legend />
                    
                    {/* Median Listing Price */}
                    <Line 
                      type="monotone" 
                      dataKey="median_listing_price" 
                      name="Median Price" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        if (props.payload.isForecast) {
                          return (
                            <circle
                              key={`median-forecast-${props.cx}-${props.cy}`}
                              cx={props.cx}
                              cy={props.cy}
                              r={3}
                              fill="#8884d8"
                              strokeWidth={2}
                            />
                          );
                        }
                        return (
                          <circle
                            key={`median-${props.cx}-${props.cy}`}
                            cx={props.cx}
                            cy={props.cy}
                            r={1}
                            fill="#8884d8"
                            strokeWidth={0}
                          />
                        );
                      }}
                      strokeDasharray="0"
                    />
                    
                    {/* Average Listing Price */}
                    <Line 
                      type="monotone" 
                      dataKey="average_listing_price" 
                      name="Average Price" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={(props: any) => {
                        if (props.payload.isForecast) {
                          return (
                            <circle
                              key={`average-forecast-${props.cx}-${props.cy}`}
                              cx={props.cx}
                              cy={props.cy}
                              r={3}
                              fill="#82ca9d"
                              strokeWidth={2}
                            />
                          );
                        }
                        return (
                          <circle
                            key={`average-${props.cx}-${props.cy}`}
                            cx={props.cx}
                            cy={props.cy}
                            r={1}
                            fill="#82ca9d"
                            strokeWidth={0}
                          />
                        );
                      }}
                      strokeDasharray="0"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Chart 2: Market Supply & Demand Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Market Supply & Demand Trends (with Forecasts)</CardTitle>
              <CardDescription>Relationship between listing count and days on market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={chartData.map((item, index) => ({ ...item, index }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthYear" />
                    
                    {/* Left Y-axis for listing count */}
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    
                    {/* Right Y-axis for days on market */}
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tickFormatter={(value) => `${value} days`}
                    />
                    
                    <Tooltip content={<SupplyDemandTooltip />} />
                    <Legend />
                    
                    {/* Market Condition Annotations */}
                    {chartData.map((item, index) => {
                      const condition = getMarketCondition(index);
                      if (!condition) return null;
                      
                      return (
                        <ReferenceLine
                          key={index}
                          x={item.monthYear}
                          stroke={condition === "Buyer's Advantage" ? "#2563eb" : "#dc2626"}
                          strokeDasharray="3 3"
                        >
                          <Label
                            value={condition}
                            position="insideTop"
                            fill={condition === "Buyer's Advantage" ? "#2563eb" : "#dc2626"}
                            fontSize={10}
                          />
                        </ReferenceLine>
                      );
                    })}
                    
                    {/* Total Listing Count - All Data */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_listing_count"
                      name="Listings"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />

                    {/* Total Listing Count - Forecast overlay with dashed line */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={(entry: any) => entry.isForecast ? entry.total_listing_count : null}
                      // name="Listings (Forecast)"
                      stroke="#ffffffff"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{
                        r: 3,
                        fill: "#8884d8",
                        strokeWidth: 1,
                        stroke: "#8884d8"
                      }}
                      connectNulls={true}
                    />
                    
                    {/* Median Days on Market - All Data */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="median_days_on_market"
                      name="Days on Market"
                      stroke="#ff7300"
                      strokeWidth={2}
                      dot={false}
                    />
                    
                    {/* Median Days on Market - Forecast overlay with dashed line */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={(entry: any) => entry.isForecast ? entry.median_days_on_market : null}
                      // name="Days on Market (Forecast)"
                      stroke="#ffffffff"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{
                        r: 3,
                        fill: "#ff7300",
                        strokeWidth: 1,
                        stroke: "#ff7300"
                      }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
              <CardDescription>Key insights for {selectedCity} real estate market</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Total Listings</h4>
                  <p className="text-2xl font-bold text-primary">{marketData.total_listing_count.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Active listings</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Market Velocity</h4>
                  <p className="text-2xl font-bold text-primary">{marketData.median_days_on_market} days</p>
                  <p className="text-sm text-muted-foreground">Median time to sell</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Market Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  The {selectedCity} market is currently showing 
                  {marketData.market_trend ? (
                    <>
                      a <strong className="capitalize">{marketData.market_trend}</strong> trend. 
                    </>
                  ) : (
                    <> the latest trends based on our predictions. </>
                  )}
                  With an average price of{" "}
                  <strong>${marketData.average_listing_price.toLocaleString()}</strong> and properties spending an average of{" "}
                  <strong>{marketData.median_days_on_market} days</strong> on the market,
                  {marketData.market_trend === "rising" && " this indicates a seller's market with strong demand."}
                  {marketData.market_trend === "declining" && " buyers may have more negotiating power."}
                  {marketData.market_trend === "stable" && " the market shows balanced conditions for both buyers and sellers."}
                  {!marketData.market_trend && " market conditions should be carefully evaluated."}
                </p>
                
                {historicalData.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      Based on historical data analysis, the market has shown {" "}
                      {
                        historicalData[historicalData.length - 1].median_listing_price > historicalData[0].median_listing_price
                          ? <span>a <strong className="text-green-600">positive growth trend</strong> in median listing prices</span>
                          : <span>a <strong className="text-red-600">negative growth trend</strong> in median listing prices</span>
                      } over the past {historicalData.length} months.
                      
                      {chartData.some(item => getMarketCondition(chartData.indexOf(item)) === "Buyer's Advantage") && 
                        " There have been periods favorable to buyers when inventory increased while properties took longer to sell."}
                      
                      {chartData.some(item => getMarketCondition(chartData.indexOf(item)) === "Seller's Market") && 
                        " The market has also shown strong seller's conditions when inventory decreased and properties sold more quickly."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No market data available</h3>
            <p>Market insights for {selectedCity} are not currently available.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
