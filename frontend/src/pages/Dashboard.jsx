import {useEffect,useState} from "react";
import api from "../api/axios";
import Card from "../components/Card";

import {
    PieChart,
    Pie,
    Tooltip,
    Cell,
    ResponsiveContainer
} from "recharts";

const COLORS=[
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b"
];

export default function Dashboard(){
    const [data,setData]=useState(null);

    useEffect(()=>{
        api.get("/api/analytics")
        .then(res=>setData(res.data))
        .catch(console.error);
    },[]);

    if(!data){
        return <p className="text-white">Loading...</p>
    }

    return(
        <div>
            <h1 className="text-4xl font-bold mb-8"> Dashboard </h1>

            <div className="grid md:grid-cols-3 gap-5">
                <Card
                    title="Total Spending"
                    value={`₹${data.total}`}
                />
                <Card
                    title="Transactions"
                    value={data.categories.length}
                />
                <Card
                    title="Categories"
                    value={data.categories.length}
                />
            </div>

            <div className="bg-white/10 mt-10 p-8 rounded-3xl h-[450px]">
                {data.categories.length===0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No expense data yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.categories}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={150}
                                label
                            >
                                {data.categories.map((_,i)=>(
                                    <Cell
                                        key={i}
                                        fill={COLORS[i % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}