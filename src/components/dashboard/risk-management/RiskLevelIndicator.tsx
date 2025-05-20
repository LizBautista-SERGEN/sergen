
import React from "react";

interface RiskLevelIndicatorProps {
  riskLevel: string;
}

export const RiskLevelIndicator = ({ riskLevel }: RiskLevelIndicatorProps) => {
  const getRiskLevelColor = (level: string): string => {
    switch(level) {
      case "ALTO":
        return "#C00000"; // Keep red with better contrast
      case "MEDIO":
        return "#0EA5E9"; // Changed to blue
      case "BAJO":
        return "#196B24"; // Keep green with better contrast
      default:
        return "#0EA5E9"; // Default to blue
    }
  };

  return (
    <div className="text-center w-[266px]">
      <p className="text-[#8E9196] text-lg font-medium mb-2">Riesgo de coincidente</p>
      <p style={{ backgroundColor: getRiskLevelColor(riskLevel) }} className="text-white px-4 h-[66px] rounded w-full flex items-center justify-center text-2xl font-medium">
        {riskLevel}
      </p>
    </div>
  );
};
