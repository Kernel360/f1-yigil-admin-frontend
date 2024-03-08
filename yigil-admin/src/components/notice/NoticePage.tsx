// import React, { useState, useEffect } from "react";
// import Layout from "../Layout.tsx";
// import withAuthProtection from "../snippet/withAuthProtection.tsx";

// import {
//   ChevronDownIcon,
//   DotsHorizontalIcon,
//   RocketIcon,
// } from "@radix-ui/react-icons";

// import {
//   ColumnDef,
//   ColumnFiltersState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { AlertBox } from "../snippet/AlertBox.tsx";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Checkbox } from "@/components/ui/checkbox.tsx";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu.tsx";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination.tsx";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table.tsx";

// const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// export type Notice = {
//   id: number;
//   title: string;
//   author: string;
//   author_id: number;
//   created_at: Date;
// };

// const NoticePage: React.FC = () => {
//   const [notices, setNotices] = useState<Notice[]>([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);

//   const [columnFilters, setColumnFilters] = React.useState<ColumnFilterState>(
//     []
//   );
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});

//   const [alertName, setAlertName] = useState("");
//   const [message, setMessage] = useState("");
//   const [isOpen, setIsOpen] = useState(false);

//   const columns: ColumnDef<Notice>[] = [
//     {
//       id: "select",
//       header: ({ table }) => (
//         <Checkbox
//           checked={table.getIsAllPageRowsSelected()}
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select-row"
//         />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },
//     {
//       accessorKey: "title",
//       header: "제목",
//       cell: ({ row }) => <div>{row.getValue("title")}</div>,
//     },
//     {
//       accessorKey: "author",
//       header: "작성자",
//       cell: ({ row }) => {
//         const notice = row.original;

//         return (

//         )
//       },
//     },
//     {
//       accessorKey: "created_at",
//       header: "작성시간",
//       cell: ({ row }) => <div>{row.getValue("created_at")}</div>
//     },
//   ];
// };
