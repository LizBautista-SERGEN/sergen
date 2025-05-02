
import React from "react";

interface TimeRangeDisplayProps {
  timeRange: string;
}

export const TimeRangeDisplay = ({ timeRange }: TimeRangeDisplayProps) => {
  return (
    <div className="text-center w-[220px]">
      <p className="text-[#8E9196] text-base font-medium mb-1">Rango horario</p>
      <p style={{ backgroundColor: "#156082" }} className="text-white px-4 h-[63px] rounded w-full flex items-center justify-center text-lg font-medium">
        {timeRange}
      </p>
    </div>
  );
};
