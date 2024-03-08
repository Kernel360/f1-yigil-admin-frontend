import React, { useState, useEffect } from "react";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import { AlertBox } from "../snippet/AlertBox.tsx";
import {
  RocketIcon,
  PersonIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const MyPage: React.FC = () => {
  const [userInfo, setUserInfo] = useState({
    nickname: "",
    profileUrl: "",
    email: "",
  });

  const [profilePreview, setProfilePreview] = useState("");

  const [current_password, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchUserInfo = () => {
    const accessToken = getCookie("accessToken");

    fetch(`${apiBaseUrl}/api/v1/admins/detail-info`, {
      method: "GET",
      headers: {
        Authorization: `${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserInfo({
          nickname: data.nickname,
          profileUrl: data.profile_url,
          email: data.email,
        });
      })
      .catch((error) => {
        setAlertName("데이터를 가져올 수 없습니다");
        setMessage(
          "데이터를 불러오는 중 오류가 발생하였습니다. " + error.getMessage
        );
        setIsOpen(true);
      });
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAlertName("파일을 불러올 수 없습니다");
      setMessage("이미지가 아닌 형식의 파일은 업로드할 수 없습니다.");
      setIsOpen(true);
      event.target.value = "";
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    const fileInput = document.getElementById("picture") as HTMLInputElement;

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      formData.append("profileImageFile", fileInput.files[0]);
    } else {
      setAlertName("파일 업로드 실패");
      setMessage("파일을 업로드해주세요");
      setIsOpen(true);
    }

    const accessToken = getCookie("accessToken");

    fetch(`${apiBaseUrl}/api/v1/admins/profile-image`, {
      method: "POST",
      headers: {
        Authorization: `${accessToken}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "서버에서 오류가 발생하였습니다. 응답 코드: " + response.status
          );
        }
        return response.json();
      })
      .then((data) => {
        fetchUserInfo();
        setAlertName("업로드 성공");
        setMessage(data.getMessage);
        setIsOpen(true);
      })
      .catch((error) => {
        setAlertName("업로드 실패");
        setMessage(
          "프로필 이미지 업로드 중 오류가 발생했습니다. " + error.getMessage
        );
        setIsOpen(true);
      });
  };

  const handleCurrentPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPassword(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handlePasswordCheckChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordCheck(event.target.value);
  };

  const requestPasswordChange = async () => {
    if (!current_password.trim()) {
      setAlertName("비밀번호 변경 실패");
      setMessage("현재 비밀번호를 작성해주세요");
      setIsOpen(true);
      return;
    }

    if (!password.trim()) {
      setAlertName("비밀번호 변경 실패");
      setMessage("변경할 비밀번호를 작성해주세요");
      setIsOpen(true);
      return;
    }

    if (password !== passwordCheck) {
      setAlertName("비밀번호 변경 실패");
      setMessage(
        "새로운 비밀번호와 비밀번호 확인의 값이 다릅니다.\n다시 작성해주세요"
      );
      setIsOpen(true);
      return;
    }

    const accessToken = getCookie("accessToken");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/admins/password`, {
        method: "POST",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          existing_password: current_password,
          new_password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("비밀번호 변경 실패");
        setMessage(
          errorData.message || "비밀번호 변경 요청 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
        setCurrentPassword("");
        setPassword("");
        setPasswordCheck("");
        return;
      }

      setAlertName("비밀번호 변경 완료");
      setMessage("비밀번호 변경이 성공적으로 완료되었습니다.");
      setIsOpen(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordCheck("");
    } catch (error) {
      setAlertName("비밀번호 변경 실패");
      setMessage("비밀번호 변경 요청 중 오류가 발생하였습니다.");
      setIsOpen(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordCheck("");
    }
  };

  return (
    <Layout>
      <div className="w-[800px] my-10 mx-auto">
        <Alert>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>마이 페이지</AlertTitle>
          <AlertDescription>
            프로필 사진, 비밀번호를 변경해보세요!
          </AlertDescription>
        </Alert>
      </div>
      <Card className="w-[350px] mx-auto">
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>나의 프로필 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Avatar className="mx-auto size-40 mb-10">
            <AvatarImage src={userInfo.profileUrl} />
            <AvatarFallback>{userInfo.nickname}</AvatarFallback>
          </Avatar>
          <div className="flex my-3">
            <PersonIcon className="mr-3 h-5 w-5" />
            <p className="text-sm">{userInfo.nickname}</p>
          </div>
          <div className="flex">
            <EnvelopeClosedIcon className="mr-3 h-5 w-5" />
            <p className="text-sm">{userInfo.email}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">프로필 이미지 변경</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>프로필 이미지 변경</DialogTitle>
                <DialogDescription>
                  프로필 이미지를 업로드해보세요. 이미지를 미리 볼 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-40 h-40 object-cover mx-auto rounded-2xl"
                  />
                )}
                <div className="flex gap-4 items-center cursor-pointer">
                  <Label htmlFor="picture" className="text-right">
                    Picture
                  </Label>
                  <Input id="picture" type="file" onChange={handleFileChange} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>업로드</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">비밀번호 변경</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>비밀번호 변경</DialogTitle>
                <DialogDescription>
                  비밀번호를 변경해서 보안을 강화하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="current_password" className="text-right">
                    현재 비밀번호
                  </Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={current_password}
                    onChange={handleCurrentPasswordChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    새로운 비밀번호
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="col-span-3"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password_check" className="text-right">
                    비밀번호 확인
                  </Label>
                  <Input
                    id="password_check"
                    type="password"
                    value={passwordCheck}
                    onChange={handlePasswordCheckChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={requestPasswordChange}>비밀번호 변경</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      <AlertBox
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        errorMessage={message}
        errorName={alertName}
      />
    </Layout>
  );
};

export default withAuthProtection(MyPage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
