import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

function ItineraryPlanner() {
  const { currentUser } = useAuth();
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    async function initListener() {
      // If user is not logged in, reset state and exit safely
      if (!currentUser) {
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const q = query(
          collection(db, "itineraries"),
          where("userId", "==", currentUser.uid)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setActivities(items);
            setLoading(false);
          },
          (error) => {
            console.warn(
              "Itinerary Planner stream offline/unreachable:",
              error.message
            );

            setActivities([]);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Failed to initialize Firestore listener:", error);
        setActivities([]);
        setLoading(false);
      }
    }

    initListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  async function addActivity() {
    const trimmed = activity.trim();
    if (!trimmed || !currentUser) return;

    try {
      await addDoc(collection(db, "itineraries"), {
        activity: trimmed,
        userId: currentUser.uid,
        createdAt: new Date(),
      });

      setActivity("");
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  }

  async function removeActivity(id) {
    try {
      await deleteDoc(doc(db, "itineraries", id));
    } catch (error) {
      console.error("Error removing activity:", error);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      addActivity();
    }
  }

  return (
    <div className="card">
      <h2>Itinerary Planner</h2>

      <div className="planner-input">
        <input
          type="text"
          placeholder="Add activity"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={addActivity}>Add</button>
      </div>

      <ul className="activity-list">
        {loading ? (
          <p className="empty">Loading activities...</p>
        ) : activities.length === 0 ? (
          <p className="empty">No activities added yet</p>
        ) : (
          activities.map((item) => (
            <li key={item.id}>
              {item.activity}
              <button
                className="delete-btn"
                onClick={() => removeActivity(item.id)}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ItineraryPlanner;