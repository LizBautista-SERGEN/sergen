
import React from "react";

interface ModulatedDaysCounterProps {
  modulatedDays: number;
}

export const ModulatedDaysCounter = ({ modulatedDays }: ModulatedDaysCounterProps) => {
  return (
    <div className="text-center w-[200px]">
      <p className="text-sm text-gray-500">Días modulados</p>
      <p style={{ backgroundColor: '#156082' }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center border">
        {modulatedDays} días
      </p>
    </div>
  );
};
