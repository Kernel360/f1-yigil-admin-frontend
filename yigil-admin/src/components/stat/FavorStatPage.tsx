import React, { useState, useEffect } from "react";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { CalendarIcon, RocketIcon } from "@radix-ui/react-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertBox } from "../snippet/AlertBox.tsx";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils.ts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card.tsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type FavorStat = {
  date: string;
  count: number;
};

export type TopFavor = {
  writer_email: string;
  writer_name: string;
  writer_profile_image_url: string;
  favor_count: number;
};

const FavorStatPage: React.FC = () => {
  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [topFavors, setTopFavors] = useState<TopFavor[]>([]);

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    return {
      from: sevenDaysAgo,
      to: today,
    };
  });

  const [stats, setStats] = useState<FavorStat[]>([]);

  useEffect(() => {
    if (date?.from && date?.to) {
      const formattedStartDate = format(date.from, "yyyy-MM-dd");
      const formattedEndDate = format(date.to, "yyyy-MM-dd");

      const fetchFavorStats = async () => {
        try {
          const accessToken = getCookie("accessToken");
          const response = await fetch(
            `${apiBaseUrl}/api/v1/stats/daily-favors?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
            {
              method: "GET",
              headers: {
                Authorization: `${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            setAlertName("통계를 불러올 수 없습니다");
            setMessage(errorData.message);
            setIsOpen(true);
            return;
          }

          const responseData = await response.json();
          const { daily_favors } = responseData;
          const sortedFavors = daily_favors.sort(
            (a: FavorStat, b: FavorStat) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
          );
          setStats(sortedFavors);
        } catch (error) {
          setAlertName("통계를 불러올 수 없습니다");
          setMessage("통계를 불러오던 중 오류가 발생하였습니다");
          setIsOpen(true);
        }
      };

      fetchFavorStats();
    }
  }, [date]);

  const fetchTopFavors = async () => {
    if (date?.from && date?.to) {
      const formattedStartDate = format(date.from, "yyyy-MM-dd");
      const formattedEndDate = format(date.to, "yyyy-MM-dd");
      try {
        const accessToken = getCookie("accessToken");
        const response = await fetch(
          `${apiBaseUrl}/api/v1/stats/daily-favors/top?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setAlertName("좋아요 순위 정보를 불러올 수 없습니다");
          setMessage(errorData.message);
          setIsOpen(true);
          return;
        }

        const responseData = await response.json();
        const { daily_favors } = responseData;
        setTopFavors(daily_favors);
      } catch (error) {
        setAlertName("좋아요 순위 정보를 불러올 수 없습니다");
        setMessage("좋아요 순위 정보를 불러오던 중 오류가 발생하였습니다");
        console.error(error);
        setIsOpen(true);
      }
    }
  };

  useEffect(() => {
    fetchTopFavors();
  }, []);

  return (
    <Layout>
      <div className="w-[1100px] my-10 mx-auto">
        <Alert className="mb-10">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>좋아요 통게</AlertTitle>
          <AlertDescription>사용자 선호도 통계를 확인하세요.</AlertDescription>
        </Alert>
        <div className="flex justify-end mb-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-between">
          <Card className="w-7/12 h-[500px] p-10">
            <CardTitle className="mb-20">Overview</CardTitle>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats}>
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  style={
                    {
                      fill: "hsl(var(--foreground))",
                      opacity: 0.9,
                    } as React.CSSProperties
                  }
                />
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `${value}`}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="w-[440px]">
            <CardHeader className="p-10">
              <CardTitle>Top Contents</CardTitle>
              <CardDescription>
                좋아요를 많이 받은 게시물을 확인해보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {topFavors.map((favor) => (
                <div className="flex items-center">
                  <Avatar className="flex items-center">
                    <AvatarImage
                      src={favor.writer_profile_image_url}
                      alt="Avatar"
                    />
                    <AvatarFallback>{favor.writer_name}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {favor.writer_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {favor.writer_email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    +{favor.favor_count}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertBox
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        errorMessage={message}
        errorName={alertName}
      />
    </Layout>
  );
};

export default withAuthProtection(FavorStatPage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
