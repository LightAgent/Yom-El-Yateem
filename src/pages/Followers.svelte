<script>
  import { onMount } from "svelte";
  import { navigate } from 'svelte-routing';
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { db, collection, getDocs } from "../lib/firebase";

  let followers = [];
  let loading = true;

  onMount(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, "followers"));
          followers = querySnapshot.docs.map((doc) => doc.data());
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

    {#if loading}
      <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">...جاري التحميل</p>
    {:else if followers.length === 0}
      <p class="has-text-centered" style="font-size: 1.2rem; color: #000;">لا يوجد مشاركون حالياً.</p>
    {:else}
      <div class="table-container">
        <table class="table is-fullwidth is-striped is-hoverable" style="background-color: #fff0e1; border-radius: 12px;">
          <thead style="background-color: #ff8f66; color: white;">
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>البريد الإلكتروني</th>
              <th>الرقم الجامعي</th>
            </tr>
          </thead>
          <tbody>
            {#each followers as f}
              <tr>
                <td>{f.name}</td>
                <td>{f.phone}</td>
                <td>{f.email}</td>
                <td>{f.collegeId}</td>
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
