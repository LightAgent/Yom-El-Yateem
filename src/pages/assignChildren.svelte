<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import Navbar from "../components/Navbar.svelte";
  import {
    db,
    collection,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    arrayUnion,
    arrayRemove,
  } from "../lib/firebase";
  import { getAuth, onAuthStateChanged } from "firebase/auth";

  let children = [];
  let orphanages = {};
  let followers = [];
  let selectedChild = null;
  let showModal = false;

  let searchType = "childId"; // Default to searching by childId
  let searchValue = "";
  let matchedFollower = []; // Changed to array to hold multiple matched followers

  let searchChildValue = "";
  let searchChildType = "childId"; // Default search type for children
  let filteredChildren = []; // Added to hold filtered children

  onMount(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchData();
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  });

  async function fetchData() {
    try {
      const orphanageSnapshot = await getDocs(collection(db, "orphanages"));
      orphanages = {};
      orphanageSnapshot.forEach((doc) => {
        orphanages[doc.id] = doc.data();
      });

      const childrenSnapshot = await getDocs(collection(db, "children"));
      children = childrenSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const followersSnapshot = await getDocs(collection(db, "followers"));
      followers = followersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Initialize filteredChildren with all children data
      filteredChildren = children;
    } catch (e) {
      console.error("Error loading data:", e);
    }
  }

  function openAssignModal(child) {
    selectedChild = child;
    showModal = true;
    searchValue = "";
    matchedFollower = []; // Reset matched followers when opening the modal
  }

  function closeModal() {
    showModal = false;
    selectedChild = null;
    matchedFollower = []; // Reset matched followers when closing the modal
    searchValue = "";
  }

  async function assignToFollower(followerId) {
    if (!selectedChild) return;

    try {
      await updateDoc(doc(db, "children", selectedChild.id), {
        assigned: followerId,
      });

      await updateDoc(doc(db, "followers", followerId), {
        children: arrayUnion(selectedChild.id),
      });

      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Assignment failed:", err);
    }
  }

  async function deassignChild(child) {
    const followerId = child.assigned;
    if (!followerId) return;

    try {
      await updateDoc(doc(db, "children", child.id), {
        assigned: false,
      });

      await updateDoc(doc(db, "followers", followerId), {
        children: arrayRemove(child.id),
      });

      await fetchData();
    } catch (err) {
      console.error("Deassignment failed:", err);
    }
  }

  function searchFollower() {
    // Search followers by selected type (e.g., collegeId or phone)
    matchedFollower = followers.filter((f) => f[searchType] === searchValue);
    console.log("Matched Followers:", matchedFollower);
  }

  // Filter children based on selected search type and value
  function searchChildren() {
    let filtered = [...children]; // Make a copy of children to apply filtering

    if (searchChildType === "childId") {
      // Ensure childId is a string before using includes
      filtered = filtered.filter(
        (child) => String(child.childId).includes(searchChildValue) // Convert childId to string
      );
    } else if (searchChildType === "collegeId") {
      // Search children by follower's collegeId
      filtered = filtered.filter((child) =>
        followers.some(
          (f) => f.collegeId === searchChildValue && f.id === child.assigned
        )
      );
    }

    filteredChildren = filtered; // Update filteredChildren with the new list
  }

  function handleSearch() {
    searchChildren(); // Trigger the search when the button is clicked
  }

  function showAllChildren() {
    // Show all children by resetting the filtered list
    filteredChildren = children;
  }
</script>

<Navbar />

<section class="section">
  <div class="container">
    <h1 class="title has-text-centered">Children</h1>

    <!-- Search Bar for Children -->
    <div class="box">
      <div class="field">
        <label class="label">Search for Child</label>
        <div class="control">
          <div class="select is-fullwidth">
            <select bind:value={searchChildType}>
              <option value="childId">Child ID</option>
              <option value="collegeId">Follower's College ID</option>
            </select>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="label">Value</label>
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={searchChildValue}
            placeholder="Enter value"
          />
        </div>
      </div>

      <button class="button is-info is-small" on:click={handleSearch}>
        Search
      </button>

      <!-- Button to show all children -->
      <button class="button is-info is-small" on:click={showAllChildren}>
        Show All Children
      </button>
    </div>

    <!-- Display filtered children -->
    <div class="box">
      {#each filteredChildren as child (child.id)}
        <div class="box" style="margin-bottom: 1rem;">
          <p><strong>👶 Name:</strong> {child.name}</p>
          <p>
            <strong>🏠 Orphanage:</strong>
            {orphanages[child.orphanageId]?.name || "?"}
          </p>

          {#if child.assigned}
            <p>
              <strong>🧍 Follower:</strong>
              {followers.find((f) => f.id === child.assigned)?.name || "?"}
            </p>
            <p>
              <strong>Follower College ID:</strong>
              {followers.find((f) => f.id === child.assigned)?.collegeId || "?"}
            </p>
            <p>
              <strong>Follower Phone Number:</strong>
              {followers.find((f) => f.id === child.assigned)?.phone || "?"}
            </p>
            <button
              class="button is-danger is-small"
              on:click={() => deassignChild(child)}
            >
              Unassign
            </button>
          {:else}
            <button
              class="button is-link is-small"
              on:click={() => openAssignModal(child)}
            >
              Assign
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

{#if showModal && selectedChild}
  <div class="modal is-active">
    <div class="modal-background" on:click={closeModal}></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Select Follower</p>
        <button class="delete" aria-label="close" on:click={closeModal}
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Select Search Type</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select bind:value={searchType}>
                <option value="collegeId">College ID</option>
                <option value="phone">Phone Number</option>
                <option value="volunteerCode">Volunteer Code</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Value</label>
          <div class="control">
            <input
              class="input"
              type="text"
              bind:value={searchValue}
              placeholder="Enter value"
            />
          </div>
        </div>

        <button class="button is-info is-small" on:click={searchFollower}>
          Search
        </button>

        {#if matchedFollower.length > 0}
          <hr />
          {#each matchedFollower as f}
            <p><strong>Name:</strong> {f.name}</p>
            <p><strong>College ID:</strong> {f.collegeId}</p>
            <button
              class="button is-primary is-small"
              on:click={() => assignToFollower(f.id)}
            >
              Confirm Assignment
            </button>
            <hr />
          {/each}
        {:else if searchValue}
          <p class="has-text-danger">No follower found.</p>
        {/if}
      </section>
      <footer class="modal-card-foot">
        <button class="button" on:click={closeModal}>Close</button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-card {
    width: 90%;
    max-width: 500px;
  }
</style>
