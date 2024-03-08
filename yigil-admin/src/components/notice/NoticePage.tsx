import React, { useState, useEffect } from "react";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  RocketIcon,
  EnvelopeClosedIcon,
} from "@radix-ui/react-icons";

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
import { AlertBox } from "../snippet/AlertBox.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type Notice = {
  id: number;
  title: string;
  author_id: number;
  author: string;
  author_email: string;
  author_profile_image_url: string;
  created_at: Date;
};

const NoticePage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
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

  const [noticeIds, setNoticeIds] = useState([]);

  const [alertName, setAlertName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const columns: ColumnDef<Notice>[] = [
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
      accessorKey: "title",
      header: "제목",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorFn: (row) => `@${row.author}#${row.author_id}`,
      header: "담당자",
      id: "author",
      cell: (info) => {
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">@{info.row.original.author}</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage
                    src={info.row.original.author_profile_image_url}
                  />
                  <AvatarFallback>{info.row.original.author}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    @{info.row.original.author}#{info.row.original.author_id}
                  </h4>
                  <p className="text-sm">이길로그 관리자</p>
                  <div className="flex items-center pt-2">
                    <EnvelopeClosedIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      {info.row.original.author_email}
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
      accessorFn: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleDateString("en-CA");
      },
      header: "작성일자",
      id: "createdAt",
      cell: (info) => {
        const value = info.getValue() as string;
        return <div>{value}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
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
              <DropdownMenuItem>수정하기</DropdownMenuItem>
              <DropdownMenuItem>삭제하기</DropdownMenuItem>
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

  const fetchNotices = async () => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(
        `${apiBaseUrl}/api/v1/notices?page=${encodeURIComponent(page)}&size=10`,
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
        setAlertName("공지사항 목록을 불러올 수 없습니다");
        setMessage(
          errorData.message ||
            "공지사항 목록을 불러오던 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
      }

      const responseData = await response.json();
      const { content, total_pages: newTotalPages } = responseData.notice_list;
      setNotices(content);
      setTotalPages(newTotalPages);

      const ids = content.map((notice: Notice) => notice.id);
      setNoticeIds(ids);
    } catch (error) {
      console.log(error);
      setAlertName("공지사항 목록을 불러올 수 없습니다");
      setMessage("공지사항 목록을 불러오던 중 오류가 발생하였습니다.");
      setIsOpen(true);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [page]);

  const table = useReactTable({
    data: notices,
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
          <AlertTitle>공지사항 관리</AlertTitle>
          <AlertDescription>
            사용자에게 공지해야 할 중요 사항들을 작성하고 공유하세요.
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
          <div className="flex-1 text-sm text-muted-forground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} rows(s) selected.
          </div>
          <div className="space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  신규 작성
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[1080px]">
                <DialogHeader>
                  <DialogTitle>공지사항 작성</DialogTitle>
                  <DialogDescription>
                    공지사항을 작성하고, 서비스에 게시해보세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4"></div>
              </DialogContent>
            </Dialog>
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

export default withAuthProtection(NoticePage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
