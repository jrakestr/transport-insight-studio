import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";
import Article from "./pages/Article";
import Opportunities from "./pages/Opportunities";
import Opportunity from "./pages/Opportunity";
import Agencies from "./pages/Agencies";
import Providers from "./pages/Providers";
import Auth from "./pages/Auth";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ArticlesAdmin from "./pages/admin/Articles";
import ArticleForm from "./pages/admin/ArticleForm";
import AgenciesAdmin from "./pages/admin/Agencies";
import AgencyForm from "./pages/admin/AgencyForm";
import ProvidersAdmin from "./pages/admin/Providers";
import ProviderForm from "./pages/admin/ProviderForm";
import OpportunitiesAdmin from "./pages/admin/Opportunities";
import OpportunityForm from "./pages/admin/OpportunityForm";
import ReportsAdmin from "./pages/admin/Reports";
import ReportForm from "./pages/admin/ReportForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:slug" element={<ReportDetail />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/:id" element={<Opportunity />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<ArticlesAdmin />} />
            <Route path="articles/new" element={<ArticleForm />} />
            <Route path="articles/:id/edit" element={<ArticleForm />} />
            <Route path="agencies" element={<AgenciesAdmin />} />
            <Route path="agencies/new" element={<AgencyForm />} />
            <Route path="agencies/:id/edit" element={<AgencyForm />} />
            <Route path="providers" element={<ProvidersAdmin />} />
            <Route path="providers/new" element={<ProviderForm />} />
            <Route path="providers/:id/edit" element={<ProviderForm />} />
            <Route path="opportunities" element={<OpportunitiesAdmin />} />
            <Route path="opportunities/new" element={<OpportunityForm />} />
            <Route path="opportunities/:id/edit" element={<OpportunityForm />} />
            <Route path="reports" element={<ReportsAdmin />} />
            <Route path="reports/new" element={<ReportForm />} />
            <Route path="reports/:id/edit" element={<ReportForm />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
