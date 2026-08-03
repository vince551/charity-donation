/* css/style.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
  background-color: #1e293b;
  border-bottom: 1px solid #334155;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

.navbar nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.navbar a {
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.navbar a:hover {
  color: #f8fafc;
}

.btn-login {
  background-color: #10b981;
  color: #ffffff !important;
  padding: 0.5rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 1.5rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  color: #94a3b8;
  max-width: 600px;
  margin-bottom: 2rem;
  font-size: 1.125rem;
}

.cta-btn {
  background-color: #10b981;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
}

/* Login Modal/Form */
.login-container {
  max-width: 400px;
  margin: 5rem auto;
  padding: 2rem;
  background: #1e293b;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.375rem;
  color: #fff;
}

button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
}

.error {
  color: #ef4444;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}