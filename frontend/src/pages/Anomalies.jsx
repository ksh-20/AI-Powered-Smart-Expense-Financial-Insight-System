import {useEffect,useState} from "react";
import api from "../api/axios";

export default function Anomalies(){

    const [anomalies,setAnomalies]=useState([]);

    useEffect(()=>{
        api.get("/api/anomaly")
        .then(res=>setAnomalies(res.data));
    },[]);

    return(
        <div>

            <h1 className="text-3xl mb-8">
                Spending Anomalies
            </h1>

            <div className="grid gap-4">

                {anomalies.map((a,i)=>(
                    <div
                        key={i}
                        className="bg-red-500/20 border border-red-500 p-5 rounded-2xl"
                    >
                        <p>
                            Suspicious transaction detected
                        </p>

                        <p>
                            Amount: ₹{a.amount}
                        </p>
                    </div>
                ))}

            </div>

        </div>
    )
}