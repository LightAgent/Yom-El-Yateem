<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { db, collection, getDocs } from "../lib/firebase";
  import Navbar from "../components/Navbar.svelte";

  let followers = [];
  let loading = true;
  let searchTerm = ""; // Search term for collegeId or volunteerCode
  let searchType = "collegeId"; // Default search type is collegeId
  let filteredFollowers = [];

  onMount(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, "followers"));
          followers = querySnapshot.docs.map((doc) => doc.data());
          filteredFollowers = followers; // Initialize with all followers
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

  // Filter followers based on search term and selected search type
  function searchFollowers() {
    filteredFollowers = followers.filter((f) =>
      f[searchType]?.includes(searchTerm)
    );
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
      قائمة المشاركين
    </h1>

    <div class="field is-grouped" style="margin-bottom: 1rem;">
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="Search by College ID or Volunteer Code"
          bind:value={searchTerm}
        />
      </div>
      <div class="control">
        <div class="select">
          <select bind:value={searchType}>
            <option value="collegeId">Search by College ID</option>
            <option value="volunteerCode">Search by Volunteer Code</option>
          </select>
        </div>
      </div>
      <div class="control">
        <button class="button is-primary" on:click={searchFollowers}>
          Search
        </button>
      </div>
    </div>

    {#if loading}
      <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">
        ...جاري التحميل
      </p>
    {:else if filteredFollowers.length === 0}
      <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">
        لا يوجد مشاركون حالياً.
      </p>
    {:else}
      <div class="table-container">
        <table
          class="table is-fullwidth is-striped is-hoverable"
          style="background-color: #fff0e1; border-radius: 12px;"
        >
          <thead style="background-color: #ff8f66; color: white;">
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>الرقم الجامعي</th>
              <th>Volunteer Code</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredFollowers as f}
              <tr>
                <td>{f.name}</td>
                <td>{f.phone}</td>
                <td>{f.email}</td>
                <td>{f.collegeId}</td>
                <td>{f.volunteerCode}</td>
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

  /* Apply text color to odd rows */
  table tbody tr:nth-child(odd) td {
    color: #000; /* Set text color for odd rows */
  }
</style>
