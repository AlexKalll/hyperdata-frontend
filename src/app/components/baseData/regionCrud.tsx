import { useState, useEffect } from "react";
import { useDataService } from "@/app/lib/generic-base-data-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import AddBasedataForm from "./addBasedataFormDynamic";

import UpdateBasedataFormDynamic from "./updateBasedataFormDynamic";
import { DeleteBasedata } from "./deleteBasedata";
import { ColumnDef } from "@tanstack/react-table";
import { useBasedataRegion } from "@/lib/hooks/useBasedata";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Basedata, RegionBasedata } from "@/app/types/basedate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogLeft";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deleted", label: "Deleted" },
];

export function RegionCRUD() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const dataService = useDataService("regions");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [verificationStatus, setVerificationStatus] = useState<string>();
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const { data: regionData, isLoading: isregionLoading } = useBasedataRegion({
    page,
    pageSize,
    servicename: "region",
    searchQuery: debouncedSearch,
    verificationStatus,
  });
  const paginatedregionData = regionData?.data.result || [];
  const regionTotalElements = regionData?.data?.total || 0;
  const regionTotalPages = regionData?.data.totalPages || 0;
  const companyStartRecord = paginatedregionData.length
    ? (page - 1) * pageSize + 1
    : 0;
  const companyEndRecord = Math.min(page * pageSize, regionTotalElements);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      currentItem
        ? dataService.update(currentItem.id, data)
        : dataService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["region"] });
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["regions"] }),
  });

  type FormField = {
    name: string;
    label: string;
    type: "text" | "select";
    required?: boolean;
    options?: { value: string; label: string }[];
  };

  const formFields: FormField[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
  ];

  const columns: ColumnDef<RegionBasedata>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: function RegionCountryCell({ row }) {
        const country = row.original?.country.name;
        return (
          <span className={`px-2 py-1 rounded text-sm font-medium  `}>
            {country}
          </span>
        );
      },
    },
    {
      accessorKey: "",
      header: "Action",
      cell: function RegionActionCell({ row }) {
        const [isOpen, setIsOpen] = useState(false);
        const [isOpenDeletor, setIsOpenDeletor] = useState(false);

        return (
          <>
            <button
              onClick={() => setIsOpen(true)}
              aria-label="View user details"
            >
             <svg
                width="33"
                height="28"
                viewBox="0 0 33 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1.1"
                  y="1.1"
                  width="30.8"
                  height="25.8"
                  rx="5.4"
                  stroke="#EAECF0"
                  strokeWidth="1.2"
                />

                <g transform="translate(6, 4)">
                  <path
                    d="M12.2284 3.32463C12.8494 2.65182 13.1599 2.31542 13.4898 2.11919C14.2859 1.64572 15.2662 1.63099 16.0757 2.08035C16.4111 2.26658 16.7311 2.59352 17.3712 3.24738C18.0112 3.90125 18.3313 4.22818 18.5136 4.57086C18.9535 5.39768 18.9391 6.39908 18.4756 7.21233C18.2835 7.54938 17.9542 7.86657 17.2956 8.50092L9.45916 16.0487C8.21106 17.2508 7.58699 17.8519 6.80704 18.1565C6.02709 18.4612 5.16966 18.4387 3.45479 18.3939L3.22148 18.3878C2.69942 18.3742 2.43838 18.3673 2.28665 18.1951C2.13491 18.0229 2.15563 17.757 2.19706 17.2253L2.21956 16.9365C2.33617 15.4397 2.39447 14.6913 2.68675 14.0186C2.97903 13.3458 3.48319 12.7997 4.49152 11.7072L12.2284 3.32463Z"
                    stroke="#667085"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.333 3.42041L17.1663 9.25374"
                    stroke="#667085"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12.167 18.4204H18.8337"
                    stroke="#667085"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              </svg>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                  <UpdateBasedataFormDynamic
                    isOpen={isOpen}
                    intialdata={row.original}
                    onClose={() => setIsOpen(false)}
                    servicename="region"
                    coloumn_name="country_id"
                    foriegnData="country"
                  />
                </DialogContent>
              </Dialog>
            </button>
            <button
              onClick={() => setIsOpenDeletor(true)}
              aria-label="View user details"
              className="hover:bg-gray-100 p-1 rounded mr-1"
            >
        <svg width="33" height="28" viewBox="0 0 33 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.1" y="1.1" width="30.8" height="25.8" rx="5.4" stroke="#EAECF0" strokeWidth="1.2" />
  

  <g transform="translate(6, 3)">
    <path
      d="M16.75 4.67041L16.2336 13.0247C16.1016 15.1591 16.0357 16.2263 15.5007 16.9937C15.2361 17.373 14.8956 17.6932 14.5006 17.9337C13.7017 18.4204 12.6325 18.4204 10.4939 18.4204C8.3526 18.4204 7.28192 18.4204 6.48254 17.9328C6.08733 17.6918 5.74667 17.3711 5.48223 16.9911C4.9474 16.2226 4.88287 15.1538 4.75384 13.0164L4.25 4.67041"
      stroke="#667085"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M3 4.67008H18M13.8797 4.67008L13.3109 3.49653C12.933 2.71697 12.744 2.32718 12.4181 2.08409C12.3458 2.03017 12.2693 1.9822 12.1892 1.94067C11.8283 1.75342 11.3951 1.75342 10.5287 1.75342C9.64067 1.75342 9.19667 1.75342 8.82973 1.94852C8.74842 1.99176 8.67082 2.04167 8.59774 2.09773C8.26803 2.35067 8.08386 2.75471 7.71551 3.5628L7.21077 4.67008"
      stroke="#667085"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M8.41699 13.8369V8.83691"
      stroke="#667085"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M12.583 13.8369V8.83691"
      stroke="#667085"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </g>
</svg>
 </button>
            <DeleteBasedata
              isOpen={isOpenDeletor}
              onClose={() => setIsOpenDeletor(false)}
              service_id={row.original.id}
              servicename="region"
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
       
        <Button
          onClick={() => {
            setCurrentItem(null);
            setIsDialogOpen(true);
          }}
        >
          Add region
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="mb-8 font-bold ">Add New region</p>
          </DialogHeader>
          <AddBasedataForm
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            servicename="region"
            coloumn_name="country_id"
            foriegnData="country"
          />
        </DialogContent>
      </Dialog>
      <DataTable
        columns={columns}
        data={paginatedregionData}
        isLoading={isregionLoading}
        pagination={{
          pageCount: regionTotalPages,
          page,
          setPage: handlePageChange,
          pageSize,
          setPageSize: handlePageSizeChange,
          showingText:
            regionTotalElements > 0
              ? `Showing ${companyStartRecord} to ${companyEndRecord} out of ${regionTotalElements} records`
              : "",
        }}
      />
    </div>
  );
}
