"use client";

import React from "react";
import {
  HeaderCommonProps,
  Header1Executive,
  Header2SwissMinimal,
  Header3FloatingIsland,
  Header4EnterpriseTwoTier,
  Header5AppleSegmented,
  Header6AsymmetricCockpit,
  Header7NeoBrutalist,
  Header8UltraCompact,
  Header9GlassCrimsonGlow,
  Header10FinancialStatus,
} from "./headers/HeaderVariants";

interface NavbarProps extends HeaderCommonProps {
  headerVariant?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  headerVariant = 1,
  ...props
}) => {
  switch (headerVariant) {
    case 1:
      return <Header1Executive {...props} />;
    case 2:
      return <Header2SwissMinimal {...props} />;
    case 3:
      return <Header3FloatingIsland {...props} />;
    case 4:
      return <Header4EnterpriseTwoTier {...props} />;
    case 5:
      return <Header5AppleSegmented {...props} />;
    case 6:
      return <Header6AsymmetricCockpit {...props} />;
    case 7:
      return <Header7NeoBrutalist {...props} />;
    case 8:
      return <Header8UltraCompact {...props} />;
    case 9:
      return <Header9GlassCrimsonGlow {...props} />;
    case 10:
      return <Header10FinancialStatus {...props} />;
    default:
      return <Header1Executive {...props} />;
  }
};
