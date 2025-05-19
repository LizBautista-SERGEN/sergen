
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, UserIcon } from "lucide-react";
import { MetricsTimeFilter } from "./MetricsTimeFilter";
import { GeneralMetricsTab } from "./GeneralMetricsTab";
import { UserMetricsTab } from "./UserMetricsTab";
import { LoadingSpinner } from "./LoadingSpinner";
import { useMetricsData } from "./useMetricsData";

export const MetricsTabs = () => {
  const {
    period,
    setPeriod,
    year,
    setYear,
    month,
    setMonth,
    week,
    setWeek,
    years,
    months,
    weeks,
    userVisits,
    generalData,
    loading,
    totalVisits,
    activeUsers,
    avgTime
  } = useMetricsData();

  return (
    <Card className="p-6 space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BarChart2 size={18} />
            Análisis General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserIcon size={18} />
            Análisis por Usuario
          </TabsTrigger>
        </TabsList>

        <MetricsTimeFilter
          period={period}
          setPeriod={setPeriod}
          year={year}
          setYear={setYear}
          month={month}
          setMonth={setMonth}
          week={week}
          setWeek={setWeek}
          years={years}
          months={months}
          weeks={weeks}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <GeneralMetricsTab 
              generalData={generalData}
              totalVisits={totalVisits}
              activeUsers={activeUsers}
              avgTime={avgTime}
            />
            <UserMetricsTab users={userVisits} />
          </>
        )}
      </Tabs>
    </Card>
  );
};
