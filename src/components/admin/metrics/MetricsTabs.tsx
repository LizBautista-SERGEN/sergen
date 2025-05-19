
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserMetricsTab } from "./UserMetricsTab";
import { GeneralMetricsTab } from "./GeneralMetricsTab";
import { LoadingSpinner } from "./LoadingSpinner";
import { useMetricsData } from "./useMetricsData";
import { MetricsTimeFilter } from "./MetricsTimeFilter";

export const MetricsTabs = () => {
  const { 
    isLoading,
    activeTab, 
    setActiveTab, 
    timeFilter, 
    setTimeFilter,
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
    generalData,
    users,
    totalVisits,
    activeUsers,
    avgTime
  } = useMetricsData();

  return (
    <div className="space-y-4">
      <div>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <GeneralMetricsTab
            generalData={generalData}
            totalVisits={totalVisits}
            activeUsers={activeUsers}
            avgTime={avgTime}
          />
          
          <UserMetricsTab users={users} />
        </>
      )}
    </div>
  );
};
