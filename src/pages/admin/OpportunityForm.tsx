import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOpportunity, useOpportunityMutation } from "@/hooks/useOpportunities";
import { useAgencies } from "@/hooks/useAgencies";
import { useProviders } from "@/hooks/useProviders";
import { useArticles } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, FileText, X, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: opportunity, isLoading: loadingOpportunity } = useOpportunity(id);
  const { data: agenciesData } = useAgencies();
  const agencies = agenciesData?.agencies || [];
  const { data: providers } = useProviders();
  const { data: articles } = useArticles();
  const { createOpportunity, updateOpportunity } = useOpportunityMutation();

  const [formData, setFormData] = useState({
    title: "",
    agency_id: "",
    provider_id: "",
    article_id: "",
    notes: "",
    document_url: "",
    document_file_path: "",
  });
  
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [agencyOpen, setAgencyOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || "",
        agency_id: opportunity.agency_id || "",
        provider_id: opportunity.provider_id || "",
        article_id: opportunity.article_id || "",
        notes: opportunity.notes || "",
        document_url: opportunity.document_url || "",
        document_file_path: opportunity.document_file_path || "",
      });
    }
  }, [opportunity]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingFile(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('opportunity-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setFormData({ ...formData, document_file_path: filePath });
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = async () => {
    if (formData.document_file_path) {
      try {
        await supabase.storage
          .from('opportunity-documents')
          .remove([formData.document_file_path]);
      } catch (error) {
        console.error('Error removing file:', error);
      }
    }
    setFormData({ ...formData, document_file_path: "" });
    setSelectedFile(null);
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('opportunity-documents')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      agency_id: formData.agency_id || null,
      provider_id: formData.provider_id || null,
      article_id: formData.article_id || null,
    };

    if (isEditing && id) {
      await updateOpportunity.mutateAsync({ id, updates: data });
    } else {
      await createOpportunity.mutateAsync(data);
    }

    navigate("/admin/opportunities");
  };

  if (loadingOpportunity) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{isEditing ? "Edit" : "New"} Opportunity</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="agency_id">Transit Agency</Label>
              <Popover open={agencyOpen} onOpenChange={setAgencyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={agencyOpen}
                    className="w-full justify-between"
                  >
                    {formData.agency_id
                      ? agencies?.find((agency) => agency.id === formData.agency_id)?.agency_name
                      : "Select agency (optional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search agencies..." />
                    <CommandList>
                      <CommandEmpty>No agency found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setFormData({ ...formData, agency_id: "" });
                            setAgencyOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.agency_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          None
                        </CommandItem>
                        {agencies?.map((agency) => (
                          <CommandItem
                            key={agency.id}
                            value={agency.agency_name}
                            onSelect={() => {
                              setFormData({ ...formData, agency_id: agency.id });
                              setAgencyOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.agency_id === agency.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {agency.agency_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="provider_id">Service Provider</Label>
              <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={providerOpen}
                    className="w-full justify-between"
                  >
                    {formData.provider_id
                      ? providers?.find((provider) => provider.id === formData.provider_id)?.name
                      : "Select provider (optional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search providers..." />
                    <CommandList>
                      <CommandEmpty>No provider found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setFormData({ ...formData, provider_id: "" });
                            setProviderOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.provider_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          None
                        </CommandItem>
                        {providers?.map((provider) => (
                          <CommandItem
                            key={provider.id}
                            value={provider.name}
                            onSelect={() => {
                              setFormData({ ...formData, provider_id: provider.id });
                              setProviderOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.provider_id === provider.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {provider.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="article_id">Related Article</Label>
              <Popover open={articleOpen} onOpenChange={setArticleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={articleOpen}
                    className="w-full justify-between"
                  >
                    {formData.article_id
                      ? articles?.find((article) => article.id === formData.article_id)?.title
                      : "Select article (optional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search articles..." />
                    <CommandList>
                      <CommandEmpty>No article found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="none"
                          onSelect={() => {
                            setFormData({ ...formData, article_id: "" });
                            setArticleOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              !formData.article_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          None
                        </CommandItem>
                        {articles?.map((article) => (
                          <CommandItem
                            key={article.id}
                            value={article.title}
                            onSelect={() => {
                              setFormData({ ...formData, article_id: article.id });
                              setArticleOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.article_id === article.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {article.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Documents</h3>
              
              <div>
                <Label htmlFor="document_url">Document URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="document_url"
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={formData.document_url}
                    onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                  />
                  {formData.document_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a href={formData.document_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="document_file">Upload Document</Label>
                <div className="space-y-2">
                  {formData.document_file_path ? (
                    <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">
                        {formData.document_file_path.split('/').pop()}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <a href={getFileUrl(formData.document_file_path)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        id="document_file"
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv"
                      />
                      {uploadingFile && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createOpportunity.isPending || updateOpportunity.isPending}>
                {(createOpportunity.isPending || updateOpportunity.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update" : "Create"} Opportunity
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/opportunities")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
