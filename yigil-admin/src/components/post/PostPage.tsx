import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertBox } from "../snippet/AlertBox";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "../ui/badge.tsx";
import {
  RocketIcon,
  HeartIcon,
  ChatBubbleIcon,
  CommitIcon,
} from "@radix-ui/react-icons";
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
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

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

export type Course = {
  course_id: number;
  title: string;
  description: string;
  created_at: string;
  owner_nickname: string;
  owner_profile_image_url: string;
  spot_count: number;
  favor_count: number;
  comment_count: number;
};

enum SocialLoginType {
  Kakao = "KAKAO",
  Google = "GOOGLE",
}

interface SpotDetail {
  spot_id: number;
  content: string;
  place_name: string;
  map_static_image_url: string;
  address: string;
  x: number;
  y: number;
  created_at: string;
  rate: number;
  favor_count: number;
  comment_count: number;
  image_urls: string[];
  writer_id: number;
  writer_name: string;
  writer_profile_image_url: string;
  writer_social_login_type: SocialLoginType;
}

interface CourseDetail {}

const SocialLoginBadge: React.FC<{ type: SocialLoginType }> = ({ type }) => {
  switch (type) {
    case SocialLoginType.Kakao:
      return <Badge className="bg-yellow-300 text-black">카카오</Badge>;
    case SocialLoginType.Google:
      return <Badge className="bg-blue-600">구글</Badge>;
  }
};

export type Comment = {
  id: number;
  member_nickname: string;
  member_id: number;
  content: string;
  created_at: string;
  children: Reply[];
};

export type Reply = {
  id: number;
  member_nickname: string;
  member_id: number;
  content: string;
  created_at: string;
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
  const [totalCoursePage, setTotalCoursePage] = useState(99);
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [courseRef, inViewCourse] = useInView();

  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [spotDetail, setSpotDetail] = useState<SpotDetail>();
  const [spotComments, setSpotComments] = useState<Comment[]>([]);
  const [spotCommentPage, setSpotCommentPage] = useState(1);
  const [totalSpotCommentPage, setTotalSpotCommentPage] = useState(99);
  const [isSpotCommentLoading, setIsSpotCommentLoading] = useState(false);
  const [spotCommentRef, inViewSpotComment] = useInView();

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail>();

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

  useEffect(() => {
    if (inView) fetchSpots();
  }, [inView]);

  const fetchCourses = async () => {
    if (isCourseLoading || coursePage > totalCoursePage) return;
    setIsCourseLoading(true);
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(
        `${apiBaseUrl}/api/v1/courses?page=${encodeURIComponent(
          coursePage
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
        setAlertName("일정 목록을 불러올 수 없습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      const { content, total_pages } = responseData.courses;
      setCourses((prevCourses) => [...prevCourses, ...content]);
      setCoursePage((prevPage) => (prevPage += 1));
      setTotalCoursePage(total_pages);
    } catch (error) {
      setAlertName("일정 목록을 불러올 수 없습니다");
      setMessage("일정 목록을 불러오던 중 오류가 발생하였습니다");
      setIsOpen(true);
    } finally {
      setIsCourseLoading(false);
    }
  };

  useEffect(() => {
    if (inViewCourse) fetchCourses();
  }, [inViewCourse]);

  const retrieveSpot = useCallback(async (id: number) => {
    setSelectedSpotId(id);
    setSpotComments([]);
    setSpotCommentPage(1);
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

  const deleteSpot = async (id: number) => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/spots/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("리뷰 삭제에 실패했습니다.");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      setAlertName("리뷰 삭제 완료");
      setMessage("리뷰가 성공적으로 삭제되었습니다.");
      setIsOpen(true);
      setSpots([]);
      setSpotPage(1);
    } catch (error) {
      setAlertName("리뷰 삭제에 실패했습니다.");
      setMessage("리뷰 삭제 처리 중 오류가 발생하였습니다.");
      setIsOpen(true);
    }
  };

  const fetchSpotComments = useCallback(
    async (id: number) => {
      if (isSpotCommentLoading || spotCommentPage > totalSpotCommentPage)
        return;
      setIsSpotCommentLoading(true);
      try {
        const accessToken = getCookie("accessToken");
        const response = await fetch(
          `${apiBaseUrl}/api/v1/comments/${id}?page=${encodeURIComponent(
            spotCommentPage
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
          setAlertName("댓글 조회에 실패했습니다");
          setMessage(errorData.message);
          setIsOpen(true);
          return;
        }
        const responseData = await response.json();
        const { content, total_pages } = responseData.comments;
        setSpotComments((prevComments) => [...prevComments, ...content]);
        setSpotCommentPage((prevPage) => (prevPage += 1));
        setTotalSpotCommentPage(total_pages);
        if (total_pages < 1) setTotalSpotCommentPage(99);
      } catch (error) {
        setAlertName("댓글 목록을 불러올 수 없습니다");
        setMessage("댓글 목록을 불러오던 중 오류가 발생하였습니다");
        setIsOpen(true);
      } finally {
        setIsSpotCommentLoading(false);
      }
    },
    [spotCommentPage, totalSpotCommentPage, isSpotCommentLoading]
  );

  useEffect(() => {
    if (inViewSpotComment && selectedSpotId != null) {
      fetchSpotComments(selectedSpotId);
    }
  }, [inViewSpotComment, selectedSpotId, fetchSpotComments]);

  const deleteComment = async (id: number) => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("댓글 삭제에 실패했습니다.");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      setAlertName("댓글 삭제 완료");
      setMessage("댓글이 성공적으로 삭제되었습니다.");
      setIsOpen(true);
      setSpotComments([]);
    } catch (error) {
      setAlertName("댓글 삭제에 실패했습니다.");
      setMessage("댓글 삭제 처리 중 오류가 발생하였습니다.");
      setIsOpen(true);
    }
  };

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
                          ? "scale-[0.80]"
                          : "hover:scale-[0.90]"
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="float-right">X</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>리뷰 삭제</DialogTitle>
                          <DialogDescription>
                            해당 리뷰는 사용자가 작성한 리뷰이며, 사용자에게
                            부정적인 영향을 줄 수 있습니다
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="secondary">취소</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              onClick={() => deleteSpot(spotDetail.spot_id)}
                            >
                              삭제
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Carousel
                      className="w-full max-w-xs mx-auto mb-5
                    "
                    >
                      <CarouselContent>
                        {spotDetail.image_urls.map((url, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                  <img
                                    src={url}
                                    className="object-cover rounded-md"
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                    <div className="px-10 py-3">
                      <h1 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-2xl">
                        {spotDetail.place_name}
                      </h1>
                      <p className="text-sm text-gray-500">
                        리뷰 고유 아이디: #{spotDetail.spot_id}
                      </p>
                      <Card className="text-sm mt-2 p-2 rounded-xl">
                        {spotDetail.content}
                      </Card>
                    </div>
                    <div className="px-10 py-3 flex justify-between">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="link" className="p-0">
                            @{spotDetail.writer_name}
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-50">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarImage
                                src={spotDetail.writer_profile_image_url}
                              />
                              <AvatarFallback>
                                {spotDetail.writer_name}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">
                                @{spotDetail.writer_name}#{spotDetail.writer_id}
                              </h4>
                              <div className="flex items-center pt-2">
                                <ChatBubbleIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                                <SocialLoginBadge
                                  type={spotDetail.writer_social_login_type}
                                />
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <span className="text-sm text-gray-500">
                        {timeSince(spotDetail.created_at)}
                      </span>
                    </div>
                    <div className="px-10 py-3">
                      <h3 className="text-xl font-bold">위치</h3>
                      <img
                        className="my-3 w-full md-"
                        src={spotDetail.map_static_image_url}
                      />
                      <p className="text-sm text-gray-500">
                        🗺️ {spotDetail.address}
                      </p>
                      <p className="text-sm text-gray-500">
                        🧭 ({spotDetail.x}, {spotDetail.y})
                      </p>
                    </div>
                    <div className="px-10 py-3">
                      <p className="font-semibold">
                        별점 ⭐️ {spotDetail.rate}
                      </p>
                      <p className="font-semibold">
                        좋아요 수 ❤️ {spotDetail.favor_count}
                      </p>
                      <p className="font-semibold">
                        댓글 수 💬 {spotDetail.comment_count}
                      </p>
                    </div>
                    <div className="px-10 py-3">
                      <h3 className="text-xl font-bold">댓글</h3>
                      {spotComments.map((comment, index) => (
                        <Card key={index} className="mt-2 p-5 rounded-md">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="link"
                                className="text-xs text-gray-500 float-right px-0 pl-4 py-0 pb-4"
                              >
                                X
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>댓글 삭제</DialogTitle>
                                <DialogDescription>
                                  해당 리뷰는 사용자가 작성한 댓글이며,
                                  사용자에게 부정적인 영향을 줄 수 있습니다
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="secondary">취소</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button
                                    onClick={() => deleteComment(comment.id)}
                                  >
                                    삭제
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <div className="flex justify-between">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button variant="link" className="p-0 h-auto">
                                  @{comment.member_nickname}
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-50">
                                <div className="flex justify-between space-x-4">
                                  <Avatar></Avatar>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                            <p className="text-sm text-gray-500">
                              {timeSince(comment.created_at)}
                            </p>
                          </div>
                          <Separator className="my-3" />
                          <p className="text-sm text-gray-500">
                            {comment.content}
                          </p>
                          {comment.children.map((reply, r_index) => (
                            <Card
                              key={r_index}
                              className="mt-2 pt-4 pb-2 px-5 rounded-md"
                            >
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="link"
                                    className="text-xs text-gray-500 float-right px-0 pl-4 py-0 pb-4"
                                  >
                                    X
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>댓글 삭제</DialogTitle>
                                    <DialogDescription>
                                      해당 리뷰는 사용자가 작성한 댓글이며,
                                      사용자에게 부정적인 영향을 줄 수 있습니다
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="secondary">취소</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button
                                        onClick={() => deleteComment(reply.id)}
                                      >
                                        삭제
                                      </Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <div className="flex justify-between">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button
                                      variant="link"
                                      className="p-0 h-auto"
                                    >
                                      ↪ @{reply.member_nickname}
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-50">
                                    <div className="flex justify-between space-x-4">
                                      <Avatar></Avatar>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                                <p className="text-sm text-gray-500">
                                  {timeSince(reply.created_at)}
                                </p>
                              </div>
                              <Separator className="my-3" />
                              <p className="text-sm text-gray-500">
                                {reply.content}
                              </p>
                            </Card>
                          ))}
                        </Card>
                      ))}
                      <div ref={spotCommentRef} />
                    </div>
                  </ScrollArea>
                ) : (
                  <span></span>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabsContent>
          <TabsContent value="course">
            <ResizablePanelGroup
              direction="horizontal"
              className="rounded-lg border"
            >
              <ResizablePanel className="p-3 max-h-[540px]" defaultSize={50}>
                <ScrollArea className="h-[540px] pr-5 pb-5">
                  {courses.map((course, index) => (
                    <Card
                      key={index}
                      className={`mb-3 duration-150 ${
                        selectedCourseId === course.course_id
                          ? "scale-[0.80]"
                          : "hover:scale-[0.90]"
                      }`}
                      //onClick={() => retrieveCourse(course.course_id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle>{course.title}</CardTitle>
                          <CardDescription>
                            {timeSince(course.created_at)}
                          </CardDescription>
                        </div>
                        <CardDescription>
                          @{course.owner_nickname}
                        </CardDescription>
                        <div className="flex justify-between">
                          <p className="text-xs text-gray-500">
                            {course.description}
                          </p>
                          <div className="flex">
                            <CommitIcon className="text-gray-500 h-3 relative top-0.5" />
                            <span className="text-xs text-gray-500">
                              {course.spot_count}
                            </span>
                            <HeartIcon className="text-gray-500 h-3 relative top-0.5 ml-2" />
                            <span className="text-xs text-gray-500">
                              {course.favor_count}
                            </span>
                            <ChatBubbleIcon className="text-gray-500 h-3 relative top-0.5 ml-2" />
                            <span className="text-xs text-gray-500">
                              {course.comment_count}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  <div ref={courseRef} />
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}></ResizablePanel>
            </ResizablePanelGroup>
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
