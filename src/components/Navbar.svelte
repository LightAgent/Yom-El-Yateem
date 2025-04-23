<script>
    import { link } from "svelte-routing";

    let isNavbarActive = false;
  
    function toggleNavbar() {
      isNavbarActive = !isNavbarActive;
    }
  </script>
  
  <nav class="navbar is-light"  aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <strong>Orphanage Manager</strong>
      </a>
  
      <!-- svelte-ignore a11y-interactive-supports-focus -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-missing-attribute -->
      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded={isNavbarActive}
        class:is-active={isNavbarActive}
        on:click={toggleNavbar}
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
  
    <div class="navbar-menu" class:is-active={isNavbarActive}>
      <div class="navbar-start">
        <a class="navbar-item" use:link href="/">
          Follower Sign Up
        </a>
        <a class="navbar-item" use:link href="/buses">
          Buses
        </a>
        <a class="navbar-item" use:link href="/orphanages">
          Orphanages
        </a>
        <a class="navbar-item" use:link href="/followers">
          Followers
        </a>
      </div>
    </div>
  </nav>
  
  <style>
    .navbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }
  </style>
  