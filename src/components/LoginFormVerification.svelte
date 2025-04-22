<script>
  import PhoneVerification from "./PhoneVerification.svelte";

  let name = "";
  let email = "";
  let phonePrefix = "010";
  let phoneSuffix = "";
  let collegeId = "";
  let countryCode = "+20"; // Egypt's country code

  let phoneError = "";
  let collegeIdError = "";
  let showPhoneVerification = false;

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

  function handleSubmit() {
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

    showPhoneVerification = true; // Show phone verification after form submission
  }
</script>

<section class="section">
  <div class="container">
    <h1 class="title has-text-centered has-text-primary">كن رفيقي</h1>

    <form on:submit|preventDefault={handleSubmit} class="box">
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Name</label>
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={name}
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Email</label>
        <div class="control">
          <input
            class="input"
            type="email"
            bind:value={email}
            placeholder="user@example.com"
            required
          />
        </div>
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Phone Number</label>
        <div class="field has-addons">
          <p class="control">
            <span class="select">
              <select bind:value={phonePrefix}>
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
            />
          </p>
        </div>
        {#if phoneError}
          <p class="help is-danger">{phoneError}</p>
        {/if}
      </div>

      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">College ID</label>
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={collegeId}
            placeholder="9999"
            required
            on:input={validateCollegeId}
          />
        </div>
        {#if collegeIdError}
          <p class="help is-danger">{collegeIdError}</p>
        {/if}
      </div>

      <div class="field is-grouped is-grouped-centered mt-5">
        <div class="control">
          <button class="button is-primary" type="submit">Submit</button>
        </div>
      </div>
    </form>

    {#if showPhoneVerification}
      <PhoneVerification
        phoneNumber={countryCode + phonePrefix + phoneSuffix}
      />
    {/if}
  </div>
</section>
