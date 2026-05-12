import {Link} from "react-router-dom";

export default function Sidebar(){
    return(
        <div className="w-64 min-h-screen bg-black/30 p-5">
            <h1 className="text-2xl font-bold mb-10">FinAI</h1>

            <div className="flex flex-col gap-4">
                <Link to="/">Dashboard</Link>
                <Link to="/expenses">Expenses</Link>
                <Link to="/analytics">Analytics</Link>
                <Link to="/forecast">Forecast</Link>
                <Link to="/anomalies">Anomalies</Link>
                <Link to="/assistant">Assistant</Link>
            </div>
        </div>
    )
}