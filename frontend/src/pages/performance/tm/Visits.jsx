import React from 'react'
import { useNavigate } from "react-router";
import EntityListLayout from "../../../components/EntityListLayout";

const COUNTERS = [
    { key: "c1", code: "CNT1001", title: "Dhanbad Steel Mart", related: "Raj Kumar · FAB1001", achievement: 78, delta: "-10%", status: "Needs Attention" },
    { key: "c2", code: "CNT1002", title: "Bokaro Metal Centre", related: "Raj Kumar · FAB1001", achievement: 62, delta: "-6%", status: "Needs Attention" },
    { key: "c3", code: "CNT1003", title: "Vikas Steel Works", related: "Sanjay Shaw · FAB1003", achievement: 85, delta: "+5%", status: "On Track" },
    { key: "c4", code: "CNT1004", title: "Pioneer Structures", related: "Sanjay Shaw · FAB1003", achievement: 91, delta: "+8%", status: "On Track" },
    { key: "c5", code: "CNT1002", title: "Maa Ganga Fabricators", related: "Raj Kumar · FAB1001", achievement: 68, delta: "-12%", status: "Needs Attention" },
];

const STATS = [
    { label: "Counters", value: 248, sub: "All Active" },
    { label: "On Track", value: 108, sub: "73%", color: "text-emerald-600" },
    { label: "Needs Attention", value: 48, sub: "19%", color: "text-orange-500" },
    { label: "Not Active", value: 20, sub: "8%", color: "text-neutral-400" },
];

const Visits = () => {
    const navigate = useNavigate();

    return (
        <EntityListLayout
            title="Counter List"
            period="Aug 2025 (Current Period)"
            searchPlaceholder="Search Fabricator by name or ID"
            columns={["Counter", "Fabricator", "Achv.", "Status"]}
            stats={STATS}
            rows={COUNTERS}
            onRowClick={() => navigate("/tm/visits/CNT1004")}
        />
    )
}

export default React.memo(Visits)