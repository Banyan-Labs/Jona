"use client";

import React, { useState } from "react";
import { Crown, Zap, Check, Loader2 } from "lucide-react";
import { SubscriptionService } from "@/app/services/user/index";
import type {
  CurrentSubscription,
  SubscriptionPlan,
  AuthUser,
} from "@/types/index";
import { ProfileService } from "@/utils/profile-service";

type BillingCycle = "monthly" | "yearly";

interface SubscriptionTabProps {
  subscription: CurrentSubscription | null;
  subscriptionPlans: SubscriptionPlan[];
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  authUser: AuthUser;
  onSubscriptionUpdate: () => void;
}

export default function SubscriptionTab({
  subscription,
  subscriptionPlans,
  loading,
  setLoading,
  setError,
  authUser,
  onSubscriptionUpdate,
}: SubscriptionTabProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const handleSubscriptionUpgrade = async (planId: string) => {
    if (!authUser?.id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await SubscriptionService.createCheckoutSession(
        authUser.id,
        planId,
        billingCycle
      );

      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Failed to create checkout session");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upgrade subscription"
      );
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-blue-900">
              Current Plan: {subscription?.plan_name || "Free"}
            </h3>
            <p className="text-blue-700">
              {subscription?.status === "active" &&
              subscription?.current_period_end
                ? `Active until ${new Date(
                    subscription.current_period_end
                  ).toLocaleDateString()}`
                : "No active subscription"}
            </p>
            <div className="mt-2 flex items-center gap-4">
              {subscription?.features?.includes("auto_scrape") && (
                <span className="flex items-center gap-1 text-sm text-blue-700">
                  <Zap className="w-4 h-4" />
                  Auto-scraping enabled
                </span>
              )}
              {subscription?.features?.includes("priority_support") && (
                <span className="flex items-center gap-1 text-sm text-blue-700">
                  <Crown className="w-4 h-4" />
                  Priority support
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">
              {subscription?.plan_name === "Free" || !subscription
                ? "Free"
                : `${billingCycle === "monthly" ? "$19.99/mo" : "$199.90/yr"}`}
            </div>
            <button
              onClick={() => alert("Opening billing portal...")}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              Manage Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg font-medium ${
              billingCycle === "monthly"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-lg font-medium ${
              billingCycle === "yearly"
                ? "bg-white text-gray-900 shadow"
                : "text-gray-600"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-green-600">(Save 17%)</span>
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white border-2 rounded-lg p-6 ${
              plan.popular ? "border-blue-500 shadow-lg" : "border-gray-200"
            } ${
              subscription?.plan_name === plan.name
                ? "ring-2 ring-blue-500 ring-opacity-50"
                : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-600 mt-2">{plan.description}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.name === "Free"
                    ? "Free"
                    : formatCurrency(
                        billingCycle === "monthly"
                          ? plan.price_monthly ?? 0
                          : plan.price_yearly ?? 0
                      )}
                </span>
                {plan.name !== "Free" && (
                  <span className="text-gray-600">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button
                onClick={() => handleSubscriptionUpgrade(plan.id)}
                disabled={loading || subscription?.plan_name === plan.name}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  subscription?.plan_name === plan.name
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                } disabled:opacity-50`}
              >
                {subscription?.plan_name === plan.name ? (
                  "Current Plan"
                ) : loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
