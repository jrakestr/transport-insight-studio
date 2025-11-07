import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, TrendingUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation: { name: string; href: string }[] = [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="section-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>Transit<span className="text-primary">Intel</span></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:gap-x-8 md:items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Industry News
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border shadow-lg z-50">
              <DropdownMenuItem asChild>
                <Link to="/news" className="cursor-pointer">
                  Latest
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/news?filter=paratransit" className="cursor-pointer">
                  Paratransit/ADA
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/news?filter=corporate-shuttles" className="cursor-pointer">
                  Corporate Shuttles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/news?filter=school" className="cursor-pointer">
                  School Transportation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/news?filter=healthcare" className="cursor-pointer">
                  Healthcare/NEMT
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/news?filter=government" className="cursor-pointer">
                  Government Transit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/news?filter=fixed-route" className="cursor-pointer">
                  Fixed-Route/Major Agencies
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/reports" className="cursor-pointer">
                  Market Reports
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sales Opportunities
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border shadow-lg z-50">
              <DropdownMenuItem asChild>
                <Link to="/opportunities/government" className="cursor-pointer">
                  Government Procurement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/opportunities/early-stage" className="cursor-pointer">
                  Early-Stage Opportunities
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Resources/Tools
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border shadow-lg z-50">
              <DropdownMenuItem asChild>
                <Link to="/product-portfolio" className="cursor-pointer">
                  Product Portfolio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/ntd-database" className="cursor-pointer">
                  NTD Database
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/industry-links" className="cursor-pointer">
                  Industry Links
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden md:flex md:gap-x-4">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Subscribe</Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <div className="border-b pb-2 mb-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Industry News
              </div>
              <Link
                to="/news"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Latest
              </Link>
              <Link
                to="/news?filter=paratransit"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Paratransit/ADA
              </Link>
              <Link
                to="/news?filter=corporate-shuttles"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Corporate Shuttles
              </Link>
              <Link
                to="/news?filter=school"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                School Transportation
              </Link>
              <Link
                to="/news?filter=healthcare"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Healthcare/NEMT
              </Link>
              <Link
                to="/news?filter=government"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Government Transit
              </Link>
              <Link
                to="/news?filter=fixed-route"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Fixed-Route/Major Agencies
              </Link>
              <Link
                to="/reports"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Market Reports
              </Link>
            </div>
            
            <div className="border-b pb-2 mb-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Sales Opportunities
              </div>
              <Link
                to="/opportunities/government"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Government Procurement
              </Link>
              <Link
                to="/opportunities/early-stage"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Early-Stage Opportunities
              </Link>
            </div>
            
            <div className="border-b pb-2 mb-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Resources/Tools
              </div>
              <Link
                to="/product-portfolio"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Product Portfolio
              </Link>
              <Link
                to="/ntd-database"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                NTD Database
              </Link>
              <Link
                to="/industry-links"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Industry Links
              </Link>
            </div>
            
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
