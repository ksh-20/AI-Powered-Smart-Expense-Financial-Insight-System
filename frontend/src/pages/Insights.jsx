import {useEffect,useState} from "react";
import api from "../api/axios";

export default function Insights(){

    const [data,setData]=useState(null);

    useEffect(()=>{
        api.get("/api/insights")
        .then(res=>setData(res.data));
    },[]);

    if(!data) return <p>Loading...</p>

    return(
        <div>

            <h1 className="text-3xl mb-8">
                Smart Insights
            </h1>

            <div className="grid gap-4">

                {data.recommendations.map((r,i)=>(
                    <div
                        key={i}
                        className="bg-indigo-500/20 p-5 rounded-2xl"
                    >
                        {r}
                    </div>
                ))}

            </div>

        </div>
    )
}