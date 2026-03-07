// src/components/BorrowedItemCard.js
import React, { useState } from "react";
import "./BorrowedItemCard.css";

const BorrowedItemCard = ({ item, onReturn }) => {
  const [returning, setReturning] = useState(false);

  const handleReturn = async () => {
    if (!window.confirm("Are you sure you want to return this item?")) return;

    setReturning(true);
    try {
      const response = await fetch(`http://localhost:5000/api/borrow/return/${item.borrow_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": item.student_id, // For temporary auth
          role: "student",            // Temporary role header
        },
        body: JSON.stringify({
          condition_status: "Good",
          remarks: "",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Device returned successfully!");
        onReturn(item.borrow_id); // callback to update parent state
      } else {
        alert(data.message || "Error returning device");
      }
    } catch (error) {
      console.error("Return failed:", error);
      alert("Error returning device");
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="borrowed-item-card">
      <h3>{item.device_name}</h3>
      <p><strong>Status:</strong> {item.borrow_status}</p>
      <p><strong>Borrow Start:</strong> {item.borrow_start_date}</p>
      <p><strong>Due Date:</strong> {item.borrow_end_date}</p>
      <button onClick={handleReturn} disabled={returning || item.borrow_status === "Returned"}>
        {returning ? "Returning..." : item.borrow_status === "Returned" ? "Returned" : "Return Device"}
      </button>
    </div>
  );
};

export default BorrowedItemCard;
