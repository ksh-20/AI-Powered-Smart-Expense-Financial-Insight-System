import {useEffect,useState} from "react";
import api from "../api/axios";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

export default function Forecast(){

    const [forecast,setForecast]=useState([]);

    useEffect(()=>{
        api.get("/api/forecast")
        .then(res=>{

            const formatted=res.data.forecast.map((v,i)=>({
                month:`M${i+1}`,
                value:v
            }));

            setForecast(formatted);
        });
    },[]);

    return(
        <div>

            <h1 className="text-3xl mb-8">
                Forecast
            </h1>

            <div className="bg-white/10 p-5 rounded-2xl">

                <LineChart width={700} height={300} data={forecast}>
                    <XAxis dataKey="month"/>
                    <YAxis/>
                    <Tooltip/>
                    <Line type="monotone" dataKey="value"/>
                </LineChart>

            </div>

        </div>
    )
}