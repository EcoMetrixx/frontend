import Providers from "@/core/providers"
import { Toaster } from "react-hot-toast"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          { children }
        </Providers>
        <Toaster position="top-right"></Toaster>
      </body>
    </html>
  )
}