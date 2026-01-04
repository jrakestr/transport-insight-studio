import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useSubscriptions, EntityType } from "@/hooks/useSubscriptions";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  entityType: EntityType;
  entityId?: string;
  entityValue?: string;
  entityName: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function SubscribeButton({
  entityType,
  entityId,
  entityValue,
  entityName,
  variant = "outline",
  size = "sm",
  className,
  showLabel = true,
}: SubscribeButtonProps) {
  const { user } = useAuth();
  const { isSubscribed, toggleSubscription, isSubscribing, isUnsubscribing } = useSubscriptions();

  if (!user) return null;

  const subscribed = isSubscribed(entityType, entityId, entityValue);
  const isLoading = isSubscribing || isUnsubscribing;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleSubscription(entityType, entityId, entityValue);
  };

  return (
    <Button
      variant={subscribed ? "secondary" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        subscribed && "bg-primary/10 text-primary hover:bg-primary/20",
        className
      )}
      title={subscribed ? `Unfollow ${entityName}` : `Follow ${entityName}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : subscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-1.5">{subscribed ? "Following" : "Follow"}</span>
      )}
    </Button>
  );
}
