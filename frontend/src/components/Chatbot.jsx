import {useState} from "react";
import api from "../api/axios";

export default function Chatbot(){

    const [message,setMessage]=useState("");
    const [chat,setChat]=useState([]);

    const send=async()=>{

        if(!message) return;

        const res=await api.post("/api/chatbot",{
            message
        });

        setChat([
            ...chat,
            {
                q:message,
                a:res.data.response
            }
        ]);

        setMessage("");
    };

    return(
        <div className="bg-white/10 p-5 rounded-2xl">

            <div className="h-96 overflow-auto mb-5">

                {chat.map((c,i)=>(
                    <div key={i} className="mb-4">
                        <p className="font-bold">You:</p>
                        <p>{c.q}</p>

                        <p className="font-bold mt-2">AI:</p>
                        <p>{c.a}</p>
                    </div>
                ))}

            </div>

            <div className="flex gap-2">
                <input
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-black/20"
                    placeholder="Ask financial questions..."
                />

                <button
                    onClick={send}
                    className="bg-indigo-600 px-5 rounded-lg"
                >
                    Send
                </button>
            </div>

        </div>
    )
}