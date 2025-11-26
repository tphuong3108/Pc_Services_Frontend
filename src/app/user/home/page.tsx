"use client";

import { useRouter } from "next/navigation";
import CategoryNav from "@/components/common/CategoryNav";
import DiscountProducts from "./components/DiscountProducts";
import FeaturedProducts from "./components/FeaturedProducts";
import FeaturedServices from "./components/FeaturedServices";
import HeroSection from "./components/HeroSection";
import HomeBanner from "./components/HomeBanner";
import HomeBenefits from "./components/HomeBenefits";
import TopBrand from "./components/TopBrand";

export default function UserHomePage() {

  return (
    <div>
     <CategoryNav selectedCategory={""} />
      <HomeBanner />
      <FeaturedServices />
      
      <HomeBenefits />
      <FeaturedProducts />
      <HeroSection />
      <DiscountProducts />
      <TopBrand />
    </div>
  );
}
