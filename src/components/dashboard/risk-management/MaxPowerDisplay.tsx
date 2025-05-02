
import React from "react";

interface MaxPowerDisplayProps {
  maxPower: number;
}

export const MaxPowerDisplay = ({ maxPower }: MaxPowerDisplayProps) => {
  return (
    <div className="text-center w-[242px]">
      <p className="text-[#8E9196] text-lg font-medium mb-2">Potencia Máxima</p>
      <p className="px-4 h-[66px] rounded w-full flex items-center justify-center text-white text-2xl font-medium" style={{ backgroundColor: "#156082" }}>
        {maxPower}
      </p>
    </div>
  );
};
