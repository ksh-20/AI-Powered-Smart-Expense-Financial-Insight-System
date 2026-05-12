import {useEffect,useState} from "react";
import api from "../api/axios";
import ExpenseTable from "../components/ExpenseTable";
import Loading from "../components/Loading";

export default function Expenses(){

    const [expenses,setExpenses]=useState([]);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        api.get("/api/expenses")
        .then(res=>{
            setExpenses(res.data);
            setLoading(false);
        });
    },[]);

    if(loading) return <Loading/>

    return(
        <div>

            <h1 className="text-3xl mb-5">
                Expenses
            </h1>

            <ExpenseTable expenses={expenses}/>

        </div>
    )
}