
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    <div className="space-y-4 w-full">
      <div className="w-full">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
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

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <TabsContent value="general" className="w-full">
                <GeneralMetricsTab
                  generalData={generalData}
                  totalVisits={totalVisits}
                  activeUsers={activeUsers}
                  avgTime={avgTime}
                />
              </TabsContent>
              
              <TabsContent value="users" className="w-full">
                <UserMetricsTab users={users} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};
