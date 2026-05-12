export default function ExpenseTable({expenses}){

    return(
        <div className="overflow-auto rounded-2xl">

            <table className="w-full bg-white/10">

                <thead>
                    <tr className="text-left">
                        <th className="p-4">Description</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Date</th>
                    </tr>
                </thead>

                <tbody>
                    {expenses.map(e=>(
                        <tr key={e.id} className="border-t border-white/10">
                            <td className="p-4">{e.description}</td>
                            <td className="p-4">{e.category}</td>
                            <td className="p-4">₹{e.amount}</td>
                            <td className="p-4">{e.date}</td>
                        </tr>
                    ))}
                </tbody>

            </table>

        </div>
    )
}