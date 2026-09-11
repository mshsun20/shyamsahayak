import React from 'react'
import { useNavigate } from "react-router";
import EntityListLayout from "../../../components/EntityListLayout";

const DGOS = [
    { key: "d1", code: "DGO1001", title: "Raj Kumar", related: "Dhanbad", achievement: 62, delta: "-18%", status: "Needs Attention" },
    { key: "d2", code: "DGO1002", title: "Amit Singh", related: "Ranchi", achievement: 68, delta: "-12%", status: "Needs Attention" },
    { key: "d3", code: "DGO1003", title: "Sanjay Shaw", related: "Bokaro", achievement: 85, delta: "+5%", status: "On Track" },
    { key: "d4", code: "DGO1004", title: "Manoj Kumar", related: "Jamshedpur", achievement: 91, delta: "+8%", status: "On Track" },
    { key: "d5", code: "DGO1001", title: "Raj Kumar", related: "Dhanbad", achievement: 62, delta: "-18%", status: "Needs Attention" },
];

const STATS = [
    { label: "DGOs", value: 4, sub: "All Active" },
    { label: "On Track", value: 2, sub: "50%", color: "text-emerald-600" },
    { label: "Needs Attention", value: 2, sub: "50%", color: "text-orange-500" },
    { label: "Not Active", value: 0, sub: "0%", color: "text-neutral-400" },
];

const Dgos = () => {
    const navigate = useNavigate();

  return (
    <EntityListLayout
        title="DGO List"
        period="Aug 2025 (Current Period)"
        searchPlaceholder="Search DGO by name or ID"
        columns={["DGO", "District", "Achv.", "Status"]}
        stats={STATS}
        rows={DGOS}
        onRowClick={() => navigate("/tm/dgos/DGO1001")}
    />
  )
}

export default React.memo(Dgos)