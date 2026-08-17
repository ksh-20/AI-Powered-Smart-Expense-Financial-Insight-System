import Sidebar from "../components/Sidebar";

export default function MainLayout({children}){
    return(
        <div className="flex bg-gradient-to-br from-slate-900 to-black text-white min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-6">
                {children}
            </div>
        </div>
    )
}