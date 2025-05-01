
import React from "react";

interface RiskLevelIndicatorProps {
  riskLevel: string;
}

export const RiskLevelIndicator = ({ riskLevel }: RiskLevelIndicatorProps) => {
  const getRiskLevelColor = (level: string): string => {
    switch(level) {
      case "ALTO":
        return "#ea384c"; // Red
      case "MEDIO":
        return "#F97316"; // Amber
      case "BAJO":
        return "#84cc16"; // Green
      default:
        return "#156082"; // Default blue
    }
  };

  return (
    <div className="text-center w-[200px]">
      <p className="text-[#8E9196] text-sm">Riesgo de coincidente</p>
      <p style={{ backgroundColor: getRiskLevelColor(riskLevel) }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">
        {riskLevel}
      </p>
    </div>
  );
};
