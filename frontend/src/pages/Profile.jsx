import {useEffect,useState} from "react";
import api from "../api/axios";

export default function Profile(){

    const [profile,setProfile]=useState(null);

    useEffect(()=>{
        api.get("/api/profile")
        .then(res=>setProfile(res.data));
    },[]);

    if(!profile) return <p>Loading...</p>

    return(
        <div className="bg-white/10 p-8 rounded-2xl max-w-xl">

            <h1 className="text-3xl mb-6">
                Profile
            </h1>

            <div className="space-y-4">
                <p>Name: {profile.name}</p>
                <p>Email: {profile.email}</p>
            </div>

        </div>
    )
}