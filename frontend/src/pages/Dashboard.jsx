import {useEffect,useState} from "react";
import api from "../api/axios";
import Card from "../components/Card";
import {
    PieChart,
    Pie,
    Tooltip,
    Cell
} from "recharts";

export default function Dashboard(){

    const [data,setData]=useState(null);

    useEffect(()=>{
        api.get("/api/analytics")
        .then(res=>setData(res.data));
    },[]);

    if(!data) return <p>Loading...</p>

    return(
        <div>
            <h1 className="text-3xl mb-5">Dashboard</h1>

            <div className="grid grid-cols-3 gap-5">
                <Card title="Total Spending" value={`₹${data.total}`}/>
            </div>

            <div className="bg-white/10 mt-10 p-5 rounded-2xl">
                <PieChart width={400} height={300}>
                    <Pie
                        data={data.categories}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                    >
                        {data.categories.map((e,i)=>(
                            <Cell key={i}/>
                        ))}
                    </Pie>
                    <Tooltip/>
                </PieChart>
            </div>
        </div>
    )
}