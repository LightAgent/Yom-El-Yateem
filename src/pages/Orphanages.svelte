<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import Navbar from "../components/Navbar.svelte";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import {
    db,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
  } from "../lib/firebase";

  let orphanages = [];
  let selectedBuses = [];
  let selectedChildren = {}; // Track which buses have their children displayed
  let allChildren = {}; // Store all children for each bus
  let loading = true;
  let busesMap = {};
  let giftFilterMap = {};
  let searchTermMap = {};
  let filteredChildrenMap = {}; // Store filtered children by busId

  onMount(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const orphanageSnapshot = await getDocs(collection(db, "orphanages"));
          orphanages = orphanageSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const busesSnapshot = await getDocs(collection(db, "buses"));
          busesMap = {};
          busesSnapshot.docs.forEach((doc) => {
            busesMap[doc.id] = { id: doc.id, ...doc.data() };
          });
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          loading = false;
        }
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  });

  function showBuses(orphanage) {
    selectedBuses = (orphanage.buses || [])
      .map((id) => busesMap[id])
      .filter(Boolean);
    selectedChildren = {}; // Reset the selected children when switching orphanages
    giftFilterMap = {};
    searchTermMap = {};
    filteredChildrenMap = {}; // Reset filtered children on new orphanage selection
    allChildren = {}; // Reset all children on orphanage selection
    loadAllChildren(); // Load all children for each bus initially
  }

  async function loadAllChildren() {
    for (const bus of selectedBuses) {
      try {
        const childPromises = bus.children.map(async (id) => {
          const docRef = doc(db, "children", id);
          const docSnap = await getDoc(docRef);
          return docSnap.exists()
            ? { id: docSnap.id, ...docSnap.data() }
            : null;
        });

        const childrenData = await Promise.all(childPromises);
        allChildren = {
          ...allChildren,
          [bus.id]: childrenData.filter(Boolean),
        };
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    }
  }

  // Toggle the visibility of children for a bus
  function toggleChildren(busId) {
    if (selectedChildren[busId]) {
      delete selectedChildren[busId]; // Hide children if they're already shown
    } else {
      selectedChildren[busId] = allChildren[busId]; // Show children for this bus
    }
    selectedChildren = { ...selectedChildren };
  }

  async function triggerFilter(busId) {
    const children = selectedChildren[busId] || allChildren[busId] || [];
    const searchTerm = searchTermMap[busId] || "";
    const giftFilter = giftFilterMap[busId] || "all";

    // Create an array of promises that resolve with filtered children
    const filtered = await Promise.all(
      children.map(async (child) => {
        let searchMatch = false;
        let giftMatch = false;

        // Search only by childId
        searchMatch = child.childId.toString().includes(searchTerm);

        // Check the gift filter
        giftMatch =
          giftFilter === "all" ||
          (giftFilter === "received" && child.giftGiven) ||
          (giftFilter === "notReceived" && !child.giftGiven);

        // Return the child if both conditions match
        if (searchMatch && giftMatch) {
          return child; // This child matches the filter
        }
        return null; // This child does not match, so we'll exclude it
      })
    );

    // Filter out null or undefined children after the async check
    filteredChildrenMap = {
      ...filteredChildrenMap,
      [busId]: filtered.filter(Boolean), // Removes null/undefined values
    };
  }
</script>

<Navbar />
<section
  class="section"
  style="background: linear-gradient(135deg, #fbe4d5, #f6b0d0); padding: 50px 0;"
>
  <div class="container">
    <h1
      class="title has-text-centered"
      style="font-family: 'Pacifico', cursive; font-size: 3rem; color: #000;"
    >
      Orphanage List
    </h1>

    {#if loading}
      <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">
        Loading...
      </p>
    {:else if orphanages.length === 0}
      <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">
        No orphanages found.
      </p>
    {:else}
      <div class="table-container">
        <table
          class="table is-fullwidth is-striped is-hoverable"
          style="background-color: #fff0e1; border-radius: 12px;"
        >
          <thead style="background-color: #ff8f66; color: white;">
            <tr>
              <th>Orphanage</th>
              <th>Number of Buses</th>
              <th>View Buses</th>
            </tr>
          </thead>
          <tbody>
            {#each orphanages as o}
              <tr>
                <td>{o.name}</td>
                <td>{o.buses?.length || 0}</td>
                <td>
                  <button
                    class="button is-small is-link"
                    on:click={() => showBuses(o)}>View</button
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if selectedBuses.length > 0}
        <div class="box" style="margin-top: 30px;">
          <h2 class="subtitle" style="font-size: 1.5rem;">🚍 Buses:</h2>

          {#each selectedBuses as bus (bus.id)}
            <div class="box" style="margin-top: 20px;">
              <div class="level is-flex is-justify-content-space-between">
                <div>
                  <strong>Bus Name:</strong>
                  {bus.name}
                </div>
                <button
                  class="button is-small is-info"
                  on:click={() => toggleChildren(bus.id)}
                >
                  {selectedChildren[bus.id] ? "Hide Children" : "Show Children"}
                </button>
              </div>

              {#if selectedChildren[bus.id]}
                <div class="field is-grouped" style="margin-bottom: 1rem;">
                  <div class="control">
                    <input
                      class="input"
                      type="text"
                      placeholder="Search by childId"
                      bind:value={searchTermMap[bus.id]}
                    />
                  </div>
                  <div class="control">
                    <div class="select">
                      <select bind:value={giftFilterMap[bus.id]}>
                        <option value="all">Show All</option>
                        <option value="received">Received Gift</option>
                        <option value="notReceived">Not Received Gift</option>
                      </select>
                    </div>
                  </div>
                  <div class="control">
                    <button
                      class="button is-primary"
                      on:click={() => triggerFilter(bus.id)}>Search</button
                    >
                  </div>
                </div>

                <table class="table is-bordered is-fullwidth is-narrow">
                  <thead>
                    <tr style="background-color: #fbc4ab;">
                      <th>👧 Name</th>
                      <th>🏠 Orphanage</th>
                      <th>🎁 Received Gift?</th>
                      <th>📍 Assignment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each filteredChildrenMap[bus.id] || allChildren[bus.id] || [] as child}
                      <tr>
                        <td>{child.name}</td>
                        <td>
                          {orphanages.find((o) => o.id === child.orphanageId)
                            ?.name || "?"}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={child.giftGiven}
                            on:change={() => toggleGift(child)}
                          />
                        </td>
                        <td>
                          {child.assigned ? "Assigned" : "Not Assigned"}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</section>

<style>
  .table-container {
    margin-top: 30px;
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
</style>
