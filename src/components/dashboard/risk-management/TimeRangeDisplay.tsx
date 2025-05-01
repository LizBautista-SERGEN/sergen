
import React from "react";

interface TimeRangeDisplayProps {
  timeRange: string;
}

export const TimeRangeDisplay = ({ timeRange }: TimeRangeDisplayProps) => {
  return (
    <div className="text-center w-[200px]">
      <p className="text-[#8E9196] text-sm">Rango horario</p>
      <p style={{ backgroundColor: "#156082" }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">
        {timeRange}
      </p>
    </div>
  );
};
