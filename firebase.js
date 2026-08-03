/* css/responsive.css */
@media (max-width: 768px) {
  .admin-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    min-height: auto;
  }

  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}