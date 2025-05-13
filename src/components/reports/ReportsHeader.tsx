
import { FC } from "react";

interface ReportsHeaderProps {
  title: string;
}

export const ReportsHeader: FC<ReportsHeaderProps> = ({ title }) => {
  return (
    <h1 className="text-2xl font-bold mb-6">{title}</h1>
  );
};
