import React, { useState, useEffect } from "react";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@radix-ui/react-checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  ChatBubbleIcon,
  ChevronDownIcon,
  SewingPinIcon,
  PersonIcon,
  DotsHorizontalIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertBox } from "../snippet/AlertBox";
import { Badge } from "../ui/badge.tsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

enum SocialLoginType {
  Kakao = "KAKAO",
  Google = "GOOGLE",
}

enum MemberStatus {
  Active = "ACTIVE",
  Banned = "BANNED",
  Withdraw = "WITHDRAW",
}

export type Member = {
  member_id: number;
  nickname: string;
  profile_image_url: string;
  status: MemberStatus;
  social_login_type: SocialLoginType;
  ages: string;
  gender: string;
  email: string;
  joined_at: string;
};

const SocialLoginBadge: React.FC<{ type: SocialLoginType }> = ({ type }) => {
  switch (type) {
    case SocialLoginType.Kakao:
      return <Badge className="bg-yellow-300 text-black">카카오</Badge>;
    case SocialLoginType.Google:
      return <Badge className="bg-blue-600">구글</Badge>;
  }
};

const MemberStatusBadge: React.FC<{ status: MemberStatus }> = ({ status }) => {
  switch (status) {
    case MemberStatus.Active:
      return <Badge>정상</Badge>;
    case MemberStatus.Banned:
      return <Badge variant="destructive">정지</Badge>;
    case MemberStatus.Withdraw:
      return <Badge variant="secondary">탈퇴</Badge>;
    default:
      return <Badge variant="outline">상태 없음</Badge>;
  }
};

const MemberPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [columnFilters, setCoulumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const columns: ColumnDef<Member>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorFn: (row) => `@${row.nickname}#${row.member_id}`,
      header: "멤버",
      id: "member",
      cell: (info) => {
        const type = info.row.original.social_login_type;
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">@{info.row.original.nickname}</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage src={info.row.original.profile_image_url} />
                  <AvatarFallback>{info.row.original.nickname}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    @{info.row.original.nickname}#{info.row.original.member_id}
                  </h4>
                  <div className="flex items-center pt-2">
                    <ChatBubbleIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <SocialLoginBadge type={type} />
                  </div>
                  <div className="flex items-center pt-2">
                    <SewingPinIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      {info.row.original.gender}
                    </span>
                    <PersonIcon className="ml-4 mr-2 h-4 w-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      {info.row.original.ages}
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      accessorKey: "email",
      header: "이메일",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorFn: (row) => {
        const date = new Date(row.joined_at);
        return date.toLocaleDateString("en-CA");
      },
      header: "가입일자",
      id: "joinedAt",
      cell: (info) => {
        const value = info.getValue() as string;
        return <div>{value}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({ row }) => {
        const status = row.original.status;
        return <MemberStatusBadge status={status} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const member = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {member.status !== MemberStatus.Banned ? (
                <DropdownMenuItem onClick={() => ban(member.member_id)}>
                  정지
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => unban(member.member_id)}>
                  정지 해제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handlePageClick = (newPage: number) => {
    setPage(newPage);
  };

  const createPaginationItems = () => {
    let startPage = Math.max(1, page - 4);
    let endPage = Math.min(totalPages, page + 5);

    if (endPage - startPage > 9) {
      if (page - startPage < 5) {
        endPage = startPage + 9;
      } else {
        startPage = endPage - 9;
      }
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const fetchMembers = async () => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(
        `${apiBaseUrl}/api/v1/members?page=${encodeURIComponent(
          page
        )}&dataCount=10`,
        {
          method: "GET",
          headers: {
            Authorization: `${accessToken}`,
            "Content-Type": "appication/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("멤버 목록을 불러올 수 없습니다");
        setMessage(
          errorData.message || "멤버 목록을 불러오던 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      const { content, total_pages } = responseData.members;
      setMembers(content);
      setTotalPages(total_pages);
    } catch (error) {
      console.error(error);
      setAlertName("멤버 목록을 불러올 수 없습니다");
      setMessage("공지사항 목록을 불러오던 중 오류가 발생하였습니다.");
      setIsOpen(true);
    }
  };

  const ban = async (id: number) => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/members/ban`, {
        method: "POST",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [id],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("사용자 정지에 실패했습니다.");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      setAlertName("사용자 정지 완료");
      setMessage("사용자 정지 처리가 완료되었습니다.");
      setIsOpen(true);
      fetchMembers();
    } catch (error) {
      setAlertName("사용자 정지에 실패했습니다.");
      setMessage("사용자 정지 처리 중 오류가 발생하였습니다");
      setIsOpen(true);
    }
  };

  const unban = async (id: number) => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/members/unban`, {
        method: "POST",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [id],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("사용자 정지 해제에 실패했습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      setAlertName("사용자 정지 해제 완료");
      setMessage("사용자 정지 해제 처리가 완료되었습니다");
      setIsOpen(true);
      fetchMembers();
    } catch (error) {
      setAlertName("사용자 정지 해제에 실패했습니다");
      setMessage("사용자 정지 해제 처리 중 오류가 발생하였습니다");
      setIsOpen(true);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page]);

  const table = useReactTable({
    data: members,
    columns,
    onColumnFiltersChange: setCoulumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Layout>
      <div className="w-[800px] my-10 mx-auto">
        <Alert>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>멤버 관리</AlertTitle>
          <AlertDescription>
            서비스 사용자들을 직접 확인하고 관리하세요.
          </AlertDescription>
        </Alert>
        <div className="flex items-center py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.getValue("title")}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} rows(s) selected.
          </div>
        </div>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem
                onClick={() => handlePageClick(Math.max(1, page - 1))}
              >
                <PaginationPrevious />
              </PaginationItem>
              {createPaginationItems().map((pageNum) => (
                <PaginationItem
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                >
                  <PaginationLink isActive={page === pageNum}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem
                onClick={() => handlePageClick(Math.min(totalPages, page + 1))}
              >
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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

export default withAuthProtection(MemberPage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
