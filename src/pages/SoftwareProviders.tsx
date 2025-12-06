import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Building2, 
  Calendar, 
  Globe, 
  DollarSign,
  ExternalLink,
  Server,
  Cloud,
  Users
} from 'lucide-react';
import { useSoftwareProvidersList, SOFTWARE_CATEGORIES } from '@/hooks/useSoftwareProviders';

const SoftwareProviders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: providers, isLoading } = useSoftwareProvidersList({
    search: searchTerm,
    category: selectedCategory,
  });

  const getCategoryLabel = (value: string) => {
    return SOFTWARE_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const formatPricingModel = (model: string | null) => {
    if (!model) return null;
    const models: Record<string, string> = {
      'subscription': 'Subscription',
      'perpetual': 'Perpetual License',
      'usage_based': 'Usage-Based',
      'hybrid': 'Hybrid',
      'contact': 'Contact for Pricing',
    };
    return models[model] || model;
  };

  const getDeploymentIcon = (type: string | null) => {
    if (type === 'cloud') return <Cloud className="h-4 w-4" />;
    if (type === 'on_premise') return <Server className="h-4 w-4" />;
    return <Server className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
          <div className="section-container">
            <h1 className="text-4xl font-bold mb-4">Software Providers</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore transit technology vendors and their solutions. Find the right software 
              for CAD/AVL, fare collection, scheduling, and more.
            </p>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="section-container py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, product, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Category Tabs & Content */}
        <section className="section-container pb-12">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent mb-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All Categories
              </TabsTrigger>
              {SOFTWARE_CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : providers?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No software providers found.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {providers?.map((provider) => (
                    <Card key={provider.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                            {provider.product_name && (
                              <p className="text-sm text-muted-foreground truncate">
                                {provider.product_name}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {getCategoryLabel(provider.category)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Description */}
                        {provider.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {provider.description}
                          </p>
                        )}

                        {/* Company Fundamentals */}
                        <div className="space-y-2 text-sm">
                          {provider.headquarters && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-4 w-4 shrink-0" />
                              <span className="truncate">{provider.headquarters}</span>
                            </div>
                          )}
                          
                          {provider.year_founded && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span>Founded {provider.year_founded}</span>
                            </div>
                          )}

                          {provider.deployment_type && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {getDeploymentIcon(provider.deployment_type)}
                              <span className="capitalize">
                                {provider.deployment_type === 'on_premise' ? 'On-Premise' : 
                                 provider.deployment_type === 'cloud' ? 'Cloud' : 
                                 provider.deployment_type === 'hybrid' ? 'Hybrid' : 
                                 provider.deployment_type}
                              </span>
                            </div>
                          )}

                          {provider.pricing_model && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-4 w-4 shrink-0" />
                              <span>{formatPricingModel(provider.pricing_model)}</span>
                            </div>
                          )}
                        </div>

                        {/* Website Link */}
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Globe className="h-4 w-4" />
                            Visit Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default SoftwareProviders;
