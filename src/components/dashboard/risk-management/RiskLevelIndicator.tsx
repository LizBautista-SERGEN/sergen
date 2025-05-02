
import React from "react";

interface RiskLevelIndicatorProps {
  riskLevel: string;
}

export const RiskLevelIndicator = ({ riskLevel }: RiskLevelIndicatorProps) => {
  const getRiskLevelColor = (level: string): string => {
    switch(level) {
      case "ALTO":
        return "#C00000"; // Updated to red with better contrast
      case "MEDIO":
        return "#F97316"; // Keep orange/amber for medium
      case "BAJO":
        return "#196B24"; // Updated to green with better contrast
      default:
        return "#156082"; // Default blue
    }
  };

  return (
    <div className="text-center w-[242px]">
      <p className="text-[#8E9196] text-lg font-medium mb-2">Riesgo de coincidente</p>
      <p style={{ backgroundColor: getRiskLevelColor(riskLevel) }} className="text-white px-4 h-[95px] rounded w-full flex items-center justify-center text-xl font-medium">
        {riskLevel}
      </p>
    </div>
  );
};
