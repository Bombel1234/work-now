"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { pl } from "react-day-picker/locale";
import { Toaster, toast } from 'sonner'
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/lib/firebase"
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// 💼 Тип смен (три смены)
const shifts = [
  { id: "morning", label: "1 zmiana 🌅" },
  { id: "afternoon", label: "2 zmiana ☀️" },
  { id: "night", label: "3 zmiana 🌙" },
  { id: "weekend", label: "Weekend 🥂" },
];

const db = getFirestore();

export default function ShiftTracker() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [hours, setHours] = useState(8);
  const router = useRouter();


  const formatDateForDB = (d: Date) => {
    return format(d, "yyyy-MM-dd");
  };

  const handleShiftSelect = (shiftId: string) => {
    setSelectedShift(shiftId);
    if (shiftId === "weekend") {
      setHours(0);
    } else if (selectedShift === "weekend" && hours === 0) {
      setHours(8);
    }
  };

  const handleSave = async () => {
    try {
      const finalDate = date || new Date();

      if (!selectedShift) {
        toast.error("Wybierz zmianę", {
          id: 'shift-error',
          description: "Musisz wybrać 1, 2 lub 3 zmianę.",
        });
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        toast.error("Błąd: Nie jesteś zalogowany");
        return;
      }

      const formattedDate = formatDateForDB(finalDate);
      const workHours = selectedShift === "weekend"
        ? 0
        : Number.isFinite(hours) && hours > 0 ? hours : 8;

      // Ścieżka: users/{userId}/shifts/{YYYY-MM-DD}
      const ref = doc(db, "users", user.uid, "shifts", formattedDate);

      await setDoc(ref, {
        shift: selectedShift,
        hours: workHours,
        date: formattedDate,
        createdAt: new Date(), // Czas zapisu dla sortowania
      });

      toast.success(`Zapisano: ${formattedDate}`, {
        description: `Zmiana: ${shifts.find(s => s.id === selectedShift)?.label}, godziny: ${workHours}`
      });

      // Czyścimy tylko wybór zmiany, datę zostawiamy (wygodniejsze dla usera)
      setSelectedShift(null);
      setTimeout(() => {
        router.push('/home')
      }, 3000)

    } catch (error) {
      console.error("Save error:", error);
      toast.error("Błąd zapisu do bazy");
    }
  };
  const handleBackHome = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-white py-4 px-4 flex">
        <button
          onClick={handleBackHome}
        >
          <ChevronLeft size={40} />
        </button>
        <p className="text-2xl py-2 ml-4">Powrot</p>
      </div>
      <div className=" flex items-center justify-center p-4">
        <Toaster position="top-center" richColors
          toastOptions={{
            style: {
              fontSize: '18px', // Увеличиваем основной текст
              padding: '16px',  // Добавляем отступов, чтобы кнопка выглядела пропорционально
            },
            descriptionClassName: 'text-lg', // Если используешь description, это увеличит и его
          }}
          visibleToasts={1}
        />

        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20"
          >
            <h1 className="text-2xl font-bold text-white text-center mb-4">
              Wybierz datę  i zmianę  📅
            </h1>

            {/* 📅 Calendar */}
            <div className="mb-4 bg-white text-black rounded-xl p-2">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={pl}
              />
            </div>
            {/* 📍 Wybrana data */}
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm">Wybrana data:</p>
              <p className="text-white font-semibold capitalize">
                {date ? format(date, "EEEE, d MMMM yyyy", { locale: pl }) : "Nie wybrano"}
              </p>
            </div>

            {/* 🔄 Shift selection */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {shifts.map((shift) => (
                <button
                  key={shift.id}
                  onClick={() => handleShiftSelect(shift.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition ${selectedShift === shift.id
                      ? "bg-white text-black"
                      : "bg-white/20 text-white hover:bg-white/30"
                    } ${shift.id === "weekend" ? "col-span-3" : "" // Rozciąga weekend na 3 kolumny
                    }`}
                >
                  {shift.label}
                </button>
              ))}
            </div>
            <label className="block mb-4">
              <span className="block text-sm font-medium text-gray-300 mb-2">
                Liczba godzin w tym dniu
              </span>
              <input
                type="text"
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="w-full rounded-xl bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </label>
            {/* 💾 Save */}
            <button
              onClick={handleSave}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Zapisz do kalendarza
            </button>
          </motion.div>
        </div>
      </div>
    </div>

  );
}

