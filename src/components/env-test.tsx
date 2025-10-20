'use client';

import { useState } from 'react';

export function EnvTest() {
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testEnvironment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-env');
            const data = await response.json();
            setTestResult(data);
            console.log('Environment test result:', data);
        } catch (error: any) {
            console.error('Environment test failed:', error);
            setTestResult({
                success: false,
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Environment Test</h3>
            <button
                onClick={testEnvironment}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Environment Variables'}
            </button>
            
            {testResult && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Test Results:</h4>
                    <pre className="bg-white p-3 rounded border text-sm overflow-auto">
                        {JSON.stringify(testResult, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
