import { useState } from "react";

function ItineraryPlanner() {
  const [activity, setActivity] = useState("");
  const [activities, setActivities] = useState([]);

  function addActivity() {
    const trimmed = activity.trim();
    if (!trimmed) return;

    setActivities((prev) => [...prev, trimmed]);
    setActivity("");
  }

  function removeActivity(index) {
    setActivities((prev) =>
      prev.filter((_, i) => i !== index)
    );
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
        />

        <button onClick={addActivity}>
          Add
        </button>
      </div>

      <ul className="activity-list">
        {activities.length === 0 ? (
          <p className="empty">
            No activities added yet
          </p>
        ) : (
          activities.map((item, index) => (
            <li key={index}>
              {item}

              <button
                className="delete-btn"
                onClick={() => removeActivity(index)}
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