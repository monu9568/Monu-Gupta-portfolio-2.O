import React from "react";
import PortfolioView from "@/components/PortfolioView";
import { getPortfolioDataFresh } from "@/lib/db";

// Force dynamic SSR rendering so admin changes reflect instantly (0ms cache delay)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const data = await getPortfolioDataFresh();

  return <PortfolioView initialData={data} />;
}

