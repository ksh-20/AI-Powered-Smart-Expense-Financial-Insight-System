import {useContext} from "react";
import {AuthContext} from "../context/AuthContext";

export default function Navbar(){

    const {logout}=useContext(AuthContext);

    return(
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
                AI Finance
            </h1>

            <button
                onClick={logout}
                className="bg-red-500 px-4 py-2 rounded-lg"
            >
                Logout
            </button>
        </div>
    )
}