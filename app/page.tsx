'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {auth} from "@/lib/firebase"

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.getIdToken(true); // Sprawdza, czy user nie został usunięty
          router.replace("/home");
        } catch {
          await auth.signOut();
          router.replace("/login");
        }
      } else {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Zamiast null, dajemy tło aplikacji, żeby przejście było płynne
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}


// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "@/lib/firebase";

// export default function RootPage() {
//   const router = useRouter();


//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         router.replace("/home");
//       } else {
//         router.replace("/login");
//       }
//     });

//     return () => unsubscribe();
//   }, []);

  

//   return null;
// }