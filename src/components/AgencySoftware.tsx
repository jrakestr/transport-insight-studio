import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useAgencySoftware, 
  useSoftwareProviders, 
  useAgencySoftwareMutation,
  useSoftwareProviderMutation,
  SOFTWARE_CATEGORIES,
  AgencySoftware as AgencySoftwareType
} from "@/hooks/useAgencySoftware";
import { useAuth } from "@/hooks/useAuth";
import { 
  Monitor, Plus, Trash2, ExternalLink, Loader2, Search,
  Cloud, Server, Calendar, DollarSign, Building2
} from "lucide-react";

interface AgencySoftwareProps {
  agencyId: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  planned: "bg-blue-500",
  evaluating: "bg-yellow-500",
  retired: "bg-gray-500",
};

const categoryIcons: Record<string, string> = {
  'cad-avl': '📍',
  'fare-collection': '💳',
  'scheduling': '📅',
  'passenger-info': '📱',
  'fleet-management': '🚌',
  'paratransit': '♿',
  'analytics': '📊',
  'maintenance': '🔧',
  'erp-finance': '💰',
  'workforce': '👥',
  'cybersecurity': '🔒',
  'other': '📦',
};

export const AgencySoftware = ({ agencyId }: AgencySoftwareProps) => {
  const { data: agencySoftware, isLoading } = useAgencySoftware(agencyId);
  const { data: allProviders } = useSoftwareProviders();
  const { addSoftwareToAgency, removeAgencySoftware } = useAgencySoftwareMutation();
  const { createSoftwareProvider } = useSoftwareProviderMutation();
  const { isAdmin } = useAuth();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNewProviderDialogOpen, setIsNewProviderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string>("");
  const [implementationStatus, setImplementationStatus] = useState("active");
  const [deleteConfirm, setDeleteConfirm] = useState<AgencySoftwareType | null>(null);
  
  const [newProvider, setNewProvider] = useState({
    name: "",
    category: "",
    product_name: "",
    description: "",
    website: "",
    deployment_type: "",
    pricing_model: "",
    headquarters: "",
  });

  // Group software by category
  const groupedSoftware = agencySoftware?.reduce((acc, item) => {
    const category = item.software_providers?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, AgencySoftwareType[]>);

  const categories = Object.keys(groupedSoftware || {});

  const filteredProviders = allProviders?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSoftware = async () => {
    if (!selectedSoftwareId) return;
    await addSoftwareToAgency.mutateAsync({
      agency_id: agencyId,
      software_id: selectedSoftwareId,
      implementation_status: implementationStatus,
    });
    setIsAddDialogOpen(false);
    setSelectedSoftwareId("");
    setSearchTerm("");
  };

  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createSoftwareProvider.mutateAsync({
      ...newProvider,
      integrations: [],
      certifications: [],
    } as any);
    setIsNewProviderDialogOpen(false);
    setNewProvider({
      name: "",
      category: "",
      product_name: "",
      description: "",
      website: "",
      deployment_type: "",
      pricing_model: "",
      headquarters: "",
    });
    // Auto-select the newly created provider
    setSelectedSoftwareId(result.id);
  };

  const getCategoryLabel = (value: string) => {
    return SOFTWARE_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Software Stack ({agencySoftware?.length || 0})
          </CardTitle>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Software
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Software to Agency</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search software providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {filteredProviders?.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <p>No providers found</p>
                        <Button 
                          variant="link" 
                          onClick={() => setIsNewProviderDialogOpen(true)}
                        >
                          Create new provider
                        </Button>
                      </div>
                    ) : (
                      filteredProviders?.map(provider => (
                        <div 
                          key={provider.id}
                          className={`p-3 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                            selectedSoftwareId === provider.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedSoftwareId(provider.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              {provider.product_name && (
                                <p className="text-sm text-muted-foreground">{provider.product_name}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {categoryIcons[provider.category]} {getCategoryLabel(provider.category)}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Implementation Status</Label>
                    <Select value={implementationStatus} onValueChange={setImplementationStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="evaluating">Evaluating</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setIsNewProviderDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Provider
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddSoftware} 
                        disabled={!selectedSoftwareId || addSoftwareToAgency.isPending}
                      >
                        {addSoftwareToAgency.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : agencySoftware && agencySoftware.length > 0 ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {categoryIcons[category]} {getCategoryLabel(category)}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {groupedSoftware?.[category]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="space-y-3">
                  {groupedSoftware?.[category]?.map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{item.software_providers?.name}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs text-white ${statusColors[item.implementation_status || 'active']}`}
                            >
                              {item.implementation_status || 'active'}
                            </Badge>
                          </div>
                          
                          {item.software_providers?.product_name && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.software_providers.product_name}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {item.software_providers?.deployment_type && (
                              <span className="flex items-center gap-1">
                                {item.software_providers.deployment_type === 'cloud' ? (
                                  <Cloud className="h-3 w-3" />
                                ) : (
                                  <Server className="h-3 w-3" />
                                )}
                                {item.software_providers.deployment_type}
                              </span>
                            )}
                            {item.software_providers?.headquarters && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {item.software_providers.headquarters}
                              </span>
                            )}
                            {item.contract_start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Since {new Date(item.contract_start_date).getFullYear()}
                              </span>
                            )}
                            {item.annual_cost && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${item.annual_cost.toLocaleString()}/yr
                              </span>
                            )}
                          </div>

                          {item.software_providers?.website && (
                            <a
                              href={item.software_providers.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(item)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No software tracked for this agency</p>
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Software
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {/* New Provider Dialog */}
      <Dialog open={isNewProviderDialogOpen} onOpenChange={setIsNewProviderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Software Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProvider} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={newProvider.name}
                onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={newProvider.category} 
                onValueChange={(val) => setNewProvider(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SOFTWARE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {categoryIcons[cat.value]} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                value={newProvider.product_name}
                onChange={(e) => setNewProvider(prev => ({ ...prev, product_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={newProvider.website}
                onChange={(e) => setNewProvider(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deployment</Label>
                <Select 
                  value={newProvider.deployment_type} 
                  onValueChange={(val) => setNewProvider(prev => ({ ...prev, deployment_type: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="on-premise">On-Premise</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pricing Model</Label>
                <Select 
                  value={newProvider.pricing_model} 
                  onValueChange={(val) => setNewProvider(prev => ({ ...prev, pricing_model: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="perpetual">Perpetual</SelectItem>
                    <SelectItem value="usage-based">Usage-Based</SelectItem>
                    <SelectItem value="contact">Contact for Pricing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                value={newProvider.headquarters}
                onChange={(e) => setNewProvider(prev => ({ ...prev, headquarters: e.target.value }))}
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProvider.description}
                onChange={(e) => setNewProvider(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewProviderDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!newProvider.name || !newProvider.category || createSoftwareProvider.isPending}>
                {createSoftwareProvider.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Provider
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Software</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {deleteConfirm?.software_providers?.name} from this agency? This won't delete the software provider from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm) {
                  removeAgencySoftware.mutate({ id: deleteConfirm.id, agencyId });
                  setDeleteConfirm(null);
                }
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
