import React, { useState, useCallback } from "react";
import Layout from "../Layout";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertBox } from "../snippet/AlertBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RocketIcon, ReloadIcon } from "@radix-ui/react-icons";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import withAuthProtection from "../snippet/withAuthProtection";
import MapComponent from "../snippet/MapComponent";
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
  CardContent,
} from "../ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type Place = {
  id: number;
  name: string;
  address: string;
  latest_uploaded_time: string;
  location: pointDto;
  image_file_url: string;
  map_static_image_file_url: string;
  region_name: string;
};

interface pointDto {
  x: number;
  y: number;
}

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

const PlacePage: React.FC = () => {
  const [place, setPlace] = useState<Place>();
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [profilePreview, setProfilePreview] = useState("");
  const [isLoadAnimation, setIsLoadAmination] = useState(false);

  const { toast } = useToast();

  const handleMarkerNotFound = () => {
    toast({
      title: "조회된 장소가 없습니다",
      description: "다른 화면으로 이동해보세요",
      action: <ToastAction altText="Undo">Undo</ToastAction>,
    });
  };

  const handleMarkerClick = useCallback(async (id: number) => {
    setSelectedPlaceId(id);
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/places/${id}`, {
        method: "GET",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("해당 장소를 찾을 수 없습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      setPlace(responseData);
    } catch (error) {
      setAlertName("장소 조회에 실패했습니다");
      setMessage("해당 장소를 조회하던 중 오류가 발생하였습니다");
      setIsOpen(true);
    }
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
    setIsLoadAmination(true);
    if (
      fileInput &&
      fileInput.files &&
      fileInput.files.length > 0 &&
      selectedPlaceId !== null
    ) {
      formData.append("imageFile", fileInput.files[0]);
      formData.append("placeId", selectedPlaceId.toString());
    } else {
      setAlertName("파일 업로드 실패");
      setMessage("파일을 업로드해주세요");
      setIsOpen(true);
      setIsLoadAmination(false);
    }

    const accessToken = getCookie("accessToken");

    fetch(`${apiBaseUrl}/api/v1/places/update-image`, {
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
        setIsLoadAmination(false);
        return response.json();
      })
      .then((data) => {
        if (selectedPlaceId !== null) handleMarkerClick(selectedPlaceId);
        setAlertName("업로드 성공");
        setMessage(data.getMessage);
        setIsOpen(true);
        setIsLoadAmination(false);
      })
      .catch((error) => {
        setAlertName("업로드 실패");
        setMessage(
          "프로필 이미지 업로드 중 오류가 발생했습니다. " + error.getMessage
        );
        setIsOpen(true);
        setIsLoadAmination(false);
      });
  };

  return (
    <Layout>
      <div className="w-[800px] my-10 mx-auto">
        <Alert>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>장소 데이터 관리</AlertTitle>
          <AlertDescription>
            장소 데이터를 확인하고 관리하세요.
          </AlertDescription>
        </Alert>
        <MapComponent
          lat={37.5665}
          lng={126.978}
          zoom={13}
          onMarkerClick={handleMarkerClick}
          onMarkerNotFound={handleMarkerNotFound}
        />
        {place ? (
          <div>
            <div className="flex justify-between">
              <Card className="w-[350px] p-5">
                <img
                  className="rounded-md h-[200px] mx-auto"
                  src={place.image_file_url}
                />
                <CardHeader>
                  <CardTitle>대표 이미지</CardTitle>
                  <CardDescription>
                    사용자에게 보여지는 장소 썸네일 이미지
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end pb-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>변경</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>장소 대표 이미지 변경</DialogTitle>
                        <DialogDescription>
                          장소 이미지를 업로드해보세요. 이미지를 미리 볼 수
                          있습니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {profilePreview && (
                          <img
                            src={profilePreview}
                            alt="profile preview"
                            className="w-40 h-40 object-cover mx-auto rounded-2xl"
                          />
                        )}
                        <div className="flex gap-4 items-center cursor-pointer">
                          <Label htmlFor="picture" className="text-right">
                            Picture
                          </Label>
                          <Input
                            id="picture"
                            type="file"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        {!isLoadAnimation ? (
                          <Button
                            onClick={handleSubmit}
                            disabled={isLoadAnimation}
                          >
                            업로드
                          </Button>
                        ) : (
                          <Button disabled>
                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
              <Card className="w-[350px] p-5">
                <img
                  className="rounded-md h-[200px] mx-auto"
                  src={place.map_static_image_file_url}
                />
                <CardHeader>
                  <CardTitle>지도 이미지</CardTitle>
                  <CardDescription>
                    사용자에게 보여지는 장소 지도 이미지
                  </CardDescription>
                  <CardDescription className="text-xs">
                    {place.address}
                  </CardDescription>
                  <CardDescription className="text-xs">
                    ({place.location.x}, {place.location.y})
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            <Card className="mt-5">
              <CardHeader>
                <CardTitle>장소 정보</CardTitle>
                <CardDescription>장소의 기타 정보</CardDescription>
              </CardHeader>
              <CardContent className="pl-10">
                <CardTitle>{place.name}</CardTitle>
                <Badge variant="secondary" className="my-3">
                  {place.region_name !== "" ? place.region_name : "분류 없음"}
                </Badge>
                <CardDescription className="text-xs">
                  업로드 {timeSince(place.latest_uploaded_time)}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-5">
              <Skeleton className="w-[350px] h-[376px] rounded-xl" />
              <Skeleton className="w-[350px] h-[376px] rounded-xl" />
            </div>
            <Skeleton className="w-full h-[200px] rounded-xl" />
          </div>
        )}
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

export default withAuthProtection(PlacePage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
