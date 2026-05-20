import {useState} from "react";
import api from "../api/axios";

export default function Chatbot(){
    const [message,setMessage]=useState("");
    const [chat,setChat]=useState([]);
    const [loading,setLoading]=useState(false);

    const send=async()=>{
        if(!message.trim()) return;

        const userMessage=message;

        setChat(prev=>[
            ...prev,
            {
                type:"user",
                text:userMessage
            }
        ]);

        setMessage("");
        setLoading(true);

        try{
            const res=await api.post(
                "/api/chatbot",
                {
                    message:userMessage
                }
            );

            setChat(prev=>[
                ...prev,
                {
                    type:"bot",
                    text:res.data.response
                }
            ]);
        }catch(err){
            setChat(prev=>[
                ...prev,
                {
                    type:"bot",
                    text:"Error generating response"
                }
            ]);
        }
        setLoading(false);
    };

    return(
        <div className="bg-white/10 rounded-3xl p-6">
            <div className="h-[500px] overflow-auto mb-5 space-y-4">
                {chat.map((c,i)=>(
                    <div
                        key={i}
                        className={`p-4 rounded-2xl max-w-[80%]
                        ${c.type==="user"
                            ? "bg-indigo-600 ml-auto"
                            : "bg-white/10"
                        }`}
                    >
                        {c.text}
                    </div>
                ))}

                {loading && (
                    <div className="bg-white/10 p-4 rounded-2xl w-fit">
                        Thinking...
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <input
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                    onKeyDown={e=>{
                        if(e.key==="Enter"){
                            send();
                        }
                    }}
                    placeholder="Ask financial questions..."
                    className="flex-1 p-4 rounded-2xl bg-black/20 outline-none"
                />

                <button
                    onClick={send}
                    className="bg-indigo-600 px-6 rounded-2xl"
                >
                    Send
                </button>
            </div>
        </div>
    )
}