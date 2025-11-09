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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, ExternalLink, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: opportunity, isLoading: loadingOpportunity } = useOpportunity(id);
  const { data: agencies } = useAgencies();
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
              <Select
                value={formData.agency_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, agency_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="agency_id">
                  <SelectValue placeholder="Select agency (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {agencies?.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.agency_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="provider_id">Transportation Provider</Label>
              <Select
                value={formData.provider_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, provider_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="provider_id">
                  <SelectValue placeholder="Select provider (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {providers?.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="article_id">Related Article</Label>
              <Select
                value={formData.article_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, article_id: value === "none" ? "" : value })}
              >
                <SelectTrigger id="article_id">
                  <SelectValue placeholder="Select article (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {articles?.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
