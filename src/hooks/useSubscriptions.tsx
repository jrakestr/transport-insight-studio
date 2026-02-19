import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type EntityType = 'agency' | 'provider' | 'topic' | 'state' | 'mode';

export interface Subscription {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string | null;
  entity_value: string | null;
  created_at: string;
}

export function useSubscriptions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
    enabled: !!user,
  });

  const subscribe = useMutation({
    mutationFn: async ({ 
      entityType, 
      entityId, 
      entityValue 
    }: { 
      entityType: EntityType; 
      entityId?: string; 
      entityValue?: string;
    }) => {
      if (!user) throw new Error("Must be logged in to subscribe");

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId || null,
          entity_value: entityValue || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error("Already subscribed");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscribed");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unsubscribe = useMutation({
    mutationFn: async (subscriptionId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("user_subscriptions")
        .delete()
        .eq("id", subscriptionId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Unsubscribed");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isSubscribed = (entityType: EntityType, entityId?: string, entityValue?: string) => {
    if (!subscriptions) return false;
    return subscriptions.some(sub => 
      sub.entity_type === entityType && 
      (entityId ? sub.entity_id === entityId : sub.entity_value === entityValue)
    );
  };

  const getSubscription = (entityType: EntityType, entityId?: string, entityValue?: string) => {
    if (!subscriptions) return null;
    return subscriptions.find(sub => 
      sub.entity_type === entityType && 
      (entityId ? sub.entity_id === entityId : sub.entity_value === entityValue)
    ) || null;
  };

  const toggleSubscription = async (entityType: EntityType, entityId?: string, entityValue?: string) => {
    const existing = getSubscription(entityType, entityId, entityValue);
    if (existing) {
      await unsubscribe.mutateAsync(existing.id);
    } else {
      await subscribe.mutateAsync({ entityType, entityId, entityValue });
    }
  };

  return {
    subscriptions,
    isLoading,
    subscribe: subscribe.mutate,
    unsubscribe: unsubscribe.mutate,
    isSubscribed,
    getSubscription,
    toggleSubscription,
    isSubscribing: subscribe.isPending,
    isUnsubscribing: unsubscribe.isPending,
  };
}
