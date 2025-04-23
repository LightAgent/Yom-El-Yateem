<script>
    import { onMount } from "svelte";
    import { navigate } from 'svelte-routing';
    import { getAuth, onAuthStateChanged } from "firebase/auth";
    import { db, collection, getDocs } from "../lib/firebase";
    import Navbar from "../components/Navbar.svelte";

    let buses = [];
    let loading = true;
    if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
        window.location.replace("http://localhost:8080/?page=buses");
    }

    onMount(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const querySnapshot = await getDocs(collection(db, "buses"));
            buses = querySnapshot.docs.map((doc) => doc.data());
          } catch (error) {
            console.error("Error fetching followers:", error);
          } finally {
            loading = false;
          }
        } else {
          navigate("/signin"); // redirect to home if not authenticated
        }
      });
  
      return () => unsubscribe();
    });
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
        قائمة الباصات
      </h1>
  
      {#if loading}
        <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">...جاري التحميل</p>
      {:else if buses.length === 0}
        <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">لا يوجد باصات حالياً.</p>
      {:else}
        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable" style="background-color: #fff0e1; border-radius: 12px;">
            <thead style="background-color: #ff8f66; color: white;">
              <tr>
                  <th>الاسم</th>
                  <th>الدار</th>
                <th>عدد الأطفال</th>
              </tr>
            </thead>
            <tbody>
              {#each buses as b}
                <tr>
                  <td>{b.name}</td>
                  <td>{b.orphanage}</td>
                  <td>{b.children.length}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
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
  