import React, { useState, useEffect } from "react";
import Layout from "../Layout";
import withAuthProtection from "../snippet/withAuthProtection";

import Autoplay from "embla-carousel-autoplay";
import { RocketIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const StatusPage: React.FC = () => {
  const [isClientAlive, setIsClientAlive] = useState(true);
  const [isAdminAlive, setIsAdminAlive] = useState(true);
  const [isBatchAlive, setIsBatchAlive] = useState(true);
  const [isMonitorAlive, setIsMonitorAlive] = useState(true);

  useEffect(() => {
    const checkClientStatus = () => {
      fetch("https://yigil.co.kr", { mode: "no-cors" })
        .then(() => {
          setIsClientAlive(true);
        })
        .catch((error) => {
          setIsClientAlive(false);
          console.error(error);
        });
    };

    checkClientStatus();

    const intervalId = setInterval(checkClientStatus, 15000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkAdminStatus = () => {
      fetch("https://admin.yigil.co.kr", { mode: "no-cors" })
        .then(() => {
          setIsAdminAlive(true);
        })
        .catch((error) => {
          setIsAdminAlive(false);
          console.error(error);
        });
    };

    checkAdminStatus();

    const intervalId = setInterval(checkAdminStatus, 15000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkBatchStatus = () => {
      fetch("http://43.203.96.9:8086/login", { mode: "no-cors" })
        .then(() => {
          setIsBatchAlive(true);
        })
        .catch((error) => {
          setIsBatchAlive(false);
          console.error(error);
        });
    };

    checkBatchStatus();

    const intervalId = setInterval(checkBatchStatus, 15000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkMonitorStatus = () => {
      fetch("http://43.201.131.164:5601/app/home", { mode: "no-cors" })
        .then(() => {
          setIsMonitorAlive(true);
        })
        .catch((error) => {
          setIsMonitorAlive(false);
          console.error(error);
        });
    };

    checkMonitorStatus();

    const intervalId = setInterval(checkMonitorStatus, 15000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Layout>
      <div className="w-[800px] my-10 mx-auto">
        <Alert className="mb-20">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>서비스 상태 관리</AlertTitle>
          <AlertDescription>서비스의 운영 상태를 확인해보세요</AlertDescription>
        </Alert>
        <Carousel
          opts={{ align: "start" }}
          className="w-full"
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent>
            <CarouselItem key="service" className="md:basis-1/3  lg:basis-1/3">
              <div className="p-1">
                <Card className="w-[250px]">
                  <CardHeader className="pb-0">
                    <img
                      className="rounded-md"
                      src="/images/serviceintro.png"
                    />
                    <CardTitle>이길로그</CardTitle>

                    {isClientAlive ? (
                      <CardDescription className="flex">
                        {"정상"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      </CardDescription>
                    ) : (
                      <CardDescription className="flex">
                        {"상태 확인 불가"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-red-500" />
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex justify-end">
                    <Button asChild>
                      <a href="https://yigil.co.kr">바로가기</a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
            <CarouselItem key="admin" className="md:basis-1/3 lg:basis-1/3">
              <div className="p-1">
                <Card className="w-[250px]">
                  <CardHeader className="pb-0">
                    <img className="rounded-md" src="/images/adminintro.png" />
                    <CardTitle>이길로그:관리자</CardTitle>

                    {isAdminAlive ? (
                      <CardDescription className="flex">
                        {"정상"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      </CardDescription>
                    ) : (
                      <CardDescription className="flex">
                        {"상태 확인 불가"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-red-500" />
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex justify-end">
                    <Button asChild>
                      <a href="https://admin.yigil.co.kr">바로가기</a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
            <CarouselItem key="batch" className="md:basis-1/3 lg:basis-1/3">
              <div className="p-1">
                <Card className="w-[250px]">
                  <CardHeader className="pb-0">
                    <img className="rounded-md" src="/images/batchintro.png" />
                    <CardTitle>이길로그:배치</CardTitle>

                    {isBatchAlive ? (
                      <CardDescription className="flex">
                        {"정상"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      </CardDescription>
                    ) : (
                      <CardDescription className="flex">
                        {"상태 확인 불가"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-red-500" />
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex justify-end">
                    <Button asChild>
                      <a href="http://43.203.96.9:8086/login?from=%2F">
                        바로가기
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
            <CarouselItem key="monitor" className="md:basis-1/3 lg:basis-1/3">
              <div className="p-1">
                <Card className="w-[250px]">
                  <CardHeader className="pb-0">
                    <img
                      className="rounded-md"
                      src="/images/monitorintro.png"
                    />
                    <CardTitle>이길로그:모니터링</CardTitle>

                    {isMonitorAlive ? (
                      <CardDescription className="flex">
                        {"정상"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      </CardDescription>
                    ) : (
                      <CardDescription className="flex">
                        {"상태 확인 불가"}
                        <span className="flex ml-1 h-2 w-2 translate-y-1 rounded-full bg-red-500" />
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="flex justify-end">
                    <Button asChild>
                      <a href="http://43.201.131.164:5601/app/home">바로가기</a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </Layout>
  );
};

export default withAuthProtection(StatusPage);
