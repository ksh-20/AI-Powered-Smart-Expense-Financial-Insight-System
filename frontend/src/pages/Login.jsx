import {useState,useContext} from "react";
import api from "../api/axios";
import {AuthContext} from "../context/AuthContext";
import {useNavigate,Link} from "react-router-dom";

export default function Login(){
    const [form,setForm]=useState({
        email:"",
        password:""
    });

    const {login}=useContext(AuthContext);
    const nav=useNavigate();

    const submit=async()=>{
        const res=await api.post("/api/auth/login",form);
        login(res.data.access_token);
        nav("/");
    };

    return(
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="bg-white/10 p-8 rounded-2xl w-96">
                <h1 className="text-3xl mb-5">Login</h1>

                <input
                    className="w-full p-3 mb-3 bg-black/30"
                    placeholder="Email"
                    onChange={e=>setForm({...form,email:e.target.value})}
                />

                <input
                    type="password"
                    className="w-full p-3 mb-3 bg-black/30"
                    placeholder="Password"
                    onChange={e=>setForm({...form,password:e.target.value})}
                />

                <button
                    onClick={submit}
                    className="w-full bg-indigo-600 p-3 rounded-lg"
                >
                    Login
                </button>

                <Link to="/signup">Signup</Link>
            </div>
        </div>
    )
}