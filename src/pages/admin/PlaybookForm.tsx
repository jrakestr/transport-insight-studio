import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePlaybook, useCreatePlaybook, useUpdatePlaybook } from "@/hooks/usePlaybooks";
import { useEffect } from "react";

interface PlaybookFormData {
  title: string;
  slug: string;
  description: string;
  content: string;
  icon: string;
  category: string;
  order_index: number;
}

const PlaybookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: playbook } = usePlaybook(id || "");
  const createPlaybook = useCreatePlaybook();
  const updatePlaybook = useUpdatePlaybook();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlaybookFormData>();

  useEffect(() => {
    if (playbook) {
      reset({
        title: playbook.title,
        slug: playbook.slug,
        description: playbook.description || "",
        content: playbook.content || "",
        icon: playbook.icon || "",
        category: playbook.category || "",
        order_index: playbook.order_index,
      });
    }
  }, [playbook, reset]);

  const onSubmit = async (data: PlaybookFormData) => {
    try {
      if (isEditing && id) {
        await updatePlaybook.mutateAsync({ id, ...data });
      } else {
        await createPlaybook.mutateAsync(data);
      }
      navigate("/admin/playbooks");
    } catch (error) {
      console.error("Failed to save playbook:", error);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">
        {isEditing ? "Edit Playbook" : "New Playbook"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            {...register("slug", { required: "Slug is required" })}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Lucide icon name)</Label>
          <Input id="icon" {...register("icon")} placeholder="Target" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_index">Order Index</Label>
          <Input
            id="order_index"
            type="number"
            {...register("order_index", { valueAsNumber: true })}
            defaultValue={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content (Markdown supported)</Label>
          <Textarea
            id="content"
            {...register("content")}
            rows={15}
            className="font-mono"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit">
            {isEditing ? "Update" : "Create"} Playbook
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/playbooks")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlaybookForm;
