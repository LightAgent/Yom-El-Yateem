<script>
  import { onMount } from "svelte";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import {
    db,
    addDoc,
    collection,
    getDocs,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
  } from "../lib/firebase";
  import { fly } from "svelte/transition";
  import { navigate } from "svelte-routing";
  import Navbar from "../components/Navbar.svelte";

  let orphanages = [];
  let buses = [];
  let children = [];
  let selectedOrphanageId = "";
  let selectedBusId = "";
  let loading = true;

  // FAB Modal States
  let showModal = false;
  let childName = "";
  let giftGiven = false;

  onMount(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return navigate("/signin");

      try {
        const orphanageSnapshot = await getDocs(collection(db, "orphanages"));
        orphanages = orphanageSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const busSnapshot = await getDocs(collection(db, "buses"));
        buses = busSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
      }
    });

    return () => unsubscribeAuth();
  });

  $: if (selectedOrphanageId && selectedBusId) {
    const q = query(
      collection(db, "children"),
      where("orphanageId", "==", selectedOrphanageId),
      where("busId", "==", selectedBusId)
    );
    const unsubscribeChildren = onSnapshot(q, (snapshot) => {
      children = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });

    // Cleanup
  }

  $: if (selectedOrphanageId) {
    const isValidBus = buses.some(
      (b) => b.id === selectedBusId && b.orphanageId === selectedOrphanageId
    );
    if (!isValidBus) selectedBusId = "";
  }

  // Function to get and increment the childId from the counters collection
  async function getNextChildId() {
    const counterDoc = doc(db, "counters", "childIdCounter");
    const counterSnapshot = await getDoc(counterDoc);

    if (counterSnapshot.exists()) {
      // Increment the childId
      const nextChildId = counterSnapshot.data().lastChildId + 1;

      // Update the counter in the database
      await updateDoc(counterDoc, { lastChildId: nextChildId });

      return nextChildId;
    } else {
      // If the counter doesn't exist, initialize it
      await setDoc(counterDoc, { lastChildId: 1 });
      return 1;
    }
  }

  const addChild = async () => {
    if (!childName || !selectedBusId || !selectedOrphanageId) return;

    try {
      const childId = await getNextChildId(); // Get the next sequential childId

      // 1. Add the child to the 'children' collection
      const childRef = await addDoc(collection(db, "children"), {
        name: childName,
        orphanageId: selectedOrphanageId,
        busId: selectedBusId,
        giftGiven,
        assigned: false,
        timestamp: serverTimestamp(),
        childId,
      });

      // 2. Add child ID to the 'children' array in the corresponding bus document
      const busRef = doc(db, "buses", selectedBusId);
      await updateDoc(busRef, {
        children: arrayUnion(childRef.id),
      });

      // 3. Reset modal state
      childName = "";
      giftGiven = false;
      showModal = false;
    } catch (e) {
      console.error("Error adding child:", e);
    }
  };
</script>

<Navbar />
<section class="section">
  <div class="container">
    <h1 class="title has-text-centered black">إضافة الأطفال</h1>

    {#if loading}
      <p class="has-text-centered">Loading...</p>
    {:else}
      <!-- Orphanage Selector -->
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">اختار الدار</label>
        <div class="control">
          <div class="select">
            <select bind:value={selectedOrphanageId}>
              <option disabled selected value="">اختار الدار</option>
              {#each orphanages as orphanage}
                <option value={orphanage.id}>{orphanage.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Bus Selector -->
      {#if selectedOrphanageId}
        <div class="field">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">Select Bus</label>
          <div class="control">
            <div class="select">
              <select bind:value={selectedBusId}>
                <option disabled selected value="">Choose Bus</option>
                {#each buses.filter((b) => b.orphanageId === selectedOrphanageId) as bus}
                  <option value={bus.id}>{bus.name}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      {/if}

      <!-- Children Table -->
      {#if selectedBusId && children.length > 0}
        <div class="table-container">
          <table class="table is-striped is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>معرّف الطفل</th>
              </tr>
            </thead>
            <tbody>
              {#each children as child}
                <tr>
                  <td>{child.name}</td>
                  <td>{child.childId}</td>
                  <!-- Display the childId -->
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/if}
  </div>

  <!-- FAB -->
  {#if selectedBusId && selectedOrphanageId && buses.find((b) => b.id === selectedBusId)?.orphanageId === selectedOrphanageId}
    <button
      class="fab"
      on:click={() => (showModal = true)}
      aria-label="Add child"
    >
      <span class="icon is-small">
        <i class="fas fa-plus"></i>
      </span>
    </button>
  {/if}

  <!-- Modal -->
  {#if showModal}
    <div class="modal is-active" transition:fly={{ y: 200, duration: 300 }}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="modal-background" on:click={() => (showModal = false)}></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">إضافة طفل</p>
          <button
            class="delete"
            aria-label="close"
            on:click={() => (showModal = false)}
          ></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">الاسم</label>
            <div class="control">
              <input
                class="input"
                bind:value={childName}
                placeholder="Enter name"
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" on:click={addChild}>حفظ</button>
          <button class="button" on:click={() => (showModal = false)}
            >إلغاء</button
          >
        </footer>
      </div>
    </div>
  {/if}
</section>

<style>
  .fab {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    background: #ff8f66;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 2rem;
    width: 60px;
    height: 60px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-card {
    width: 90%;
    max-width: 500px;
  }
  h1 {
    font-size: 2rem;
    color: #000;
    margin-bottom: 20px;
  }
  p {
    font-size: 1.2rem;
    color: #000;
  }
</style>
