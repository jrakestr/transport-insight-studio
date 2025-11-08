import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { marked } from "marked";
import * as LucideIcons from "lucide-react";

const PlaybookDetail = () => {
  const { slug } = useParams();
  const { data: playbooks, isLoading } = usePlaybooks();
  
  const playbook = playbooks?.find(p => p.slug === slug);
  
  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 section-container py-16">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!playbook) {
    return <Navigate to="/playbook" replace />;
  }

  const Icon = getIcon(playbook.icon);
  const contentHtml = playbook.content ? marked(playbook.content) : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <article className="section-container py-16">
          <div className="max-w-4xl mx-auto">
            {Icon && <Icon className="h-16 w-16 text-primary mb-6" />}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{playbook.title}</h1>
            {playbook.description && (
              <p className="text-xl text-muted-foreground mb-8">{playbook.description}</p>
            )}
            {playbook.content && (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PlaybookDetail;
