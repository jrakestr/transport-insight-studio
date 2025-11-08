import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Users, TrendingUp, Calendar, FileText } from "lucide-react";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const Playbook = () => {
  const { data: playbooks, isLoading } = usePlaybooks();

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Target;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Target;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Sales Playbooks
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Strategic frameworks and actionable tactics for winning transit technology deals
            </p>
          </div>
        </section>

        {/* Overview Section */}
        <section className="section-container py-16 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Overview</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground">
                This playbook provides BD managers with data-driven strategies for navigating the complex transit procurement landscape. Built on real agency data, verified procurement cycles, and documented buying triggers.
              </p>
            </div>
          </div>
        </section>

        {/* Key Sections */}
        <section className="section-container py-16">
          {isLoading ? (
            <div className="text-center py-8">Loading playbooks...</div>
          ) : !playbooks || playbooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No playbooks available yet. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {playbooks.map((playbook) => {
                const Icon = getIcon(playbook.icon);
                return (
                  <Card key={playbook.id}>
                    <CardHeader>
                      <Icon className="h-12 w-12 text-primary mb-4" />
                      <CardTitle>{playbook.title}</CardTitle>
                      <CardDescription>{playbook.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to={`/playbook/${playbook.slug}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="section-container py-16 bg-secondary/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Accelerate Your Pipeline?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get full access to detailed playbooks, templates, and real-time opportunity alerts
            </p>
            <Button size="lg">
              Subscribe Now
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Playbook;
