"use client";

import React from "react";
import { Search } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { formatRupiah } from "@/lib/utils/format";
import type { MemberRecord } from "@/types/management";

interface MembershipTableProps {
  members: MemberRecord[];
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  currentPage: number;
  totalPages: number;
  totalRegistered: number;
  onPageChange: (page: number) => void;
}

export function MembershipTable({
  members,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  currentPage,
  totalPages,
  totalRegistered,
  onPageChange,
}: MembershipTableProps) {
  const startIdx = (currentPage - 1) * 10 + 1;
  const endIdx = Math.min(startIdx + members.length - 1, totalRegistered);

  return (
    <div className="rounded-lg border border-[#18352B]/35 bg-[#C9B99A] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#18352B]/20">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#18352B]/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama atau ID member"
            className="w-full rounded-md border border-[#18352B]/35 bg-transparent py-2 pl-9 pr-3 text-xs text-[#18352B] placeholder:text-[#18352B]/55 outline-none focus:border-[#18352B]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              options={[
                { label: "Semua status", value: "all" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
          </div>

          <div className="w-48">
            <Select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              options={[
                { label: "Urutkan: ID Member", value: "code" },
                { label: "Urutkan: Transaksi Tertinggi", value: "tx_desc" },
                { label: "Urutkan: Nama A–Z", value: "name" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        headers={[
          { label: "Nama Pelanggan" },
          { label: "ID Member" },
          { label: "Status Keanggotaan" },
          { label: "Tanggal Bergabung" },
          { label: "Total Transaksi", align: "right" },
        ]}
      >
        {members.length === 0 ? (
          <tr>
            <td
              colSpan={5}
              className="px-4 py-10 text-center text-xs text-[#18352B]/65"
            >
              Data member tidak ditemukan.
            </td>
          </tr>
        ) : (
          members.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-[#18352B]/5 transition-colors"
            >
              <td className="px-4 py-3.5">
                <p className="text-xs font-bold text-[#18352B]">
                  {member.fullName}
                </p>
                <p className="text-[11px] text-[#18352B]/65">{member.email}</p>
              </td>
              <td className="px-4 py-3.5 text-xs font-medium text-[#18352B]">
                {member.memberCode}
              </td>
              <td className="px-4 py-3.5">
                <Badge
                  variant={member.status === "Active" ? "green" : "outline"}
                  dot
                >
                  {member.status}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-xs text-[#18352B]/80">
                {member.joinedDate}
              </td>
              <td className="px-4 py-3.5 text-right text-xs font-bold text-[#18352B]">
                {formatRupiah(member.totalTransactions)}
              </td>
            </tr>
          ))
        )}
      </Table>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        summaryText={
          members.length > 0
            ? `Menampilkan ${startIdx}–${endIdx} dari ${totalRegistered} pelanggan`
            : `Menampilkan 0 dari ${totalRegistered} pelanggan`
        }
        onPageChange={onPageChange}
      />
    </div>
  );
}
