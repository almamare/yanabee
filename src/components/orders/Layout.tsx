import React from 'react';

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Props) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <nav style={{ width: 250, background: '#f0f0f0', padding: '1rem' }}>
                <h2>Menu</h2>
                <ul>
                    <li>Orders</li>
                    <li>History</li>
                    <li>Settings</li>
                </ul>
            </nav>
            <main style={{ flex: 1, padding: '1rem' }}>
                {children}
            </main>
        </div>
    );
}