"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import Spinner from "../components/spinner";

// 🔥 ВАЖНО: используем единый firebase instance
import { auth, provider} from "@/lib/firebase"

import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

export default function GoogleAuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/home");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      if (!auth || !provider) {
        throw new Error("Firebase не инициализирован");
      }

      const result = await signInWithPopup(auth, provider);

      console.log("User:", result.user);
      router.push("/home");
    } catch (error) {
      console.error("Auth error:", error);

      const authError = error as { code?: string; message?: string };

      if (authError.code === "auth/popup-blocked") {
        alert("Popup заблокирован браузером");
      } else if (authError.code === "auth/cancelled-popup-request") {
        alert("Окно авторизации закрыто");
      } else {
        alert(authError.message || "Ошибка авторизации");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-2 flex items-center justify-center gradient-to-br from-gray-900 via-gray-800 to-black">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
      >
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Welcome Back 👋
        </h1>

        <p className="text-gray-300 text-center mb-8 text-sm">
          Zaloguj się bezpiecznie, używając swojego konta Google
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-xl hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        <div className="mt-6 text-center text-xs text-gray-400">
          Kontynuując, akceptujesz nasze Warunki i Politykę prywatności
        </div>
      </motion.div>
    </div>
  );
}

// =============================
// ✅ СОЗДАЙ ОТДЕЛЬНЫЙ ФАЙЛ:
// /lib/firebase.ts
// =============================

/*
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
*/

// =============================
// ❗ ПОЧЕМУ БЫЛА ОШИБКА
// =============================
// RootPage вызывал getAuth() БЕЗ initializeApp()
// теперь у тебя единая точка инициализации

// =============================
// ✅ ТЕСТЫ
// =============================
// 1. Нет ошибки "No Firebase App"
// 2. Первый заход → логин
// 3. Авторизован → редирект
// 4. Всё работает после refresh
