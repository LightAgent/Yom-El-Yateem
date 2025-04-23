<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import Navbar from "../components/Navbar.svelte";
    import {
      getAuth,
      onAuthStateChanged
    } from "firebase/auth";
    import {
      db,
      collection,
      getDocs,
      doc,
      getDoc,
      updateDoc
    } from "../lib/firebase";
  
    let orphanages = [];
    let selectedBuses = [];
    let selectedChildren = {};
    let loading = true;
    let busesMap = {};
  
    onMount(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const orphanageSnapshot = await getDocs(collection(db, "orphanages"));
            orphanages = orphanageSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
  
            const busesSnapshot = await getDocs(collection(db, "buses"));
            busesMap = {};
            busesSnapshot.docs.forEach(doc => {
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
        .map(id => busesMap[id])
        .filter(Boolean);
      selectedChildren = {};
    }
  
    async function toggleChildren(busId, childIds = []) {
      if (selectedChildren[busId]) {
        delete selectedChildren[busId];
        selectedChildren = { ...selectedChildren };
        return;
      }
  
      try {
        const childPromises = childIds.map(async (id) => {
          const docRef = doc(db, "children", id);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        });
  
        const childrenData = await Promise.all(childPromises);
        selectedChildren = {
          ...selectedChildren,
          [busId]: childrenData.filter(Boolean)
        };
      } catch (error) {
        console.error("Error fetching children:", error);
      }
    }
  
    async function toggleGift(child) {
      const newValue = !child.receivedGift;
      try {
        await updateDoc(doc(db, "children", child.id), {
          receivedGift: newValue
        });
        child.receivedGift = newValue;
      } catch (error) {
        console.error("Failed to update gift status:", error);
      }
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
        قائمة الدور
      </h1>
  
      {#if loading}
        <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">...جاري التحميل</p>
      {:else if orphanages.length === 0}
        <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">لا توجد دور حالياً.</p>
      {:else}
        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable" style="background-color: #fff0e1; border-radius: 12px;">
            <thead style="background-color: #ff8f66; color: white;">
              <tr>
                <th>الدار</th>
                <th>عدد الباصات</th>
                <th>عرض الباصات</th>
              </tr>
            </thead>
            <tbody>
              {#each orphanages as o}
                <tr>
                  <td>{o.name}</td>
                  <td>{o.buses?.length || 0}</td>
                  <td>
                    <button class="button is-small is-link" on:click={() => showBuses(o)}>عرض</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
  
        {#if selectedBuses.length > 0}
          <div class="box" style="margin-top: 30px;">
            <h2 class="subtitle" style="font-size: 1.5rem;">🚍 الباصات:</h2>
  
            {#each selectedBuses as bus (bus.id)}
              <div class="box" style="margin-top: 20px;">
                <div class="level is-flex is-justify-content-space-between">
                  <div>
                    <strong>اسم الباص:</strong> {bus.name}
                  </div>
                  <button
                    class="button is-small is-info"
                    on:click={() => toggleChildren(bus.id, bus.children || [])}
                  >
                    {selectedChildren[bus.id] ? 'إخفاء الأطفال' : 'عرض الأطفال'}
                  </button>
                </div>
  
                {#if selectedChildren[bus.id]}
                  <div style="margin-top: 10px;">
                    <table class="table is-bordered is-fullwidth is-narrow">
                      <thead>
                        <tr style="background-color: #fbc4ab;">
                          <th>👧 الاسم</th>
                          <th>🏠 الدار</th>
                          <th>🎁 استلم الهدية؟</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each selectedChildren[bus.id] as child}
                          <tr>
                            <td>{child.name}</td>
                            <td>{orphanages.find(o => o.id === child.orphanageId)?.name || "?"}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={child.receivedGift}
                                on:change={() => toggleGift(child)}
                              />
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
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
  