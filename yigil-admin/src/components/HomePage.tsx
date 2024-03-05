import React, { useState, useEffect } from "react";
import Layout from "./Layout.tsx";
import Lottie from "react-lottie";
import animationData from "../lottie/home-lottie.json";
import withAuthProtection from "./snippet/withAuthProtection.tsx";

import { motion } from "framer-motion";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const greetings = [
  "환영합니다!", // 한국어
  "Welcome!", // 영어
  "Bienvenido!", // 스페인어
  "Willkommen!", // 독일어
  "Bienvenue!", // 프랑스어
  "Benvenuto!", // 이탈리아어
  "欢迎！", // 중국어
  "ようこそ！", // 일본어
  "Добро пожаловать!", // 러시아어
  "Bem-vindo!", // 포르투갈어
];

const HomePage: React.FC = () => {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    setGreeting(greetings[randomIndex]);
  }, []);

  return (
    <Layout>
      <div className="text-center mt-10">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-6xl"
        >
          {greeting}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-xl mt-10"
        >
          이곳은 이길어때 어드민 페이지입니다
        </motion.p>
      </div>
      <Lottie options={defaultOptions} height={400} width={400} />
    </Layout>
  );
};

export default withAuthProtection(HomePage);
