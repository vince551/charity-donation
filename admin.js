/* css/dashboard.css */
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.dashboard-container .card {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
}

.dashboard-container .card h3 {
  color: #10b981;
  margin-bottom: 0.5rem;
}