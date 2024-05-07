import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@mantine/core/styles.css";
import "./globals.css";
import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "James Hoang",
    description: "James Hoang's Personal Website",
};

const myColor: MantineColorsTuple = [
    "#e1f9ff",
    "#ccedff",
    "#9ad7ff",
    "#64c1ff",
    "#3baefe",
    "#20a2fe",
    "#099cff",
    "#0088e4",
    "#0078cd",
    "#0069b6",
];

const theme = createTheme({
    colors: {
        myColor,
    },
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <MantineProvider theme={theme}>{children}</MantineProvider>
            </body>
        </html>
    );
}
