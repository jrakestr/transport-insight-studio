import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export const Footer = () => {
  const footerNavigation = {
    content: [
      { name: "Industry News", href: "/news" },
      { name: "Market Reports", href: "/reports" },
      { name: "Sales Opportunities", href: "/opportunities" },
    ],
    resources: [
      { name: "Product Portfolio", href: "/product-portfolio" },
      { name: "NTD Database", href: "/ntd-database" },
      { name: "Industry Links", href: "/industry-links" },
      { name: "Newsletter", href: "/newsletter" },
      { name: "Events", href: "/events" },
      { name: "Whitepapers", href: "/whitepapers" },
      { name: "FAQ", href: "/faq" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="border-t bg-muted/50">
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>Transit<span className="text-primary">Intel</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your trusted source for transportation industry market intelligence, covering transit technology, RFPs, and competitive analysis.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Content</h3>
            <ul className="space-y-3">
              {footerNavigation.content.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerNavigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TransitIntel. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerNavigation.legal.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
