<script>
  import { onMount } from "svelte";
  import {
    auth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
  } from "../lib/firebase";

  export let phoneNumber = "";

  let verificationCode = "";
  let confirmationResult;
  let errorMessage = "";
  let isVerificationSent = false;

  // Send verification SMS
  async function sendVerificationCode() {
    try {
      const appVerifier = window.recaptchaVerifier;
      confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      isVerificationSent = true;
      errorMessage = "";
    } catch (error) {
      errorMessage = `Error: ${error.message}`;
    }
  }

  // Verify user code
  async function verifyCode() {
    try {
      await confirmationResult.confirm(verificationCode);
      errorMessage = "";
      alert("✅ Phone verification successful!");
    } catch (error) {
      errorMessage = `Error: ${error.message}`;
    }
  }

  // Setup reCAPTCHA
  onMount(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
        }
      );
    }

    sendVerificationCode(); // 🔄 Auto-send when mounted
  });
</script>

<section class="section">
  <div class="container">
    <h2 class="title">Phone Verification</h2>
    <div id="recaptcha-container"></div>

    {#if isVerificationSent}
      <div class="field">
        <label class="label">Verification Code</label>
        <div class="control">
          <input
            class="input"
            type="text"
            bind:value={verificationCode}
            placeholder="Enter verification code"
            required
          />
        </div>
      </div>

      <div class="field">
        <button class="button is-primary" on:click={verifyCode}>
          Verify Code
        </button>
      </div>
    {/if}

    {#if errorMessage}
      <p class="help is-danger">{errorMessage}</p>
    {/if}
  </div>
</section>
