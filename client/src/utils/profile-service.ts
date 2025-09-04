import { supabase } from "@/lib/supabaseClient";
import { 
  EnhancedUserProfile, 
  UserProfile, 
  AuthUser, 
  CurrentSubscription,
  UserUsage,
  SubscriptionPlan,
  PaymentHistory,
  ExperienceLevel
} from "@/types/index";
import { safeSelect, safeSingle } from "@/lib/safeFetch";

export class ProfileService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("getUserProfile error:", error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("updateUserProfile error:", error);
      return null;
    }
  }

  static async uploadAvatar(userId: string, file: File): Promise<{ avatar_url: string } | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      await this.updateUserProfile(userId, { avatar_url: publicUrl });

      return { avatar_url: publicUrl };
    } catch (error) {
      console.error("uploadAvatar error:", error);
      return null;
    }
  }

  static async getEnhancedUserProfile(userId: string): Promise<EnhancedUserProfile | null> {
    try {
      const [profile, subscription, usage] = await Promise.allSettled([
        this.getUserProfile(userId),
        this.getCurrentSubscription(userId),
        this.getUserUsage(userId)
      ]);

      const baseProfile = profile.status === 'fulfilled' ? profile.value : null;
      
      if (!baseProfile) {
        // Create default profile if none exists
        const defaultProfile: Partial<UserProfile> = {
          id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const createdProfile = await this.updateUserProfile(userId, defaultProfile);
        if (!createdProfile) return null;
        
        return {
          ...createdProfile,
          current_subscription: subscription.status === 'fulfilled' ? subscription.value : null,
          usage: usage.status === 'fulfilled' ? usage.value : null,
          lastSeen: new Date().toISOString(),
        };
      }

      return {
        ...baseProfile,
        current_subscription: subscription.status === 'fulfilled' ? subscription.value : null,
        usage: usage.status === 'fulfilled' ? usage.value : null,
        lastSeen: new Date().toISOString(),
      };
    } catch (error) {
      console.error("getEnhancedUserProfile error:", error);
      return null;
    }
  }

  static async getCurrentSubscription(userId: string): Promise<CurrentSubscription | null> {
    try {
      const { data, error } = await supabase.rpc(
        "get_user_current_subscription",
        { user_uuid: userId }
      );

      if (error) {
        console.error("Error fetching current subscription:", error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error("getCurrentSubscription error:", error);
      return null;
    }
  }

  static async getUserUsage(userId: string): Promise<UserUsage | null> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const { data, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", userId)
        .eq("month_year", currentMonth)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user usage:", error);
      }

      if (!data) {
        const { data: newUsage, error: insertError } = await supabase
          .from("user_usage")
          .insert({
            user_id: userId,
            month_year: currentMonth,
            jobs_scraped: 0,
            applications_sent: 0,
            resumes_uploaded: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating usage record:", insertError);
          return null;
        }

        return newUsage;
      }

      return data;
    } catch (error) {
      console.error("getUserUsage error:", error);
      return null;
    }
  }

  // Get subscription plans
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("active", true)
        .order("price_monthly", { ascending: true });

      if (error) {
        console.error("Error fetching subscription plans:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("getSubscriptionPlans error:", error);
      return [];
    }
  }

  static async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    try {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false });

      if (error) {
        console.error("Error fetching payment history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("getPaymentHistory error:", error);
      return [];
    }
  }

  static calculateUsageStats(
    usage: UserUsage | null, 
    subscription: CurrentSubscription | null
  ) {
    const defaultLimits = {
      jobs_per_month: 50,
      applications_per_day: 5,
      resumes: 1,
      auto_scrape_enabled: false,
      priority_support: false,
    };

    const limits = subscription ? {
      jobs_per_month: subscription.max_jobs_per_month || defaultLimits.jobs_per_month,
      applications_per_day: subscription.max_applications_per_day || defaultLimits.applications_per_day,
      resumes: subscription.max_resumes || defaultLimits.resumes,
      auto_scrape_enabled: subscription.features?.includes('auto_scrape') || false,
      priority_support: subscription.features?.includes('priority_support') || false,
    } : defaultLimits;

    const current = usage ? {
      jobs_scraped: usage.jobs_scraped || 0,
      applications_sent: usage.applications_sent || 0,
      resumes_uploaded: usage.resumes_uploaded || 0,
    } : {
      jobs_scraped: 0,
      applications_sent: 0,
      resumes_uploaded: 0,
    };

    return {
      current_month: current,
      limits,
      percentage_used: {
        jobs: limits.jobs_per_month > 0 ? Math.round((current.jobs_scraped / limits.jobs_per_month) * 100) : 0,
        applications: limits.applications_per_day > 0 ? Math.round((current.applications_sent / limits.applications_per_day) * 100) : 0,
        resumes: limits.resumes > 0 ? Math.round((current.resumes_uploaded / limits.resumes) * 100) : 0,
      }
    };
  }

  static async createCheckoutSession(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{ url: string } | null> {
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          planId,
          billingCycle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      return await response.json();
    } catch (error) {
      console.error("createCheckoutSession error:", error);
      return null;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) {
        console.error("Error canceling subscription:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("cancelSubscription error:", error);
      return false;
    }
  }
}

// import { supabase } from "@/lib/supabaseClient";
// import { 
//   EnhancedUserProfile, 
//   UserProfile, 
//   AuthUser, 
//   CurrentSubscription,
//   UserUsage,
//   SubscriptionPlan,
//   PaymentHistory,
//   ExperienceLevel
// } from "@/types/index";
// import { safeSelect, safeSingle } from "@/lib/safeFetch";

// export class ProfileService {
//   // Get user profile from user_profiles table
//   static async getUserProfile(userId: string): Promise<UserProfile | null> {
//     try {
//       const { data, error } = await supabase
//         .from("user_profiles")
//         .select("*")
//         .eq("id", userId)
//         .maybeSingle();

//       if (error) {
//         console.error("Error fetching user profile:", error);
//         return null;
//       }

//       return data;
//     } catch (error) {
//       console.error("getUserProfile error:", error);
//       return null;
//     }
//   }

//   // Update user profile
//   static async updateUserProfile(
//     userId: string, 
//     updates: Partial<UserProfile>
//   ): Promise<UserProfile | null> {
//     try {
//       const { data, error } = await supabase
//         .from("user_profiles")
//         .upsert({
//           id: userId,
//           ...updates,
//           updated_at: new Date().toISOString(),
//         })
//         .select()
//         .single();

//       if (error) {
//         console.error("Error updating user profile:", error);
//         return null;
//       }

//       return data;
//     } catch (error) {
//       console.error("updateUserProfile error:", error);
//       return null;
//     }
//   }

//   // Upload and update avatar
//   static async uploadAvatar(userId: string, file: File): Promise<{ avatar_url: string } | null> {
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${userId}.${fileExt}`;
//       const filePath = `avatars/${fileName}`;

//       // Upload file to Supabase Storage
//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from('user-avatars')
//         .upload(filePath, file, { upsert: true });

//       if (uploadError) {
//         console.error("Error uploading avatar:", uploadError);
//         return null;
//       }

//       // Get public URL
//       const { data: { publicUrl } } = supabase.storage
//         .from('user-avatars')
//         .getPublicUrl(filePath);

//       // Update profile with new avatar URL
//       await this.updateUserProfile(userId, { avatar_url: publicUrl });

//       return { avatar_url: publicUrl };
//     } catch (error) {
//       console.error("uploadAvatar error:", error);
//       return null;
//     }
//   }

//   // Get enhanced user profile with subscription and usage data
//   static async getEnhancedUserProfile(userId: string): Promise<EnhancedUserProfile | null> {
//     try {
//       const [profile, subscription, usage] = await Promise.allSettled([
//         this.getUserProfile(userId),
//         this.getCurrentSubscription(userId),
//         this.getUserUsage(userId)
//       ]);

//       const baseProfile = profile.status === 'fulfilled' ? profile.value : null;
      
//       if (!baseProfile) {
//         // Create default profile if none exists
//         const defaultProfile: Partial<UserProfile> = {
//           id: userId,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         };
        
//         const createdProfile = await this.updateUserProfile(userId, defaultProfile);
//         if (!createdProfile) return null;
        
//         return {
//           ...createdProfile,
//           current_subscription: subscription.status === 'fulfilled' ? subscription.value : null,
//           usage: usage.status === 'fulfilled' ? usage.value : null,
//           lastSeen: new Date().toISOString(),
//         };
//       }

//       return {
//         ...baseProfile,
//         current_subscription: subscription.status === 'fulfilled' ? subscription.value : null,
//         usage: usage.status === 'fulfilled' ? usage.value : null,
//         lastSeen: new Date().toISOString(),
//       };
//     } catch (error) {
//       console.error("getEnhancedUserProfile error:", error);
//       return null;
//     }
//   }

//   // Get current subscription (reusing from SubscriptionService)
//   static async getCurrentSubscription(userId: string): Promise<CurrentSubscription | null> {
//     try {
//       const { data, error } = await supabase.rpc(
//         "get_user_current_subscription",
//         { user_uuid: userId }
//       );

//       if (error) {
//         console.error("Error fetching current subscription:", error);
//         return null;
//       }

//       return data?.[0] || null;
//     } catch (error) {
//       console.error("getCurrentSubscription error:", error);
//       return null;
//     }
//   }

//   // Get user usage (reusing from SubscriptionService)
//   static async getUserUsage(userId: string): Promise<UserUsage | null> {
//     try {
//       const currentMonth = new Date().toISOString().slice(0, 7);

//       const { data, error } = await supabase
//         .from("user_usage")
//         .select("*")
//         .eq("user_id", userId)
//         .eq("month_year", currentMonth)
//         .maybeSingle();

//       if (error && error.code !== 'PGRST116') {
//         console.error("Error fetching user usage:", error);
//       }

//       if (!data) {
//         // Initialize usage record
//         const { data: newUsage, error: insertError } = await supabase
//           .from("user_usage")
//           .insert({
//             user_id: userId,
//             month_year: currentMonth,
//             jobs_scraped: 0,
//             applications_sent: 0,
//             resumes_uploaded: 0,
//           })
//           .select()
//           .single();

//         if (insertError) {
//           console.error("Error creating usage record:", insertError);
//           return null;
//         }

//         return newUsage;
//       }

//       return data;
//     } catch (error) {
//       console.error("getUserUsage error:", error);
//       return null;
//     }
//   }

//   // Get subscription plans
//   static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
//     try {
//       const { data, error } = await supabase
//         .from("subscription_plans")
//         .select("*")
//         .eq("active", true)
//         .order("price_monthly", { ascending: true });

//       if (error) {
//         console.error("Error fetching subscription plans:", error);
//         return [];
//       }

//       return data || [];
//     } catch (error) {
//       console.error("getSubscriptionPlans error:", error);
//       return [];
//     }
//   }

//   // Get payment history
//   static async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
//     try {
//       const { data, error } = await supabase
//         .from("payment_history")
//         .select("*")
//         .eq("user_id", userId)
//         .order("payment_date", { ascending: false });

//       if (error) {
//         console.error("Error fetching payment history:", error);
//         return [];
//       }

//       return data || [];
//     } catch (error) {
//       console.error("getPaymentHistory error:", error);
//       return [];
//     }
//   }

//   // Calculate usage statistics
//   static calculateUsageStats(
//     usage: UserUsage | null, 
//     subscription: CurrentSubscription | null
//   ) {
//     const defaultLimits = {
//       jobs_per_month: 50,
//       applications_per_day: 5,
//       resumes: 1,
//       auto_scrape_enabled: false,
//       priority_support: false,
//     };

//     const limits = subscription ? {
//       jobs_per_month: subscription.max_jobs_per_month || defaultLimits.jobs_per_month,
//       applications_per_day: subscription.max_applications_per_day || defaultLimits.applications_per_day,
//       resumes: subscription.max_resumes || defaultLimits.resumes,
//       auto_scrape_enabled: subscription.features?.includes('auto_scrape') || false,
//       priority_support: subscription.features?.includes('priority_support') || false,
//     } : defaultLimits;

//     const current = usage ? {
//       jobs_scraped: usage.jobs_scraped || 0,
//       applications_sent: usage.applications_sent || 0,
//       resumes_uploaded: usage.resumes_uploaded || 0,
//     } : {
//       jobs_scraped: 0,
//       applications_sent: 0,
//       resumes_uploaded: 0,
//     };

//     return {
//       current_month: current,
//       limits,
//       percentage_used: {
//         jobs: limits.jobs_per_month > 0 ? Math.round((current.jobs_scraped / limits.jobs_per_month) * 100) : 0,
//         applications: limits.applications_per_day > 0 ? Math.round((current.applications_sent / limits.applications_per_day) * 100) : 0,
//         resumes: limits.resumes > 0 ? Math.round((current.resumes_uploaded / limits.resumes) * 100) : 0,
//       }
//     };
//   }

//   // Create Stripe checkout session
//   static async createCheckoutSession(
//     userId: string,
//     planId: string,
//     billingCycle: 'monthly' | 'yearly'
//   ): Promise<{ url: string } | null> {
//     try {
//       const response = await fetch("/api/stripe/create-checkout-session", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId,
//           planId,
//           billingCycle,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create checkout session");
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("createCheckoutSession error:", error);
//       return null;
//     }
//   }

//   // Cancel subscription
//   static async cancelSubscription(subscriptionId: string): Promise<boolean> {
//     try {
//       const { error } = await supabase
//         .from("user_subscriptions")
//         .update({
//           status: "canceled",
//           canceled_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", subscriptionId);

//       if (error) {
//         console.error("Error canceling subscription:", error);
//         return false;
//       }

//       return true;
//     } catch (error) {
//       console.error("cancelSubscription error:", error);
//       return false;
//     }
//   }
// }

