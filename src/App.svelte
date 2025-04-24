<script>
  import { Router, Route, navigate } from "svelte-routing";
  import LoginForm from "./components/LoginForm.svelte";
  import ThankYou from "./pages/ThankYou.svelte";
  import Followers from "./pages/Followers.svelte";
  import SignIn from "./pages/SignIn.svelte";
  import Buses from "./pages/Buses.svelte";
  import Orphanages from "./pages/Orphanages.svelte";
  import AddChildren from "./pages/AddChildren.svelte";
  import assign from "./pages/assignChildren.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    // Extract the 'page' query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get("page") || "");
    navigate(urlParams.get("page"));
  });
</script>

<Router>
  <Route path="/" component={LoginForm} />
  <Route path="/thankyou" component={ThankYou} />
  <Route path="/followers" component={Followers} />
  <Route path="/signin" component={SignIn} />
  <Route path="/buses" component={Buses} />
  <Route path="/orphanages" component={Orphanages} />
  <Route path="/addchildren" component={AddChildren} />
  <Route path="/assignChildren" component={assign} />
  <!-- <Route path="/about" component={About} /> -->
</Router>
