<script>
  import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
  import { navigate } from "svelte-routing";
  import { app } from "../lib/firebase"; // Ensure your Firebase app is exported
  const auth = getAuth(app);

  let email = "";
  let password = "";
  let error = "";

  async function handleLogin() {
    error = "";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in!");
      navigate("/followers");
      // Navigate or show success state
    } catch (err) {
      error = "فشل تسجيل الدخول. تأكد من صحة البيانات.";
      console.error(err);
    }
  }
  async function logout() {
    await signOut(auth);
  }
</script>

<section
  class="section"
  style="background: linear-gradient(135deg, #fbe4d5, #f6b0d0); padding: 50px 0;"
>
  <div class="container has-text-centered">
    <h1
      class="title has-text-primary"
      style="font-family: 'Pacifico', cursive; font-size: 3rem; color: #000;"
    >
      تسجيل الدخول
    </h1>

    <div
      class="box"
      style="max-width: 400px; margin: 0 auto; background-color: #ffffff; border-radius: 15px; box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); padding: 30px;"
    >
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label" style="color: #000; font-size: 1.2rem;"
          >البريد الإلكتروني</label
        >
        <div class="control">
          <input
            class="input"
            type="email"
            bind:value={email}
            placeholder="you@example.com"
            required
            style="border-radius: 20px; padding: 15px; background-color: #fff0e1; border: 1px solid #ff8f66; color: #000;"
          />
        </div>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label" style="color: #000; font-size: 1.2rem;"
          >كلمة المرور</label
        >
        <div class="control">
          <input
            class="input"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            required
            style="border-radius: 20px; padding: 15px; background-color: #fff0e1; border: 1px solid #ff8f66; color: #000;"
          />
        </div>
      </div>

      {#if error}
        <p class="help is-danger" style="margin-top: 10px;">{error}</p>
      {/if}

      <div class="field is-grouped is-grouped-centered mt-5">
        <div class="control">
          <button
            class="button is-primary"
            on:click={handleLogin}
            style="background-color: #ff8f66; border-radius: 20px; padding: 15px; font-size: 1.1rem; color: white;"
          >
            تسجيل الدخول
          </button>
          <!-- <div class="control">
            <button
              class="button is-primary"
              on:click={logout}
              style="background-color: #ff8f66; border-radius: 20px; padding: 15px; font-size: 1.1rem; color: white;"
            >
              Logout
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .button:hover {
    background-color: #ff7a47;
  }
</style>
