<script>
  import { link } from "svelte-routing";

  let isNavbarActive = false;
  let isDropdownActive = false; // Added state for dropdown visibility

  function toggleNavbar() {
    isNavbarActive = !isNavbarActive;
  }

  function toggleDropdown() {
    isDropdownActive = !isDropdownActive; // Toggle dropdown
  }
</script>

<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="#">
      <img src="/logo.png" alt="Logo" style="max-height: 3rem;" />
    </a>

    <!-- Burger icon for mobile view -->
    <a
      role="button"
      class="navbar-burger"
      aria-label="menu"
      aria-expanded={isNavbarActive ? "true" : "false"}
      class:is-active={isNavbarActive}
      on:click={toggleNavbar}
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <!-- Navbar Menu -->
  <div class="navbar-menu" class:is-active={isNavbarActive}>
    <div class="navbar-start">
      <a class="navbar-item" use:link href="/addchildren">Add Children</a>
      <a class="navbar-item" use:link href="/assignChildren">Assign</a>

      <div
        class="navbar-item has-dropdown is-hoverable"
        class:is-active={isDropdownActive}
      >
        <a class="navbar-link" href="#" on:click={toggleDropdown}>View</a>
        <div class="navbar-dropdown">
          <a class="navbar-item" use:link href="/buses">Buses</a>
          <a class="navbar-item" use:link href="/followers">Followers</a>
          <a class="navbar-item" use:link href="/orphanages">Orphanages</a>
        </div>
      </div>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <a class="button is-primary" use:link href="/">
            <strong>Follower Sign Up</strong>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .navbar-burger span {
    background-color: #000; /* Makes the burger lines visible if needed */
  }

  /* For mobile, toggle the menu */
  @media screen and (max-width: 768px) {
    .navbar-menu {
      display: none;
    }

    .navbar-menu.is-active {
      display: block;
    }

    .navbar-burger {
      display: block;
    }

    .navbar-item.has-dropdown.is-active .navbar-dropdown {
      display: block; /* Show the dropdown on mobile when active */
    }
  }

  /* Default styles for dropdown */
  .navbar-dropdown {
    display: none; /* Hide the dropdown by default */
  }

  .navbar-item.has-dropdown.is-active .navbar-dropdown {
    display: block; /* Show the dropdown when active */
  }
</style>
