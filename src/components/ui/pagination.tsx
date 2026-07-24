import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between gap-2 py-2 text-xs", className)}>
      <span className="text-muted-foreground font-medium">
        Page <span className="text-foreground font-bold">{currentPage}</span> of{" "}
        <span className="text-foreground font-bold">{totalPages}</span>
      </span>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span className="sr-only">First page</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="sr-only">Previous page</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  );
}
