import React from 'react'
import { useNavigate } from "react-router";
import EntityListLayout from "../../../components/EntityListLayout";

const FABRICATORS = [
    { key: "f1", code: "FAB1001", title: "Shree Krishna Steel", related: "Raj Kumar · DGO1001", achievement: 62, delta: "-18%", status: "Needs Attention" },
    { key: "f2", code: "FAB1002", title: "Maa Ganga Fabricators", related: "Raj Kumar · DGO1001", achievement: 68, delta: "-12%", status: "Needs Attention" },
    { key: "f3", code: "FAB1003", title: "Vikas Steel Works", related: "Sanjay Shaw · DGO1003", achievement: 91, delta: "+8%", status: "On Track" },
    { key: "f4", code: "FAB1004", title: "Pioneer Structures", related: "Sanjay Shaw · DGO1003", achievement: 91, delta: "+8%", status: "On Track" },
    { key: "f5", code: "FAB1002", title: "Maa Ganga Fabricators", related: "Raj Kumar · DGO1001", achievement: 68, delta: "-12%", status: "Needs Attention" },
];

const STATS = [
    { label: "Fabricators", value: 4, sub: "All Active" },
    { label: "On Track", value: 98, sub: "78%", color: "text-emerald-600" },
    { label: "Needs Attention", value: 20, sub: "16%", color: "text-orange-500" },
    { label: "Not Active", value: 8, sub: "6%", color: "text-neutral-400" },
];

const Fabricators = () => {
    const navigate = useNavigate();

    return (
        <EntityListLayout
            title="Fabricator List"
            period="Aug 2025 (Current Period)"
            searchPlaceholder="Search Fabricator by name or ID"
            columns={["Fabricator", "DGO", "Achv.", "Status"]}
            stats={STATS}
            rows={FABRICATORS}
            onRowClick={() => navigate("/tm/fabricators/FAB1003")}
        />
    )
}

export default React.memo(Fabricators)