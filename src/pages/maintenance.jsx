import React from "react";
import { Wrench, Clock } from "lucide-react";

const MaintenancePage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-6">
            <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full">
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full">
                        <Wrench className="w-10 h-10 animate-spin-slow" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    We’ll be back soon!
                </h1>
                <p className="text-gray-600 mb-6">
                    Our system is currently undergoing scheduled maintenance.
                    Please check back later — we’ll be up and running shortly.
                </p>
                <div className="flex items-center justify-center text-gray-500">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm">Estimated downtime: a few minutes</span>
                </div>
            </div>

            <footer className="mt-8 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} AmboTheGreat. All rights reserved.
            </footer>
        </div>
    );
};

export default MaintenancePage;
