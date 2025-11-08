import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Users, TrendingUp, Calendar, FileText } from "lucide-react";

const Playbook = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="section-container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Sales Playbook
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Account Targeting</CardTitle>
                <CardDescription>
                  Identify high-value prospects using fleet size, budget cycles, and technology deployment patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Framework
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Timing Strategies</CardTitle>
                <CardDescription>
                  Map procurement cycles, RFP timelines, and budget planning windows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Timeline
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Stakeholder Mapping</CardTitle>
                <CardDescription>
                  Navigate multi-level decision-making with transit managers, board members, and city officials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Value Proposition</CardTitle>
                <CardDescription>
                  Craft compelling narratives around safety, efficiency, and ROI specific to transit operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>RFP Response Tactics</CardTitle>
                <CardDescription>
                  Win more bids with proven strategies for transit technology procurement responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Tactics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Case Studies</CardTitle>
                <CardDescription>
                  Learn from successful deals across agencies of different sizes and service types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Studies
                </Button>
              </CardContent>
            </Card>
          </div>
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
