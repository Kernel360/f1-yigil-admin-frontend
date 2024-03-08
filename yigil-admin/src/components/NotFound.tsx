import React from "react";

import Layout from "./Layout.tsx";

import { RocketIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";

import Lottie from "react-lottie";
import animationData from "../lottie/404-lottie.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="w-[800px] my-10 mx-auto">
        <Alert>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            열심히 개발중인 메뉴입니다! 다른 메뉴를 확인해주세요.
          </AlertDescription>
        </Alert>
      </div>
      <Lottie options={defaultOptions} height={400} width={400} />
    </Layout>
  );
};

export default NotFound;
