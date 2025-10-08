import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({ children, title, subtitle, buttonLabel, onButtonClick }) => {
    const { signOut, user } = useAuth();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { error } = await signOut();
            if (error) {
                showError(error.message);
            } else {
                success('Successfully logged out');
                navigate('/login');
            }
        } catch (err) {
            showError('Failed to log out');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {(title || subtitle || buttonLabel) && (
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            {title && (
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-lg text-gray-600">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {user && (
                                <span className="text-sm text-gray-700 mr-2">
                                    {user.email}
                                </span>
                            )}
                            
                            {buttonLabel && (
                                <button
                                    onClick={onButtonClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
                                >
                                    {buttonLabel}
                                </button>
                            )}
                            
                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

export { PageLayout };
