export default function Card({title,value}){
    return(
        <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl shadow-lg">
            <h2 className="text-gray-300">{title}</h2>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    )
}