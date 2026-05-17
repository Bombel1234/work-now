"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { pl } from "react-day-picker/locale";
import { Tags } from "lucide-react"
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Spinner from "../components/spinner";
// 🔥 Firebase
import { auth } from "@/lib/firebase";
import {
    getFirestore,
    collection,
    getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const db = getFirestore();
type ShiftId = "morning" | "afternoon" | "night" | "weekend";
type ShiftEntry = {
    shift: ShiftId;
    hours: number;
};

const parseDbDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

const formatDateForDB = (date: Date) => format(date, "yyyy-MM-dd");

const isSameMonth = (date: Date, month: Date) => {
    return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
};

export default function ShiftCalendarPage() {
    const [data, setData] = useState<Record<string, ShiftEntry>>({});
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [dayDialog, setDayDialog] = useState<{ date: Date; entry?: ShiftEntry } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    // ✅ ЖДЁМ пользователя (фикс твоей ошибки)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const ref = collection(db, "users", user.uid, "shifts");
                const snapshot = await getDocs(ref);

                const result: Record<string, ShiftEntry> = {};

                snapshot.forEach((doc) => {
                    const d = doc.data();
                    result[d.date] = {
                        shift: d.shift,
                        hours: typeof d.hours === "number" ? d.hours : 8,
                    };
                });

                setData(result);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // 📊 статистика
    const stats = useMemo(() => {
        const counts = {
            morning: 0,
            afternoon: 0,
            night: 0,
            total: 0,
            hours: 0,
        };

        Object.entries(data).forEach(([dateKey, entry]) => {
            if (!isSameMonth(parseDbDate(dateKey), calendarMonth)) {
                return;
            }

            counts.hours += entry.hours;
            const shift = entry.shift;
            if (counts[shift as keyof typeof counts] !== undefined) {
                counts[shift as keyof typeof counts]++;
                counts.total++;
            }
        });

        return counts;
    }, [data, calendarMonth]);

    const handleDayClick = (day: Date, _modifiers: unknown, event: React.MouseEvent) => {
        if (event.detail !== 2) {
            return;
        }

        setDayDialog({
            date: day,
            entry: data[formatDateForDB(day)],
        });
    };

    // 🎯 modifiers
    const modifiers = useMemo(() => {
        return {
            morning: Object.keys(data)
                .filter((d) => data[d].shift === "morning")
                .map(parseDbDate),
            afternoon: Object.keys(data)
                .filter((d) => data[d].shift === "afternoon")
                .map(parseDbDate),
            night: Object.keys(data)
                .filter((d) => data[d].shift === "night")
                .map(parseDbDate),
        };
    }, [data]);

    const modifiersClassNames = {
        morning: "bg-yellow-200 text-black border-2",
        afternoon: "bg-pink-300 text-black border-2",
        night: "bg-blue-400 text-black border-2 border-black",
    };

    if (loading) {
        return (
            <Spinner/>
            
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20"
                >
                    <div className="flex mb-4 gap-4">
                        <button onClick={() => router.push('/dashboard')}>
                           <Tags size={35} color="red"/> 
                        </button>
                        
                        <h1 className="text-2xl font-bold text-white uppercase ">
                            Grafik pracy 📅
                        </h1>                      
                    </div>

                    <div className="mb-4 bg-white text-black rounded-xl p-2">
                        <DayPicker
                            modifiers={modifiers}
                            modifiersClassNames={modifiersClassNames}
                            locale={pl}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            onDayClick={handleDayClick}
                        />
                    </div>
                    <div className="mb-4 text-center text-gray-300">
                        Statystyka za:{" "}
                        <span className="font-semibold text-white capitalize">
                            {calendarMonth.toLocaleDateString("pl-PL", {
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                    <div>
                        <div className="bg-white/10 p-3 rounded-xl mb-4 flex justify-between">
                            <span className="text-2xl">🌅</span>
                            <div className="text-white text-[22px]">Pierwsza zmiana: {stats.morning} dni</div>
                            <div className="w-4 h-10 bg-yellow-200 rounded-sm shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl mb-4 flex justify-between">
                            <span className="text-2xl">☀️</span>
                            <div className="text-white text-[22px]">Druga zmiana: {stats.afternoon} dni</div>
                            <div className="w-4 h-10 bg-pink-300 rounded-sm shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl mb-4 flex justify-between">
                            <span className="text-2xl">🌙</span>
                            <div className="text-white text-[22px]">Trzecia zmiana: {stats.night} dni</div>
                            <div className="w-4 h-10 bg-blue-400 rounded-sm shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl text-white text-[20px] font-bold">
                            Razem przepracowano: <span className="px-4 text-yellow-500">{stats.total} dni</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl mt-4 text-white text-[20px] font-bold">
                            Godziny w miesiącu: <span className="px-4 text-yellow-500">{stats.hours} h</span>
                        </div>
                    </div>
                </motion.div>
            </div >
            {dayDialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setDayDialog(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border border-white/20 bg-gray-900 p-6 text-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 className="mb-2 text-xl font-bold">Godziny pracy</h2>
                        <p className="mb-4 text-gray-300 capitalize">
                            {dayDialog.date.toLocaleDateString("pl-PL", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                        <p className="mb-6 text-3xl font-bold text-yellow-400">
                            {dayDialog.entry ? `${dayDialog.entry.hours} h` : "Brak wpisu"}
                        </p>
                        <button
                            className="w-full rounded-xl bg-white py-3 font-semibold text-black transition hover:scale-105"
                            onClick={() => setDayDialog(null)}
                        >
                            Zamknij
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
}

