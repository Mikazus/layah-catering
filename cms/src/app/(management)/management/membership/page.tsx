"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { getMembershipsApi } from "@/lib/api/management";
import { downloadCsv } from "@/lib/utils/export";
import { MembershipTable } from "@/components/management/MembershipTable";
import { Button } from "@/components/ui/Button";
import type { MembershipResponse } from "@/types/management";

const PAGE_SIZE = 10;

export default function ManagementMembershipPage() {
  const [data, setData] = useState<MembershipResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("code");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMembershipsApi()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Gagal memuat data membership"
        )
      );
  }, []);

  const processedMembers = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();

    const filtered = data.members.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!q) return true;
      return `${m.fullName} ${m.email} ${m.memberCode}`
        .toLowerCase()
        .includes(q);
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "tx_desc") return b.totalTransactions - a.totalTransactions;
      if (sortBy === "name") return a.fullName.localeCompare(b.fullName);
      return a.memberCode.localeCompare(b.memberCode);
    });
  }, [data, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(processedMembers.length / PAGE_SIZE));
  const pagedMembers = processedMembers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleExportCsv = () => {
    downloadCsv(
      "layah-membership-pelanggan.csv",
      ["Nama Pelanggan", "Email", "ID Member", "Status", "Tanggal Bergabung", "Total Transaksi (Rp)"],
      processedMembers.map((m) => [
        m.fullName,
        m.email,
        m.memberCode,
        m.status,
        m.joinedDate,
        m.totalTransactions,
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#18352B]/65">
            LAYAH / MANAJEMEN KATERING
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#18352B] font-sans">
            Data Membership
          </h1>
          <p className="mt-1 text-xs text-[#18352B]/70">
            Pusat pemantauan data keanggotaan pelanggan.
          </p>
        </div>

        <Button
          variant="burgundy"
          onClick={handleExportCsv}
          disabled={processedMembers.length === 0}
        >
          <Download className="h-4 w-4" />
          Ekspor Data (CSV)
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-[#641E2A]/35 bg-[#F3E4E6] px-4 py-3 text-xs text-[#641E2A]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#18352B]">
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            {data ? `${data.totalRegistered} pelanggan terdaftar` : "Memuat..."}
          </span>
          <span className="text-[#18352B]/30">|</span>
          <span>
            <strong>{data?.activeCount ?? 0}</strong> Active
          </span>
          <span className="text-[#18352B]/70">
            {data?.inactiveCount ?? 0} Inactive
          </span>
        </div>

        <span className="text-[11px] text-[#18352B]/70">
          {data?.asOfLabel ?? ""}
        </span>
      </div>

      <MembershipTable
        members={pagedMembers}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        currentPage={page}
        totalPages={totalPages}
        totalRegistered={processedMembers.length}
        onPageChange={setPage}
      />
    </div>
  );
}
