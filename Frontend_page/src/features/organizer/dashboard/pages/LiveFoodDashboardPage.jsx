import { useEffect, useState } from "react";
import axios from "axios";
import { getevent } from "@/Services/api";
import { Select, SelectItem } from "@/components/ui/Select";
import {
  Coffee,
  Utensils,
  Pizza,
  Moon,
  Users,
  Store,
  UserPlus
} from "lucide-react";

export const LiveFoodDashboard = () => {

  const [events, setEvents] = useState([]);

  const [event, setEvent] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealType, setMealType] = useState("");

  const [data, setData] = useState({
    guests_inside: 0,
    total_capacity: 0,
    waiting_outside: 0
  });

  // ------------------------
  // LOAD EVENTS
  // ------------------------

  const getEvents = async () => {

    const res = await getevent();

    setEvents(res.data);
  };

  useEffect(() => {
    getEvents();
  }, []);


  // ------------------------
  // GET LIVE FOOD DATA
  // ------------------------

  const getFoodCount = async () => {

    const res = await getFoodCount({
      event_id: event,
      meal_time: mealTime,
      meal_type: mealType
    });

    setData(res.data.data);
  };


  useEffect(() => {

    if (event && mealTime && mealType) {
      getFoodCount();
    }

  }, [event, mealTime, mealType]);


  // ------------------------
  // ICON CHANGE
  // ------------------------

  const mealIcon = () => {

    if (mealTime === "Breakfast") return <Coffee size={70} />
    if (mealTime === "Lunch") return <Utensils size={70} />
    if (mealTime === "Snacks") return <Pizza size={70} />
    if (mealTime === "Dinner") return <Moon size={70} />
    return <Store size={70} />;
  };


  return (

    <div className="p-10 bg-gray-100 min-h-screen">

      {/* TITLE */}

      <h1 className="text-3xl font-bold mb-6">
        Live Food Count
      </h1>


      {/* FILTERS */}

      <div className="flex gap-4 mb-10">

        {/* EVENT */}
        <Select
          value={event}
          onValueChange={(val) => {
            setEvent(val);
            setMealTime("");
            setMealType("");
          }}
          placeholder="Select Event"
          className="w-64"
          triggerClassName="h-11 bg-white border-slate-200 rounded-xl text-xs font-semibold focus:ring-cyan-500"
        >
          {events.map((ev) => (
            <SelectItem key={ev.id} value={String(ev.id)}>
              {ev.event_name}
            </SelectItem>
          ))}
        </Select>

        {/* MEAL TIME */}
        <Select
          disabled={!event}
          value={mealTime}
          onValueChange={(val) => {
            setMealTime(val);
            setMealType("");
          }}
          placeholder="Select Meal Time"
          className="w-64"
          triggerClassName="h-11 bg-white border-slate-200 rounded-xl text-xs font-semibold focus:ring-cyan-500"
        >
          <SelectItem value="Breakfast">Breakfast</SelectItem>
          <SelectItem value="Lunch">Lunch</SelectItem>
          <SelectItem value="Snacks">Snacks</SelectItem>
          <SelectItem value="Dinner">Dinner</SelectItem>
        </Select>

        {/* MEAL TYPE */}
        <Select
          disabled={!mealTime}
          value={mealType}
          onValueChange={(val) => setMealType(val)}
          placeholder="Select Meal Type"
          className="w-64"
          triggerClassName="h-11 bg-white border-slate-200 rounded-xl text-xs font-semibold focus:ring-cyan-500"
        >
          <SelectItem value="Veg">Veg</SelectItem>
          <SelectItem value="Non Veg">Non Veg</SelectItem>
        </Select>

      </div>


      {/* DASHBOARD CARDS */}

      <div className="grid grid-cols-3 gap-8">


        {/* INSIDE DINING */}

        <div className="bg-white p-8 rounded-xl shadow text-center">

          <h2 className="text-xl font-semibold mb-4">
            Guests Inside Dining Area
          </h2>

          <div className="flex justify-center text-indigo-600">
            <Users size={70} />
          </div>

          <p className="text-5xl font-bold mt-5">
            {data.guests_inside}
          </p>

        </div>



        {/* TOTAL CAPACITY */}

        <div className="bg-white p-8 rounded-xl shadow text-center">

          <h2 className="text-xl font-semibold mb-4">
            Total Dining Capacity
          </h2>

          <div className="flex justify-center text-indigo-600">
            {mealIcon()}
          </div>

          <p className="text-5xl font-bold mt-5">
            {data.total_capacity}
          </p>

        </div>



        {/* WAITING OUTSIDE */}

        <div className="bg-white p-8 rounded-xl shadow text-center">

          <h2 className="text-xl font-semibold mb-4">
            Guests Waiting Outside
          </h2>

          <div className="flex justify-center text-indigo-600">
            <UserPlus size={70} />
          </div>

          <p className="text-5xl font-bold mt-5">
            {data.waiting_outside}
          </p>

        </div>


      </div>

    </div>
  );
}