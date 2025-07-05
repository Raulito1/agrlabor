export const Dashboard: React.FC = () => {
    return (
        <div className="flex flex-col h-screen">
            <header className="text-white p-4 bg-gradient-to-r from-blue-600 to-blue-400 shadow-md">
                <h1 className="text-xl font-bold">Agrilabor Dashboard</h1>
            </header>
            <main className="flex-1 p-6 bg-gray-100">
                <div className="container mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Welcome to the Dashboard</h2>
                    {/* Placeholder for dashboard content */}
                    <p className="text-gray-600">Dashboard content will be displayed here.</p>
                </div>
            </main>
        </div>
    );
}