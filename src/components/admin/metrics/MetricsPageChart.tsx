
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface PageMetrics {
  page: string;
  visits: number;
}

interface MetricsPageChartProps {
  data: PageMetrics[];
}

export const MetricsPageChart = ({ data }: MetricsPageChartProps) => {
  return (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="page" tick={{ fontSize: 14 }} height={60} />
          <YAxis tick={{ fontSize: 14 }} width={60} />
          <Tooltip contentStyle={{ fontSize: 14 }} />
          <Legend wrapperStyle={{ fontSize: 14, paddingTop: 20 }} />
          <Bar dataKey="visits" fill="#8884d8" name="Visitas" barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
