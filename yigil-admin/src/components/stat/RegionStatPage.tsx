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

export type RegionStat = {
  region: string;
  reference_count: number;
};

export type RecentPost = {
  owner_profile_image_url: string;
  owner_nickname: string;
  owner_email: string;
  travel_name: string;
  travel_url: string;
};

const RegionStatPage: React.FC = () => {
  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [recentPostCount, setRecentPostCount] = useState(0);
  const [recentPost, setRecentPost] = useState<RecentPost[]>([]);

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    return {
      from: sevenDaysAgo,
      to: today,
    };
  });

  const [stats, setStats] = useState<RegionStat[]>([]);

  useEffect(() => {
    if (date?.from && date?.to) {
      const formattedStartDate = format(date.from, "yyyy-MM-dd");
      const formattedEndDate = format(date.to, "yyyy-MM-dd");

      const fetchRegionStats = async () => {
        try {
          const accessToken = getCookie("accessToken");
          const response = await fetch(
            `${apiBaseUrl}/api/v1/stats/region?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
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
          const { region_stats_info_list } = responseData;
          setStats(region_stats_info_list);
        } catch (error) {
          setAlertName("통계를 불러올 수 없습니다");
          setMessage("통계를 불러오던 중 오류가 발생하였습니다");
          setIsOpen(true);
        }
      };

      fetchRegionStats();
    }
  }, [date]);

  const fetchRecentPosts = async () => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/stats/region/recent`, {
        method: "GET",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("최근 콘텐츠 정보를 불러올 수 없습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      const { travels, travel_cnt } = responseData;
      console.log(responseData);
      setRecentPost(travels);
      setRecentPostCount(travel_cnt);
    } catch (error) {
      setAlertName("최큰 콘텐츠 정보를 불러올 수 없습니다");
      setMessage("최근 콘텐츠 정보를 불러오던 중 오류가 발생하였습니다");
      setIsOpen(true);
    }
  };

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  return (
    <Layout>
      <div className="w-[1100px] my-10 mx-auto">
        <Alert className="mb-10">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>지역/장소 통계</AlertTitle>
          <AlertDescription>
            서비스에 등록된 게시글 통계를 확인하세요.
          </AlertDescription>
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
                  dataKey="reference_count"
                  radius={[4, 4, 0, 0]}
                  style={
                    {
                      fill: "hsl(var(--foreground))",
                      opacity: 0.9,
                    } as React.CSSProperties
                  }
                />
                <XAxis
                  dataKey="region"
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
              <CardTitle>Recent Contents</CardTitle>
              <CardDescription>
                오늘 총 {recentPostCount}개의 콘텐츠가 등록되었습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {recentPost.map((post) => (
                <div className="flex items-center">
                  <Avatar className="flex items-center">
                    <AvatarImage
                      src={post.owner_profile_image_url}
                      alt="Avatar"
                    />
                    <AvatarFallback>{post.owner_nickname}</AvatarFallback>
                  </Avatar>

                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {post.owner_nickname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {post.owner_email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <a href={"https://yigil.co.kr" + post.travel_url}>
                      {post.travel_name}
                    </a>
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

export default withAuthProtection(RegionStatPage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
