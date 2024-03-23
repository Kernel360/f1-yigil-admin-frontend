import React, { useState, useEffect } from "react";
import Layout from "../Layout.tsx";
import withAuthProtection from "../snippet/withAuthProtection.tsx";

import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  RocketIcon,
  ReloadIcon,
  EnvelopeClosedIcon,
  ChatBubbleIcon,
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
import { Badge } from "../ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Separator } from "@/components/ui/separator";
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
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card.tsx";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.tsx";
import { Input } from "../ui/input.tsx";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export type Response = {
  report: Report;
  reporter: Reporter;
};

export type Report = {
  id: number;
  report_type: ReportType;
  content: string;
  status: string;
  created_at: string;
};

export type Reporter = {
  id: number;
  name: string;
  email: string;
  social_login_type: SocialLoginType;
  profile_image_url: string;
};

interface ReportType {
  id: number;
  name: string;
  description: string;
}

enum SocialLoginType {
  Kakao = "KAKAO",
  Google = "GOOGLE",
}

const SocialLoginBadge: React.FC<{ type: SocialLoginType }> = ({ type }) => {
  switch (type) {
    case SocialLoginType.Kakao:
      return <Badge className="bg-yellow-300 text-black">카카오</Badge>;
    case SocialLoginType.Google:
      return <Badge className="bg-blue-600">구글</Badge>;
  }
};

const ReportPage: React.FC = () => {
  const [reports, setReports] = useState<Response[]>([]);
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

  const [isReadFormOpen, setIsReadFormOpen] = useState(false);
  const [readContent, setReadContent] = useState("");

  const [isProcessFormOpen, setIsProcessFormOpen] = useState(false);
  const [processContent, setProcessContent] = useState("");
  const [processReportId, setProcessReportId] = useState(0);

  const [isTypeFormOpen, setIsTypeFormOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>();
  const [types, setTypes] = useState<ReportType[]>([]);

  const [isTypeWriteFormOpen, setIsTypeWriteFormOpen] = useState(false);
  const [typeTitle, setTypeTitle] = useState("");
  const [typeContent, setTypeContent] = useState("");

  const [isLoadAnimation, setIsLoadAmination] = useState(false);

  const columns: ColumnDef<Response>[] = [
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
      accessorKey: "type",
      header: "신고 사유",
      cell: ({ row }) => <div>{row.original.report.report_type.name}</div>,
    },
    {
      accessorFn: (row) => `@${row.reporter.name}#${row.reporter.id}`,
      header: "신고자",
      id: "author",
      cell: (info) => {
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">@{info.row.original.reporter.name}</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-60">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarImage
                    src={info.row.original.reporter.profile_image_url}
                  />
                  <AvatarFallback>
                    {info.row.original.reporter.name}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    @{info.row.original.reporter.name}#
                    {info.row.original.reporter.id}
                  </h4>
                  <div className="flex items-center pt-2">
                    <ChatBubbleIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <SocialLoginBadge
                      type={info.row.original.reporter.social_login_type}
                    />
                  </div>
                  <div className="flex items-center pt-2">
                    <EnvelopeClosedIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                    <span className="text-xs text-muted-foreground">
                      {info.row.original.reporter.email}
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
      accessorKey: "status",
      header: "진행 상태",
      cell: ({ row }) => (
        <div>
          <Badge>{row.original.report.status}</Badge>
        </div>
      ),
    },
    {
      accessorFn: (row) => {
        const date = new Date(row.report.created_at);
        return date.toLocaleDateString("en-CA");
      },
      header: "신고일자",
      id: "reportedAt",
      cell: (info) => {
        const value = info.getValue() as string;
        return <div>{value}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const report = row.original;

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
              <DropdownMenuItem
                onClick={() =>
                  viewContent(report.report.report_type.description)
                }
              >
                조회하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => getProcessReport(report.report.id)}
              >
                완료처리
              </DropdownMenuItem>
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

  const fetchReports = async () => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(
        `${apiBaseUrl}/api/v1/reports?page=${encodeURIComponent(page)}&size=10`,
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
        setAlertName("신고 목록을 불러올 수 없습니다");
        setMessage(
          errorData.message || "신고 목록을 불러오던 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      const { reports, total_page } = responseData;
      setReports(reports);
      setTotalPages(total_page);
    } catch (error) {
      setAlertName("신고 목록을 불러올 수 없습니다");
      setMessage("신고 목록을 불러오던 중 오류가 발생하였습니다.");
      setIsOpen(true);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  const table = useReactTable({
    data: reports,
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

  const viewContent = async (content: string) => {
    setReadContent(content);
    setIsReadFormOpen(true);
  };

  const getProcessReport = async (id: number) => {
    setProcessContent("");
    setProcessReportId(id);
    setIsProcessFormOpen(true);
  };

  const getProcessCreateForm = () => {
    setTypeTitle("");
    setTypeContent("");
    setIsTypeWriteFormOpen(true);
  };

  const processReport = async (id: number) => {
    setIsLoadAmination(true);
    const accessToken = getCookie("accessToken");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/reports/${id}`, {
        method: "POST",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: processContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("신고 처리에 실패했습니다.");
        setMessage(errorData.message);
        setIsOpen(true);
        setIsLoadAmination(false);
        return;
      }

      setAlertName("신고 처리 완료");
      setMessage("신고가 완료처리 되었습니다.");
      setIsOpen(true);
      fetchReports();

      setProcessContent("");
      setIsProcessFormOpen(false);
    } catch (error) {
      setAlertName("신고 처리에 실패했습니다");
      setMessage("신고 처리 중 오류가 발생하였습니다.");
      setIsOpen(true);
    } finally {
      setIsLoadAmination(false);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const accessToken = getCookie("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/report-types`, {
        method: "GET",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("신고 항목을 불러올 수 없습니다");
        setMessage(
          errorData.message || "신고 항목을 불러오던 중 오류가 발생하였습니다."
        );
        setIsOpen(true);
        return;
      }

      const responseData = await response.json();
      const { category_list } = responseData;
      setTypes(category_list);
    } catch (error) {
      setAlertName("신고 항목을 불러올 수 없습니다");
      setMessage("신고 항목을 불러오던 중 오류가 발생하였습니다");
      setIsOpen(true);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const createReportType = async () => {
    setIsLoadAmination(true);
    const accessToken = getCookie("accessToken");

    if (!typeTitle.trim()) {
      setAlertName("신고 항목 추가에 실패하였습니다");
      setMessage("신고 항목명을 작성해주세요.");
      setIsOpen(true);
      setIsLoadAmination(false);
      return;
    }

    if (!typeContent.trim()) {
      setAlertName("신고 항목 추가에 실패하였습니다");
      setMessage("신고 항목 설명을 작성해주세요.");
      setIsOpen(true);
      setIsLoadAmination(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/report-types`, {
        method: "POST",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: typeTitle,
          description: typeContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("신고 항목 추가에 실패했습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        setIsLoadAmination(false);
        return;
      }

      setAlertName("신고 항목 추가 완료");
      setMessage("신고 항목이 성공적으로 추가되었습니다.");
      setIsOpen(true);
      fetchReportTypes();

      setTypeTitle("");
      setTypeContent("");
      setIsTypeWriteFormOpen(false);
    } catch (error) {
      setAlertName("신고 항목 추가에 실패했습니다");
      setMessage("신고 항목 추가 중 오류가 발생하였습니다.");
      setIsOpen(true);
    } finally {
      setIsLoadAmination(false);
    }
  };

  const deleteReportType = async (id: string) => {
    const accessToken = getCookie("accessToken");

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/report-types/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertName("신고 항목 삭제에 실패했습니다");
        setMessage(errorData.message);
        setIsOpen(true);
        return;
      }

      setAlertName("신고 항목 삭제 완료");
      setMessage("신고 항목을 성공적으로 삭제하였습니다.");
      setIsOpen(true);
      fetchReportTypes();
    } catch (error) {
      setAlertName("신고 항목 삭제에 실패했습니다");
      setMessage("신고 항목 삭제 중 오류가 발생하였습니다.");
      setIsOpen(true);
    }
  };

  return (
    <Layout>
      <div className="w-[800px] my-10 mx-auto">
        <Alert>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>신고 관리</AlertTitle>
          <AlertDescription>
            사용자로부터 접수된 신고사항을 확인하고 조치하세요.
          </AlertDescription>
        </Alert>
        <div className="flex items-center py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDownIcon className="ml-2 h-2 w-4" />
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
                    key={row.getValue("type")}
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
            <Dialog open={isTypeFormOpen} onOpenChange={setIsTypeFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  신고 항목 관리
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>신고 항목</DialogTitle>
                  <DialogDescription>
                    신고 항목을 확인하고 추가해보세요
                  </DialogDescription>
                  <Separator />
                  <RadioGroup
                    value={selectedTypeId}
                    onValueChange={setSelectedTypeId}
                  >
                    {types.map((type, index) => (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={type.id.toString()}
                          id={index.toString()}
                        />
                        <Label htmlFor={index.toString()}>{type.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </DialogHeader>
                <DialogFooter>
                  {!isLoadAnimation ? (
                    <Button
                      onClick={getProcessCreateForm}
                      disabled={isLoadAnimation}
                    >
                      신규 등록
                    </Button>
                  ) : (
                    <Button disabled>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Button>
                  )}
                  {!isLoadAnimation ? (
                    <Button
                      onClick={() =>
                        selectedTypeId && deleteReportType(selectedTypeId)
                      }
                      variant="destructive"
                      disabled={isLoadAnimation || !selectedTypeId}
                    >
                      삭제
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
      <Dialog open={isReadFormOpen} onOpenChange={setIsReadFormOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>신고사유</DialogTitle>
            <DialogDescription>{readContent}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={isProcessFormOpen} onOpenChange={setIsProcessFormOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>신고 조치완료</DialogTitle>
            <DialogDescription>
              신고 조치 완료 사실을 메일로 사용자에게 알리세요.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="이곳에 조치 내용을 작성하세요."
            className="h-80"
            value={processContent}
            onChange={(e) => setProcessContent(e.target.value)}
          />
          <DialogFooter>
            {!isLoadAnimation ? (
              <Button
                disabled={isLoadAnimation}
                onClick={() => processReport(processReportId)}
              >
                보내기
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
      <Dialog open={isTypeWriteFormOpen} onOpenChange={setIsTypeWriteFormOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>신고 항목 추가</DialogHeader>
          <DialogDescription>신고 항목을 추가하세요</DialogDescription>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-12 items-center gap-4">
              <Label htmlFor="type_title" className="text-right">
                이름
              </Label>
              <Input
                id="type_title"
                className="col-span-11"
                value={typeTitle}
                onChange={(e) => setTypeTitle(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="해당 항목의 설명을 작성하세요."
              className="h-80"
              value={typeContent}
              onChange={(e) => setTypeContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            {!isLoadAnimation ? (
              <Button
                disabled={isLoadAnimation}
                onClick={() => createReportType()}
              >
                등록
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
    </Layout>
  );
};

export default withAuthProtection(ReportPage);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}
