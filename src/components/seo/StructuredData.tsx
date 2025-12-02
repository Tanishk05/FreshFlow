import React from "react";
import Script from "next/script";

interface StructuredDataProps {
  type:
    | "Organization"
    | "WebApplication"
    | "Product"
    | "BreadcrumbList"
    | "FAQPage";
  data: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: "FreshFlow",
        url: process.env.NEXT_PUBLIC_APP_URL || "https://freshflow.com",
        logo: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://freshflow.com"
        }/logo.png`,
        description: "AI-powered fresh food supply chain management platform",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Service",
          email: "support@freshflow.com",
        },
        sameAs: [
          "https://twitter.com/freshflow",
          "https://linkedin.com/company/freshflow",
          "https://facebook.com/freshflow",
        ],
      }}
    />
  );
}

export function WebApplicationStructuredData() {
  return (
    <StructuredData
      type="WebApplication"
      data={{
        name: "FreshFlow",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "150",
        },
        description: "AI-powered fresh food supply chain management platform",
        featureList: [
          "Real-time inventory tracking",
          "AI-powered demand forecasting",
          "Automated logistics management",
          "Quality control monitoring",
          "Price optimization",
          "Waste reduction analytics",
        ],
      }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  return (
    <StructuredData
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQStructuredData({ items }: { items: FAQItem[] }) {
  return (
    <StructuredData
      type="FAQPage"
      data={{
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}
