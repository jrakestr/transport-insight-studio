import { useParams, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <article className="section-container py-12">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" asChild className="mb-8">
              <Link to="/playbook">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Playbooks
              </Link>
            </Button>

            {/* Header */}
            <div className="mb-12">
              {Icon && <Icon className="h-12 w-12 text-primary mb-4" />}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                {playbook.title}
              </h1>
              {playbook.description && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {playbook.description}
                </p>
              )}
            </div>

            {/* Content */}
            {playbook.content && (
              <div className="playbook-content space-y-8">
                <div dangerouslySetInnerHTML={{ __html: playbook.content }} />
              </div>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default PlaybookDetail;
