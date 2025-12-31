import { useParams, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as LucideIcons from "lucide-react";
import { useState } from "react";
import DOMPurify from "dompurify";

const PlaybookDetail = () => {
  const { slug } = useParams();
  const { data: playbooks, isLoading } = usePlaybooks();
  const [activePhase, setActivePhase] = useState("overview");
  
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

  // Parse phases from content
  const parsePhases = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const h2Elements = doc.querySelectorAll('h2');
    
    const phases = [{ id: "overview", title: "Overview", content: "" }];
    
    h2Elements.forEach((h2, index) => {
      const title = h2.textContent || "";
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Get content between this h2 and the next
      let content = h2.outerHTML;
      let nextElement = h2.nextElementSibling;
      
      while (nextElement && nextElement.tagName !== 'H2') {
        content += nextElement.outerHTML;
        nextElement = nextElement.nextElementSibling;
      }
      
      phases.push({ id, title, content });
    });
    
    return phases;
  };

  const phases = playbook.content ? parsePhases(playbook.content) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="section-container py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/playbook">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Playbooks
            </Link>
          </Button>

          {/* Header */}
          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex items-start gap-4">
              {Icon && <Icon className="h-10 w-10 text-primary flex-shrink-0 mt-1" />}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {playbook.title}
                </h1>
                {playbook.description && (
                  <p className="mt-3 text-lg text-muted-foreground">
                    {playbook.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabbed Navigation */}
          <Tabs value={activePhase} onValueChange={setActivePhase} className="w-full">
            <div className="border-b border-border mb-8">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-auto p-0 bg-transparent w-full justify-start">
                  {phases.map((phase) => (
                    <TabsTrigger
                      key={phase.id}
                      value={phase.id}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium"
                    >
                      {phase.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            {phases.map((phase, index) => (
              <TabsContent key={phase.id} value={phase.id} className="mt-0">
                <div className="max-w-5xl">
                  {phase.id === "overview" ? (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {playbook.description}
                      </p>
                      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {phases.slice(1).map((p, i) => (
                          <button
                            key={p.id}
                            onClick={() => setActivePhase(p.id)}
                            className="text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors group"
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-semibold text-foreground group-hover:text-primary">
                                {p.title}
                              </span>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-2" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="playbook-content prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(phase.content) }}
                    />
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-12 pt-8 border-t border-border">
                    <div>
                      {index > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setActivePhase(phases[index - 1].id)}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {phases[index - 1].title}
                        </Button>
                      )}
                    </div>
                    <div>
                      {index < phases.length - 1 && (
                        <Button
                          onClick={() => setActivePhase(phases[index + 1].id)}
                        >
                          {phases[index + 1].title}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlaybookDetail;
