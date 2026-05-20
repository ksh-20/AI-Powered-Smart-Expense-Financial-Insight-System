import {useState,useContext} from "react";
import api from "../api/axios";
import {AuthContext} from "../context/AuthContext";
import {useNavigate, Link} from "react-router-dom";

export default function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");

    const {login}=useContext(AuthContext);
    const navigate=useNavigate();

    const submit=async()=>{
        try{
            const formData=new URLSearchParams();

            formData.append("username",email);
            formData.append("password",password);

            const res=await api.post(
                "/api/auth/login",
                formData,
                {
                    headers:{
                        "Content-Type":
                        "application/x-www-form-urlencoded"
                    }
                }
            );
            login(res.data.access_token);
            navigate("/");
        }catch(err){
            setError("Invalid credentials");
            console.error(err);
        }
    };

    return(
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="w-96 bg-white/10 p-8 rounded-3xl">
                <h1 className="text-4xl font-bold mb-8"> Login </h1>

                {error && (
                    <div className="bg-red-500/20 p-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    className="w-full p-4 mb-4 rounded-xl bg-black/20 outline-none"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    className="w-full p-4 mb-6 rounded-xl bg-black/20 outline-none"
                />

                <button
                    onClick={submit}
                    className="w-full bg-indigo-600 p-4 rounded-xl"
                >
                    Login
                </button>

                <Link
                    to="/signup"
                    className="block mt-5 text-center text-indigo-400"
                >
                    Create account
                </Link>
            </div>
        </div>
    )
}