
import React from "react";

interface TimeRangeDisplayProps {
  timeRange: string;
}

export const TimeRangeDisplay = ({ timeRange }: TimeRangeDisplayProps) => {
  return (
    <div className="text-center w-[242px]">
      <p className="text-[#8E9196] text-lg font-medium mb-2">Rango horario</p>
      <p style={{ backgroundColor: "#156082" }} className="text-white px-4 h-[95px] rounded w-full flex items-center justify-center text-xl font-medium">
        {timeRange}
      </p>
    </div>
  );
};
