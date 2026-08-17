import {useState} from "react";
import api from "../api/axios";
import {useNavigate} from "react-router-dom";

export default function Signup(){

    const nav=useNavigate();

    const [form,setForm]=useState({
        name:"",
        email:"",
        password:""
    });

    const submit=async()=>{

        await api.post("/api/auth/signup",form);

        nav("/login");
    };

    return(
        <div className="flex items-center justify-center min-h-screen bg-black text-white">

            <div className="w-96 p-8 rounded-2xl bg-white/10">

                <h1 className="text-3xl mb-5">
                    Signup
                </h1>

                <input
                    className="w-full p-3 mb-3 bg-black/20"
                    placeholder="Name"
                    onChange={e=>setForm({...form,name:e.target.value})}
                />

                <input
                    className="w-full p-3 mb-3 bg-black/20"
                    placeholder="Email"
                    onChange={e=>setForm({...form,email:e.target.value})}
                />

                <input
                    type="password"
                    className="w-full p-3 mb-5 bg-black/20"
                    placeholder="Password"
                    onChange={e=>setForm({...form,password:e.target.value})}
                />

                <button
                    onClick={submit}
                    className="w-full bg-indigo-600 p-3 rounded-lg"
                >
                    Create Account
                </button>

            </div>

        </div>
    )
}