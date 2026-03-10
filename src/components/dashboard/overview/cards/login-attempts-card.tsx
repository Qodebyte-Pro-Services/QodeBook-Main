import { AiOutlineLogin } from "react-icons/ai";

const LoginAttemptsCard = () => {
    return(
        <div className="w-full py-2 bg-template-card-attempts rounded-sm text-white">
            <div className="flex flex-col gap-y-3 px-3">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-1">
                        <AiOutlineLogin size={18} />
                        <div className="text-sm font-[550]">Logining Attempts</div>
                    </div>
                    <button className="bg-transparent border border-white px-1 rounded-full self-start text-xs">
                        6 Today
                    </button>
                </div>
                <div className="w-full px-3 py-1 mt-3 bg-white/30">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-y-3 text-center">
                            <div className="text-xs font-[550]">Successful</div>
                            <div className="text-sm font-[550]">3</div>
                        </div>
                        <div className="flex flex-col gap-y-3 text-center">
                            <div className="text-xs font-[550]">Failed</div>
                            <div className="text-sm font-[550]">3</div>
                        </div>
                    </div>
                </div>
                <div className="px-3 flex flex-col gap-y-2">
                    <button className="py-1 px-3 rounded-sm bg-white text-template-primary text-xs">View Login History</button>
                    <div className="h-0 5 w-full bg-white" />
                    <div className="text-xs font-[550]">View and manage all customer orders</div>
                </div>
            </div>
        </div>
    );
}

export default LoginAttemptsCard;