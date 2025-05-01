
import React from "react";

interface MaxPowerDisplayProps {
  maxPower: number;
}

export const MaxPowerDisplay = ({ maxPower }: MaxPowerDisplayProps) => {
  return (
    <div className="text-center w-[200px]">
      <p className="text-[#8E9196] text-sm">Potencia Máxima</p>
      <p className="px-4 h-[42px] rounded w-full flex items-center justify-center text-white" style={{ backgroundColor: "#156082" }}>
        {maxPower}
      </p>
    </div>
  );
};
