import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers/providers"
import { Toaster as SonnToaster } from "sonner";
import { ToastContainer } from "react-toastify";
import { IoMdAlert, IoMdCheckmarkCircle, IoMdCloseCircle, IoMdInformationCircle } from "react-icons/io";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: "Gas Management System",
    template: "%s | Gas Management System",
  },
  description: "Gas Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="w-screen h-screen overflow-y-hidden bg-background font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
          <Toaster />
          <SonnToaster
            position="top-right"
            duration={5000}
            richColors
            icons={{
              success: <IoMdCheckmarkCircle className="text-green-500" size={20} />,
              error: <IoMdCloseCircle className="text-red-500" size={20} />,
              warning: <IoMdAlert className="text-yellow-500" size={20} />,
              info: <IoMdInformationCircle className="text-blue-500" size={20} />,
            }}
          />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Providers>
      </body>
    </html>
  )
}
