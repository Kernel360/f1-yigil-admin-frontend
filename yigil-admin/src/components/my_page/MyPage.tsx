import React from "react";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import { RocketIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "../ui/button.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MyPage: React.FC = () => {
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
          <CardTitle>프로필 사진 변경</CardTitle>
          <CardDescription>프로필 사진을 변경해보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <image></image>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="picture">Picture</Label>
                <Input id="picture" type="file" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button>업로드</Button>
        </CardFooter>
      </Card>
    </Layout>
  );
};

export default withAuthProtection(MyPage);
