/* css/admin.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f4f6f9;
  color: #333;
}

.admin-wrapper {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #1a1e29;
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar h3 {
  margin-bottom: 25px;
  color: #00d26a;
  text-align: center;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
}

.sidebar nav a {
  color: #a0aec0;
  text-decoration: none;
  padding: 12px 15px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.sidebar nav a:hover,
.sidebar nav a.active {
  background-color: #2d3748;
  color: #fff;
}

#logoutBtn {
  margin-top: 20px;
  padding: 10px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

#logoutBtn:hover {
  background-color: #c53030;
}

.content {
  flex-grow: 1;
  padding: 30px;
}

header h1 {
  margin-bottom: 20px;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.card h3 {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.card p {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.data-table th, .data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background-color: #edf2f7;
  font-weight: 600;
}

.btn-primary {
  background-color: #00d26a;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #00b058;
}