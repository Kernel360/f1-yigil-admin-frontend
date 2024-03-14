import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertBox } from "../snippet/AlertBox";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "@/components/ui/button.tsx";
import { RocketIcon, HeartIcon, ChatBubbleIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselContent,
} from "@/components/ui/carousel.tsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type Spot = {
  spot_id: number;
  place_name: string;
  description: string;
  created_at: string;
  owner_nickname: string;
  owner_profile_image_url: string;
  favor_count: number;
  comment_count: number;
};

interface SpotDetail {
  spot_id: number;
  content: string;
  place_name: string;
  map_static_image_url: string;
  created_at: string;
  rate: number;
  favor_count: number;
  comment_count: number;
  image_urls: string[];
  writer_id: number;
  writer_name: string;
}

export type Course = {
  string: string;
};

function timeSince(dateString: string): string {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const date = new Date(new Date(dateString).getTime() + KST_OFFSET);
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "년 전";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "달 전";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "일 전";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "시간 전";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "분 전";
  }
  return "방금 전";
}

const PostPage: React.FC = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [spotPage, setSpotPage] = useState(1);
  const [totalSpotPage, setTotalSpotPage] = useState(99);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursePage, setCoursePage] = useState(1);
  const [totalCoursePage, setTotalCoursePage] = useState(0);

  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [spotDetail, setSpotDetail] = useState<SpotDetail>();

  const fetchSpots = async () => {
    if (isLoading || spotPage > totalSpotPage) return;
    setIsLoading(true);
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(
        `${apiBaseUrl}/api/v1/spots?page=${encodeURIComponent(
          spotPage
        )}&size=5`,
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
        setAlertName("리뷰 목록을 불러올 수 없습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      const { content, total_pages } = responseData.spots;
      setSpots((prevSpots) => [...prevSpots, ...content]);
      setSpotPage((prevPage) => (prevPage += 1));
      setTotalSpotPage(total_pages);
    } catch (error) {
      setAlertName("리뷰 목록을 불러올 수 없습니다");
      setMessage("리뷰 목록을 불러오던 중 오류가 발생하였습니다");
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const retrieveSpot = useCallback(async (id: number) => {
    setSelectedSpotId(id);
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/spots/${id}`, {
        method: "GET",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("리뷰 조회에 실패했습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }
      const responseData = await response.json();
      setSpotDetail(responseData);
    } catch (error) {
      setAlertName("리뷰 조회에 실패했습니다");
      setMessage("해당 리뷰를 조회하던 중 오류가 발생하였습니다");
      setIsOpen(true);
    }
  }, []);
  useEffect(() => {
    if (inView) fetchSpots();
  }, [inView]);

  return (
    <Layout>
      <div className="w-[1100px] my-10 mx-auto">
        <Alert className="mb-10">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>게시글 관리</AlertTitle>
          <AlertDescription>
            서비스에 등록된 게시글을 확인하고 관리하세요.
          </AlertDescription>
        </Alert>
        <Tabs defaultValue="spot" className="">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="spot">리뷰</TabsTrigger>
            <TabsTrigger value="course">일정</TabsTrigger>
          </TabsList>
          <TabsContent value="spot">
            <ResizablePanelGroup
              direction="horizontal"
              className="rounded-lg border"
            >
              <ResizablePanel className="p-3 max-h-[540px]" defaultSize={50}>
                <ScrollArea className="h-[540px] pr-5 pb-5">
                  {spots.map((spot, index) => (
                    <Card
                      key={index}
                      className={`mb-3 duration-150 ${
                        selectedSpotId === spot.spot_id
                          ? "bg-blue-100"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={() => retrieveSpot(spot.spot_id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle>{spot.place_name}</CardTitle>
                          <CardDescription>
                            {timeSince(spot.created_at)}
                          </CardDescription>
                        </div>

                        <CardDescription>
                          @{spot.owner_nickname}
                        </CardDescription>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">
                            {spot.description}
                          </p>
                          <div className="flex">
                            <HeartIcon className="text-gray-500 h-3 relative top-0.5" />
                            <span className="text-xs text-gray-500">
                              {spot.favor_count}
                            </span>
                            <ChatBubbleIcon className="text-gray-500 h-3 relative top-0.5 ml-2" />
                            <span className="text-xs text-gray-500">
                              {spot.comment_count}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  <div ref={ref} />
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                {spotDetail ? (
                  <ScrollArea className="h-[540px] p-5">
                    <Carousel
                      className="w-full max-w-xs m-auto
                    "
                    >
                      <CarouselContent>
                        {spotDetail.image_urls.map((url, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                  <img src={url} className="object-cover" />
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </ScrollArea>
                ) : (
                  <span></span>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
          <TabsContent value="course">
            <h1>야호</h1>
          </TabsContent>
        </Tabs>
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

export default withAuthProtection(PostPage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
