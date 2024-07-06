"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const TEST_MODE_ENABLED = process.env.NEXT_PUBLIC_TEST_MODE_ENABLED === 'true';

const STRIPE_WAITLIST_PRICE_ID = TEST_MODE_ENABLED 
  ? process.env.NEXT_PUBLIC_STRIPE_WAITLIST_PRICE_ID_TEST 
  : process.env.NEXT_PUBLIC_STRIPE_WAITLIST_PRICE_ID;

const STRIPE_MONTHLY_PRICE_ID = TEST_MODE_ENABLED 
  ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID_TEST 
  : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;

const STRIPE_ANNUAL_PRICE_ID = TEST_MODE_ENABLED 
  ? process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID_TEST 
  : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

interface PricingTierProps {
  title: string;
  price: string;
  description: string;
  features?: string[];
  buttonText?: string;
  isFree?: boolean;
  priceId?: string;
  user: User | null;
}
interface PricingPageProps {
  user: User | null;
}
const PricingTier: React.FC<PricingTierProps> = ({
  title,
  price,
  description,
  features,
  buttonText,
  isFree = false,
  priceId,
  user,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please log in to subscribe to this plan.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to start checkout process. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card className="flex h-full w-full flex-col border border-primary-700">
      <CardHeader className="flex-grow space-y-3 p-6">
        <CardTitle className="text-2xl text-primary-700">{title}</CardTitle>
        <p className="text-sm font-medium text-gray-400 sm:text-base">
          {description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col space-y-6 p-6">
        {!isFree && (
          <p className="text-3xl font-medium sm:text-4xl">
            ${price}
            <span className="text-lg font-normal sm:text-xl"> /month</span>
          </p>
        )}
        {isFree ? (
          <>
            <Button className="flex w-full items-center justify-center rounded-2xl bg-primary-700 py-3 text-center text-sm text-white-50 hover:bg-primary-800 sm:py-4 sm:text-base">
              <Download className="mr-2 h-4 w-4" /> Windows
            </Button>
            <Button className="flex w-full items-center justify-center rounded-2xl bg-primary-700 py-3 text-center text-sm text-white-50 hover:bg-primary-800 sm:py-4 sm:text-base">
              <Download className="mr-2 h-4 w-4" /> macOS
            </Button>
            <Button className="flex w-full items-center justify-center rounded-2xl bg-primary-700 py-3 text-center text-sm text-white-50 hover:bg-primary-800 sm:py-4 sm:text-base">
              <Download className="mr-2 h-4 w-4" /> Linux
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCheckout}
            className="w-full rounded-2xl bg-primary-700 py-4 text-center text-base text-white-50 hover:bg-primary-800"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Processing..." : buttonText}
          </Button>
        )}
      </CardContent>
      <CardFooter className="p-6">
        {!isFree && features && (
          <ul className="flex-grow space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="mr-3 h-5 w-5 flex-shrink-0 text-primary-700" />
                <span className="text-sm font-medium text-primary-700 sm:text-base">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardFooter>
    </Card>
  );
};
const PricingPage: React.FC<PricingPageProps> = ({ user }) => {
  const [stripeMonthlyPriceId, setStripeMonthlyPriceId] = useState<string | undefined>();
  const [stripeAnnualPriceId, setStripeAnnualPriceId] = useState<string | undefined>();

  useEffect(() => {
    const testModeEnabled = process.env.NEXT_PUBLIC_TEST_MODE_ENABLED === 'true';
    const monthlyPriceId = testModeEnabled 
      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID_TEST 
      : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    const annualPriceId = testModeEnabled 
      ? process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID_TEST 
      : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

    setStripeMonthlyPriceId(monthlyPriceId);
    setStripeAnnualPriceId(annualPriceId);
  }, []);

  const tiers: Omit<PricingTierProps, "user">[] = [
    {
      title: "Free",
      price: "0",
      description:
        "Download PearAI and use it for free with your own API keys!",
      isFree: true,
    },
    {
      title: "Monthly",
      price: "18",
      description:
        "Get the monthly subscription and get your supercharged coding editor assistant",
      features: [
        "Pro two-week trial",
        "Unlimited Copilot++ completions",
        "OpenAI zero-data retention",
        "Unlimited Copilot++ completions",
      ],
      buttonText: "Get Started",
      priceId: stripeMonthlyPriceId,
    },
    {
      title: "Yearly",
      price: "14",
      description: "Pay yearly and get... add text here",
      features: [
        "Pro two-week trial",
        "Unlimited Copilot++ completions",
        "OpenAI zero-data retention",
        "Unlimited Copilot++ completions",
      ],
      buttonText: "Get Started",
      priceId: stripeAnnualPriceId,
    },
  ];


  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24">
          {/* Page header */}
          <div className="mx-auto mt-16 max-w-4xl space-y-4 text-center sm:mt-0 sm:space-y-6">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Fair pricing, unfair advantage.
            </h1>
            <p className="text-base font-medium text-gray-400 sm:text-lg md:text-xl lg:text-2xl">
              Download PearAI today and get your coding efficiency to a new
              level
            </p>
          </div>
          {/* Pricing tiers */}
          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <div key={index} className="w-full">
                <PricingTier {...tier} user={user} />
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="text-center">
            <p className="text-base text-gray-400 sm:text-lg md:text-xl">
              Want to use it on a professional level?
              <Link
                href="#"
                className="ml-2 font-semibold text-primary-700 hover:text-primary-800"
              >
                Contact us for custom plans!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPage;
