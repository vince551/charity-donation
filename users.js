// js/tournaments.js
import { db } from './firebase.js';
import { collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Fetch and render all tournaments
export async function loadTournaments() {
  const tableBody = document.getElementById('tournamentsList');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

  try {
    const querySnapshot = await getDocs(collection(db, "tournaments"));
    tableBody.innerHTML = '';

    if (querySnapshot.empty) {
      tableBody.innerHTML = '<tr><td colspan="5">No tournaments found.</td></tr>';
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const tournament = docSnap.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${tournament.name || 'Unnamed'}</td>
        <td>${tournament.type || 'Knockout'}</td>
        <td>${tournament.teamCount || 0}</td>
        <td><span class="badge">${tournament.status || 'Upcoming'}</span></td>
        <td>
          <button onclick="deleteTournament('${docSnap.id}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    tableBody.innerHTML = '<tr><td colspan="5">Error loading tournaments.</td></tr>';
  }
}

// Create new tournament
export async function createTournament(tournamentData) {
  try {
    const docRef = await addDoc(collection(db, "tournaments"), {
      ...tournamentData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}