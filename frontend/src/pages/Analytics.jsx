import {useEffect,useState} from "react";
import api from "../api/axios";

import {
    PieChart,
    Pie,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis
} from "recharts";

export default function Analytics(){

    const [data,setData]=useState(null);

    useEffect(()=>{
        api.get("/api/analytics")
        .then(res=>setData(res.data));
    },[]);

    if(!data) return <p>Loading...</p>

    return(
        <div>

            <h1 className="text-3xl mb-8">
                Analytics
            </h1>

            <div className="grid md:grid-cols-2 gap-10">

                <div className="bg-white/10 p-5 rounded-2xl">
                    <PieChart width={350} height={300}>
                        <Pie
                            data={data.categories}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                        />
                        <Tooltip/>
                    </PieChart>
                </div>

                <div className="bg-white/10 p-5 rounded-2xl">
                    <BarChart width={400} height={300} data={data.categories}>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="value"/>
                    </BarChart>
                </div>

            </div>

        </div>
    )
}