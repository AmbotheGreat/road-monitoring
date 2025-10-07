import React from 'react';

const PageLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {(title || subtitle) && (
                    <div className="mb-8">
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
                )}
                {children}
            </div>
        </div>
    );
};

export { PageLayout };
