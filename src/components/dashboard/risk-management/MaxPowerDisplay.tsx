
import React from "react";

interface MaxPowerDisplayProps {
  maxPower: number;
}

export const MaxPowerDisplay = ({ maxPower }: MaxPowerDisplayProps) => {
  return (
    <div className="text-center w-[220px]">
      <p className="text-[#8E9196] text-base font-medium mb-1">Potencia Máxima</p>
      <p className="px-4 h-[63px] rounded w-full flex items-center justify-center text-white text-lg font-medium" style={{ backgroundColor: "#156082" }}>
        {maxPower}
      </p>
    </div>
  );
};
