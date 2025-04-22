<script>
  import { db,addDoc,collection } from "../lib/firebase"; // import Firestore functions
  import { navigate,link } from 'svelte-routing';

  let name = "";
  let email = "";
  let phonePrefix = "010";
  let phoneSuffix = "";
  let collegeId = "";

  let phoneError = "";
  let collegeIdError = "";

  const prefixes = ["010", "011", "012", "015"];

  function validatePhone() {
    const fullPhone = phonePrefix + phoneSuffix;
    const regex = /^(01[0125])[0-9]{8}$/;
    if (!regex.test(fullPhone)) {
      phoneError = "Please enter a valid Egyptian phone number.";
      return false;
    }
    phoneError = "";
    return true;
  }

  function validateCollegeId() {
    const regex = /^\d{4,6}$/;
    if (!regex.test(collegeId)) {
      collegeIdError = "College ID must be 4 to 6 digits.";
      return false;
    }
    collegeIdError = "";
    return true;
  }

  async function handleSubmit() {
    const validPhone = validatePhone();
    const validId = validateCollegeId();

    if (!validPhone || !validId) return;

    const fullPhone = phonePrefix + phoneSuffix;

    console.log({
      name,
      email,
      phone: fullPhone,
      collegeId,
    });

    try {
      // Create a document with the collegeId as the document ID in the 'followers' collection
      const docRef = await addDoc(collection(db, "followers"), {
        name,
        email,
        phone: fullPhone,
        collegeId,
        children: []
      });
      navigate("/thankyou")
      console.log("Document written with ID: ", collegeId);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
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
      كٌنْ رَفِيقِي
    </h1>
    <h2
      class="subtitle"
      style="font-family: 'Roboto', sans-serif; color: #000; font-size: 1.5rem; margin-bottom: 30px;"
    >
      اجعل هذا اليوم مميزاً
    </h2>

    <!-- Image at the top -->
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img
      src="/banner.png"
      alt="Orphan's Day Image"
      style="max-width: 100%; border-radius: 8px; margin-bottom: 30px;"
    />

    <form
      on:submit|preventDefault={handleSubmit}
      class="box"
      style="background-color: #ffffff; border-radius: 15px; box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); padding: 30px;"
    >
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label" style="color: #000; font-size: 1.2rem;">Name</label
        >
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={name}
            placeholder="John Doe"
            required
            style="border-radius: 20px; padding: 15px; border: 1px solid #ff8f66; font-size: 1rem; background-color: #fff0e1; color: #000;"
          />
        </div>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label" style="color: #000; font-size: 1.2rem;"
          >Email</label
        >
        <div class="control">
          <input
            class="input"
            type="email"
            bind:value={email}
            placeholder="user@example.com"
            required
            style="border-radius: 20px; padding: 15px; border: 1px solid #ff8f66; font-size: 1rem; background-color: #fff0e1; color: #000;"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->

        <label class="label" style="color: #000; font-size: 1.2rem;"
          >Phone Number</label
        >
        <div class="field has-addons">
          <p
            class="control"
            style="border: 1px solid #ff8f66; border-radius: 20px;"
          >
            <span class="select" style="border-radius: 20px; overflow: hidden;">
              <select
                bind:value={phonePrefix}
                style="border: none; font-size: 1rem; background-color: #fff0e1; color: #000; border-radius: 20px;"
              >
                {#each prefixes as prefix}
                  <option value={prefix}>{prefix}</option>
                {/each}
              </select>
            </span>
          </p>
          <p class="control is-expanded">
            <input
              class="input"
              type="tel"
              placeholder="12345678"
              maxlength="8"
              bind:value={phoneSuffix}
              on:input={validatePhone}
              required
              style="border-radius: 20px; padding: 15px; border: 1px solid #ff8f66; font-size: 1rem; background-color: #fff0e1; color: #000;"
            />
          </p>
        </div>
        {#if phoneError}
          <p class="help is-danger">{phoneError}</p>
        {/if}
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->

        <label class="label" style="color: #000; font-size: 1.2rem;"
          >College ID</label
        >
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={collegeId}
            placeholder="9999"
            required
            on:input={validateCollegeId}
            style="border-radius: 20px; padding: 15px; border: 1px solid #ff8f66; font-size: 1rem; background-color: #fff0e1; color: #000;"
          />
        </div>
        {#if collegeIdError}
          <p class="help is-danger">{collegeIdError}</p>
        {/if}
      </div>

      <div class="field is-grouped is-grouped-centered mt-5">
        <div class="control">
          <button
            class="button is-primary"
            type="submit"
            style="background-color: #ff8f66; border-radius: 20px; padding: 15px; font-size: 1.1rem; color: white;"
            >Submit</button
          >
        </div>
      </div>
    </form>
  </div>
</section>

<section class="section has-text-centered">
  <h2 style="font-size: 1.8rem; color: #ff8f66;">
    Thank You for Your Support!
  </h2>
  <p style="font-size: 1.2rem; color: rgb(251, 228, 213);">
    Your participation makes Orphan's Day truly special. Together, we are
    creating a brighter future.
  </p>
</section>

<style>
  /* For larger screens (PC), reduce the height of the image */
  @media (min-width: 1024px) {
    img {
      max-height: 400px; /* Adjust the value to your desired height */
    }
  }
  /* Button Hover Effect */
  .button:hover {
    background-color: #ff7a47;
  }
</style>
