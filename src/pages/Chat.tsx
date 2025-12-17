import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import TransitChat from "@/components/TransitChat";

export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Transit Intelligence Chat</h1>
            <p className="text-muted-foreground">
              Ask questions about transit agencies, service providers, contracts,
              and industry statistics. Powered by our comprehensive database.
            </p>
          </div>
          <TransitChat />
        </div>
      </main>
      <Footer />
    </div>
  );
}
