import Providers from "@/core/providers"
import { Toaster } from "react-hot-toast"

export const metadata = {
  title: "Ecometrix",
  description: "Web destianda a inmobiliaras que financian hogares a traves de los bonos Mi Vivienda y Techo Propio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          { children }
        </Providers>
        <Toaster position="top-right"></Toaster>
      </body>
    </html>
  )
}