import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  isEmpty?: boolean;
  actions?: React.ReactNode;
}

export const CollapsibleSection = ({
  title,
  icon,
  count,
  children,
  defaultOpen = true,
  className,
  headerClassName,
  isEmpty = false,
  actions,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(isEmpty ? false : defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("card-elevated border-border/50", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className={cn(
            "border-b border-border/30 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors",
            headerClassName
          )}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                {icon}
                {title}
                {count !== undefined && (
                  <span className="text-muted-foreground font-normal">({count})</span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {actions && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {actions}
                  </div>
                )}
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} 
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
