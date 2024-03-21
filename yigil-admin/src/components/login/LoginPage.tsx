import React, { useState } from "react";
import Layout from "../Layout.tsx";
import { useNavigate } from "react-router-dom";
import { ReloadIcon } from "@radix-ui/react-icons";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";
import { AlertBox } from "../snippet/AlertBox.tsx";
import { SignUpDrawer } from "./SignUpDrawer.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [new_email, setNewEmail] = useState("");
  const [new_name, setNewName] = useState("");

  const [errorName, setErrorName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);

  const [isLoadAnimation, setIsLoadAmination] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleNewEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(event.target.value);
  };

  const handleNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(event.target.value);
  };

  const handleLogin = async () => {
    setIsLoadAmination(true);
    if (!email.trim()) {
      setErrorName("로그인 실패");
      setErrorMessage("이메일을 입력해주세요");
      setIsOpen(true);
      setIsLoadAmination(false);
      return; // 함수 종료
    }

    if (!password.trim()) {
      setErrorName("로그인 실패");
      setErrorMessage("비밀번호를 입력해주세요");
      setIsOpen(true);
      setIsLoadAmination(false);
      return; // 함수 종료
    }
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/admins/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorName("로그인 실패");
        setErrorMessage(
          errorData.message || "로그인 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
        setPassword("");
        setIsLoadAmination(false);
        return;
      }

      const { access_token, refresh_token } = await response.json();
      document.cookie = `accessToken=Bearer ${access_token}; path=/;`;
      document.cookie = `refreshToken=${refresh_token}; path=/;`;

      navigate("/");
    } catch (error) {
      setErrorName("로그인 오류");
      setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
      setIsOpen(true);
      setPassword("");
    } finally {
      setIsLoadAmination(false);
    }
  };

  const handleSignUp = async () => {
    if (!new_email.trim()) {
      setErrorName("회원가입 요청 실패");
      setErrorMessage("이메일을 입력해주세요");
      setIsOpen(true);
      return; // 함수 종료
    }

    if (!new_name.trim()) {
      setErrorName("회원가입 요청 실패");
      setErrorMessage("사용자 이름을 입력해주세요");
      setIsOpen(true);
      return; // 함수 종료
    }
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/admins/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: new_email, nickname: new_name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorName("회원가입 요청 실패");
        setErrorMessage(
          errorData.message || "회원가입 요청 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
        setNewEmail("");
        setNewName("");
        return;
      }

      setIsSignUpSuccess(true);
    } catch (error) {
      setErrorName("회원가입 요청 실패");
      setErrorMessage("회원가입 요청 중 오류가 발생하였습니다.");
      setIsOpen(true);
      setNewEmail("");
      setNewName("");
    }
  };

  return (
    <Layout>
      <Tabs defaultValue="login" className="w-[400px] my-10 mx-auto">
        <TabsList>
          <TabsTrigger value="login">로그인</TabsTrigger>
          <TabsTrigger value="join">회원가입</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>로그인</CardTitle>
              <CardDescription>
                이길어때 어드민 서비스를 이용하기 위해 로그인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              {!isLoadAnimation ? (
                <Button onClick={handleLogin} disabled={isLoadAnimation}>
                  로그인
                </Button>
              ) : (
                <Button disabled>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>회원가입</CardTitle>
              <CardDescription>
                어드민 서비스용 계정이 없으신가요?
                <br />
                가입을 요청하시면 승인 후 메일로 결과를 알려드려요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="new_email">이메일</Label>
                <Input
                  id="new_email"
                  type="email"
                  value={new_email}
                  onChange={handleNewEmailChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new_name">사용자명</Label>
                <Input
                  id="new_name"
                  value={new_name}
                  onChange={handleNewNameChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSignUp}>가입신청</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Accordion type="single" collapsible className="w-[400px] mx-auto">
        <AccordionItem value="item-1">
          <AccordionTrigger>회원가입은 언제 처리되나요?</AccordionTrigger>
          <AccordionContent className="text-slate-400">
            회원가입은 다른 관리자의 승인을 받아야만 처리가 가능합니다.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            승인을 받은 것 같은데 이메일이 안와요
          </AccordionTrigger>
          <AccordionContent className="text-slate-400">
            해당 메일은 때로는 스팸 계정으로 인식됩니다. 스팸 메일함을
            확인해주세요.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            문제가 있어요, 어떻게 도움을 받을 수 있나요?
          </AccordionTrigger>
          <AccordionContent className="text-slate-400">
            kiit0901@gmail.com 으로 문의 주시면 빠른 시일 내에 도움을 드릴 수
            있습니다.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <AlertBox
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        errorMessage={errorMessage}
        errorName={errorName}
      />
      <SignUpDrawer
        isSignUpSuccess={isSignUpSuccess}
        email={new_email}
        close={() => setIsSignUpSuccess(false)}
      />
    </Layout>
  );
};

export default LoginPage;
