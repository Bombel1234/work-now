export default function Spinner(){
    return(
        <div className="h-screen w-screen bg-black flex justify-center items-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-500"></div>
        </div>
    )
}