'use client';
import "@/styles/globals.css";
import "@/styles/styles.css";
import ApolloProvider from "@/components/ApolloProvider";
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie'; // For cookie-based token storage



export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    // State to manage sidebar visibility
    return (
        <html lang="ar" dir="rtl">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="stylesheet" href="https://cdn.elhamaad.com/assets/plugins/fontawesome-pro/css/all.min.css" />
            </head>
            <body>
                <ApolloProvider >
                    {children}
                </ApolloProvider>
            </body>
        </html>
    );
}
