"use client";
import { useAuth } from "@/core/providers/AuthProvider";

// Pagina de prueba

export default function Home() {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <p>Usuario actual: { user ?? "Nadie logueado" }</p>
      <button onClick={() => {
        login("demo@ecometrix.com", "aaa");
      }
      }>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}